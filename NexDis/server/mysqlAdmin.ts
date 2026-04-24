import mysql from 'mysql2/promise';

let cachedPool: mysql.Pool | null | undefined;

/**
 * Devuelve un pool de conexiones MySQL reutilizable.
 * Retorna `null` si las variables de entorno no están configuradas.
 *
 * Variables soportadas:
 *   MYSQL_URL              (mysql://user:pass@host:3306/dbname)      ← prioridad
 *   - o bien -
 *   MYSQL_HOST             (default: 127.0.0.1)
 *   MYSQL_PORT             (default: 3306)
 *   MYSQL_USER             (requerido)
 *   MYSQL_PASSWORD         (requerido)
 *   MYSQL_DATABASE         (requerido)
 *   MYSQL_CONNECTION_LIMIT (default: 10)
 *   MYSQL_SSL              ('true' para producción con SSL obligatorio)
 */
export function getMysqlPool(): mysql.Pool | null {
  if (cachedPool !== undefined) return cachedPool;

  const url = process.env.MYSQL_URL?.trim();

  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE?.trim();

  if (!url && (!user || !database)) {
    cachedPool = null;
    return null;
  }

  const ssl =
    process.env.MYSQL_SSL === 'true'
      ? { rejectUnauthorized: true }
      : undefined;

  try {
    cachedPool = url
      ? mysql.createPool(url)
      : mysql.createPool({
          host: process.env.MYSQL_HOST?.trim() || '127.0.0.1',
          port: Number(process.env.MYSQL_PORT || 3306),
          user: user!,
          password: password ?? '',
          database: database!,
          waitForConnections: true,
          connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
          queueLimit: 0,
          dateStrings: true,
          ssl,
        });

    return cachedPool;
  } catch (e) {
    console.error('[mysql] Error creando pool', e);
    cachedPool = null;
    return null;
  }
}

export function isMysqlConfigured(): boolean {
  return getMysqlPool() !== null;
}

/** Helper para tests/cierres controlados. Ideal para scripts CLI. */
export async function closeMysqlPool(): Promise<void> {
  if (cachedPool) {
    await cachedPool.end();
    cachedPool = null;
  }
}
