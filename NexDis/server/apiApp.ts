import express, { type Express, type Response } from 'express';
import multer from 'multer';
import { getSupabaseAdmin } from './supabaseAdmin';
import {
  sbListCategories,
  sbInsertCategory,
  sbListProducts,
  sbInsertProduct,
  sbUpdateProductImageUrl,
  sbListCustomers,
  sbInsertCustomer,
  sbInsertOrder,
  sbListOrders,
  sbUpdateOrderStatus,
  sbDecrementStock,
  sbStats,
} from './supabaseRepo';

type RealtimeEvent =
  | { type: 'customers:created'; payload: any }
  | { type: 'orders:created'; payload: any }
  | { type: 'inventory:updated'; payload: any }
  | { type: 'categories:updated'; payload: any };

export function createInitialDb() {
  return {
    inventory: [
      { id: '1', name: 'Arroz Premium 1kg', sku: 'ARZ-001', stock: 1200, minStock: 200, maxStock: 5000, warehouse: 'Principal', lot: 'L2024-001', expiry: '2025-12-31', price: 4.50, category: 'Abarrotes', imageUrl: null },
      { id: '2', name: 'Aceite Girasol 900ml', sku: 'ACE-900', stock: 850, minStock: 100, maxStock: 2000, warehouse: 'Norte', lot: 'L2024-052', expiry: '2025-06-15', price: 8.90, category: 'Abarrotes', imageUrl: null },
      { id: '3', name: 'Azúcar Rubia 1kg', sku: 'AZU-001', stock: 600, minStock: 150, maxStock: 3000, warehouse: 'Principal', lot: 'L2024-014', expiry: '2026-02-28', price: 4.20, category: 'Abarrotes', imageUrl: null },
      { id: '4', name: 'Harina de Trigo 1kg', sku: 'HAR-001', stock: 420, minStock: 100, maxStock: 2500, warehouse: 'Principal', lot: 'L2024-021', expiry: '2025-10-10', price: 3.80, category: 'Abarrotes', imageUrl: null },
      { id: '5', name: 'Fideos Spaghetti 500g', sku: 'FID-500', stock: 350, minStock: 80, maxStock: 2000, warehouse: 'Principal', lot: 'L2024-033', expiry: '2026-01-20', price: 2.80, category: 'Abarrotes', imageUrl: null },
      { id: '6', name: 'Atún en lata 170g', sku: 'ATN-170', stock: 220, minStock: 60, maxStock: 1200, warehouse: 'Principal', lot: 'L2024-044', expiry: '2026-08-15', price: 5.60, category: 'Abarrotes', imageUrl: null },
      { id: '7', name: 'Leche Entera 1L', sku: 'LEC-001', stock: 300, minStock: 80, maxStock: 1800, warehouse: 'Norte', lot: 'L2024-055', expiry: '2025-05-30', price: 4.20, category: 'Lácteos', imageUrl: null },
      { id: '8', name: 'Yogurt Fresa 1L', sku: 'YOG-FRE', stock: 180, minStock: 50, maxStock: 900, warehouse: 'Norte', lot: 'L2024-061', expiry: '2025-04-22', price: 6.90, category: 'Lácteos', imageUrl: null },
      { id: '9', name: 'Queso Fresco 500g', sku: 'QUE-500', stock: 95, minStock: 40, maxStock: 600, warehouse: 'Norte', lot: 'L2024-066', expiry: '2025-03-10', price: 9.50, category: 'Lácteos', imageUrl: null },
      { id: '10', name: 'Mantequilla 200g', sku: 'MAN-200', stock: 140, minStock: 40, maxStock: 700, warehouse: 'Norte', lot: 'L2024-069', expiry: '2025-07-01', price: 7.40, category: 'Lácteos', imageUrl: null },
      { id: '11', name: 'Gaseosa Cola 3L', sku: 'GAS-CO3', stock: 260, minStock: 80, maxStock: 1500, warehouse: 'Sur', lot: 'L2024-071', expiry: '2025-11-05', price: 9.90, category: 'Bebidas', imageUrl: null },
      { id: '12', name: 'Agua Mineral 625ml', sku: 'AGU-625', stock: 540, minStock: 120, maxStock: 3000, warehouse: 'Sur', lot: 'L2024-073', expiry: '2026-09-18', price: 1.50, category: 'Bebidas', imageUrl: null },
      { id: '13', name: 'Jugo Naranja 1L', sku: 'JUG-NAR', stock: 160, minStock: 40, maxStock: 900, warehouse: 'Sur', lot: 'L2024-075', expiry: '2025-08-12', price: 4.90, category: 'Bebidas', imageUrl: null },
      { id: '14', name: 'Cerveza Lata 355ml', sku: 'CER-355', stock: 480, minStock: 100, maxStock: 2000, warehouse: 'Sur', lot: 'L2024-077', expiry: '2025-12-01', price: 4.50, category: 'Bebidas', imageUrl: null },
      { id: '15', name: 'Café Molido 250g', sku: 'CAF-250', stock: 110, minStock: 30, maxStock: 600, warehouse: 'Principal', lot: 'L2024-080', expiry: '2026-03-25', price: 12.50, category: 'Abarrotes', imageUrl: null },
      { id: '16', name: 'Galletas Surtidas 300g', sku: 'GAL-300', stock: 230, minStock: 50, maxStock: 1200, warehouse: 'Principal', lot: 'L2024-082', expiry: '2025-09-19', price: 5.20, category: 'Abarrotes', imageUrl: null },
      { id: '17', name: 'Detergente Líquido 1L', sku: 'DET-1L', stock: 190, minStock: 50, maxStock: 1100, warehouse: 'Principal', lot: 'L2024-084', expiry: '2027-01-14', price: 8.80, category: 'Limpieza', imageUrl: null },
      { id: '18', name: 'Jabón de Tocador x3', sku: 'JAB-X3', stock: 320, minStock: 80, maxStock: 1800, warehouse: 'Principal', lot: 'L2024-086', expiry: '2027-06-06', price: 4.60, category: 'Limpieza', imageUrl: null },
      { id: '19', name: 'Lejía 1L', sku: 'LEJ-1L', stock: 210, minStock: 60, maxStock: 1200, warehouse: 'Principal', lot: 'L2024-088', expiry: '2026-10-30', price: 3.50, category: 'Limpieza', imageUrl: null },
      { id: '20', name: 'Papel higiénico pack x4', sku: 'PAP-X4', stock: 400, minStock: 80, maxStock: 2200, warehouse: 'Principal', lot: 'L2024-090', expiry: '2030-01-01', price: 6.20, category: 'Limpieza', imageUrl: null },
    ] as any[],
    categories: ['General', 'Abarrotes', 'Bebidas', 'Lácteos', 'Limpieza'],
    customers: [
      { id: '1', name: 'Minimarket La Esquina', contact: 'Juan Perez', creditLimit: 50000, currentBalance: 12500, lat: -12.046374, lng: -77.042793, history: [] },
      { id: '2', name: 'Tienda Don Pepe', contact: 'Jose Garcia', creditLimit: 20000, currentBalance: 5000, lat: -12.050000, lng: -77.050000, history: [] },
    ] as any[],
    orders: [] as any[],
    visits: [] as any[],
  };
}

