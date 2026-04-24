import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createApiApp } from './server/apiApp.js';
import { getSupabaseAdmin } from './server/supabaseAdmin.js';
import { getMysqlPool } from './server/mysqlAdmin.js';

// Cargar variables de entorno: .env.local tiene prioridad sobre .env
// (igual que hace Vite en el frontend).
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  // Mount API routes (shared with Vercel serverless)
  app.use(createApiApp({ supportSse: true }));

  // Vite middleware for dev, static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (getMysqlPool()) {
      console.log(
        `MySQL: activo (${process.env.MYSQL_HOST ?? '127.0.0.1'}:${process.env.MYSQL_PORT ?? '3306'}/${process.env.MYSQL_DATABASE ?? 'nexdis'})`,
      );
    } else if (getSupabaseAdmin()) {
      console.log('Supabase: activo (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)');
    } else {
      console.log('Datos: base en memoria (no hay MySQL ni Supabase configurados)');
    }
  });
}

startServer();
