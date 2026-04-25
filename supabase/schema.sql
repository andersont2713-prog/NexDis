-- Ejecutar en Supabase: SQL Editor → New query → Run
-- Proyecto NexDis: tablas base para inventario, categorías, clientes y pedidos.
--
-- Si pegas y falla: no partas filas a la mitad; cada fila de VALUES es un ( ... )
-- completo. Usa nombres sin tilde en datos de prueba para evitar problemas de
-- copiado en algunos editores (o duplica comillas en SQL: 'Juan''s' ).

create extension if not exists "pgcrypto";

-- Categorías de producto
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Productos (inventario maestro)
create table if not exists public.products (
  id text primary key,
  name text not null,
  sku text not null unique,
  stock int not null default 0,
  min_stock int not null default 0,
  max_stock int not null default 0,
  warehouse text not null default 'Principal',
  lot text not null default 'N/A',
  expiry text not null default '2099-12-31',
  price numeric not null default 0,
  category text not null default 'General',
  image_url text,
  created_at timestamptz default now()
);

-- Clientes CRM
create table if not exists public.customers (
  id text primary key,
  name text not null,
  contact text default '',
  credit_limit numeric default 0,
  current_balance numeric default 0,
  lat double precision,
  lng double precision,
  email text default '',
  phone text default '',
  address text default '',
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Pedidos (payload JSON para flexibilidad con la app actual)
create table if not exists public.orders (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Datos iniciales (idempotente: seguro re-ejecutar)
-- ---------------------------------------------------------------------------

insert into public.categories (name)
values
  ('General'),
  ('Abarrotes'),
  ('Bebidas'),
  ('Lácteos'),
  ('Limpieza')
on conflict (name) do nothing;

-- id, name, sku, stock, min_stock, max_stock, warehouse, lot, expiry, price, category
insert into public.products (id, name, sku, stock, min_stock, max_stock, warehouse, lot, expiry, price, category)
values
  (
    '1',
    'Arroz Premium 1kg',
    'ARZ-001',
    1200,
    200,
    5000,
    'Principal',
    'L2024-001',
    '2025-12-31',
    0,
    'Abarrotes'
  ),
  (
    '2',
    'Aceite Girasol 900ml',
    'ACE-900',
    850,
    100,
    2000,
    'Norte',
    'L2024-052',
    '2025-06-15',
    0,
    'Abarrotes'
  )
on conflict (id) do nothing;

-- id, name, contact, credit_limit, current_balance, lat, lng, email, phone, address, history
insert into public.customers (id, name, contact, credit_limit, current_balance, lat, lng, email, phone, address, history)
values
  (
    '1',
    'Minimarket La Esquina',
    'Juan Perez',
    50000,
    12500,
    -12.046374,
    -77.042793,
    '',
    '',
    '',
    '[]'::jsonb
  ),
  (
    '2',
    'Tienda Don Pepe',
    'Jose Garcia',
    20000,
    5000,
    -12.05,
    -77.05,
    '',
    '',
    '',
    '[]'::jsonb
  )
on conflict (id) do nothing;

-- Más adelante: habilita RLS y define políticas en el dashboard (especialmente si usas VITE_SUPABASE_ANON_KEY en el cliente).
