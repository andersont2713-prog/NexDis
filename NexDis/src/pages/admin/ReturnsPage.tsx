import React, { useState } from 'react';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  User, 
  Package, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
}

interface Return {
  id: string;
  orderId: string;
  customerName: string;
  items: ReturnItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  totalValue: number;
  createdAt: Date;
}

const MOCK_RETURNS: Return[] = [
  {
    id: 'RET-001',
    orderId: 'ORD-5421',
    customerName: 'Abarrotes Don Lucho',
    items: [{ productId: '1', productName: 'Arroz Extra Costeño 1kg', quantity: 5, reason: 'Empaque dañado' }],
    status: 'completed',
    totalValue: 22.50,
    createdAt: new Date(2024, 3, 15, 10, 30)
  },
  {
    id: 'RET-002',
    orderId: 'ORD-8712',
    customerName: 'Minimarket El Sol',
    items: [{ productId: '2', productName: 'Aceite Girasol Primor 1L', quantity: 2, reason: 'Producto vencido' }],
    status: 'pending',
    totalValue: 19.60,
    createdAt: new Date(2024, 3, 20, 14, 15)
  },
  {
    id: 'RET-003',
    orderId: 'ORD-2109',
    customerName: 'Bodega Santa Rosa',
    items: [{ productId: '3', productName: 'Leche Gloria Six Pack', quantity: 1, reason: 'Error en despacho' }],
    status: 'approved',
    totalValue: 24.50,
    createdAt: new Date(2024, 3, 21, 0, 0)
  }
];

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: <AlertCircle size={14} /> },
  approved: { label: 'Aprobado', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', icon: <CheckCircle2 size={14} /> },
  rejected: { label: 'Rechazado', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: <XCircle size={14} /> },
  completed: { label: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: <CheckCircle2 size={14} /> },
};

