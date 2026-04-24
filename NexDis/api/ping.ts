import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    message: 'Ping minimal sin Express',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}
