import type { Pool, RowDataPacket } from 'mysql2/promise';

/* ------------------------------------------------------------------ */
/* Tipos de fila                                                       */
/* ------------------------------------------------------------------ */

type ProductRow = RowDataPacket & {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  warehouse: string;
  lot: string;
  expiry: string;
  price: string | number;
  category: string;
  image_url: string | null;
};

type CustomerRow = RowDataPacket & {
  id: string;
  name: string;
  contact: string;
  credit_limit: string | number;
  current_balance: string | number;
  lat: number | null;
  lng: number | null;
  email: string;
  phone: string;
  address: string;
  history: string | null;
};

type OrderRow = RowDataPacket & {
  id: string;
  payload: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function mapProduct(r: ProductRow) {
  return {
    id: r.id,
    name: r.name,
    sku: r.sku,
    stock: Number(r.stock),
    minStock: Number(r.min_stock),
    maxStock: Number(r.max_stock),
    warehouse: r.warehouse,
    lot: r.lot,
    expiry: r.expiry,
    price: Number(r.price),
    category: r.category,
    imageUrl: r.image_url ?? undefined,
  };
}

function mapCustomer(r: CustomerRow) {
  let history: unknown[] = [];
  if (r.history) {
    try {
      history = typeof r.history === 'string' ? JSON.parse(r.history) : (r.history as any);
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
  }
  return {
    id: r.id,
    name: r.name,
    contact: r.contact ?? '',
    creditLimit: Number(r.credit_limit ?? 0),
    currentBalance: Number(r.current_balance ?? 0),
    lat: r.lat != null ? Number(r.lat) : 0,
    lng: r.lng != null ? Number(r.lng) : 0,
    email: r.email ?? '',
    phone: r.phone ?? '',
    address: r.address ?? '',
    history,
  };
}

function parseOrder(r: OrderRow) {
  try {
    return typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload;
  } catch {
    return { id: r.id };
  }
}

/** El formulario de clientes envía `gps: { lat, lng }`; normalizamos a lat/lng. */
function bodyLatLng(body: Record<string, unknown>): {
  lat: number | null;
  lng: number | null;
} {
  if (body.lat != null || body.lng != null) {
    return {
      lat: body.lat != null ? Number(body.lat) : null,
      lng: body.lng != null ? Number(body.lng) : null,
    };
  }
  const g = body.gps as { lat?: unknown; lng?: unknown } | undefined;
  if (g && typeof g === 'object') {
    return {
      lat: g.lat != null ? Number(g.lat) : null,
      lng: g.lng != null ? Number(g.lng) : null,
    };
  }
  return { lat: null, lng: null };
}

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

export async function myListCategories(pool: Pool): Promise<string[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT name FROM categories ORDER BY name ASC',
  );
  return (rows as { name: string }[]).map((r) => r.name);
}

export async function myInsertCategory(pool: Pool, name: string): Promise<void> {
  await pool.query('INSERT INTO categories (id, name) VALUES (UUID(), ?)', [name]);
}

/* ------------------------------------------------------------------ */
/* Productos                                                           */
/* ------------------------------------------------------------------ */

export async function myListProducts(pool: Pool) {
  const [rows] = await pool.query<ProductRow[]>(
    'SELECT * FROM products ORDER BY name ASC',
  );
  return rows.map(mapProduct);
}

export async function myInsertProduct(
  pool: Pool,
  input: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    maxStock: number;
    warehouse: string;
    lot: string;
    expiry: string;
    price: number;
    category: string;
    imageUrl?: string | null;
  },
) {
  await pool.query(
    `INSERT INTO products
       (id, name, sku, stock, min_stock, max_stock, warehouse, lot, expiry, price, category, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id,
      input.name,
      input.sku,
      input.stock,
      input.minStock,
      input.maxStock,
      input.warehouse,
      input.lot,
      input.expiry,
      input.price,
      input.category,
      input.imageUrl ?? null,
    ],
  );
  const [rows] = await pool.query<ProductRow[]>(
    'SELECT * FROM products WHERE id = ? LIMIT 1',
    [input.id],
  );
  return mapProduct(rows[0]);
}

export async function myUpdateProductImageUrl(
  pool: Pool,
  id: string,
  imageUrl: string,
) {
  await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [imageUrl, id]);
  const [rows] = await pool.query<ProductRow[]>(
    'SELECT * FROM products WHERE id = ? LIMIT 1',
    [id],
  );
  if (!rows.length) throw new Error('product not found');
  return mapProduct(rows[0]);
}

/* ------------------------------------------------------------------ */
/* Clientes                                                            */
/* ------------------------------------------------------------------ */

export async function myListCustomers(pool: Pool) {
  const [rows] = await pool.query<CustomerRow[]>(
    'SELECT * FROM customers ORDER BY name ASC',
  );
  return rows.map(mapCustomer);
}

export async function myInsertCustomer(pool: Pool, body: Record<string, unknown>) {
  const id = String(body.id ?? `CUST-${Date.now()}`);
  const history = Array.isArray(body.history) ? body.history : [];
  const { lat, lng } = bodyLatLng(body);
  await pool.query(
    `INSERT INTO customers
       (id, name, contact, credit_limit, current_balance, lat, lng, email, phone, address, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(body.name ?? ''),
      String(body.contact ?? ''),
      Number((body.creditLimit ?? (body as any).credit_limit) ?? 0),
      Number((body.currentBalance ?? (body as any).current_balance) ?? 0),
      lat,
      lng,
      String(body.email ?? ''),
      String(body.phone ?? ''),
      String(body.address ?? ''),
      JSON.stringify(history),
    ],
  );
  const [rows] = await pool.query<CustomerRow[]>(
    'SELECT * FROM customers WHERE id = ? LIMIT 1',
    [id],
  );
  return mapCustomer(rows[0]);
}

