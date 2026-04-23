import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Warehouse,
  Plus,
  MapPin,
  ArrowRightLeft,
  X,
  Package,
  Truck,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Trash2,
  Edit3,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

type WarehouseType = 'main' | 'branch' | 'truck' | 'pickup';

type WarehouseConfig = {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  address: string;
  city: string;
  manager: string;
  phone: string;
  capacity: number;
  occupancy: number;
  active: boolean;
  notes?: string;
};

type TransferStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

type Transfer = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  status: TransferStatus;
  date: string;
  arrivalDate?: string;
  driver?: string;
  vehicle?: string;
  notes?: string;
  items: { sku: string; name: string; quantity: number }[];
};

const WAREHOUSES_KEY = 'nexdist:warehouses:v1';
const TRANSFERS_KEY = 'nexdist:transfers:v1';

const TYPE_META: Record<WarehouseType, { label: string; color: string; icon: React.ReactNode }> = {
  main: { label: 'Principal', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', icon: <Building2 size={14} /> },
  branch: { label: 'Sucursal', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', icon: <Warehouse size={14} /> },
  truck: { label: 'Camión', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: <Truck size={14} /> },
  pickup: { label: 'Punto', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: <MapPin size={14} /> },
};

const STATUS_META: Record<TransferStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: <Clock size={12} /> },
  in_transit: { label: 'En tránsito', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', icon: <Truck size={12} /> },
  delivered: { label: 'Entregado', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Cancelado', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: <AlertCircle size={12} /> },
};

const SEED_WAREHOUSES: WarehouseConfig[] = [
  { id: 'W-01', code: 'PRIN', name: 'Bodega Principal', type: 'main', address: 'Cra 50 #18-22', city: 'Bogotá', manager: 'Anderson T.', phone: '+57 310 555 0001', capacity: 5000, occupancy: 3420, active: true, notes: 'Centro de distribución principal.' },
  { id: 'W-02', code: 'NORT', name: 'Sucursal Norte', type: 'branch', address: 'Autopista Norte Km 18', city: 'Chía', manager: 'Karla Ríos', phone: '+57 320 555 0002', capacity: 1800, occupancy: 920, active: true },
  { id: 'W-03', code: 'SUR', name: 'Sucursal Sur', type: 'branch', address: 'Cll 80 Sur #45', city: 'Soacha', manager: 'Luis Vega', phone: '+57 300 555 0003', capacity: 1500, occupancy: 640, active: true },
  { id: 'W-04', code: 'CAM1', name: 'Camión Ruta 1 · Centro', type: 'truck', address: 'Móvil', city: 'Ruta Centro', manager: 'Anderson T.', phone: '+57 310 555 0201', capacity: 300, occupancy: 180, active: true },
  { id: 'W-05', code: 'CAM2', name: 'Camión Ruta 2 · Norte', type: 'truck', address: 'Móvil', city: 'Ruta Norte', manager: 'Karla Ríos', phone: '+57 320 555 0202', capacity: 300, occupancy: 220, active: true },
];

const SEED_TRANSFERS: Transfer[] = [
  { id: 'TR-0101', fromId: 'W-01', fromName: 'Bodega Principal', toId: 'W-02', toName: 'Sucursal Norte', status: 'delivered', date: iso(-5), arrivalDate: iso(-4), driver: 'José Mora', vehicle: 'ABC-123', items: [{ sku: 'BEB-001', name: 'Gaseosa Cola 1.5L', quantity: 40 }, { sku: 'BEB-002', name: 'Agua Mineral 600ml', quantity: 60 }] },
  { id: 'TR-0102', fromId: 'W-01', fromName: 'Bodega Principal', toId: 'W-04', toName: 'Camión Ruta 1 · Centro', status: 'in_transit', date: iso(-1), driver: 'Anderson T.', vehicle: 'NexDist-01', items: [{ sku: 'ALM-010', name: 'Arroz Premium 1kg', quantity: 80 }] },
  { id: 'TR-0103', fromId: 'W-02', fromName: 'Sucursal Norte', toId: 'W-05', toName: 'Camión Ruta 2 · Norte', status: 'pending', date: iso(0), items: [{ sku: 'LAC-020', name: 'Leche entera 1L', quantity: 50 }] },
];

function iso(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

const makeWhId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `W-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
    : `W-${Date.now().toString(36).toUpperCase()}`;

const makeTrId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `TR-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    : `TR-${Date.now().toString(36).toUpperCase()}`;

const DEFAULT_WH: Omit<WarehouseConfig, 'id'> = {
  code: '',
  name: '',
  type: 'branch',
  address: '',
  city: '',
  manager: '',
  phone: '',
  capacity: 1000,
  occupancy: 0,
  active: true,
  notes: '',
};

type DraftTransferItem = { tmpId: string; sku: string; name: string; quantity: number };

export default function WarehousesPage() {
  const { formatPrice } = useRegional();
  const [warehouses, setWarehouses] = useState<WarehouseConfig[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<{ sku: string; name: string }[]>([]);
  const [whOpen, setWhOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<string | null>(null);
  const [whForm, setWhForm] = useState(DEFAULT_WH);
  const [trOpen, setTrOpen] = useState(false);
  const [trForm, setTrForm] = useState({
    fromId: '',
    toId: '',
    driver: '',
    vehicle: '',
    notes: '',
  });
  const [trItems, setTrItems] = useState<DraftTransferItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WAREHOUSES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setWarehouses(parsed);
        else setWarehouses(SEED_WAREHOUSES);
      } else setWarehouses(SEED_WAREHOUSES);

      const rawT = localStorage.getItem(TRANSFERS_KEY);
      if (rawT) {
        const parsed = JSON.parse(rawT);
        if (Array.isArray(parsed)) setTransfers(parsed);
      } else setTransfers(SEED_TRANSFERS);
    } catch {
      setWarehouses(SEED_WAREHOUSES);
      setTransfers(SEED_TRANSFERS);
    }
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setProducts(d.map((p: any) => ({ sku: p.sku, name: p.name }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      if (warehouses.length) localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
    } catch {}
  }, [warehouses]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSFERS_KEY, JSON.stringify(transfers));
    } catch {}
  }, [transfers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warehouses;
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.manager.toLowerCase().includes(q)
    );
  }, [warehouses, search]);

  const totals = useMemo(() => {
    const capacity = warehouses.reduce((a, w) => a + w.capacity, 0);
    const occupied = warehouses.reduce((a, w) => a + w.occupancy, 0);
    const pct = capacity > 0 ? (occupied / capacity) * 100 : 0;
    const active = warehouses.filter((w) => w.active).length;
    const inTransit = transfers.filter((t) => t.status === 'in_transit').length;
    return { capacity, occupied, pct, active, inTransit };
  }, [warehouses, transfers]);

  const openCreateWh = () => {
    setEditingWh(null);
    setWhForm(DEFAULT_WH);
    setWhOpen(true);
  };

  const openEditWh = (w: WarehouseConfig) => {
    setEditingWh(w.id);
    setWhForm({
      code: w.code, name: w.name, type: w.type, address: w.address, city: w.city,
      manager: w.manager, phone: w.phone, capacity: w.capacity, occupancy: w.occupancy,
      active: w.active, notes: w.notes || '',
    });
    setWhOpen(true);
  };

  const submitWh = (e: FormEvent) => {
    e.preventDefault();
    if (!whForm.name.trim()) {
      toast.error('Nombre requerido');
      return;
    }
    if (editingWh) {
      setWarehouses((list) => list.map((w) => (w.id === editingWh ? { ...w, ...whForm } : w)));
      toast.success('Bodega actualizada');
    } else {
      const created: WarehouseConfig = { id: makeWhId(), ...whForm };
      setWarehouses((list) => [created, ...list]);
      toast.success('Bodega creada');
    }
    setWhOpen(false);
  };

  const removeWh = (id: string) => {
    setWarehouses((list) => list.filter((w) => w.id !== id));
    toast.success('Bodega eliminada');
  };

  const resetTr = () => {
    setTrForm({ fromId: '', toId: '', driver: '', vehicle: '', notes: '' });
    setTrItems([]);
  };

  const addTrItem = () => {
    setTrItems((list) => [
      ...list,
      { tmpId: Math.random().toString(36).slice(2, 8), sku: '', name: '', quantity: 1 },
    ]);
  };

  const updTrItem = (tmpId: string, patch: Partial<DraftTransferItem>) => {
    setTrItems((list) => list.map((i) => (i.tmpId === tmpId ? { ...i, ...patch } : i)));
  };

  const delTrItem = (tmpId: string) => {
    setTrItems((list) => list.filter((i) => i.tmpId !== tmpId));
  };

  const submitTr = (e: FormEvent) => {
    e.preventDefault();
    if (!trForm.fromId || !trForm.toId) {
      toast.error('Selecciona origen y destino');
      return;
    }
    if (trForm.fromId === trForm.toId) {
      toast.error('Origen y destino deben ser distintos');
      return;
    }
    if (!trItems.length) {
      toast.error('Agrega al menos un producto');
      return;
    }
    const from = warehouses.find((w) => w.id === trForm.fromId);
    const to = warehouses.find((w) => w.id === trForm.toId);
    const created: Transfer = {
      id: makeTrId(),
      fromId: trForm.fromId,
      fromName: from?.name || '',
      toId: trForm.toId,
      toName: to?.name || '',
      status: 'pending',
      date: new Date().toISOString(),
      driver: trForm.driver || undefined,
      vehicle: trForm.vehicle || undefined,
      notes: trForm.notes || undefined,
      items: trItems.map(({ tmpId, ...i }) => i),
    };
    setTransfers((list) => [created, ...list]);
    toast.success(`Traslado ${created.id} creado`);
    setTrOpen(false);
    resetTr();
  };

  const advanceTransfer = (id: string) => {
    setTransfers((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        if (t.status === 'pending') return { ...t, status: 'in_transit' };
        if (t.status === 'in_transit') {
          const totalUnits = t.items.reduce((a, i) => a + i.quantity, 0);
          setWarehouses((whs) =>
            whs.map((w) => {
              if (w.id === t.fromId) return { ...w, occupancy: Math.max(0, w.occupancy - totalUnits) };
              if (w.id === t.toId) return { ...w, occupancy: w.occupancy + totalUnits };
              return w;
            })
          );
          return { ...t, status: 'delivered', arrivalDate: new Date().toISOString() };
        }
        return t;
      })
    );
    toast.success('Estado actualizado');
  };

  const cancelTransfer = (id: string) => {
    setTransfers((list) => list.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)));
    toast.success('Traslado cancelado');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Bodegas & Transferencias
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
            Multi-bodega, camiones de ruta y traslados en tiempo real.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
            onClick={() => { resetTr(); setTrOpen(true); }}
          >
            <ArrowRightLeft size={18} />
            <span>Nuevo Traslado</span>
          </button>
          <button className="btn-glass" onClick={openCreateWh}>
            <Plus size={18} />
            <span>Nueva Bodega</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Bodegas Activas" value={totals.active.toString()} icon={<Warehouse size={16} />} accent="text-indigo-400" />
          <KPI title="Capacidad Total" value={totals.capacity.toLocaleString()} icon={<Package size={16} />} accent="text-cyan-400" />
          <KPI title="Ocupación" value={`${totals.pct.toFixed(1)}%`} icon={<Building2 size={16} />} accent="text-amber-400" />
          <KPI title="En Tránsito" value={totals.inTransit.toString()} icon={<Truck size={16} />} accent="text-emerald-400" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código, ciudad o encargado…"
              className="input-glass pl-9"
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">
            {filtered.length} bodegas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((w) => {
            const pct = w.capacity > 0 ? Math.min(100, (w.occupancy / w.capacity) * 100) : 0;
            const meta = TYPE_META[w.type];
            return (
              <div key={w.id} className={cn('frosted-card p-5 space-y-4 border transition-all', w.active ? 'border-white/5' : 'border-rose-500/20 opacity-75')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', meta.color)}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black italic text-white truncate">{w.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 truncate">
                        {w.code} · {meta.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditWh(w)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center" title="Editar">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => removeWh(w.id)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center" title="Eliminar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-2 truncate"><MapPin size={12} className="text-slate-500 shrink-0" />{w.address || '—'} · {w.city}</div>
                  <div className="flex items-center gap-2 truncate"><User size={12} className="text-slate-500 shrink-0" />{w.manager || '—'}</div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-500">Capacidad</span>
                    <span className="text-white font-mono">{w.occupancy.toLocaleString()} / {w.capacity.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn('h-full transition-all', pct > 85 ? 'bg-rose-400' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: `${pct}%` }} />
                  </div>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest italic text-right',
                    pct > 85 ? 'text-rose-300' : pct > 60 ? 'text-amber-300' : 'text-emerald-300')}>
                    {pct.toFixed(1)}% ocupada
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="frosted-card border-white/5 p-0 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div>
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Traslados recientes</h3>
              <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                {transfers.length} movimientos registrados
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 bg-white/5">
                <tr>
                  <th className="p-4">Traslado</th>
                  <th className="p-4">Origen</th>
                  <th className="p-4">Destino</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Conductor</th>
                  <th className="p-4 text-right">Items</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => {
                  const meta = STATUS_META[t.status];
                  const totalUnits = t.items.reduce((a, i) => a + i.quantity, 0);
                  return (
                    <tr key={t.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-xs font-black text-white font-mono">{t.id}</td>
                      <td className="p-4 text-[11px] text-slate-300">{t.fromName}</td>
                      <td className="p-4 text-[11px] text-slate-300">{t.toName}</td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-4 text-[11px] text-slate-400">{t.driver || '—'}</td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-black text-white font-mono">{t.items.length}</span>
                        <span className="text-[9px] text-slate-500 ml-1">({totalUnits}u)</span>
                      </td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest italic', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {(t.status === 'pending' || t.status === 'in_transit') && (
                            <button
                              onClick={() => advanceTransfer(t.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-indigo-500/20"
                            >
                              {t.status === 'pending' ? 'Enviar' : 'Confirmar'}
                            </button>
                          )}
                          {t.status !== 'delivered' && t.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelTransfer(t.id)}
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
                              title="Cancelar"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">
                      Sin traslados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {whOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWhOpen(false)} />
          <form onSubmit={submitWh} className="relative z-10 w-full max-w-xl frosted-card border-white/10 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                  {editingWh ? 'Editar Bodega' : 'Nueva Bodega'}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  Configura ubicación y capacidad
                </p>
              </div>
              <button type="button" onClick={() => setWhOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Código *">
                <input className="input-glass uppercase" value={whForm.code} onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })} placeholder="PRIN / NORT / CAM1" />
              </Field>
              <Field label="Nombre *">
                <input className="input-glass" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} />
              </Field>
            </div>
            <Field label="Tipo">
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TYPE_META) as WarehouseType[]).map((t) => {
                  const meta = TYPE_META[t];
                  const active = whForm.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWhForm({ ...whForm, type: t })}
                      className={cn('p-3 rounded-xl border transition-all flex flex-col items-center gap-1',
                        active ? meta.color : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10')}
                    >
                      {meta.icon}
                      <span className="text-[9px] font-black uppercase tracking-widest italic">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dirección">
                <input className="input-glass" value={whForm.address} onChange={(e) => setWhForm({ ...whForm, address: e.target.value })} />
              </Field>
              <Field label="Ciudad">
                <input className="input-glass" value={whForm.city} onChange={(e) => setWhForm({ ...whForm, city: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Encargado">
                <input className="input-glass" value={whForm.manager} onChange={(e) => setWhForm({ ...whForm, manager: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <input className="input-glass" value={whForm.phone} onChange={(e) => setWhForm({ ...whForm, phone: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacidad (unidades)">
                <input type="number" className="input-glass" value={whForm.capacity} onChange={(e) => setWhForm({ ...whForm, capacity: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="Ocupación actual">
                <input type="number" className="input-glass" value={whForm.occupancy} onChange={(e) => setWhForm({ ...whForm, occupancy: Number(e.target.value) || 0 })} />
              </Field>
            </div>
            <Field label="Notas">
              <textarea rows={2} className="input-glass resize-none" value={whForm.notes} onChange={(e) => setWhForm({ ...whForm, notes: e.target.value })} />
            </Field>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-slate-400 cursor-pointer">
                <input type="checkbox" checked={whForm.active} onChange={(e) => setWhForm({ ...whForm, active: e.target.checked })} className="accent-emerald-500" />
                Bodega activa
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setWhOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={16} />
                  <span>{editingWh ? 'Guardar' : 'Crear'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {trOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTrOpen(false)} />
          <form onSubmit={submitTr} className="relative z-10 w-full max-w-3xl frosted-card border-white/10 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Nuevo traslado</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  Mueve inventario entre bodegas o camiones
                </p>
              </div>
              <button type="button" onClick={() => setTrOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Origen *">
                <select className="input-glass" value={trForm.fromId} onChange={(e) => setTrForm({ ...trForm, fromId: e.target.value })}>
                  <option value="">Selecciona bodega origen…</option>
                  {warehouses.filter((w) => w.active).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
              <Field label="Destino *">
                <select className="input-glass" value={trForm.toId} onChange={(e) => setTrForm({ ...trForm, toId: e.target.value })}>
                  <option value="">Selecciona bodega destino…</option>
                  {warehouses.filter((w) => w.active && w.id !== trForm.fromId).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Conductor / Responsable">
                <input className="input-glass" value={trForm.driver} onChange={(e) => setTrForm({ ...trForm, driver: e.target.value })} />
              </Field>
              <Field label="Vehículo / Placa">
                <input className="input-glass" value={trForm.vehicle} onChange={(e) => setTrForm({ ...trForm, vehicle: e.target.value })} />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Productos a trasladar</p>
                <button type="button" onClick={addTrItem} className="btn-glass !py-1.5 !px-3 text-[10px]">
                  <Plus size={12} />
                  Agregar
                </button>
              </div>
              {trItems.map((i) => (
                <div key={i.tmpId} className="grid grid-cols-12 gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="col-span-12 md:col-span-8">
                    <input
                      list="tr-products"
                      className="input-glass"
                      placeholder="Buscar producto…"
                      value={i.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        const hit = products.find((p) => p.name === v || p.sku === v);
                        updTrItem(i.tmpId, { name: hit?.name || v, sku: hit?.sku || i.sku });
                      }}
                    />
                  </div>
                  <input type="number" min={1} className="input-glass col-span-10 md:col-span-3" placeholder="Cant."
                    value={i.quantity}
                    onChange={(e) => updTrItem(i.tmpId, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  />
                  <button type="button" onClick={() => delTrItem(i.tmpId)} className="col-span-2 md:col-span-1 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {trItems.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-[11px] text-slate-500 font-black uppercase tracking-widest italic">
                  Agrega los productos a trasladar
                </div>
              )}
              <datalist id="tr-products">
                {products.map((p) => <option key={p.sku} value={p.name}>{p.sku}</option>)}
              </datalist>
            </div>

            <Field label="Notas">
              <textarea rows={2} className="input-glass resize-none" value={trForm.notes} onChange={(e) => setTrForm({ ...trForm, notes: e.target.value })} />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTrOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                Cancelar
              </button>
              <button type="submit" className="btn-glass">
                <ArrowRightLeft size={16} />
                <span>Crear traslado</span>
              </button>
            </div>
          </form>
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
