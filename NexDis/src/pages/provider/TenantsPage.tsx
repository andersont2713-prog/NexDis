import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Trash2,
  X,
  LogIn,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProvider, PLAN_COLORS, type Tenant, type TenantStatus, type Subscription } from '../../context/ProviderContext';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

const DEFAULT_FORM: Omit<Tenant, 'id' | 'createdAt'> = {
  name: '',
  slug: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  country: 'Colombia',
  city: '',
  industry: 'Abarrotes',
  status: 'trial',
  planId: 'plan-starter',
  notes: '',
};

const INDUSTRIES = ['Abarrotes', 'Minimarket', 'Mayorista', 'Lácteos', 'Bebidas', 'Snacks', 'Limpieza', 'Importaciones', 'Otros'];

const STATUS_META: Record<TenantStatus, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  trial: { label: 'Trial', color: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30' },
  pending: { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
  suspended: { label: 'Suspendido', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  churned: { label: 'Perdido', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
};

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'empresa';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `tn-${crypto.randomUUID().slice(0, 6)}`
    : `tn-${Date.now().toString(36)}`;

export default function TenantsPage() {
  const { tenants, plans, subscriptions, upsertTenant, removeTenant, upsertSubscription } = useProvider();
  const { formatPrice } = useRegional();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TenantStatus>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (params.get('new') === '1') {
      openCreate();
      params.delete('new');
      setParams(params, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tenants.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (planFilter !== 'all' && t.planId !== planFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.adminEmail.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    });
  }, [tenants, search, statusFilter, planFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setIsOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      slug: t.slug,
      adminName: t.adminName,
      adminEmail: t.adminEmail,
      adminPhone: t.adminPhone,
      country: t.country,
      city: t.city,
      industry: t.industry,
      status: t.status,
      planId: t.planId,
      trialEndsAt: t.trialEndsAt,
      notes: t.notes || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nombre de empresa requerido');
      return;
    }
    if (!form.adminEmail.trim()) {
      toast.error('Email del administrador requerido');
      return;
    }
    const slug = form.slug.trim() || slugify(form.name);
    if (editingId) {
      const existing = tenants.find((t) => t.id === editingId);
      if (!existing) return;
      upsertTenant({ ...existing, ...form, slug });
      toast.success('Empresa actualizada');
    } else {
      const id = newId();
      const plan = plans.find((p) => p.id === form.planId);
      const trialEndsAt = form.status === 'trial' && plan
        ? (() => { const d = new Date(); d.setDate(d.getDate() + plan.trialDays); return d.toISOString(); })()
        : form.trialEndsAt;
      const tenant: Tenant = {
        id,
        createdAt: new Date().toISOString(),
        ...form,
        slug,
        trialEndsAt,
        metrics: { users: 0, products: 0, ordersThisMonth: 0, storageGb: 0 },
      };
      upsertTenant(tenant);
      if (plan) {
        const sub: Subscription = {
          id: `sub-${id}`,
          tenantId: id,
          planId: plan.id,
          status: form.status === 'trial' ? 'trial' : form.status === 'active' ? 'active' : 'paused',
          billingCycle: 'monthly',
          startedAt: new Date().toISOString(),
          renewsAt: trialEndsAt || (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString(); })(),
          mrr: form.status === 'trial' ? 0 : plan.monthlyPrice,
          seats: 1,
          discount: 0,
        };
        upsertSubscription(sub);
      }
      toast.success('Empresa creada · cuenta lista para onboarding');
    }
    setIsOpen(false);
  };

  const impersonateTenant = (t: Tenant) => {
    sessionStorage.setItem('nexdist:impersonation', JSON.stringify({ tenantId: t.id, tenantName: t.name, at: new Date().toISOString() }));
    toast.success(`Entrando como ${t.name}…`);
    setTimeout(() => navigate('/admin'), 400);
  };

  const toggleSuspend = (t: Tenant) => {
    const nextStatus: TenantStatus = t.status === 'suspended' ? 'active' : 'suspended';
    upsertTenant({ ...t, status: nextStatus });
    const sub = subscriptions.find((s) => s.tenantId === t.id);
    if (sub) {
      upsertSubscription({ ...sub, status: nextStatus === 'suspended' ? 'paused' : 'active' });
    }
    toast.success(nextStatus === 'suspended' ? 'Empresa suspendida' : 'Empresa reactivada');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Empresas
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Catálogo de tenants, planes asignados y acceso impersonado.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>Nueva empresa</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, slug, email o ciudad…"
              className="input-glass pl-9"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            {(['all', 'active', 'trial', 'suspended', 'churned'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic transition-all',
                  statusFilter === s ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {s === 'all' ? 'Todos' : STATUS_META[s].label}
              </button>
            ))}
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-900/40 text-[10px] font-black uppercase tracking-widest italic text-slate-300 outline-none py-1.5 px-3 rounded-lg border border-white/5"
          >
            <option value="all">Todos los planes</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 ml-auto">
            {filtered.length} / {tenants.length} empresas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t) => {
            const plan = plans.find((p) => p.id === t.planId);
            const color = plan ? PLAN_COLORS[plan.color] || PLAN_COLORS.indigo : PLAN_COLORS.indigo;
            const badge = STATUS_META[t.status];
            const sub = subscriptions.find((s) => s.tenantId === t.id);
            const daysLeft = t.trialEndsAt ? Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div key={t.id} className={cn('frosted-card p-5 space-y-4 border transition-all', color.border)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', color.bg)}>
                      <Building2 size={22} className={color.text} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black italic text-white truncate">{t.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono truncate">
                        {t.slug} · {t.industry}
                      </p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border', badge.color)}>
                    {badge.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-medium text-slate-400">
                  <div className="flex items-center gap-2 truncate"><Mail size={12} className="text-slate-500 shrink-0" />{t.adminEmail}</div>
                  <div className="flex items-center gap-2 truncate"><Phone size={12} className="text-slate-500 shrink-0" />{t.adminPhone || '—'}</div>
                  <div className="flex items-center gap-2 truncate"><MapPin size={12} className="text-slate-500 shrink-0" />{t.city}, {t.country}</div>
                </div>

                {t.status === 'trial' && daysLeft !== null && (
                  <div className={cn('p-2 rounded-xl border flex items-center gap-2',
                    daysLeft <= 3 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-fuchsia-500/5 border-fuchsia-500/20')}>
                    <Calendar size={12} className={daysLeft <= 3 ? 'text-rose-300' : 'text-fuchsia-300'} />
                    <p className={cn('text-[9px] font-black uppercase tracking-widest italic',
                      daysLeft <= 3 ? 'text-rose-300' : 'text-fuchsia-300')}>
                      {daysLeft > 0 ? `${daysLeft} días de trial restantes` : 'Trial vencido'}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest italic">
                  <div>
                    <p className="text-slate-500">Plan</p>
                    <p className={cn('font-mono text-sm truncate', color.text)}>{plan?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">MRR</p>
                    <p className="text-white font-mono text-sm">{formatPrice(sub?.mrr || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Usuarios</p>
                    <p className="text-white font-mono text-sm">{t.metrics?.users ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Pedidos/mes</p>
                    <p className="text-white font-mono text-sm">{t.metrics?.ordersThisMonth ?? 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => impersonateTenant(t)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest italic hover:bg-fuchsia-500/20 transition-all"
                  >
                    <LogIn size={12} />
                    Entrar como
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSuspend(t)}
                      title={t.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                      className={cn('w-8 h-8 rounded-lg border flex items-center justify-center transition-all',
                        t.status === 'suspended'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10')}
                    >
                      {t.status === 'suspended' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar empresa ${t.name}? Esta acción también borra su suscripción y facturas.`)) {
                          removeTenant(t.id);
                          toast.success('Empresa eliminada');
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
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
              Sin empresas en este filtro. Pulsa "Nueva empresa" para comenzar.
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#0b0920]/90 backdrop-blur-2xl border border-fuchsia-500/20 p-7 space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                  {editingId ? 'Editar empresa' : 'Nueva empresa'}
                </h3>
                <p className="text-[10px] text-fuchsia-300 font-black uppercase tracking-widest italic">
                  {editingId ? 'Actualiza datos del tenant' : 'Onboarding a la plataforma NexDist'}
                </p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Razón social / Nombre *">
                <input
                  className="input-glass"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
                  }}
                  placeholder="Distribuidora Los Andes"
                />
              </Field>
              <Field label="Slug / Subdominio">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <input
                    className="bg-transparent px-3 py-2 text-sm text-white font-mono flex-1 outline-none"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    placeholder="losandes"
                  />
                  <span className="px-3 text-[10px] text-slate-500 font-black uppercase tracking-widest italic border-l border-white/5">
                    .nexdist.app
                  </span>
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Administrador *">
                <input className="input-glass" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
              </Field>
              <Field label="Industria">
                <select className="input-glass" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email del admin *">
                <input type="email" className="input-glass" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <input className="input-glass" value={form.adminPhone} onChange={(e) => setForm({ ...form, adminPhone: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ciudad">
                <input className="input-glass" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="País">
                <input className="input-glass" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
            </div>

            <Field label="Plan">
              <div className="grid grid-cols-3 gap-2">
                {plans.filter((p) => p.active).map((p) => {
                  const color = PLAN_COLORS[p.color] || PLAN_COLORS.indigo;
                  const active = form.planId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, planId: p.id })}
                      className={cn('p-3 rounded-xl border text-left transition-all',
                        active ? cn(color.border, color.bg) : 'border-white/5 bg-white/5 hover:bg-white/10')}
                    >
                      <p className={cn('text-xs font-black italic uppercase tracking-tight', active ? color.text : 'text-slate-300')}>
                        {p.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {formatPrice(p.monthlyPrice)}/mes
                      </p>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Estado">
                <select className="input-glass" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TenantStatus })}>
                  <option value="trial">Trial</option>
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="suspended">Suspendido</option>
                  <option value="churned">Perdido</option>
                </select>
              </Field>
              <Field label="Fin de trial (opcional)">
                <input
                  type="date"
                  className="input-glass"
                  value={form.trialEndsAt ? form.trialEndsAt.slice(0, 10) : ''}
                  onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              </Field>
            </div>

            <Field label="Notas internas">
              <textarea rows={2} className="input-glass resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic text-fuchsia-300">
                <ShieldCheck size={12} />
                Onboarding automático vía email
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-black uppercase tracking-widest italic shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2">
                  <Plus size={14} />
                  {editingId ? 'Guardar' : 'Crear empresa'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
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
