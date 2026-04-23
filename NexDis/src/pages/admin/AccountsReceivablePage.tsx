import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  TrendingUp,
  User,
  Download,
  X,
  Banknote,
  CalendarDays,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
type PaymentMethod = 'cash' | 'transfer' | 'card' | 'check' | 'credit_note';

type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  note?: string;
};

type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paid: number;
  status: InvoiceStatus;
  seller: string;
  note?: string;
};

const INVOICES_KEY = 'nexdist:invoices:v1';
const PAYMENTS_KEY = 'nexdist:payments:v1';

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30', icon: <Clock size={12} /> },
  partial: { label: 'Parcial', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: <Receipt size={12} /> },
  paid: { label: 'Pagada', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  overdue: { label: 'Mora', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: <AlertCircle size={12} /> },
  cancelled: { label: 'Anulada', color: 'bg-slate-500/5 text-slate-400 border-slate-500/20', icon: <X size={12} /> },
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  check: 'Cheque',
  credit_note: 'Nota crédito',
};

const SEED_INVOICES: Invoice[] = [
  { id: 'FV-5201', customerId: 'C-001', customerName: 'Bodega El Sol', issueDate: iso(-42), dueDate: iso(-12), total: 1850000, paid: 0, status: 'overdue', seller: 'Anderson' },
  { id: 'FV-5202', customerId: 'C-002', customerName: 'Minimarket Lily', issueDate: iso(-35), dueDate: iso(-5), total: 920000, paid: 400000, status: 'partial', seller: 'Karla' },
  { id: 'FV-5203', customerId: 'C-003', customerName: 'Mercado Central #24', issueDate: iso(-20), dueDate: iso(10), total: 3480000, paid: 0, status: 'pending', seller: 'Karla' },
  { id: 'FV-5204', customerId: 'C-004', customerName: 'Distribuidora San Martín', issueDate: iso(-15), dueDate: iso(15), total: 5120000, paid: 5120000, status: 'paid', seller: 'Anderson' },
  { id: 'FV-5205', customerId: 'C-005', customerName: 'Tienda Don Jhon', issueDate: iso(-50), dueDate: iso(-20), total: 740000, paid: 0, status: 'overdue', seller: 'Luis' },
  { id: 'FV-5206', customerId: 'C-006', customerName: 'Abarrotes La Esquina', issueDate: iso(-8), dueDate: iso(22), total: 1260000, paid: 0, status: 'pending', seller: 'Luis' },
  { id: 'FV-5207', customerId: 'C-007', customerName: 'Kiosko Central', issueDate: iso(-3), dueDate: iso(27), total: 680000, paid: 200000, status: 'partial', seller: 'Anderson' },
  { id: 'FV-5208', customerId: 'C-008', customerName: 'Market Express', issueDate: iso(-70), dueDate: iso(-40), total: 2190000, paid: 500000, status: 'overdue', seller: 'Karla' },
  { id: 'FV-5209', customerId: 'C-009', customerName: 'Tienda El Progreso', issueDate: iso(-10), dueDate: iso(20), total: 1120000, paid: 0, status: 'pending', seller: 'Luis' },
  { id: 'FV-5210', customerId: 'C-010', customerName: 'Bodega Doña Rosa', issueDate: iso(-6), dueDate: iso(24), total: 2340000, paid: 2340000, status: 'paid', seller: 'Anderson' },
];

function iso(daysOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
}

