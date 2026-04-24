# Stack MySQL + phpMyAdmin

Este proyecto puede usar **MySQL 8** como base de datos y **phpMyAdmin** como interfaz de administración, además de (o en lugar de) Supabase.

## Prioridad del backend

El servidor Express (`server/apiApp.ts`) selecciona la capa de datos en este orden:

1. **MySQL** — si `MYSQL_URL` o (`MYSQL_USER` + `MYSQL_DATABASE`) están definidos
2. **Supabase** — si `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` están definidos
3. **Memoria** — fallback para desarrollo sin infraestructura

## Requisitos

- Docker Desktop instalado y corriendo (Windows/Mac) o Docker Engine (Linux)

## Arrancar el stack local

Desde la raíz del proyecto (`NexDis/`):

```bash
docker compose up -d
```

Esto inicia dos contenedores:

| Servicio    | Puerto local | URL                       |
| ----------- | ------------ | ------------------------- |
| MySQL 8     | 3306         | `mysql://...@127.0.0.1:3306` |
| phpMyAdmin  | 8080         | http://localhost:8080     |

### Credenciales por defecto

- **Usuario:** `nexdis`
- **Contraseña:** `nexdis_pass`
- **Base de datos:** `nexdis`
- **Root:** `root` / `root_pass`

## Abrir phpMyAdmin

Ve a http://localhost:8080 y entra con:

- Servidor: `mysql` (ya prellenado)
- Usuario: `nexdis`
- Contraseña: `nexdis_pass`

Ahí puedes inspeccionar tablas, ejecutar SQL, exportar CSV/SQL, importar dumps, etc.

## Esquema inicial

El archivo `mysql/schema.sql` se carga automáticamente la **primera vez** que arranca el contenedor MySQL (gracias al volumen `docker-entrypoint-initdb.d`). Incluye:

- `categories` — catálogo de categorías
- `products` — inventario maestro
- `customers` — CRM de clientes con lat/lng
- `orders` — pedidos con payload JSON

Incluye datos semilla: 5 categorías, 15 productos, 2 clientes.

## Reaplicar el schema

Si modificas `schema.sql` y quieres que se recargue:

```bash
docker compose down -v    # ¡borra los datos!
docker compose up -d
```

## Arrancar la app Node apuntando a MySQL

Con el stack corriendo y el archivo `.env.local` configurado (ya tiene los defaults apuntando a `127.0.0.1:3306`):

```bash
npm run dev
```

El backend detectará MySQL automáticamente. Puedes verificar en http://localhost:3000/api/health:

```json
{
  "ok": true,
  "mysql": true,
  "supabase": false,
  "sse": true
}
```

## Parar el stack (conservando datos)

```bash
docker compose down
```

## Parar y eliminar todo (datos incluidos)

```bash
docker compose down -v
```

## Despliegue en producción

**Vercel no puede correr phpMyAdmin** (necesita PHP). Opciones reales:

1. **Railway** — despliega este mismo `docker-compose.yml` con un par de clics.
2. **VPS propio** (Hetzner, DigitalOcean, Contabo) — `docker compose up -d` en el servidor.
3. **Hosting compartido con cPanel** — crea la DB MySQL desde el panel, sube phpMyAdmin incluido.
4. **DB administrada** (PlanetScale / Aiven / AWS RDS) + phpMyAdmin en otro lado.

En todos los casos define en Vercel las variables `MYSQL_URL` o `MYSQL_HOST/USER/PASSWORD/DATABASE` con los datos del servidor remoto y activa `MYSQL_SSL=true`.

## Troubleshooting

- **"Access denied for user 'nexdis'"** → Borra el volumen: `docker compose down -v`. El schema solo se carga si la DB está vacía.
- **Puerto 3306 ya en uso** → Edita `docker-compose.yml` y cambia `"3306:3306"` a `"3307:3306"`, luego usa `MYSQL_PORT=3307`.
- **phpMyAdmin no carga** → Verifica que el contenedor MySQL esté `healthy`: `docker compose ps`.
