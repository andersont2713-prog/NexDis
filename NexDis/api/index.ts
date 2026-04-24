import type { IncomingMessage, ServerResponse } from 'http';
import { createApiApp } from '../server/apiApp';

const app = createApiApp({ supportSse: false });

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (app as any)(req, res);
}

export const config = {
  maxDuration: 30,
};
