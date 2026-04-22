import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter, 
  History, 
  TrendingUp, 
  Receipt, 
  Fuel, 
  Coffee, 
  Wrench, 
  Clock,
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  reference?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX-001', type: 'income', category: 'Venta Directa', description: 'Cierre de POS Caja 1', amount: 1540.50, date: new Date(2024, 3, 21, 9, 30), reference: 'POS-742' },
  { id: 'TX-002', type: 'expense', category: 'Logística', description: 'Combustible Camión N° 4', amount: 120.00, date: new Date(2024, 3, 21, 10, 15), reference: 'FACT-4521' },
  { id: 'TX-003', type: 'expense', category: 'Alimentación', description: 'Viáticos conductor - Ruta Sur', amount: 25.00, date: new Date(2024, 3, 21, 11, 0), reference: 'BOL-781' },
  { id: 'TX-004', type: 'income', category: 'Cobranza', description: 'Pago factura Cliente Abarrotes Lucho', amount: 3200.00, date: new Date(2024, 3, 21, 11, 30), reference: 'FAC-901' },
  { id: 'TX-005', type: 'expense', category: 'Mantenimiento', description: 'Repuesto llanta repuesto', amount: 450.00, date: new Date(2024, 3, 21, 12, 0), reference: 'FACT-992' },
];

export default function CashControlPage() {
  const { formatPrice, formatTime, formatDate } = useRegional();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [searchTerm, setSearchTerm] = useState('');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTx: Transaction = {
      id: `TX-00${transactions.length + 1}`,
      type: modalType,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: new Date(),
      reference: formData.get('reference') as string || undefined,
    };

    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
    toast.success(`${modalType === 'income' ? 'Ingreso' : 'Egreso'} registrado con éxito`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8 space-y-8 relative">
      <div className="flex items-center justify-between relative z-10 text-white italic tracking-tighter uppercase font-display">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase font-display text-white">Caja General</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-emerald-500/30 pl-3 italic">Control total de flujos, ingresos y egresos operativos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setModalType('income'); setIsModalOpen(true); }}
            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center gap-2 font-black uppercase italic tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            <ArrowUpRight size={16} />
            <span>Registrar Ingreso</span>
          </button>
          <button 
            onClick={() => { setModalType('expense'); setIsModalOpen(true); }}
            className="h-12 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex items-center gap-2 font-black uppercase italic tracking-widest text-[10px] transition-all shadow-xl shadow-rose-600/20 active:scale-95"
          >
            <ArrowDownLeft size={16} />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-8">
        <div className="frosted-card border-white/10 bg-indigo-600/10 p-8 shadow-2xl shadow-indigo-600/10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Wallet size={28} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Saldo Disponible</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase font-mono mt-1">
                {formatPrice(currentBalance)}
              </h3>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '75%' }}
               className="h-full bg-indigo-500"
            />
          </div>
        </div>

        <div className="frosted-card border-white/5 p-8 bg-emerald-600/5">
          <div className="flex items-center gap-4 mb-4 text-emerald-400">
            <ArrowUpRight size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Total Ingresos de Hoy</span>
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter font-mono">
            {formatPrice(totalIncome)}
          </h3>
          <p className="text-[9px] text-emerald-500/60 font-bold uppercase mt-2 tracking-widest italic">Basado en {transactions.filter(t => t.type === 'income').length} movimientos</p>
        </div>

        <div className="frosted-card border-white/5 p-8 bg-rose-600/5">
          <div className="flex items-center gap-4 mb-4 text-rose-400">
            <ArrowDownLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Total Egresos de Hoy</span>
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter font-mono">
            {formatPrice(totalExpense)}
          </h3>
          <p className="text-[9px] text-rose-500/60 font-bold uppercase mt-2 tracking-widest italic">Basado en {transactions.filter(t => t.type === 'expense').length} movimientos</p>
        </div>
      </div>

      {/* Main Cash Ledger */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-6 backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar movimiento por descripción o categoría..." 
              className="input-glass pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 transition-all rounded-xl border border-transparent hover:border-white/10">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {transactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(tx => (
            <div key={tx.id} className="frosted-card border-white/5 p-5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  tx.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {tx.type === 'income' ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded italic">#{tx.id}</span>
                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{tx.description}</h4>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase italic tracking-widest">
                      {getCategoryIcon(tx.category)}
                      {tx.category}
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase italic tracking-widest">
                      <Clock size={12} className="text-indigo-500/50" />
                      {formatTime(tx.date)}
                    </div>
                    {tx.reference && (
                      <>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase italic">Ref: {tx.reference}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-black italic tracking-tighter uppercase font-mono",
                  tx.type === 'income' ? "text-emerald-400" : "text-rose-400"
                )}>
                  {tx.type === 'income' ? '+' : '-'}{formatPrice(tx.amount)}
                </p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 font-bold uppercase italic mt-1">
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  Liquidado
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[42px] shadow-2xl relative z-10 overflow-hidden"
            >
              <form onSubmit={handleAddTransaction}>
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl",
                      modalType === 'income' ? "bg-emerald-600 shadow-emerald-600/20" : "bg-rose-600 shadow-rose-600/20"
                    )}>
                      {modalType === 'income' ? <ArrowUpRight size={32} /> : <ArrowDownLeft size={32} />}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nuevo {modalType === 'income' ? 'Ingreso' : 'Gasto'}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Complete la información del flujo de caja.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 h-12 w-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Monto del Movimiento</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 italic">$</span>
                      <input 
                        name="amount"
                        type="number" 
                        step="0.01"
                        required
                        autoFocus
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl h-20 pl-14 pr-8 text-4xl font-black text-white italic tracking-tighter outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Categoría</label>
                      <select name="category" required className="input-glass h-14 italic appearance-none cursor-pointer">
                        {modalType === 'income' ? (
                          <>
                            <option value="Venta Directa">Venta Directa</option>
                            <option value="Cobranza">Cobranza</option>
                            <option value="Inyección Capital">Inyección Capital</option>
                            <option value="Anulación Gasto">Anulación Gasto</option>
                          </>
                        ) : (
                          <>
                            <option value="Combustible">Combustible</option>
                            <option value="Viáticos">Viáticos</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Sueldos">Sueldos</option>
                            <option value="Impuestos">Impuestos</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Referencia (Opcional)</label>
                      <input name="reference" type="text" placeholder="Ej: Ticket-452" className="input-glass h-14" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Descripción Detallada</label>
                    <textarea name="description" placeholder="Describa el motivo del movimiento..." className="input-glass min-h-[100px] py-4" required></textarea>
                  </div>
                </div>

                <div className="p-10 bg-white/[0.02] border-t border-white/5">
                  <button 
                    type="submit"
                    className={cn(
                      "w-full h-16 rounded-2xl font-black uppercase italic tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.98]",
                      modalType === 'income' ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"
                    )}
                  >
                    Confirmar Registro en Caja
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getCategoryIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('venta') || c.includes('cobranza')) return <Receipt size={12} className="text-emerald-400" />;
  if (c.includes('combus')) return <Fuel size={12} className="text-amber-400" />;
  if (c.includes('mante')) return <Wrench size={12} className="text-blue-400" />;
  if (c.includes('viát') || c.includes('alim')) return <Coffee size={12} className="text-rose-400" />;
  return <AlertCircle size={12} className="text-slate-500" />;
}
