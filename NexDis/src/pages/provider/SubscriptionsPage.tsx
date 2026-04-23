import { useMemo, useState, type ReactNode } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Pause,
  Play,
  XCircle,
  Calendar,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProvider, PLAN_COLORS, type SubscriptionStatus, type PlatformInvoice } from '../../context/ProviderContext';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

const STATUS_META: Record<SubscriptionStatus, { label: string; color: string; icon: ReactNode }> = {
  active: { label: 'Activa', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  trial: { label: 'Trial', color: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30', icon: <Sparkles size={12} /> },
  past_due: { label: 'En mora', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: <AlertCircle size={12} /> },
  cancelled: { label: 'Cancelada', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: <XCircle size={12} /> },
  paused: { label: 'Pausada', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: <Pause size={12} /> },
};

const makeInvId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `inv-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    : `inv-${Date.now().toString(36).toUpperCase()}`;

export default function SubscriptionsPage() {
  const { subscriptions, tenants, plans, cancelSubscription, pauseSubscription, resumeSubscription, addInvoice } = useProvider();
  const { formatPrice } = useRegional();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [cycleFilter, setCycleFilter] = useState<'all' | 'monthly' | 'annual'>('all');

  const enriched = useMemo(() => {
    return subscriptions.map((s) => {
      const tenant = tenants.find((t) => t.id === s.tenantId);
      const plan = plans.find((p) => p.id === s.planId);
      const renewDate = new Date(s.renewsAt).getTime();
      const daysToRenew = Math.ceil((renewDate - Date.now()) / (1000 * 60 * 60 * 24));
      return { ...s, tenant, plan, daysToRenew };
    });
  }, [subscriptions, tenants, plans]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (cycleFilter !== 'all' && s.billingCycle !== cycleFilter) return false;
        if (!q) return true;
        return (
          s.id.toLowerCase().includes(q) ||
          s.tenant?.name.toLowerCase().includes(q) ||
          s.plan?.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.daysToRenew - b.daysToRenew);
  }, [enriched, search, statusFilter, cycleFilter]);

  const totals = useMemo(() => {
    const activeCount = enriched.filter((s) => s.status === 'active').length;
    const trialCount = enriched.filter((s) => s.status === 'trial').length;
    const pastDueCount = enriched.filter((s) => s.status === 'past_due').length;
    const mrr = enriched.filter((s) => s.status === 'active').reduce((a, s) => a + s.mrr, 0);
    const upcomingRenew = enriched.filter((s) => s.status === 'active' && s.daysToRenew >= 0 && s.daysToRenew <= 15).length;
    return { activeCount, trialCount, pastDueCount, mrr, upcomingRenew };
  }, [enriched]);

  const generateInvoice = (subId: string) => {
    const sub = enriched.find((s) => s.id === subId);
    if (!sub || !sub.plan || !sub.tenant) return;
    const amount = sub.billingCycle === 'annual'
      ? sub.plan.annualPrice * (1 - (sub.discount / 100))
      : sub.plan.monthlyPrice * (1 - (sub.discount / 100));
    const inv: PlatformInvoice = {
      id: makeInvId(),
      tenantId: sub.tenantId,
      subscriptionId: sub.id,
      amount,
      status: 'pending',
      issuedAt: new Date().toISOString(),
      dueAt: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString(); })(),
      concept: `Renovación ${sub.plan.name} ${sub.billingCycle === 'monthly' ? 'mensual' : 'anual'}`,
      cycle: sub.billingCycle,
    };
    addInvoice(inv);
    toast.success(`Factura ${inv.id} generada`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Suscripciones
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Contratos activos, renovaciones próximas y estado de pago.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPI title="Activas" value={totals.activeCount.toString()} icon={<CheckCircle2 size={16} />} color="text-emerald-300" />
          <KPI title="Trial" value={totals.trialCount.toString()} icon={<Sparkles size={16} />} color="text-fuchsia-300" />
          <KPI title="En mora" value={totals.pastDueCount.toString()} icon={<AlertCircle size={16} />} color="text-amber-300" />
          <KPI title="Renuevan ≤15d" value={totals.upcomingRenew.toString()} icon={<Calendar size={16} />} color="text-cyan-300" />
          <KPI title="MRR" value={formatPrice(totals.mrr)} icon={<TrendingUp size={16} />} color="text-indigo-300" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, empresa o plan…"
              className="input-glass pl-9"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            {(['all', 'active', 'trial', 'past_due', 'paused', 'cancelled'] as const).map((s) => (
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
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value as any)}
            className="bg-slate-900/40 text-[10px] font-black uppercase tracking-widest italic text-slate-300 outline-none py-1.5 px-3 rounded-lg border border-white/5"
          >
            <option value="all">Todos los ciclos</option>
            <option value="monthly">Mensual</option>
            <option value="annual">Anual</option>
          </select>
        </div>

        <div className="frosted-card border-white/5 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 bg-white/5">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Ciclo</th>
                  <th className="p-4">Inicio</th>
                  <th className="p-4">Renueva</th>
                  <th className="p-4 text-right">MRR</th>
                  <th className="p-4 text-right">Asientos</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const meta = STATUS_META[s.status];
                  const color = s.plan ? PLAN_COLORS[s.plan.color] || PLAN_COLORS.indigo : PLAN_COLORS.indigo;
                  return (
                    <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-xs font-black text-white font-mono">{s.id}</td>
                      <td className="p-4">
                        <p className="text-xs text-slate-200 font-bold">{s.tenant?.name || s.tenantId}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">{s.tenant?.slug}</p>
                      </td>
                      <td className="p-4">
                        <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border', color.border, color.bg, color.text)}>
                          {s.plan?.name || '—'}
                        </span>
                      </td>
                      <td className="p-4 text-[11px] text-slate-300 uppercase italic font-bold">
                        {s.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                        {s.discount > 0 && <span className="ml-1 text-emerald-300">-{s.discount}%</span>}
                      </td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">{new Date(s.startedAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="text-[11px] text-slate-300 font-mono">{new Date(s.renewsAt).toLocaleDateString()}</p>
                        <p className={cn('text-[9px] font-black uppercase tracking-widest italic',
                          s.daysToRenew < 0 ? 'text-rose-300' : s.daysToRenew <= 7 ? 'text-amber-300' : 'text-slate-500')}>
                          {s.daysToRenew < 0 ? `${Math.abs(s.daysToRenew)}d mora` : `${s.daysToRenew}d`}
                        </p>
                      </td>
                      <td className="p-4 text-xs text-white font-mono font-black text-right">{formatPrice(s.mrr)}</td>
                      <td className="p-4 text-xs text-slate-300 font-mono text-right">{s.seats}</td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest italic', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {(s.status === 'active' || s.status === 'past_due') && (
                            <button
                              onClick={() => generateInvoice(s.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-indigo-500/20 flex items-center gap-1"
                            >
                              <Receipt size={10} />
                              Facturar
                            </button>
                          )}
                          {s.status === 'active' && (
                            <button
                              onClick={() => { pauseSubscription(s.id); toast.success('Suscripción pausada'); }}
                              title="Pausar"
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center justify-center"
                            >
                              <Pause size={12} />
                            </button>
                          )}
                          {s.status === 'paused' && (
                            <button
                              onClick={() => { resumeSubscription(s.id); toast.success('Suscripción reactivada'); }}
                              title="Reactivar"
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 flex items-center justify-center"
                            >
                              <Play size={12} />
                            </button>
                          )}
                          {s.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm('¿Cancelar suscripción?')) {
                                  cancelSubscription(s.id);
                                  toast.success('Suscripción cancelada');
                                }
                              }}
                              title="Cancelar"
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">
                      Sin suscripciones en este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, icon, color }: { title: string; value: string; icon: ReactNode; color: string }) {
  return (
    <div className="frosted-card border-white/5 p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center', color)}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{title}</p>
        <p className="text-base font-black text-white font-mono tracking-tight">{value}</p>
      </div>
    </div>
  );
}
