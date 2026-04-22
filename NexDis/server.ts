import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { getSupabaseAdmin } from './server/supabaseAdmin.ts';
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
} from './server/supabaseRepo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive: true});
  app.use('/uploads', express.static(uploadsDir));

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
      },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
  });

  // --- Realtime sync (SSE) ---
  type RealtimeEvent =
    | { type: 'customers:created'; payload: any }
    | { type: 'orders:created'; payload: any }
    | { type: 'inventory:updated'; payload: any }
    | { type: 'categories:updated'; payload: any };

  const sseClients = new Set<express.Response>();

  function broadcast(event: RealtimeEvent) {
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
    for (const res of sseClients) {
      try {
        res.write(data);
      } catch {
        // ignore broken pipes; cleanup happens on close
      }
    }
  }

  // Mock Database State
  let db = {
    inventory: [
      { id: '1', name: 'Arroz Premium 1kg', sku: 'ARZ-001', stock: 1200, minStock: 200, maxStock: 5000, warehouse: 'Principal', lot: 'L2024-001', expiry: '2025-12-31', imageUrl: null },
      { id: '2', name: 'Aceite Girasol 900ml', sku: 'ACE-900', stock: 850, minStock: 100, maxStock: 2000, warehouse: 'Norte', lot: 'L2024-052', expiry: '2025-06-15', imageUrl: null },
    ],
    categories: ['General', 'Abarrotes', 'Bebidas', 'Lácteos', 'Limpieza'],
    customers: [
      { id: '1', name: 'Minimarket La Esquina', contact: 'Juan Perez', creditLimit: 50000, currentBalance: 12500, lat: -12.046374, lng: -77.042793, history: [] },
      { id: '2', name: 'Tienda Don Pepe', contact: 'Jose Garcia', creditLimit: 20000, currentBalance: 5000, lat: -12.050000, lng: -77.050000, history: [] },
    ],
    orders: [],
    visits: [],
  };

  // API Routes
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders?.();
    res.write('event: ready\ndata: {}\n\n');

    sseClients.add(res);

    const keepAlive = setInterval(() => {
      res.write('event: ping\ndata: {}\n\n');
    }, 25_000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  app.get('/api/inventory', async (req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbListProducts(sb));
      res.json(db.inventory);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al leer inventario' });
    }
  });

  app.get('/api/categories', async (req, res) => {
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
    if (!body?.name || !body?.sku) {
      return res.status(400).json({ error: 'name and sku are required' });
    }

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
    const file = (req as any).file as { filename: string } | undefined;
    if (!file) return res.status(400).json({error: 'photo file is required'});

    const publicUrl = `/uploads/${file.filename}`;

    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const saved = await sbUpdateProductImageUrl(sb, id, publicUrl);
        broadcast({ type: 'inventory:updated', payload: saved });
        return res.json(saved);
      }

      const idx = db.inventory.findIndex((p: any) => String(p.id) === id);
      if (idx === -1) return res.status(404).json({error: 'product not found'});
      db.inventory[idx] = {...db.inventory[idx], imageUrl: publicUrl};
      broadcast({ type: 'inventory:updated', payload: db.inventory[idx] });
      return res.json(db.inventory[idx]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({error: e?.message ?? 'Error al subir foto'});
    }
  });

  app.get('/api/customers', async (req, res) => {
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

      if (normalizedItems.length === 0) {
        return res.status(400).json({ error: 'items is required' });
      }

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
        // emit inventory updated (clients will refetch)
        broadcast({ type: 'inventory:updated', payload: { reason: 'order', orderId: base.id } });
        return res.json(order);
      }

      // mock: decrement stock in memory
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
        broadcast({ type: 'orders:created', payload: updated }); // reuse event to trigger refetch
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

  app.get('/api/stats', async (req, res) => {
    try {
      const sb = getSupabaseAdmin();
      if (sb) return res.json(await sbStats(sb));

      const totalSales = db.orders.reduce((sum, o: any) => sum + Number(o.total ?? 0), 0);
      const lowStockCount = db.inventory.filter(i => i.stock <= i.minStock).length;
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

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (getSupabaseAdmin()) {
      console.log('Supabase: activo (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)');
    } else {
      console.log('Supabase: no configurado — usando base en memoria');
    }
  });
}

startServer();
