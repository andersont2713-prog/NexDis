import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Hello from Express on Vercel',
    timestamp: new Date().toISOString(),
  });
});

app.get('*', (req, res) => {
  res.status(404).json({ error: 'not found', path: req.url });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
