import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseAdmin } from './server/supabaseAdmin.ts';
import {
  sbListCategories,
  sbInsertCategory,
  sbListProducts,
  sbInsertProduct,
  sbListCustomers,
  sbInsertCustomer,
  sbInsertOrder,
  sbStats,
} from './server/supabaseRepo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
      { id: '1', name: 'Arroz Premium 1kg', sku: 'ARZ-001', stock: 1200, minStock: 200, maxStock: 5000, warehouse: 'Principal', lot: 'L2024-001', expiry: '2025-12-31' },
      { id: '2', name: 'Aceite Girasol 900ml', sku: 'ACE-900', stock: 850, minStock: 100, maxStock: 2000, warehouse: 'Norte', lot: 'L2024-052', expiry: '2025-06-15' },
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
      const sb = getSupabaseAdmin();
      const base = {...req.body, id: Date.now().toString(), status: 'pending', createdAt: new Date()};
      if (sb) {
        const order = await sbInsertOrder(sb, base);
        broadcast({ type: 'orders:created', payload: order });
        return res.json(order);
      }

      db.orders.push(base);
      broadcast({ type: 'orders:created', payload: base });
      res.json(base);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.message ?? 'Error al crear pedido' });
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
