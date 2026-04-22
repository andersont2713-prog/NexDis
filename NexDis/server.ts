import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

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
    | { type: 'inventory:updated'; payload: any };

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

  app.get('/api/inventory', (req, res) => res.json(db.inventory));
  app.post('/api/inventory', (req, res) => {
    const body = req.body ?? {};
    if (!body?.name || !body?.sku) {
      return res.status(400).json({ error: 'name and sku are required' });
    }

    const product = {
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

    db.inventory.push(product);
    broadcast({ type: 'inventory:updated', payload: product });
    return res.status(201).json(product);
  });
  app.get('/api/customers', (req, res) => res.json(db.customers));
  
  app.post('/api/customers', (req, res) => {
    const customer = { ...req.body, id: `CUST-00${db.customers.length + 1}`, currentBalance: 0 };
    db.customers.push(customer);
    broadcast({ type: 'customers:created', payload: customer });
    res.status(201).json(customer);
  });
  
  app.post('/api/orders', (req, res) => {
    const order = { ...req.body, id: Date.now().toString(), status: 'pending', createdAt: new Date() };
    db.orders.push(order);
    broadcast({ type: 'orders:created', payload: order });
    res.json(order);
  });

  app.post('/api/visits', (req, res) => {
    const visit = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
    db.visits.push(visit);
    res.json(visit);
  });

  app.get('/api/stats', (req, res) => {
    const totalSales = db.orders.reduce((sum, o) => sum + o.total, 0);
    const lowStockCount = db.inventory.filter(i => i.stock <= i.minStock).length;
    res.json({
      totalSales,
      orderCount: db.orders.length,
      customerCount: db.customers.length,
      lowStockCount
    });
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
  });
}

startServer();