const makePayId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `PG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    : `PG-${Date.now().toString(36).toUpperCase()}`;

export default function AccountsReceivablePage() {
  const { formatPrice } = useRegional();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState<{ amount: number; method: PaymentMethod; reference: string; note: string }>({
    amount: 0,
    method: 'cash',
    reference: '',
    note: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVOICES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setInvoices(recomputeStatuses(parsed));
          const p = localStorage.getItem(PAYMENTS_KEY);
          if (p) setPayments(JSON.parse(p));
          return;
        }
      }
      setInvoices(recomputeStatuses(SEED_INVOICES));
    } catch {
      setInvoices(recomputeStatuses(SEED_INVOICES));
    }
  }, []);

  useEffect(() => {
    try {
      if (invoices.length) localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    } catch {}
  }, [payments]);

  function recomputeStatuses(list: Invoice[]): Invoice[] {
    const today = Date.now();
    return list.map((i) => {
      if (i.status === 'cancelled') return i;
      const balance = i.total - i.paid;
      if (balance <= 0) return { ...i, status: 'paid' };
      const due = new Date(i.dueDate).getTime();
      if (due < today) return { ...i, status: 'overdue' };
      if (i.paid > 0) return { ...i, status: 'partial' };
      return { ...i, status: 'pending' };
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recomputeStatuses(invoices)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .filter((i) => {
        if (statusFilter !== 'all' && i.status !== statusFilter) return false;
        if (!q) return true;
        return i.id.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q) || i.seller.toLowerCase().includes(q);
      });
  }, [invoices, search, statusFilter]);

  const aging = useMemo(() => {
    const now = Date.now();
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
    let totalReceivable = 0;
    let paidCount = 0;
    let overdueAmount = 0;
    invoices.forEach((i) => {
      if (i.status === 'cancelled') return;
      const balance = i.total - i.paid;
      if (balance <= 0) {
        paidCount++;
        return;
      }
      totalReceivable += balance;
      const due = new Date(i.dueDate).getTime();
      const days = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      if (days < 0) buckets.current += balance;
      else if (days <= 30) buckets.d30 += balance;
      else if (days <= 60) buckets.d60 += balance;
      else if (days <= 90) buckets.d90 += balance;
      else buckets.d90plus += balance;
      if (days > 0) overdueAmount += balance;
    });
    return { buckets, totalReceivable, paidCount, overdueAmount };
  }, [invoices]);

  const topDebtors = useMemo(() => {
    const byCustomer = new Map<string, { name: string; balance: number; count: number }>();
    invoices.forEach((i) => {
      if (i.status === 'cancelled') return;
      const bal = i.total - i.paid;
      if (bal <= 0) return;
      const prev = byCustomer.get(i.customerId) || { name: i.customerName, balance: 0, count: 0 };
      prev.balance += bal;
      prev.count += 1;
      byCustomer.set(i.customerId, prev);
    });
    return Array.from(byCustomer.values()).sort((a, b) => b.balance - a.balance).slice(0, 5);
  }, [invoices]);

  const openPayment = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    setPayingId(id);
    setPayForm({ amount: Math.max(0, inv.total - inv.paid), method: 'cash', reference: '', note: '' });
  };

  const submitPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!payingId) return;
    const inv = invoices.find((i) => i.id === payingId);
    if (!inv) return;
    const remaining = inv.total - inv.paid;
    const amount = Math.min(payForm.amount, remaining);
    if (amount <= 0) {
      toast.error('Monto inválido');
      return;
    }
    const payment: Payment = {
      id: makePayId(),
      invoiceId: inv.id,
      amount,
      method: payForm.method,
      date: new Date().toISOString(),
      reference: payForm.reference,
      note: payForm.note,
    };
    setPayments((list) => [payment, ...list]);
    setInvoices((list) =>
      recomputeStatuses(list.map((i) => (i.id === inv.id ? { ...i, paid: i.paid + amount } : i)))
    );
    toast.success(`Abono registrado · ${formatPrice(amount)}`);
    setPayingId(null);
  };

  const cancelInvoice = (id: string) => {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)));
    toast.success('Factura anulada');
  };

  const sendReminder = (inv: Invoice) => {
    toast.success(`Recordatorio enviado a ${inv.customerName}`);
  };

  const payingInvoice = invoices.find((i) => i.id === payingId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Cuentas por Cobrar
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
            Cartera viva, abonos, antigüedad y recuperación de saldos.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
            onClick={() => toast.success('Exportando cartera a Excel')}
          >
            <Download size={18} />
            <span>Exportar Cartera</span>
          </button>
          <button
            className="btn-glass"
            onClick={() => toast.message('Envía recordatorios masivos a clientes en mora')}
          >
            <Mail size={18} />
            <span>Recordatorios</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPI title="Por Cobrar" value={formatPrice(aging.totalReceivable)} icon={<Wallet size={16} />} accent="text-indigo-400" />
          <KPI title="En Mora" value={formatPrice(aging.overdueAmount)} icon={<AlertCircle size={16} />} accent="text-rose-400" />
          <KPI title="Facturas Abiertas" value={invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length.toString()} icon={<Receipt size={16} />} accent="text-amber-400" />
          <KPI title="Pagadas" value={aging.paidCount.toString()} icon={<CheckCircle2 size={16} />} accent="text-emerald-400" />
          <KPI title="Recuperado Hoy" value={formatPrice(payments.filter(p => sameDay(p.date, new Date().toISOString())).reduce((a, p) => a + p.amount, 0))} icon={<TrendingUp size={16} />} accent="text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 frosted-card border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Antigüedad de saldos</h3>
              <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">
                Total: {formatPrice(aging.totalReceivable)}
              </span>
            </div>
            <div className="space-y-3">
              <AgingBar label="Al día" value={aging.buckets.current} total={aging.totalReceivable} color="bg-emerald-400" format={formatPrice} />
              <AgingBar label="1-30 días" value={aging.buckets.d30} total={aging.totalReceivable} color="bg-amber-400" format={formatPrice} />
              <AgingBar label="31-60 días" value={aging.buckets.d60} total={aging.totalReceivable} color="bg-orange-400" format={formatPrice} />
              <AgingBar label="61-90 días" value={aging.buckets.d90} total={aging.totalReceivable} color="bg-rose-400" format={formatPrice} />
              <AgingBar label="Más de 90 días" value={aging.buckets.d90plus} total={aging.totalReceivable} color="bg-rose-600" format={formatPrice} />
            </div>
          </div>

          <div className="frosted-card border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Top deudores</h3>
            <div className="space-y-2">
              {topDebtors.length === 0 && (
                <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic py-4 text-center">
                  Sin deudores
                </div>
              )}
              {topDebtors.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black italic',
                    i === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400')}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black italic text-white truncate">{d.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{d.count} factura(s)</p>
                  </div>
                  <p className="text-xs font-black font-mono text-rose-300">{formatPrice(d.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N°, cliente o vendedor…"
              className="input-glass pl-9"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl p-1 border border-white/5">
            <Filter size={14} className="text-slate-500 ml-2" />
            {(['all', 'pending', 'partial', 'overdue', 'paid', 'cancelled'] as const).map((s) => (
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
                  <th className="p-4">Factura</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Emitida</th>
                  <th className="p-4">Vence</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Pagado</th>
                  <th className="p-4 text-right">Saldo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const meta = STATUS_META[i.status];
                  const balance = i.total - i.paid;
                  const daysLeft = Math.floor((new Date(i.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={i.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-xs font-black text-white font-mono">{i.id}</td>
                      <td className="p-4">
                        <p className="text-xs text-slate-200 font-bold">{i.customerName}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{i.customerId}</p>
                      </td>
                      <td className="p-4 text-[11px] text-slate-400">{i.seller}</td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">{new Date(i.issueDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="text-[11px] text-slate-300 font-mono">{new Date(i.dueDate).toLocaleDateString()}</p>
                        <p className={cn('text-[9px] font-black uppercase tracking-widest italic',
                          daysLeft < 0 ? 'text-rose-300' : daysLeft <= 5 ? 'text-amber-300' : 'text-slate-500')}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} d mora` : daysLeft === 0 ? 'hoy' : `${daysLeft} d restantes`}
                        </p>
                      </td>
                      <td className="p-4 text-xs text-white font-mono font-black text-right">{formatPrice(i.total)}</td>
                      <td className="p-4 text-xs text-emerald-300 font-mono font-black text-right">{formatPrice(i.paid)}</td>
                      <td className={cn('p-4 text-xs font-mono font-black text-right',
                        balance > 0 ? 'text-amber-300' : 'text-slate-500')}>{formatPrice(balance)}</td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest italic', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {balance > 0 && i.status !== 'cancelled' && (
                            <button
                              onClick={() => openPayment(i.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-emerald-500/20 flex items-center gap-1"
                            >
                              <Banknote size={12} />
                              Abonar
                            </button>
                          )}
                          {(i.status === 'overdue' || i.status === 'partial') && (
                            <button
                              onClick={() => sendReminder(i)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest italic hover:bg-indigo-500/20 flex items-center gap-1"
                            >
                              <Mail size={12} />
                              Avisar
                            </button>
                          )}
                          {i.status !== 'cancelled' && i.status !== 'paid' && (
                            <button
                              onClick={() => cancelInvoice(i.id)}
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center"
                              title="Anular"
                            >
                              <X size={12} />
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
                      Sin facturas en este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {payments.length > 0 && (
          <div className="frosted-card border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Últimos abonos</h3>
              <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                {payments.length} registrados
              </span>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
              {payments.slice(0, 20).map((p) => {
                const inv = invoices.find((i) => i.id === p.invoiceId);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                      <Banknote size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black italic text-white truncate">
                        {inv?.customerName || p.invoiceId}
                        <span className="text-[9px] text-slate-500 ml-2 font-mono">· {p.invoiceId}</span>
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        {PAYMENT_LABEL[p.method]} {p.reference ? `· ${p.reference}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-300 font-mono">{formatPrice(p.amount)}</p>
                      <p className="text-[9px] font-mono text-slate-500">{new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {payingInvoice && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayingId(null)} />
          <form onSubmit={submitPayment} className="relative z-10 w-full max-w-lg frosted-card border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Registrar abono</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                  {payingInvoice.id} · {payingInvoice.customerName}
                </p>
              </div>
              <button type="button" onClick={() => setPayingId(null)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <Info label="Total" value={formatPrice(payingInvoice.total)} />
              <Info label="Pagado" value={formatPrice(payingInvoice.paid)} />
              <Info label="Saldo" value={formatPrice(payingInvoice.total - payingInvoice.paid)} highlight />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Monto del abono">
                <input
                  type="number"
                  className="input-glass"
                  min={1}
                  max={payingInvoice.total - payingInvoice.paid}
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Método">
                <select className="input-glass" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value as PaymentMethod })}>
                  {Object.entries(PAYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Referencia (opcional)">
              <input className="input-glass" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} placeholder="N° de transferencia, cheque, voucher…" />
            </Field>
            <Field label="Nota">
              <textarea rows={2} className="input-glass resize-none" value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPayingId(null)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-black uppercase tracking-widest">
                Cancelar
              </button>
              <button type="submit" className="btn-glass">
                <Plus size={16} />
                <span>Registrar abono</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function sameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function AgingBar({ label, value, total, color, format }: { label: string; value: number; total: number; color: string; format: (n: number) => string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest italic">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-mono">{format(value)}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={cn('h-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
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
        <p className="text-base font-black text-white font-mono tracking-tight">{value}</p>
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

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">{label}</p>
      <p className={cn('font-mono font-black', highlight ? 'text-white text-lg' : 'text-slate-200 text-sm')}>{value}</p>
    </div>
  );
}