/* ------------------------------------------------------------------ */
/* Pedidos                                                             */
/* ------------------------------------------------------------------ */

export async function myInsertOrder(pool: Pool, order: Record<string, unknown>) {
  const id = String(order.id ?? Date.now());
  const full: Record<string, unknown> = {
    ...order,
    id,
    status: order.status ?? 'pending',
    createdAt: order.createdAt ?? new Date().toISOString(),
  };
  await pool.query(
    'INSERT INTO orders (id, payload) VALUES (?, ?)',
    [id, JSON.stringify(full)],
  );
  return full;
}

export async function myListOrders(
  pool: Pool,
  opts: { sellerId?: string } = {},
): Promise<any[]> {
  let sql = 'SELECT id, payload, created_at FROM orders';
  const params: unknown[] = [];
  if (opts.sellerId) {
    sql += ` WHERE JSON_UNQUOTE(JSON_EXTRACT(payload, '$.sellerId')) = ?`;
    params.push(opts.sellerId);
  }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.query<OrderRow[]>(sql, params);
  return rows.map(parseOrder);
}

export async function myUpdateOrderStatus(
  pool: Pool,
  id: string,
  status: string,
): Promise<any> {
  const [rows] = await pool.query<OrderRow[]>(
    'SELECT id, payload, created_at FROM orders WHERE id = ? LIMIT 1',
    [id],
  );
  if (!rows.length) throw new Error('order not found');

  const current = parseOrder(rows[0]);
  const updated = { ...current, status };
  await pool.query('UPDATE orders SET payload = ? WHERE id = ?', [
    JSON.stringify(updated),
    id,
  ]);
  return updated;
}

export async function myDecrementStock(
  pool: Pool,
  items: { productId: string; quantity: number }[],
): Promise<void> {
  if (items.length === 0) return;
  const ids = Array.from(new Set(items.map((i) => i.productId)));
  const placeholders = ids.map(() => '?').join(',');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ProductRow[]>(
      `SELECT id, stock FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
      ids,
    );

    const byId = new Map<string, number>();
    for (const r of rows) byId.set(r.id, Number(r.stock));

    for (const item of items) {
      const current = byId.get(item.productId);
      if (current == null) throw new Error(`Producto no existe: ${item.productId}`);
      if (current < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.productId}: ${current} < ${item.quantity}`,
        );
      }
      byId.set(item.productId, current - item.quantity);
    }

    for (const [id, newStock] of byId.entries()) {
      await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export async function myStats(pool: Pool) {
  const [orderStats] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS order_count,
       COALESCE(SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.total')) AS DECIMAL(14,2))), 0) AS total_sales
     FROM orders`,
  );

  const [stockStats] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS low_stock FROM products WHERE stock <= min_stock',
  );

  const [custStats] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM customers',
  );

  return {
    totalSales: Number((orderStats[0] as any).total_sales ?? 0),
    orderCount: Number((orderStats[0] as any).order_count ?? 0),
    customerCount: Number((custStats[0] as any).c ?? 0),
    lowStockCount: Number((stockStats[0] as any).low_stock ?? 0),
  };
}