export type InMemoryDb = ReturnType<typeof createInitialDb>;

type Options = {
  db?: InMemoryDb;
  uploadsDir?: string | null;
  supportSse?: boolean;
};

export function createApiApp(opts: Options = {}): Express {
  const app = express();
  const db: InMemoryDb = opts.db ?? createInitialDb();
  const supportSse = opts.supportSse !== false;

  app.use(express.json({ limit: '10mb' }));

  const sseClients = new Set<Response>();

  function broadcast(event: RealtimeEvent) {
    if (!supportSse) return;
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
    for (const res of sseClients) {
      try { res.write(data); } catch {}
    }
  }

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  app.get('/api/events', (req, res) => {
    if (!supportSse) {
      return res.status(200).json({ enabled: false, message: 'SSE disabled in serverless mode' });
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    res.write('event: ready\ndata: {}\n\n');
    sseClients.add(res);
    const keepAlive = setInterval(() => {
      try { res.write('event: ping\ndata: {}\n\n'); } catch {}
    }, 25_000);
    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      supabase: !!getSupabaseAdmin(),
      sse: supportSse,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/inventory', async (_req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbListProducts(sb));
      res.json(db.inventory);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al leer inventario' });
    }
  });

  app.get('/api/categories', async (_req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbListCategories(sb));
      res.json(db.categories);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al leer categorías' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        await sbInsertCategory(sb, name);
        broadcast({ type: 'categories:updated', payload: { name } });
        return res.status(201).json({ name });
      }
      const exists = db.categories.some((c: string) => c.toLowerCase() === name.toLowerCase());
      if (exists) return res.status(409).json({ error: 'category already exists' });
      db.categories.push(name);
      broadcast({ type: 'categories:updated', payload: { name } });
      return res.status(201).json({ name });
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '');
      if (msg.includes('duplicate') || msg.includes('unique') || e?.code === '23505') {
        return res.status(409).json({ error: 'category already exists' });
      }
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al crear categoría' });
    }
  });

  app.post('/api/inventory', async (req, res) => {
    const body = req.body ?? {};
    if (!body?.name || !body?.sku) return res.status(400).json({ error: 'name and sku are required' });
    const payload = {
      id: `PROD-${Date.now()}`,
      name: body.name,
      sku: body.sku,
      stock: Number(body.stock ?? 0),
      minStock: Number(body.minStock ?? 0),
      maxStock: Number(body.maxStock ?? 0),
      warehouse: body.warehouse ?? 'Principal',
      lot: body.lot ?? 'N/A',
      expiry: body.expiry ?? '2099-12-31',
      price: Number(body.price ?? 0),
      category: body.category ?? 'General',
      imageUrl: body.imageUrl ?? null,
    };
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const saved = await sbInsertProduct(sb, payload);
        broadcast({ type: 'inventory:updated', payload: saved });
        return res.status(201).json(saved);
      }
      db.inventory.push(payload);
      broadcast({ type: 'inventory:updated', payload });
      return res.status(201).json(payload);
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '');
      if (msg.includes('duplicate') || msg.includes('unique') || e?.code === '23505') {
        return res.status(409).json({ error: 'SKU ya existe' });
      }
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al crear producto' });
    }
  });

  app.post('/api/inventory/:id/photo', upload.single('photo'), async (req, res) => {
    const id = String(req.params.id);
    const file = (req as any).file as { buffer: Buffer; originalname: string; mimetype: string } | undefined;
    if (!file) return res.status(400).json({ error: 'photo file is required' });

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const saved = await sbUpdateProductImageUrl(sb, id, dataUrl);
        broadcast({ type: 'inventory:updated', payload: saved });
        return res.json(saved);
      }
      const idx = db.inventory.findIndex((p: any) => String(p.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'product not found' });
      db.inventory[idx] = { ...db.inventory[idx], imageUrl: dataUrl };
      broadcast({ type: 'inventory:updated', payload: db.inventory[idx] });
      return res.json(db.inventory[idx]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al subir foto' });
    }
  });

  app.get('/api/customers', async (_req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbListCustomers(sb));
      res.json(db.customers);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al leer clientes' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const customer = await sbInsertCustomer(sb, req.body ?? {});
        broadcast({ type: 'customers:created', payload: customer });
        return res.status(201).json(customer);
      }
      const customer = { ...req.body, id: `CUST-00${db.customers.length + 1}`, currentBalance: 0 };
      db.customers.push(customer);
      broadcast({ type: 'customers:created', payload: customer });
      res.status(201).json(customer);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al crear cliente' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const normalizedItems = items.map((i: any) => ({
        productId: String(i.productId),
        quantity: Number(i.quantity ?? 0),
      })).filter((i: any) => i.productId && i.quantity > 0);

      if (normalizedItems.length === 0) return res.status(400).json({ error: 'items is required' });

      const base = {
        ...req.body,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const sb = getSupabaseAdmin();
      if (sb) {
        await sbDecrementStock(sb, normalizedItems);
        const order = await sbInsertOrder(sb, base);
        broadcast({ type: 'orders:created', payload: order });
        broadcast({ type: 'inventory:updated', payload: { reason: 'order', orderId: base.id } });
        return res.json(order);
      }

      for (const item of normalizedItems) {
        const product = db.inventory.find((p: any) => p.id === item.productId);
        if (!product) return res.status(404).json({ error: `Producto no existe: ${item.productId}` });
        if (product.stock < item.quantity) {
          return res.status(409).json({ error: `Stock insuficiente para ${product.sku}`, sku: product.sku, stock: product.stock, requested: item.quantity });
        }
      }
      for (const item of normalizedItems) {
        const product = db.inventory.find((p: any) => p.id === item.productId);
        product.stock -= item.quantity;
      }

      db.orders.push(base);
      broadcast({ type: 'orders:created', payload: base });
      broadcast({ type: 'inventory:updated', payload: { reason: 'order', orderId: base.id } });
      res.json(base);
    } catch (e: any) {
      console.error(e);
      const msg = String(e?.message ?? e ?? '');
      if (msg.includes('Stock insuficiente')) return res.status(409).json({ error: msg });
      res.status(500).json({ error: e?.message ?? 'Error al crear pedido' });
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const sellerId = req.query.sellerId ? String(req.query.sellerId) : undefined;
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbListOrders(sb, { sellerId }));
      const orders = sellerId ? db.orders.filter((o: any) => o.sellerId === sellerId) : db.orders;
      res.json(orders);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al leer pedidos' });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    const id = String(req.params.id);
    const status = String(req.body?.status ?? '').trim();
    const allowed = new Set(['pending', 'processed', 'shipped', 'delivered', 'cancelled']);
    if (!allowed.has(status)) return res.status(400).json({ error: 'invalid status' });
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const updated = await sbUpdateOrderStatus(sb, id, status);
        broadcast({ type: 'orders:created', payload: updated });
        return res.json(updated);
      }
      const idx = db.orders.findIndex((o: any) => String(o.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'order not found' });
      db.orders[idx] = { ...db.orders[idx], status };
      broadcast({ type: 'orders:created', payload: db.orders[idx] });
      return res.json(db.orders[idx]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al actualizar estado' });
    }
  });

  app.post('/api/visits', (req, res) => {
    const visit = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
    db.visits.push(visit);
    res.json(visit);
  });

  app.get('/api/stats', async (_req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbStats(sb));
      const totalSales = db.orders.reduce((sum, o: any) => sum + Number(o.total ?? 0), 0);
      const lowStockCount = db.inventory.filter((i: any) => i.stock <= i.minStock).length;
      res.json({
        totalSales,
        orderCount: db.orders.length,
        customerCount: db.customers.length,
        lowStockCount,
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al calcular estadísticas' });
    }
  });

  return app;
}
