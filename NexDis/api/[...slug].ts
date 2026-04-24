import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApiApp } from '../server/apiApp.js';

const app = createApiApp({ supportSse: false });

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}

export const config = {
  maxDuration: 30,
};
