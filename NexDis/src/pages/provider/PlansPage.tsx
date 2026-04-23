import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  X,
  Users,
  Boxes,
  ShoppingCart,
  HardDrive,
  Warehouse,
  Check,
  Sparkles,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProvider, PLAN_COLORS, type Plan, type PlanSlug } from '../../context/ProviderContext';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

const COLOR_CHOICES = ['indigo', 'cyan', 'fuchsia', 'emerald', 'amber', 'rose'];

const DEFAULT_PLAN: Omit<Plan, 'id'> = {
  name: '',
  slug: 'custom',
  monthlyPrice: 0,
  annualPrice: 0,
  features: [],
  limits: { users: 5, products: 1000, ordersPerMonth: 1000, storageGb: 5, warehouses: 1 },
  active: true,
  trialDays: 14,
  color: 'indigo',
};

export default function PlansPage() {
  const { plans, tenants, subscriptions, upsertPlan, removePlan } = useProvider();
  const { formatPrice } = useRegional();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Plan, 'id'>>(DEFAULT_PLAN);
  const [featureDraft, setFeatureDraft] = useState('');

  const totals = useMemo(() => {
    return plans.map((p) => {
      const activeTenants = tenants.filter((t) => t.planId === p.id && t.status !== 'churned').length;
      const mrr = subscriptions
        .filter((s) => s.planId === p.id && s.status === 'active')
        .reduce((a, s) => a + s.mrr, 0);
      return { ...p, activeTenants, mrr };
    });
  }, [plans, tenants, subscriptions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_PLAN);
    setFeatureDraft('');
    setIsOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditingId(p.id);
    const { id, ...rest } = p;
    setForm(rest);
    setFeatureDraft('');
    setIsOpen(true);
  };

  const addFeature = () => {
    const f = featureDraft.trim();
    if (!f) return;
    setForm((s) => ({ ...s, features: [...s.features, f] }));
    setFeatureDraft('');
  };

  const removeFeature = (idx: number) => {
    setForm((s) => ({ ...s, features: s.features.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nombre del plan requerido');
      return;
    }
    if (editingId) {
      upsertPlan({ id: editingId, ...form });
      toast.success('Plan actualizado');
    } else {
      const id = `plan-${form.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36).slice(-4)}`;
      upsertPlan({ id, ...form });
      toast.success('Plan creado');
    }
    setIsOpen(false);
  };

  const togglePlanActive = (p: Plan) => {
    upsertPlan({ ...p, active: !p.active });
    toast.success(p.active ? 'Plan desactivado' : 'Plan activado');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Planes
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Tarifa, límites y beneficios que comercializas a las empresas.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>Nuevo plan</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {totals.map((p) => {
            const color = PLAN_COLORS[p.color] || PLAN_COLORS.indigo;
            return (
              <div
                key={p.id}
                className={cn('relative frosted-card p-6 space-y-5 border transition-all overflow-hidden',
                  p.active ? color.border : 'border-white/5 opacity-75')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" style={{ background: 'currentColor' }} />
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', color.bg)}>
                      <Package size={22} className={color.text} />
                    </div>
                    <div>
                      <h3 className={cn('text-base font-black italic tracking-tight uppercase', color.text)}>{p.name}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        {p.slug} · {p.trialDays} días trial
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePlanActive(p)}
                    className={cn('w-7 h-7 rounded-lg border flex items-center justify-center transition-all',
                      p.active
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300')}
                    title={p.active ? 'Desactivar' : 'Activar'}
                  >
                    <Power size={12} />
                  </button>
                </div>

                <div className="relative z-10">
                  <p className="text-3xl font-black font-mono text-white tracking-tight">
                    {formatPrice(p.monthlyPrice)}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 italic">/ mes</span>
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 mt-1">
                    {formatPrice(p.annualPrice)} / año
                  </p>
                </div>

                <div className="relative z-10 space-y-1.5">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <Check size={12} className={color.text} />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="relative z-10 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest italic">
                  <LimitChip icon={<Users size={10} />} value={p.limits.users === 999 ? '∞' : p.limits.users.toString()} />
                  <LimitChip icon={<Boxes size={10} />} value={p.limits.products >= 999999 ? '∞' : p.limits.products.toLocaleString()} />
                  <LimitChip icon={<ShoppingCart size={10} />} value={p.limits.ordersPerMonth >= 999999 ? '∞' : p.limits.ordersPerMonth.toLocaleString()} />
                  <LimitChip icon={<HardDrive size={10} />} value={`${p.limits.storageGb}GB`} />
                  <LimitChip icon={<Warehouse size={10} />} value={p.limits.warehouses === 99 ? '∞' : p.limits.warehouses.toString()} />
                </div>

                <div className="relative z-10 pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest italic">
                  <div>
                    <p className="text-slate-500">Tenants activos</p>
                    <p className="text-white font-mono text-lg">{p.activeTenants}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">MRR del plan</p>
                    <p className="text-white font-mono text-lg">{formatPrice(p.mrr)}</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-end gap-1 pt-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 flex items-center gap-1"
                  >
                    <Edit3 size={12} /> Editar
                  </button>
                  <button
                    onClick={() => {
                      if (p.activeTenants > 0) {
                        toast.error(`No se puede eliminar: ${p.activeTenants} empresa(s) lo usan`);
                        return;
                      }
                      if (confirm(`¿Eliminar plan ${p.name}?`)) {
                        removePlan(p.id);
                        toast.success('Plan eliminado');
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#0b0920]/90 backdrop-blur-2xl border border-fuchsia-500/20 p-7 space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                  {editingId ? 'Editar plan' : 'Nuevo plan'}
                </h3>
                <p className="text-[10px] text-fuchsia-300 font-black uppercase tracking-widest italic">
                  Define tarifa, límites y beneficios
                </p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre *">
                <input className="input-glass" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Starter · Pro · Enterprise" />
              </Field>
              <Field label="Slug">
                <select className="input-glass" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value as PlanSlug })}>
                  <option value="starter">starter</option>
                  <option value="pro">pro</option>
                  <option value="enterprise">enterprise</option>
                  <option value="custom">custom</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Precio mensual">
                <input type="number" className="input-glass" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="Precio anual">
                <input type="number" className="input-glass" value={form.annualPrice} onChange={(e) => setForm({ ...form, annualPrice: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="Trial (días)">
                <input type="number" className="input-glass" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) || 0 })} />
              </Field>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <Field label="Usuarios">
                <input type="number" className="input-glass" value={form.limits.users} onChange={(e) => setForm({ ...form, limits: { ...form.limits, users: Number(e.target.value) || 0 } })} />
              </Field>
              <Field label="Productos">
                <input type="number" className="input-glass" value={form.limits.products} onChange={(e) => setForm({ ...form, limits: { ...form.limits, products: Number(e.target.value) || 0 } })} />
              </Field>
              <Field label="Pedidos/mes">
                <input type="number" className="input-glass" value={form.limits.ordersPerMonth} onChange={(e) => setForm({ ...form, limits: { ...form.limits, ordersPerMonth: Number(e.target.value) || 0 } })} />
              </Field>
              <Field label="Storage GB">
                <input type="number" className="input-glass" value={form.limits.storageGb} onChange={(e) => setForm({ ...form, limits: { ...form.limits, storageGb: Number(e.target.value) || 0 } })} />
              </Field>
              <Field label="Bodegas">
                <input type="number" className="input-glass" value={form.limits.warehouses} onChange={(e) => setForm({ ...form, limits: { ...form.limits, warehouses: Number(e.target.value) || 0 } })} />
              </Field>
            </div>

            <Field label="Color del plan">
              <div className="flex items-center gap-2">
                {COLOR_CHOICES.map((c) => {
                  const color = PLAN_COLORS[c];
                  const active = form.color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={cn('w-9 h-9 rounded-xl border transition-all flex items-center justify-center',
                        active ? cn(color.bg, color.border) : 'bg-white/5 border-white/5 hover:bg-white/10')}
                      title={c}
                    >
                      <span className={cn('w-3 h-3 rounded-full', color.bg, 'border', color.border)}></span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Beneficios (uno a uno)">
              <div className="flex items-center gap-2">
                <input
                  className="input-glass"
                  value={featureDraft}
                  onChange={(e) => setFeatureDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Ej. Soporte 24/7"
                />
                <button type="button" onClick={addFeature} className="px-3 py-2 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest italic hover:bg-fuchsia-500/25 flex items-center gap-1">
                  <Plus size={12} /> Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.features.map((f, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 flex items-center gap-1">
                    {f}
                    <button type="button" onClick={() => removeFeature(i)} className="text-slate-500 hover:text-rose-400">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-slate-400 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-fuchsia-500" />
                Plan disponible para nuevas empresas
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-black uppercase tracking-widest italic shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2">
                  <Plus size={14} />
                  {editingId ? 'Guardar' : 'Crear plan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function LimitChip({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1 text-slate-300">
      {icon}
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">{label}</label>
      {children}
    </div>
  );
}
