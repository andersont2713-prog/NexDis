import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Building2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useProvider, PLAN_COLORS } from '../../context/ProviderContext';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

export default function ProviderDashboard() {
  const { tenants, subscriptions, invoices, plans } = useProvider();
  const { formatPrice } = useRegional();

  const metrics = useMemo(() => {
    const active = tenants.filter((t) => t.status === 'active').length;
    const trials = tenants.filter((t) => t.status === 'trial').length;
    const suspended = tenants.filter((t) => t.status === 'suspended').length;
    const churned = tenants.filter((t) => t.status === 'churned').length;
    const mrr = subscriptions
      .filter((s) => s.status === 'active')
      .reduce((a, s) => a + s.mrr, 0);
    const arr = mrr * 12;
    const outstanding = invoices
      .filter((i) => i.status === 'overdue' || i.status === 'pending')
      .reduce((a, i) => a + i.amount, 0);
    const paidThisMonth = invoices
      .filter((i) => i.status === 'paid' && i.paidAt && new Date(i.paidAt).getMonth() === new Date().getMonth())
      .reduce((a, i) => a + i.amount, 0);
    const trialConversion = tenants.length > 0 ? ((active / Math.max(1, active + churned)) * 100).toFixed(1) : '0';
    return { active, trials, suspended, churned, mrr, arr, outstanding, paidThisMonth, trialConversion };
  }, [tenants, subscriptions, invoices]);

  const newestTenants = useMemo(
    () => [...tenants].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [tenants]
  );

  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'overdue' || i.status === 'pending').slice(0, 5),
    [invoices]
  );

  const statusBadge = (s: string) => {
    if (s === 'active') return { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (s === 'trial') return { label: 'Trial', color: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30' };
    if (s === 'suspended') return { label: 'Suspendido', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    if (s === 'churned') return { label: 'Perdido', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
    return { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Console
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Salud comercial de NexDist · MRR, churn y onboarding de empresas.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/provider/tenants"
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <Building2 size={16} />
            <span>Ver Empresas</span>
          </Link>
          <Link
            to="/provider/tenants?new=1"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>Nueva empresa</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="MRR"
            value={formatPrice(metrics.mrr)}
            icon={<TrendingUp size={16} />}
            accent="from-fuchsia-500/20 to-violet-500/20"
            iconColor="text-fuchsia-300"
            hint="Ingresos recurrentes mensuales"
          />
          <KpiCard
            title="ARR"
            value={formatPrice(metrics.arr)}
            icon={<ArrowUpRight size={16} />}
            accent="from-indigo-500/20 to-cyan-500/20"
            iconColor="text-indigo-300"
            hint="Proyección anual"
          />
          <KpiCard
            title="Empresas activas"
            value={metrics.active.toString()}
            icon={<Building2 size={16} />}
            accent="from-emerald-500/20 to-cyan-500/20"
            iconColor="text-emerald-300"
            hint={`${metrics.trials} en trial`}
          />
          <KpiCard
            title="Conversión"
            value={`${metrics.trialConversion}%`}
            icon={<ShieldCheck size={16} />}
            accent="from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-300"
            hint={`${metrics.churned} perdidas`}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Por cobrar" value={formatPrice(metrics.outstanding)} icon={<AlertCircle size={14} />} color="text-amber-300" />
          <MiniStat label="Recaudado mes" value={formatPrice(metrics.paidThisMonth)} icon={<ArrowUpRight size={14} />} color="text-emerald-300" />
          <MiniStat label="Suspendidas" value={metrics.suspended.toString()} icon={<ArrowDownRight size={14} />} color="text-rose-300" />
          <MiniStat label="Planes activos" value={plans.filter(p => p.active).length.toString()} icon={<CreditCard size={14} />} color="text-fuchsia-300" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 frosted-card border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Últimas empresas registradas</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">Onboarding y estado actual</p>
              </div>
              <Link to="/provider/tenants" className="text-[10px] font-black uppercase tracking-widest italic text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1">
                Ver todas
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {newestTenants.map((t) => {
                const plan = plans.find((p) => p.id === t.planId);
                const badge = statusBadge(t.status);
                const color = plan ? PLAN_COLORS[plan.color] || PLAN_COLORS.indigo : PLAN_COLORS.indigo;
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-fuchsia-500/20 transition-all">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color.bg)}>
                      <Building2 size={16} className={color.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black italic text-white truncate">{t.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 truncate">
                        {t.city}, {t.country} · {t.industry}
                      </p>
                    </div>
                    <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border', badge.color)}>
                      {badge.label}
                    </span>
                    <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border', color.border, color.bg, color.text)}>
                      {plan?.name || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="frosted-card border-white/5 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Alertas de cobranza</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">
                {overdueInvoices.length} facturas requieren atención
              </p>
            </div>
            <div className="space-y-2">
              {overdueInvoices.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-[11px] text-slate-500 font-black uppercase tracking-widest italic text-center">
                  Sin facturas pendientes
                </div>
              )}
              {overdueInvoices.map((inv) => {
                const tenant = tenants.find((t) => t.id === inv.tenantId);
                const overdue = inv.status === 'overdue';
                return (
                  <div key={inv.id} className={cn(
                    'p-3 rounded-xl border',
                    overdue ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black italic text-white truncate">{tenant?.name || inv.tenantId}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">{inv.id} · {new Date(inv.dueAt).toLocaleDateString()}</p>
                      </div>
                      <p className={cn('text-xs font-black font-mono', overdue ? 'text-rose-300' : 'text-amber-300')}>
                        {formatPrice(inv.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-widest italic">
                      <Clock size={10} className="text-slate-500" />
                      <span className={overdue ? 'text-rose-300' : 'text-amber-300'}>
                        {overdue ? 'Mora' : 'Por vencer'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/provider/billing" className="text-[10px] font-black uppercase tracking-widest italic text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1">
              Ir a facturación
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.filter((p) => p.active).map((p) => {
            const color = PLAN_COLORS[p.color] || PLAN_COLORS.indigo;
            const count = tenants.filter((t) => t.planId === p.id && t.status !== 'churned').length;
            const revenue = subscriptions.filter((s) => s.planId === p.id && s.status === 'active').reduce((a, s) => a + s.mrr, 0);
            return (
              <div key={p.id} className={cn('frosted-card p-5 space-y-3 border', color.border)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color.bg)}>
                      <Package size={14} className={color.text} />
                    </div>
                    <h4 className={cn('text-sm font-black italic tracking-tight uppercase', color.text)}>{p.name}</h4>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">
                    {p.trialDays}d trial
                  </span>
                </div>
                <p className="text-2xl font-black font-mono text-white">
                  {formatPrice(p.monthlyPrice)}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 italic">/ mes</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest italic">
                  <div>
                    <p className="text-slate-500">Empresas</p>
                    <p className="text-white font-mono text-sm">{count}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Ingreso mes</p>
                    <p className="text-white font-mono text-sm">{formatPrice(revenue)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title, value, icon, accent, iconColor, hint,
}: {
  title: string; value: string; icon: ReactNode; accent: string; iconColor: string; hint?: string;
}) {
  return (
    <div className={cn('relative rounded-2xl p-5 border border-white/5 bg-gradient-to-br overflow-hidden', accent)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">{title}</p>
          <p className="text-2xl font-black font-mono tracking-tight text-white mt-1">{value}</p>
          {hint && <p className="text-[9px] font-bold uppercase tracking-widest italic text-slate-500 mt-1">{hint}</p>}
        </div>
        <div className={cn('w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center', iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon, color }: { label: string; value: string; icon: ReactNode; color: string }) {
  return (
    <div className="frosted-card border-white/5 p-3 flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center', color)}>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">{label}</p>
        <p className="text-sm font-black text-white font-mono">{value}</p>
      </div>
    </div>
  );
}
