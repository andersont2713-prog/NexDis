import {useEffect, useMemo, useState} from 'react';
import {Package, RefreshCw} from 'lucide-react';
import {useRegional} from '../../context/RegionalContext';
import {useRealtime} from '../../lib/realtime';
import {cn} from '../../lib/utils';
import type {Order} from '../../types';

const STATUS_LABEL: Record<Order['status'], {label: string; cls: string}> = {
  pending: {label: 'Pendiente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20'},
  processed: {label: 'Procesado', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'},
  shipped: {label: 'En ruta', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'},
  delivered: {label: 'Entregado', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20'},
  cancelled: {label: 'Cancelado', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20'},
};

function parseOrder(o: any): Order {
  return {
    ...o,
    createdAt: o?.createdAt ? new Date(o.createdAt) : new Date(),
  } as Order;
}

export default function OrdersHistoryPage() {
  const {formatPrice, formatDate, formatTime} = useRegional();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const sellerId = 'USR-001';

  const load = () =>
    fetch(`/api/orders?sellerId=${encodeURIComponent(sellerId)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data.map(parseOrder) : [];
        setOrders(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  useRealtime({
    onEvent: (type) => {
      if (type === 'orders:created') load();
    },
  });

  const sorted = useMemo(
    () => [...orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt)),
    [orders],
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Historial</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-emerald-500/30 pl-3">
            Pedidos enviados recientemente.
          </p>
        </div>

        <button
          onClick={load}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Actualizar"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading && (
        <div className="frosted-card border-white/10 flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Cargando pedidos…
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="frosted-card border-dashed border-white/10 flex flex-col items-center justify-center py-12 text-slate-600 italic uppercase font-black text-xs tracking-widest">
          <Package className="mb-4 opacity-20" size={48} />
          Aún no tienes pedidos
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((o) => {
          const meta = STATUS_LABEL[o.status];
          return (
            <div key={o.id} className="frosted-card bg-emerald-500/5 border-emerald-500/10 group">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-[10px] font-black uppercase tracking-[0.2em] italic px-2 py-0.5 rounded-full border', meta.cls)}>
                  {meta.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatDate(o.createdAt)} {formatTime(o.createdAt)}
                </span>
              </div>

              <h4 className="font-bold text-white uppercase italic tracking-tight">{o.id}</h4>

              <div className="flex items-center justify-between mt-4">
                <p className="text-xl font-black text-white font-mono tracking-tighter">{formatPrice(o.total ?? 0)}</p>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase italic">
                  <Package size={12} className="text-indigo-400" />
                  {(o.items?.length ?? 0)} items
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

