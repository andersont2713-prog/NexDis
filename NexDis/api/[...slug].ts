import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/test-import', async (_req, res) => {
  try {
    const mod = await import('../server/apiApp');
    res.json({ ok: true, hasCreateApiApp: typeof mod.createApiApp === 'function' });
  } catch (e: any) {
    res.status(500).json({ error: 'import failed', message: e?.message, stack: e?.stack });
  }
});

app.get('/api/test-create', async (_req, res) => {
  try {
    const { createApiApp } = await import('../server/apiApp');
    const a = createApiApp({ supportSse: false });
    res.json({ ok: true, type: typeof a });
  } catch (e: any) {
    res.status(500).json({ error: 'create failed', message: e?.message, stack: e?.stack });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Hello from Express on Vercel', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.status(404).json({ error: 'not found', path: req.url });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
