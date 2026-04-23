import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Edit3,
  Trash2,
  X,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

export type Supplier = {
  id: string;
  name: string;
  taxId: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: number;
  creditLimit: number;
  balance: number;
  category: string;
  rating: number;
  notes: string;
  active: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'nexdist:suppliers:v1';

const DEFAULT_FORM: Omit<Supplier, 'id' | 'createdAt' | 'balance'> = {
  name: '',
  taxId: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  city: 'Bogotá',
  country: 'Colombia',
  paymentTerms: 30,
  creditLimit: 0,
  category: 'Abarrotes',
  rating: 5,
  notes: '',
  active: true,
};

const SUPPLIER_CATEGORIES = [
  'Abarrotes',
  'Bebidas',
  'Lácteos',
  'Limpieza',
  'Cuidado Personal',
  'Snacks',
  'Frescos',
  'Importados',
  'Otros',
];

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Distribuidora Andina S.A.',
    taxId: '900.123.456-7',
    contact: 'María González',
    phone: '+57 310 555 0101',
    email: 'compras@andina.com',
    address: 'Zona Industrial Cll 80 #45-10',
    city: 'Bogotá',
    country: 'Colombia',
    paymentTerms: 30,
    creditLimit: 50000000,
    balance: 12400000,
    category: 'Bebidas',
    rating: 5,
    notes: 'Entrega lunes y jueves. Contacto comercial: Ana Rueda.',
    active: true,
    createdAt: new Date(2024, 2, 12).toISOString(),
  },
  {
    id: 'SUP-002',
    name: 'Alimentos del Valle Ltda.',
    taxId: '830.987.654-3',
    contact: 'Jorge Ramírez',
    phone: '+57 301 555 0202',
    email: 'ventas@alimentosvalle.co',
    address: 'Km 4 vía Cali-Yumbo',
    city: 'Cali',
    country: 'Colombia',
    paymentTerms: 45,
    creditLimit: 30000000,
    balance: 4850000,
    category: 'Abarrotes',
    rating: 4,
    notes: 'Descuento por volumen desde 500 unidades.',
    active: true,
    createdAt: new Date(2024, 4, 3).toISOString(),
  },
  {
    id: 'SUP-003',
    name: 'Lácteos La Pradera',
    taxId: '901.444.222-1',
    contact: 'Diana Torres',
    phone: '+57 320 555 0303',
    email: 'pedidos@lapradera.com',
    address: 'Autopista Norte Km 18',
    city: 'Chía',
    country: 'Colombia',
    paymentTerms: 15,
    creditLimit: 18000000,
    balance: 0,
    category: 'Lácteos',
    rating: 5,
    notes: 'Cadena de frío obligatoria al recibir.',
    active: true,
    createdAt: new Date(2024, 5, 20).toISOString(),
  },
  {
    id: 'SUP-004',
    name: 'Limpieza Total Express',
    taxId: '900.222.111-0',
    contact: 'Luis Bernal',
    phone: '+57 300 555 0404',
    email: 'luis@limpiezatotal.co',
    address: 'Cra 50 #18-22',
    city: 'Medellín',
    country: 'Colombia',
    paymentTerms: 30,
    creditLimit: 12000000,
    balance: 2100000,
    category: 'Limpieza',
    rating: 4,
    notes: '',
    active: true,
    createdAt: new Date(2024, 6, 1).toISOString(),
  },
];

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `SUP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    : `SUP-${Date.now().toString(36).toUpperCase()}`;

export default function SuppliersPage() {
  const { formatPrice } = useRegional();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setSuppliers(parsed);
          return;
        }
      }
      setSuppliers(SEED_SUPPLIERS);
    } catch {
      setSuppliers(SEED_SUPPLIERS);
    }
  }, []);

  useEffect(() => {
    try {
      if (suppliers.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    } catch {}
  }, [suppliers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.taxId.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    });
  }, [suppliers, search, categoryFilter]);

  const totals = useMemo(() => {
    const active = suppliers.filter((s) => s.active).length;
    const credit = suppliers.reduce((a, s) => a + s.creditLimit, 0);
    const debt = suppliers.reduce((a, s) => a + s.balance, 0);
    const overdue = suppliers.filter((s) => s.balance > s.creditLimit * 0.9).length;
    return { active, credit, debt, overdue };
  }, [suppliers]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setIsOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      taxId: s.taxId,
      contact: s.contact,
      phone: s.phone,
      email: s.email,
      address: s.address,
      city: s.city,
      country: s.country,
      paymentTerms: s.paymentTerms,
      creditLimit: s.creditLimit,
      category: s.category,
      rating: s.rating,
      notes: s.notes,
      active: s.active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Completa el nombre del proveedor');
      return;
    }
    if (editingId) {
      setSuppliers((list) =>
        list.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
      toast.success('Proveedor actualizado');
    } else {
      const created: Supplier = {
        id: makeId(),
        balance: 0,
        createdAt: new Date().toISOString(),
        ...form,
      };
      setSuppliers((list) => [created, ...list]);
      toast.success('Proveedor registrado');
    }
    setIsOpen(false);
  };

  const removeSupplier = (id: string) => {
    setSuppliers((list) => list.filter((s) => s.id !== id));
    toast.success('Proveedor eliminado');
  };

  const toggleActive = (id: string) => {
    setSuppliers((list) => list.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Proveedores
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
            Red de abastecimiento, condiciones comerciales y cuentas por pagar.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
            onClick={() => toast.success('Exportando proveedores a Excel')}
          >
            <Building2 size={18} />
            <span>Exportar</span>
          </button>
          <button className="btn-glass" onClick={openCreate}>
            <Plus size={18} />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Proveedores Activos" value={totals.active.toString()} icon={<Truck size={16} />} accent="text-indigo-400" />
          <KPI title="Crédito Total" value={formatPrice(totals.credit)} icon={<CreditCard size={16} />} accent="text-cyan-400" />
          <KPI title="Saldo por Pagar" value={formatPrice(totals.debt)} icon={<ArrowUpRight size={16} />} accent="text-amber-400" />
          <KPI title="Alertas de Cupo" value={totals.overdue.toString()} icon={<Star size={16} />} accent="text-rose-400" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass pl-9"
              placeholder="Buscar por nombre, NIT, contacto o ciudad…"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            <button
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic transition-all',
                categoryFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Todos
            </button>
            {SUPPLIER_CATEGORIES.slice(0, 4).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic transition-all',
                  categoryFilter === c ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {c}
              </button>
            ))}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest italic text-slate-400 outline-none pr-2"
            >
              <option value="all">Más</option>
              {SUPPLIER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const usage = s.creditLimit > 0 ? Math.min(100, (s.balance / s.creditLimit) * 100) : 0;
            return (
              <div
                key={s.id}
                className={cn(
                  'frosted-card p-5 space-y-4 transition-all border',
                  s.active ? 'border-white/5 hover:border-indigo-500/30' : 'border-rose-500/20 opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center shrink-0">
                      <Truck size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black italic text-white truncate">{s.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
                        {s.taxId || 'Sin NIT'} · {s.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < s.rating ? 'text-amber-400' : 'text-slate-700'}
                        fill={i < s.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-2 truncate"><Phone size={12} className="text-slate-500 shrink-0" />{s.phone || '—'}</div>
                  <div className="flex items-center gap-2 truncate"><Mail size={12} className="text-slate-500 shrink-0" />{s.email || '—'}</div>
                  <div className="flex items-center gap-2 truncate"><MapPin size={12} className="text-slate-500 shrink-0" />{s.city}, {s.country}</div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-500">Condiciones</span>
                    <span className="text-white">{s.paymentTerms} días</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-500">Crédito</span>
                    <span className="text-cyan-300">{formatPrice(s.creditLimit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-500">Saldo</span>
                    <span className={cn(usage > 90 ? 'text-rose-300' : usage > 60 ? 'text-amber-300' : 'text-emerald-300')}>
                      {formatPrice(s.balance)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        usage > 90 ? 'bg-rose-400' : usage > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                      )}
                      style={{ width: `${usage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => toggleActive(s.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic border transition-all',
                      s.active
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    )}
                  >
                    {s.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => removeSupplier(s.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 p-10 rounded-2xl border border-dashed border-white/10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">
              Sin proveedores registrados. Pulsa "Nuevo Proveedor" para comenzar.
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl frosted-card border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                  {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  Ficha comercial y condiciones
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Razón social / Nombre *">
                  <input className="input-glass" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="NIT / RUT / RFC">
                  <input className="input-glass" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Contacto">
                  <input className="input-glass" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </Field>
                <Field label="Categoría">
                  <select className="input-glass" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {SUPPLIER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <input className="input-glass" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" className="input-glass" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
              </div>
              <Field label="Dirección">
                <input className="input-glass" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad">
                  <input className="input-glass" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="País">
                  <input className="input-glass" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Plazo (días)">
                  <input type="number" className="input-glass" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Límite de crédito">
                  <input type="number" className="input-glass" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || 0 })} />
                </Field>
                <Field label={`Calificación · ${form.rating}/5`}>
                  <input type="range" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full accent-amber-400 mt-3" />
                </Field>
              </div>
              <Field label="Notas">
                <textarea
                  rows={3}
                  className="input-glass resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Horarios de entrega, contactos adicionales, condiciones especiales…"
                />
              </Field>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={16} />
                  <span>{editingId ? 'Guardar cambios' : 'Registrar'}</span>
                </button>
              </div>
            </form>
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