export default function ReturnsPage() {
  const { formatPrice, formatTime, formatDate } = useRegional();
  const [returns, setReturns] = useState<Return[]>(MOCK_RETURNS);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [filter, setFilter] = useState('all');

  const filteredReturns = returns.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8 space-y-8 relative">
      <div className="flex items-center justify-between relative z-10 text-white italic tracking-tighter uppercase font-display">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase font-display">Gestión de Devoluciones</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3 italic">Control de logística inversa y mermas.</p>
        </div>
        <button className="h-12 px-6 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl flex items-center gap-2 font-black uppercase italic tracking-widest text-[10px] transition-all shadow-xl shadow-white/5 active:scale-95">
          <Plus size={16} />
          <span>Procesar Nueva Devolución</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Sidebar Filters & Stats */}
        <div className="col-span-3 space-y-6 overflow-y-auto pr-2">
          <div className="frosted-card border-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic mb-6">Estado del Proceso</h3>
            <div className="space-y-2">
              <FilterButton label="Todos" count={returns.length} isActive={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterButton label="Pendientes" count={returns.filter(r => r.status === 'pending').length} isActive={filter === 'pending'} onClick={() => setFilter('pending')} color="text-amber-400" />
              <FilterButton label="Aprobados" count={returns.filter(r => r.status === 'approved').length} isActive={filter === 'approved'} onClick={() => setFilter('approved')} color="text-indigo-400" />
              <FilterButton label="Completados" count={returns.filter(r => r.status === 'completed').length} isActive={filter === 'completed'} onClick={() => setFilter('completed')} color="text-emerald-400" />
            </div>
          </div>

          <div className="frosted-card border-white/5 p-6 bg-indigo-600/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <RotateCcw size={20} />
              </div>
              <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Impacto Financiero</h4>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Mermas del mes</p>
              <p className="text-3xl font-black text-white italic tracking-tighter uppercase font-mono">
                {formatPrice(returns.reduce((acc, r) => acc + r.totalValue, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="col-span-9 flex flex-col space-y-4 overflow-hidden">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-6 backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" placeholder="Buscar por cliente, pedido o ID..." className="input-glass pl-10" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredReturns.map(ret => (
              <motion.div 
                layoutId={ret.id}
                key={ret.id}
                onClick={() => setSelectedReturn(ret)}
                className={cn(
                  "frosted-card border-white/5 p-6 hover:border-indigo-500/30 transition-all cursor-pointer group hover:bg-white/[0.03]",
                  selectedReturn?.id === ret.id ? "border-indigo-500/50 bg-white/[0.05]" : ""
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded italic border border-indigo-400/20">
                        {ret.id}
                      </span>
                      <span className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[9px] font-black uppercase italic border shadow-sm",
                        STATUS_CONFIG[ret.status].bg,
                        STATUS_CONFIG[ret.status].color,
                        STATUS_CONFIG[ret.status].border
                      )}>
                        {STATUS_CONFIG[ret.status].icon}
                        {STATUS_CONFIG[ret.status].label}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                        {ret.customerName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest italic">
                          <ClipboardList size={12} className="text-indigo-500/50" />
                          Pedido: {ret.orderId}
                        </div>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest italic">
                          <Calendar size={12} className="text-indigo-500/50" />
                          {formatTime(ret.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-2xl font-black text-white italic tracking-tighter uppercase font-mono">
                      {formatPrice(ret.totalValue)}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase italic border border-white/5 px-2 py-0.5 rounded-lg">
                      <Package size={10} />
                      {ret.items.length} {ret.items.length === 1 ? 'Producto' : 'Productos'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReturn(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedReturn.id}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded italic border border-indigo-400/20">{selectedReturn.id}</span>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Detalle de Devolución</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Registrado el {formatDate(selectedReturn.createdAt)} a las {formatTime(selectedReturn.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedReturn(null)} className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <RotateCcw className="rotate-45" size={20} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-8">
                <div className="flex gap-8">
                  <div className="flex-1 space-y-4">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Información del Cliente</h5>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-indigo-400" />
                        <span className="text-lg font-black text-white italic uppercase tracking-tighter">{selectedReturn.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs">
                        <ClipboardList size={14} />
                        <span className="font-bold uppercase tracking-wider">Originado de Pedido #{selectedReturn.orderId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-48 space-y-4">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Estado</h5>
                    <div className={cn(
                      "flex items-center justify-center gap-3 h-14 rounded-2xl font-black uppercase italic tracking-widest text-xs border shadow-lg",
                      STATUS_CONFIG[selectedReturn.status].bg,
                      STATUS_CONFIG[selectedReturn.status].color,
                      STATUS_CONFIG[selectedReturn.status].border
                    )}>
                      {STATUS_CONFIG[selectedReturn.status].icon}
                      {STATUS_CONFIG[selectedReturn.status].label}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Productos Devueltos</h5>
                  <div className="space-y-2">
                    {selectedReturn.items.map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400 font-black italic">
                            {item.quantity}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white italic uppercase tracking-tight">{item.productName}</p>
                            <p className="text-[9px] text-rose-400 font-bold uppercase italic tracking-widest">Causa: {item.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-xl font-black text-slate-500 uppercase italic tracking-tighter">Valor Reintegrado</p>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {formatPrice(selectedReturn.totalValue)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]">
                      Aprobar Devolución
                    </button>
                    <button className="h-16 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all border border-rose-500/20 active:scale-[0.98]">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, count, isActive, onClick, color = "text-slate-400" }: { 
  label: string, 
  count: number, 
  isActive: boolean, 
  onClick: () => void,
  color?: string
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border",
        isActive 
          ? "bg-white/5 border-white/10 shadow-lg" 
          : "border-transparent hover:bg-white/[0.02] text-slate-500"
      )}
    >
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest italic",
        isActive ? "text-white" : color
      )}>{label}</span>
      <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 rounded italic font-mono">{count}</span>
    </button>
  );
}
