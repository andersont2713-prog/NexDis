import { useMemo, useState, type ReactNode } from 'react';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  CreditCard,
  XCircle,
  Send,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProvider, type InvoiceStatus } from '../../context/ProviderContext';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: ReactNode }> = {
  paid: { label: 'Pagada', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  pending: { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: <Clock size={12} /> },
  overdue: { label: 'Mora', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: <AlertCircle size={12} /> },
  failed: { label: 'Fallida', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: <XCircle size={12} /> },
  refunded: { label: 'Reembolsada', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', icon: <Download size={12} /> },
};

export default function PlatformBillingPage() {
  const { invoices, tenants, markInvoicePaid } = useProvider();
  const { formatPrice } = useRegional();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  const enriched = useMemo(() => {
    return invoices.map((inv) => {
      const tenant = tenants.find((t) => t.id === inv.tenantId);
      const due = new Date(inv.dueAt).getTime();
      const days = Math.floor((due - Date.now()) / (1000 * 60 * 60 * 24));
      const actualStatus: InvoiceStatus = inv.status === 'pending' && days < 0 ? 'overdue' : inv.status;
      return { ...inv, tenant, daysToDue: days, actualStatus };
    });
  }, [invoices, tenants]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((i) => {
        if (statusFilter !== 'all' && i.actualStatus !== statusFilter) return false;
        if (!q) return true;
        return (
          i.id.toLowerCase().includes(q) ||
          i.tenant?.name.toLowerCase().includes(q) ||
          i.concept.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [enriched, search, statusFilter]);

  const totals = useMemo(() => {
    const paid = enriched.filter((i) => i.actualStatus === 'paid').reduce((a, i) => a + i.amount, 0);
    const pending = enriched.filter((i) => i.actualStatus === 'pending').reduce((a, i) => a + i.amount, 0);
    const overdue = enriched.filter((i) => i.actualStatus === 'overdue').reduce((a, i) => a + i.amount, 0);
    const monthPaid = enriched
      .filter((i) => i.actualStatus === 'paid' && i.paidAt && new Date(i.paidAt).getMonth() === new Date().getMonth())
      .reduce((a, i) => a + i.amount, 0);
    return { paid, pending, overdue, monthPaid };
  }, [enriched]);

  const sendInvoice = (id: string) => {
    toast.success(`Factura ${id} enviada al cliente por email`);
  };

  const markPaid = (id: string) => {
    markInvoicePaid(id);
    toast.success('Pago registrado');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Facturación
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Facturas de la plataforma emitidas a cada empresa cliente.
          </p>
        </div>
        <button
          onClick={() => toast.success('Exportando facturación a Excel')}
          className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
        >
          <Download size={16} />
          <span>Exportar</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Recaudado mes" value={formatPrice(totals.monthPaid)} icon={<TrendingUp size={16} />} color="text-emerald-300" />
          <KPI title="Pagado total" value={formatPrice(totals.paid)} icon={<CheckCircle2 size={16} />} color="text-cyan-300" />
          <KPI title="Por cobrar" value={formatPrice(totals.pending)} icon={<Clock size={16} />} color="text-amber-300" />
          <KPI title="En mora" value={formatPrice(totals.overdue)} icon={<AlertCircle size={16} />} color="text-rose-300" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° factura, empresa o concepto…"
              className="input-glass pl-9"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            {(['all', 'paid', 'pending', 'overdue', 'failed', 'refunded'] as const).map((s) => (
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
          <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 ml-auto">
            {filtered.length} facturas
          </span>
        </div>

        <div className="frosted-card border-white/5 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 bg-white/5">
                <tr>
                  <th className="p-4">Factura</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Concepto</th>
                  <th className="p-4">Emitida</th>
                  <th className="p-4">Vence</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const meta = STATUS_META[inv.actualStatus];
                  return (
                    <tr key={inv.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-xs font-black text-white font-mono">{inv.id}</td>
                      <td className="p-4">
                        <p className="text-xs text-slate-200 font-bold">{inv.tenant?.name || inv.tenantId}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">{inv.subscriptionId}</p>
                      </td>
                      <td className="p-4 text-[11px] text-slate-300">{inv.concept}</td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="text-[11px] text-slate-300 font-mono">{new Date(inv.dueAt).toLocaleDateString()}</p>
                        {inv.actualStatus !== 'paid' && inv.actualStatus !== 'refunded' && (
                          <p className={cn('text-[9px] font-black uppercase tracking-widest italic',
                            inv.daysToDue < 0 ? 'text-rose-300' : inv.daysToDue <= 5 ? 'text-amber-300' : 'text-slate-500')}>
                            {inv.daysToDue < 0 ? `${Math.abs(inv.daysToDue)}d mora` : inv.daysToDue === 0 ? 'hoy' : `${inv.daysToDue}d`}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-xs text-white font-mono font-black text-right">{formatPrice(inv.amount)}</td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest italic', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {(inv.actualStatus === 'pending' || inv.actualStatus === 'overdue') && (
                            <>
                              <button
                                onClick={() => markPaid(inv.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-emerald-500/20 flex items-center gap-1"
                                title="Marcar pagada"
                              >
                                <Banknote size={10} />
                                Pagada
                              </button>
                              <button
                                onClick={() => sendInvoice(inv.id)}
                                className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-indigo-500/20 flex items-center gap-1"
                                title="Enviar al cliente"
                              >
                                <Send size={10} />
                                Enviar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toast.message('Descarga de PDF próximamente')}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
                            title="PDF"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">
                      Sin facturas en este filtro.
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
