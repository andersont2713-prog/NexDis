import type {SupabaseClient} from '@supabase/supabase-js';
import {getSupabaseAdmin} from './supabaseAdmin.ts';

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  warehouse: string;
  lot: string;
  expiry: string;
  price: number;
  category: string;
};

function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    stock: row.stock,
    minStock: row.min_stock,
    maxStock: row.max_stock,
    warehouse: row.warehouse,
    lot: row.lot,
    expiry: row.expiry,
    price: Number(row.price),
    category: row.category,
  };
}

export async function sbListCategories(sb: SupabaseClient): Promise<string[]> {
  const {data, error} = await sb.from('categories').select('name').order('name');
  if (error) throw error;
  return (data ?? []).map((r: {name: string}) => r.name);
}

export async function sbInsertCategory(sb: SupabaseClient, name: string): Promise<void> {
  const {error} = await sb.from('categories').insert({name});
  if (error) throw error;
}

export async function sbListProducts(sb: SupabaseClient) {
  const {data, error} = await sb.from('products').select('*').order('name');
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

export async function sbInsertProduct(sb: SupabaseClient, input: {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
  lot: string;
  expiry: string;
  price: number;
  category: string;
}) {
  const row = {
    id: input.id,
    name: input.name,
    sku: input.sku,
    stock: input.stock,
    min_stock: input.minStock,
    max_stock: input.maxStock,
    warehouse: input.warehouse,
    lot: input.lot,
    expiry: input.expiry,
    price: input.price,
    category: input.category,
  };
  const {data, error} = await sb.from('products').insert(row).select('*').single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
}

export async function sbListCustomers(sb: SupabaseClient) {
  const {data, error} = await sb.from('customers').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    contact: r.contact ?? '',
    creditLimit: Number(r.credit_limit ?? 0),
    currentBalance: Number(r.current_balance ?? 0),
    lat: r.lat != null ? Number(r.lat) : 0,
    lng: r.lng != null ? Number(r.lng) : 0,
    email: r.email ?? '',
    phone: r.phone ?? '',
    address: r.address ?? '',
    history: Array.isArray(r.history) ? r.history : [],
  }));
}

export async function sbInsertCustomer(sb: SupabaseClient, body: Record<string, unknown>) {
  const id = String(body.id ?? `CUST-${Date.now()}`);
  const row = {
    id,
    name: body.name,
    contact: body.contact ?? '',
    credit_limit: Number(body.creditLimit ?? body.credit_limit ?? 0),
    current_balance: Number(body.currentBalance ?? body.current_balance ?? 0),
    lat: body.lat != null ? Number(body.lat) : null,
    lng: body.lng != null ? Number(body.lng) : null,
    email: body.email ?? '',
    phone: body.phone ?? '',
    address: body.address ?? '',
    history: body.history ?? [],
  };
  const {data, error} = await sb.from('customers').insert(row).select('*').single();
  if (error) throw error;
  const r = data as any;
  return {
    id: r.id,
    name: r.name,
    contact: r.contact ?? '',
    creditLimit: Number(r.credit_limit ?? 0),
    currentBalance: Number(r.current_balance ?? 0),
    lat: r.lat != null ? Number(r.lat) : 0,
    lng: r.lng != null ? Number(r.lng) : 0,
    email: r.email ?? '',
    phone: r.phone ?? '',
    address: r.address ?? '',
    history: Array.isArray(r.history) ? r.history : [],
  };
}

export async function sbInsertOrder(sb: SupabaseClient, order: Record<string, unknown>) {
  const id = String(order.id ?? Date.now());
  const full: Record<string, unknown> = {...order, id};
  const {error} = await sb.from('orders').insert({id, payload: full});
  if (error) throw error;
  return {
    ...full,
    status: (full.status as string | undefined) ?? 'pending',
    createdAt: (full.createdAt as Date | string | undefined) ?? new Date(),
  };
}

export async function sbStats(sb: SupabaseClient) {
  const {data: orders, error: e1} = await sb.from('orders').select('payload');
  if (e1) throw e1;
  const {data: products, error: e2} = await sb.from('products').select('stock,min_stock');
  if (e2) throw e2;
  const {count: customerCount, error: e3} = await sb.from('customers').select('*', {count: 'exact', head: true});
  if (e3) throw e3;

  let totalSales = 0;
  for (const o of orders ?? []) {
    const p = (o as {payload: {total?: number}}).payload;
    totalSales += Number(p?.total ?? 0);
  }
  const lowStockCount = (products ?? []).filter(
    (p: {stock: number; min_stock: number}) => p.stock <= p.min_stock,
  ).length;

  return {
    totalSales,
    orderCount: (orders ?? []).length,
    customerCount: customerCount ?? 0,
    lowStockCount,
  };
}

export async function sbListOrders(
  sb: SupabaseClient,
  opts: { sellerId?: string } = {},
): Promise<any[]> {
  const q = sb.from('orders').select('payload,created_at').order('created_at', {ascending: false});
  const {data, error} = opts.sellerId ? await q.eq('payload->>sellerId', opts.sellerId) : await q;
  if (error) throw error;
  return (data ?? []).map((r: any) => r.payload);
}

export async function sbUpdateOrderStatus(
  sb: SupabaseClient,
  id: string,
  status: string,
): Promise<any> {
  const {data: existing, error: e1} = await sb.from('orders').select('payload').eq('id', id).single();
  if (e1) throw e1;
  const payload = {...(existing as any).payload, status};
  const {error: e2} = await sb.from('orders').update({payload}).eq('id', id);
  if (e2) throw e2;
  return payload;
}

export async function sbDecrementStock(
  sb: SupabaseClient,
  items: {productId: string; quantity: number}[],
): Promise<void> {
  const ids = Array.from(new Set(items.map((i) => i.productId)));
  const {data, error} = await sb.from('products').select('id,stock').in('id', ids);
  if (error) throw error;

  const byId = new Map<string, number>();
  for (const r of data ?? []) byId.set((r as any).id, Number((r as any).stock ?? 0));

  for (const item of items) {
    const current = byId.get(item.productId);
    if (current == null) throw new Error(`Producto no existe: ${item.productId}`);
    if (current < item.quantity) {
      throw new Error(`Stock insuficiente para ${item.productId}: ${current} < ${item.quantity}`);
    }
    byId.set(item.productId, current - item.quantity);
  }

  for (const [id, newStock] of byId.entries()) {
    const {error: e2} = await sb.from('products').update({stock: newStock}).eq('id', id);
    if (e2) throw e2;
  }
}
