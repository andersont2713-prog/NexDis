-- NexDis: schema MySQL 8.0
-- Se carga automáticamente la primera vez que arranca el contenedor
-- (docker-entrypoint-initdb.d). Para re-aplicarlo: `docker compose down -v && docker compose up -d`.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  name       VARCHAR(120) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Productos (inventario maestro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           VARCHAR(64)    NOT NULL,
  name         VARCHAR(255)   NOT NULL,
  sku          VARCHAR(120)   NOT NULL,
  stock        INT            NOT NULL DEFAULT 0,
  min_stock    INT            NOT NULL DEFAULT 0,
  max_stock    INT            NOT NULL DEFAULT 0,
  warehouse    VARCHAR(120)   NOT NULL DEFAULT 'Principal',
  lot          VARCHAR(120)   NOT NULL DEFAULT 'N/A',
  expiry       VARCHAR(32)    NOT NULL DEFAULT '2099-12-31',
  price        DECIMAL(12,2)  NOT NULL DEFAULT 0,
  category     VARCHAR(120)   NOT NULL DEFAULT 'General',
  image_url    LONGTEXT       NULL,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_category (category),
  KEY ix_products_warehouse (warehouse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Clientes (CRM básico)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id              VARCHAR(64)    NOT NULL,
  name            VARCHAR(255)   NOT NULL,
  contact         VARCHAR(255)   NOT NULL DEFAULT '',
  credit_limit    DECIMAL(14,2)  NOT NULL DEFAULT 0,
  current_balance DECIMAL(14,2)  NOT NULL DEFAULT 0,
  lat             DOUBLE         NULL,
  lng             DOUBLE         NULL,
  email           VARCHAR(255)   NOT NULL DEFAULT '',
  phone           VARCHAR(64)    NOT NULL DEFAULT '',
  address         VARCHAR(500)   NOT NULL DEFAULT '',
  history         JSON           NULL,
  created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Pedidos (payload JSON para flexibilidad con la app actual)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id         VARCHAR(64) NOT NULL,
  payload    JSON        NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Datos semilla
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO categories (id, name) VALUES
  (UUID(), 'General'),
  (UUID(), 'Abarrotes'),
  (UUID(), 'Bebidas'),
  (UUID(), 'Lácteos'),
  (UUID(), 'Limpieza');

INSERT IGNORE INTO products
  (id, name, sku, stock, min_stock, max_stock, warehouse, lot, expiry, price, category)
VALUES
  ('1',  'Arroz Premium 1kg',       'ARZ-001', 1200, 200, 5000, 'Principal', 'L2024-001', '2025-12-31',  4.50, 'Abarrotes'),
  ('2',  'Aceite Girasol 900ml',    'ACE-900',  850, 100, 2000, 'Norte',     'L2024-052', '2025-06-15',  8.90, 'Abarrotes'),
  ('3',  'Azúcar Rubia 1kg',        'AZU-001',  600, 150, 3000, 'Principal', 'L2024-014', '2026-02-28',  4.20, 'Abarrotes'),
  ('4',  'Harina de Trigo 1kg',     'HAR-001',  420, 100, 2500, 'Principal', 'L2024-021', '2025-10-10',  3.80, 'Abarrotes'),
  ('5',  'Fideos Spaghetti 500g',   'FID-500',  350,  80, 2000, 'Principal', 'L2024-033', '2026-01-20',  2.80, 'Abarrotes'),
  ('6',  'Atún en lata 170g',       'ATN-170',  220,  60, 1200, 'Principal', 'L2024-044', '2026-08-15',  5.60, 'Abarrotes'),
  ('7',  'Leche Entera 1L',         'LEC-001',  300,  80, 1800, 'Norte',     'L2024-055', '2025-05-30',  4.20, 'Lácteos'),
  ('8',  'Yogurt Fresa 1L',         'YOG-FRE',  180,  50,  900, 'Norte',     'L2024-061', '2025-04-22',  6.90, 'Lácteos'),
  ('9',  'Queso Fresco 500g',       'QUE-500',   95,  40,  600, 'Norte',     'L2024-066', '2025-03-10',  9.50, 'Lácteos'),
  ('10', 'Mantequilla 200g',        'MAN-200',  140,  40,  700, 'Norte',     'L2024-069', '2025-07-01',  7.40, 'Lácteos'),
  ('11', 'Gaseosa Cola 3L',         'GAS-CO3',  260,  80, 1500, 'Sur',       'L2024-071', '2025-11-05',  9.90, 'Bebidas'),
  ('12', 'Agua Mineral 625ml',      'AGU-625',  540, 120, 3000, 'Sur',       'L2024-073', '2026-09-18',  1.50, 'Bebidas'),
  ('13', 'Jugo Naranja 1L',         'JUG-NAR',  160,  40,  900, 'Sur',       'L2024-075', '2025-08-12',  4.90, 'Bebidas'),
  ('14', 'Cerveza Lata 355ml',      'CER-355',  480, 100, 2000, 'Sur',       'L2024-077', '2025-12-01',  4.50, 'Bebidas'),
  ('15', 'Café Molido 250g',        'CAF-250',  110,  30,  600, 'Principal', 'L2024-080', '2026-03-25', 12.50, 'Abarrotes');

INSERT IGNORE INTO customers
  (id, name, contact, credit_limit, current_balance, lat, lng, email, phone, address, history)
VALUES
  ('1', 'Minimarket La Esquina', 'Juan Perez', 50000, 12500, -12.046374, -77.042793, '', '', '', JSON_ARRAY()),
  ('2', 'Tienda Don Pepe',       'Jose Garcia', 20000,  5000, -12.050000, -77.050000, '', '', '', JSON_ARRAY());
