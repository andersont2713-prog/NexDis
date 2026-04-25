// Script de inicialización MySQL para NexDis
// Uso: node scripts/mysql-init.mjs
//
// Lee .env.local y aplica mysql/schema.sql en la base MYSQL_DATABASE.
// Reporta número de tablas y filas al final.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ---- Cargar .env.local a mano (sin dependencia dotenv) ----
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.join(rootDir, '.env'));

const dbName =
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'nexdis';
const baseConfig = {
  host: process.env.MYSQL_HOST || process.env.MYSQLHOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
  password: process.env.MYSQL_PASSWORD ?? process.env.MYSQLPASSWORD ?? '',
  multipleStatements: true,
};

console.log('[nexdis] Conectando a MySQL...');
console.log(`  host     = ${baseConfig.host}:${baseConfig.port}`);
console.log(`  user     = ${baseConfig.user}`);
console.log(`  database = ${dbName}`);
console.log('');

const schemaPath = path.join(rootDir, 'mysql', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('[nexdis] ERROR: no existe mysql/schema.sql');
  process.exit(1);
}
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

try {
  // 1. Conectar sin DB específica para poder crearla
  const rootConn = await mysql.createConnection(baseConfig);
  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`[nexdis] Base '${dbName}' lista (creada si no existia).`);
  await rootConn.end();

  // 2. Conectar ya con la DB
  const conn = await mysql.createConnection({ ...baseConfig, database: dbName });

  console.log('[nexdis] Aplicando schema...');
  await conn.query(schemaSql);
  console.log('[nexdis] Schema aplicado correctamente.');
  console.log('');

  // Verificación
  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map((r) => Object.values(r)[0]);
  console.log(`[nexdis] Tablas en ${dbName}: ${tableNames.length}`);
  for (const t of tableNames) {
    const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
    console.log(`  - ${t.padEnd(14)} ${rows[0].c} filas`);
  }

  await conn.end();
  console.log('');
  console.log('[nexdis] Listo. La app ya puede conectar.');
  console.log('         Arranca el dev server con: npm run dev');
  process.exit(0);
} catch (e) {
  console.error('[nexdis] ERROR conectando o aplicando schema:');
  console.error('  code:', e.code);
  console.error('  message:', e.message);
  if (e.code === 'ECONNREFUSED') {
    console.error('  -> MySQL no responde. Verifica que XAMPP Control Panel tenga MySQL "Start".');
  } else if (e.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('  -> Usuario/password incorrectos. Ajusta MYSQL_USER y MYSQL_PASSWORD en .env.local.');
  } else if (e.code === 'ER_BAD_DB_ERROR') {
    console.error(`  -> La base '${dbName}' no existe. Créala en phpMyAdmin primero.`);
  }
  process.exit(1);
}
