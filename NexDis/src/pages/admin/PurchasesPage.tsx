import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  Download,
  PackageCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

type PurchaseStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

type PurchaseItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  received: number;
  unitCost: number;
  tax: number;
};

type Purchase = {
  id: string;
  supplierId: string;
  supplierName: string;
  warehouse: string;
  status: PurchaseStatus;
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  notes: string;
  items: PurchaseItem[];
  subtotal: number;
  taxes: number;
  total: number;
  paid: number;
};

const PURCHASES_KEY = 'nexdist:purchases:v1';
const SUPPLIERS_KEY = 'nexdist:suppliers:v1';

type ProductLite = { id?: string; sku: string; name: string; price: number };

const STATUS_META: Record<PurchaseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Borrador', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: <FileText size={12} /> },
  sent: { label: 'Enviada', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', icon: <Truck size={12} /> },
  partial: { label: 'Parcial', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: <Clock size={12} /> },
  received: { label: 'Recibida', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Cancelada', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: <AlertCircle size={12} /> },
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `PO-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    : `PO-${Date.now().toString(36).toUpperCase()}`;

const SEED_PURCHASES: Purchase[] = [
  {
    id: 'PO-2041',
    supplierId: 'SUP-001',
    supplierName: 'Distribuidora Andina S.A.',
    warehouse: 'Principal',
    status: 'received',
    orderDate: new Date(2025, 10, 2).toISOString(),
    expectedDate: new Date(2025, 10, 7).toISOString(),
    receivedDate: new Date(2025, 10, 8).toISOString(),
    notes: 'Reposición mensual bebidas.',
    items: [
      { productId: 'P-001', sku: 'BEB-001', name: 'Gaseosa Cola 1.5L', quantity: 200, received: 200, unitCost: 2400, tax: 0.19 },
      { productId: 'P-002', sku: 'BEB-002', name: 'Agua Mineral 600ml', quantity: 300, received: 300, unitCost: 850, tax: 0.19 },
    ],
    subtotal: 735000,
    taxes: 139650,
    total: 874650,
    paid: 874650,
  },
  {
    id: 'PO-2042',
    supplierId: 'SUP-002',
    supplierName: 'Alimentos del Valle Ltda.',
    warehouse: 'Principal',
    status: 'partial',
    orderDate: new Date(2025, 10, 10).toISOString(),
    expectedDate: new Date(2025, 10, 18).toISOString(),
    notes: 'Pendiente completar arroz Premium.',
    items: [
      { productId: 'P-010', sku: 'ALM-010', name: 'Arroz Premium 1kg', quantity: 500, received: 300, unitCost: 3800, tax: 0.05 },
      { productId: 'P-011', sku: 'ALM-011', name: 'Azúcar 1kg', quantity: 250, received: 250, unitCost: 3200, tax: 0.05 },
    ],
    subtotal: 2700000,
    taxes: 135000,
    total: 2835000,
    paid: 1000000,
  },
  {
    id: 'PO-2043',
    supplierId: 'SUP-003',
    supplierName: 'Lácteos La Pradera',
    warehouse: 'Principal',
    status: 'sent',
    orderDate: new Date(2025, 10, 15).toISOString(),
    expectedDate: new Date(2025, 10, 17).toISOString(),
    notes: 'Programar recepción 5am.',
    items: [
      { productId: 'P-020', sku: 'LAC-020', name: 'Leche entera 1L', quantity: 400, received: 0, unitCost: 3600, tax: 0.0 },
      { productId: 'P-021', sku: 'LAC-021', name: 'Yogurt natural 1kg', quantity: 150, received: 0, unitCost: 6800, tax: 0.0 },
    ],
    subtotal: 2460000,
    taxes: 0,
    total: 2460000,
    paid: 0,
  },
  {
    id: 'PO-2044',
    supplierId: 'SUP-004',
    supplierName: 'Limpieza Total Express',
    warehouse: 'Sucursal Norte',
    status: 'draft',
    orderDate: new Date(2025, 10, 18).toISOString(),
    expectedDate: new Date(2025, 10, 25).toISOString(),
    notes: '',
    items: [
      { productId: 'P-030', sku: 'LIM-030', name: 'Detergente 3kg', quantity: 80, received: 0, unitCost: 12500, tax: 0.19 },
    ],
    subtotal: 1000000,
    taxes: 190000,
    total: 1190000,
    paid: 0,
  },
];

type DraftItem = PurchaseItem & { tmpId: string };

type SupplierLite = { id: string; name: string; active?: boolean };

export default function PurchasesPage() {
  const { formatPrice } = useRegional();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PurchaseStatus>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    supplierId: '',
    warehouse: 'Principal',
    expectedDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PURCHASES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setPurchases(parsed);
          return;
        }
      }
      setPurchases(SEED_PURCHASES);
    } catch {
      setPurchases(SEED_PURCHASES);
    }
  }, []);

  useEffect(() => {
    try {
      if (purchases.length) localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    } catch {}
  }, [purchases]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUPPLIERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSuppliers(parsed.map((s: any) => ({ id: s.id, name: s.name, active: s.active })));
        }
      }
    } catch {}
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d))
      .catch(() => {});
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...purchases]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (!q) return true;
        return (
          p.id.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.warehouse.toLowerCase().includes(q)
        );
      });
  }, [purchases, search, statusFilter]);

  const totals = useMemo(() => {
    const open = purchases.filter((p) => p.status === 'sent' || p.status === 'partial').length;
    const month = purchases
      .filter((p) => new Date(p.orderDate).getMonth() === new Date().getMonth())
      .reduce((a, p) => a + p.total, 0);
    const pendingAmount = purchases.reduce((a, p) => a + Math.max(0, p.total - p.paid), 0);
    return { open, month, pendingAmount, count: purchases.length };
  }, [purchases]);

  const totalsDraft = useMemo(() => {
    const subtotal = items.reduce((a, i) => a + i.unitCost * i.quantity, 0);
    const taxes = items.reduce((a, i) => a + i.unitCost * i.quantity * i.tax, 0);
    return { subtotal, taxes, total: subtotal + taxes };
  }, [items]);

  const resetDraft = () => {
    setForm({ supplierId: '', warehouse: 'Principal', expectedDate: new Date().toISOString().slice(0, 10), notes: '' });
    setItems([]);
  };

  const addItem = () => {
    setItems((list) => [
      ...list,
      {
        tmpId: Math.random().toString(36).slice(2, 8),
        productId: '',
        sku: '',
        name: '',
        quantity: 1,
        received: 0,
        unitCost: 0,
        tax: 0.19,
      },
    ]);
  };

  const updateItem = (tmpId: string, patch: Partial<DraftItem>) => {
    setItems((list) => list.map((i) => (i.tmpId === tmpId ? { ...i, ...patch } : i)));
  };

  const removeItem = (tmpId: string) => {
    setItems((list) => list.filter((i) => i.tmpId !== tmpId));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) {
      toast.error('Selecciona un proveedor');
      return;
    }
    if (!items.length) {
      toast.error('Agrega al menos un producto');
      return;
    }
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    const created: Purchase = {
      id: makeId(),
      supplierId: form.supplierId,
      supplierName: supplier?.name || 'Proveedor',
      warehouse: form.warehouse,
      status: 'sent',
      orderDate: new Date().toISOString(),
      expectedDate: new Date(form.expectedDate).toISOString(),
      notes: form.notes,
      items: items.map(({ tmpId, ...i }) => ({ ...i, received: 0 })),
      subtotal: totalsDraft.subtotal,
      taxes: totalsDraft.taxes,
      total: totalsDraft.total,
      paid: 0,
    };
    setPurchases((list) => [created, ...list]);
    toast.success(`Orden ${created.id} creada`);
    setIsOpen(false);
    resetDraft();
  };

  const receiveAll = (id: string) => {
    const po = purchases.find((p) => p.id === id);
    if (!po) return;
    const updated: Purchase = {
      ...po,
      status: 'received',
      receivedDate: new Date().toISOString(),
      items: po.items.map((i) => ({ ...i, received: i.quantity })),
    };
    setPurchases((list) => list.map((p) => (p.id === id ? updated : p)));

    const inc = po.items.map((i) => ({ sku: i.sku, name: i.name, qty: i.quantity - i.received, warehouse: po.warehouse }));
    fetch('/api/inventory/stock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: po.id, items: inc }),
    }).catch(() => {});
    toast.success('Recepción total registrada · Stock actualizado');
  };

  const cancelPurchase = (id: string) => {
    setPurchases((list) => list.map((p) => (p.id === id ? { ...p, status: 'cancelled' } : p)));
    toast.success('Orden cancelada');
  };

  const registerPayment = (id: string) => {
    const po = purchases.find((p) => p.id === id);
    if (!po) return;
    const pending = po.total - po.paid;
    if (pending <= 0) {
      toast.message('Orden ya pagada');
      return;
    }
    setPurchases((list) => list.map((p) => (p.id === id ? { ...p, paid: p.total } : p)));
    toast.success(`Pago registrado · ${formatPrice(pending)}`);
  };

  const detail = purchases.find((p) => p.id === detailId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Compras
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
            Órdenes de compra, recepción en bodega y cuentas por pagar.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
            onClick={() => toast.success('Exportando compras a Excel')}
          >
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button className="btn-glass" onClick={() => { resetDraft(); setIsOpen(true); }}>
            <Plus size={18} />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Órdenes del Mes" value={totals.count.toString()} icon={<ShoppingBag size={16} />} accent="text-indigo-400" />
          <KPI title="Compras del Mes" value={formatPrice(totals.month)} icon={<Package size={16} />} accent="text-cyan-400" />
          <KPI title="Pendientes de Recibir" value={totals.open.toString()} icon={<Truck size={16} />} accent="text-amber-400" />
          <KPI title="Por Pagar" value={formatPrice(totals.pendingAmount)} icon={<AlertCircle size={16} />} accent="text-rose-400" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° de orden, proveedor o bodega…"
              className="input-glass pl-9"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            {(['all', 'draft', 'sent', 'partial', 'received', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic transition-all',
                  statusFilter === s ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {s === 'all' ? 'Todas' : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="frosted-card border-white/5 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 bg-white/5">
                <tr>
                  <th className="p-4">Orden</th>
                  <th className="p-4">Proveedor</th>
                  <th className="p-4">Bodega</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Items</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Pagado</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const meta = STATUS_META[p.status];
                  const pending = p.total - p.paid;
                  return (
                    <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <button onClick={() => setDetailId(p.id)} className="text-xs font-black text-white font-mono hover:text-indigo-300 transition-all">
                          {p.id}
                        </button>
                      </td>
                      <td className="p-4 text-xs text-slate-200 font-bold">{p.supplierName}</td>
                      <td className="p-4 text-[11px] text-slate-400">{p.warehouse}</td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">{new Date(p.orderDate).toLocaleDateString()}</td>
                      <td className="p-4 text-[11px] text-slate-400">{p.items.length}</td>
                      <td className="p-4 text-xs text-white font-mono font-black text-right">{formatPrice(p.total)}</td>
                      <td className={cn('p-4 text-xs font-mono font-black text-right', pending > 0 ? 'text-amber-300' : 'text-emerald-300')}>
                        {formatPrice(p.paid)}
                      </td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest italic', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {(p.status === 'sent' || p.status === 'partial') && (
                            <button
                              onClick={() => receiveAll(p.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-emerald-500/20 flex items-center gap-1"
                              title="Recibir todo"
                            >
                              <PackageCheck size={12} />
                              Recibir
                            </button>
                          )}
                          {pending > 0 && p.status !== 'cancelled' && (
                            <button
                              onClick={() => registerPayment(p.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-indigo-500/20"
                            >
                              Pagar
                            </button>
                          )}
                          {p.status !== 'received' && p.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelPurchase(p.id)}
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
                              title="Cancelar"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">
                      Sin órdenes de compra registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl frosted-card border-white/10 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Nueva Orden de Compra</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  Selecciona proveedor, productos y condiciones
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10" type="button">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Proveedor *">
                  <select className="input-glass" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {suppliers.filter((s) => s.active !== false).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Bodega destino">
                  <select className="input-glass" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
                    <option value="Principal">Principal</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                    <option value="Sucursal Sur">Sucursal Sur</option>
                    <option value="Camión Ruta 1">Camión Ruta 1</option>
                  </select>
                </Field>
                <Field label="Fecha esperada">
                  <input type="date" className="input-glass" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
                </Field>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Detalle de productos</p>
                  <button type="button" onClick={addItem} className="btn-glass !py-1.5 !px-3 text-[10px]">
                    <Plus size={12} />
                    Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((it) => (
                    <div key={it.tmpId} className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="col-span-12 md:col-span-5">
                        <input
                          list="products-list"
                          className="input-glass"
                          placeholder="Buscar producto por nombre o SKU…"
                          value={it.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            const hit = products.find((p) => p.name === v || p.sku === v);
                            updateItem(it.tmpId, {
                              name: hit?.name || v,
                              sku: hit?.sku || it.sku,
                              productId: hit?.id || it.productId,
                              unitCost: hit?.price || it.unitCost,
                            });
                          }}
                        />
                      </div>
                      <input type="number" min={1} className="input-glass col-span-4 md:col-span-2" placeholder="Cant."
                        value={it.quantity}
                        onChange={(e) => updateItem(it.tmpId, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      />
                      <input type="number" className="input-glass col-span-4 md:col-span-2" placeholder="Costo"
                        value={it.unitCost}
                        onChange={(e) => updateItem(it.tmpId, { unitCost: Number(e.target.value) || 0 })}
                      />
                      <select
                        className="input-glass col-span-3 md:col-span-2"
                        value={it.tax}
                        onChange={(e) => updateItem(it.tmpId, { tax: Number(e.target.value) })}
                      >
                        <option value={0}>IVA 0%</option>
                        <option value={0.05}>IVA 5%</option>
                        <option value={0.19}>IVA 19%</option>
                      </select>
                      <button type="button" onClick={() => removeItem(it.tmpId)} className="col-span-1 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-[11px] text-slate-500 font-black uppercase tracking-widest italic">
                      Agrega los productos a comprar
                    </div>
                  )}
                </div>
                <datalist id="products-list">
                  {products.map((p) => (
                    <option key={p.sku} value={p.name}>{p.sku}</option>
                  ))}
                </datalist>
              </div>

              <Field label="Notas">
                <textarea
                  rows={2}
                  className="input-glass resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Condiciones especiales, pago, horario de entrega…"
                />
              </Field>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <TotalLine label="Subtotal" value={formatPrice(totalsDraft.subtotal)} />
                <TotalLine label="Impuestos" value={formatPrice(totalsDraft.taxes)} />
                <TotalLine label="Total" value={formatPrice(totalsDraft.total)} highlight />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={16} />
                  <span>Emitir orden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailId(null)} />
          <div className="relative z-10 w-full max-w-3xl frosted-card border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">{detail.id}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  {detail.supplierName} · {detail.warehouse}
                </p>
              </div>
              <button onClick={() => setDetailId(null)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10" type="button">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-bold uppercase tracking-widest italic text-slate-400">
                <InfoRow label="Estado" value={STATUS_META[detail.status].label} />
                <InfoRow label="Fecha" value={new Date(detail.orderDate).toLocaleDateString()} />
                <InfoRow label="Esperada" value={new Date(detail.expectedDate).toLocaleDateString()} />
                <InfoRow label="Recibida" value={detail.receivedDate ? new Date(detail.receivedDate).toLocaleDateString() : '—'} />
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-white/5 text-slate-500 font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-right">Cant.</th>
                      <th className="p-3 text-right">Recibido</th>
                      <th className="p-3 text-right">Costo</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((i) => (
                      <tr key={i.sku} className="border-t border-white/5">
                        <td className="p-3 font-mono text-slate-400">{i.sku}</td>
                        <td className="p-3 text-slate-200 font-bold">{i.name}</td>
                        <td className="p-3 text-right text-slate-300">{i.quantity}</td>
                        <td className={cn('p-3 text-right font-black', i.received >= i.quantity ? 'text-emerald-300' : 'text-amber-300')}>
                          {i.received}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300">{formatPrice(i.unitCost)}</td>
                        <td className="p-3 text-right font-mono text-white font-black">
                          {formatPrice(i.unitCost * i.quantity * (1 + i.tax))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <TotalLine label="Subtotal" value={formatPrice(detail.subtotal)} />
                <TotalLine label="Impuestos" value={formatPrice(detail.taxes)} />
                <TotalLine label="Total" value={formatPrice(detail.total)} highlight />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <TotalLine label="Pagado" value={formatPrice(detail.paid)} />
                <TotalLine label="Saldo" value={formatPrice(detail.total - detail.paid)} highlight />
              </div>

              {detail.notes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-medium text-slate-300">
                  <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-500 block mb-1">Notas</span>
                  {detail.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ title, value, icon, accent }: { title: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="frosted-card border-white/5 p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center', accent)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{title}</p>
        <p className="text-lg font-black text-white font-mono tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function TotalLine({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">{label}</p>
      <p className={cn('font-mono font-black', highlight ? 'text-white text-lg' : 'text-slate-200 text-sm')}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-xs font-black text-white">{value}</p>
    </div>
  );
}
