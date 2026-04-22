import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Fuel, 
  Coffee, 
  Wrench, 
  Receipt,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

export default function FieldExpensesPage() {
  const { formatPrice } = useRegional();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const CATEGORIES = [
    { id: 'Combustible', label: 'Combustible', icon: <Fuel size={20} />, color: 'bg-amber-500/20 text-amber-500' },
    { id: 'Alimentación', label: 'Alimentación', icon: <Coffee size={20} />, color: 'bg-rose-500/20 text-rose-500' },
    { id: 'Mantenimiento', label: 'Mantenimiento', icon: <Wrench size={20} />, color: 'bg-blue-500/20 text-blue-500' },
    { id: 'Peajes', label: 'Peajes/Estacionamiento', icon: <Receipt size={20} />, color: 'bg-emerald-500/20 text-emerald-500' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      toast.success('Gasto registrado y sincronizado');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden safe-bottom">
      <div className="shrink-0 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase font-display">Registrar Gasto</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Flujo de caja para vendedores en campo.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Monto del Gasto</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-500 italic">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-white/10 rounded-3xl h-24 pl-14 pr-8 text-5xl font-black text-white italic tracking-tighter outline-none focus:border-rose-500 transition-all placeholder:text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Categoría del Gasto</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="relative cursor-pointer group">
                      <input type="radio" name="category" value={cat.id} className="peer sr-only" defaultChecked={cat.id === 'Combustible'} />
                      <div className="h-20 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 group-active:scale-95 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-400 peer-checked:shadow-lg peer-checked:shadow-indigo-600/20">
                        <div className={cn("p-2 rounded-lg transition-colors", cat.color, "peer-checked:bg-white peer-checked:text-indigo-600")}>
                          {cat.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase italic tracking-widest text-slate-400 peer-checked:text-white">
                          {cat.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Descripción / Notas</label>
                <textarea 
                  placeholder="Ej: Gasolina para la ruta sur de hoy..."
                  className="input-glass min-h-[120px] py-4 text-sm"
                  required
                ></textarea>
              </div>

              {/* Photo Upload Placeholder */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Evidencia (Opcional)</label>
                <button type="button" className="w-full h-16 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <Camera size={20} />
                  <span className="text-[10px] font-black uppercase italic tracking-widest">Tomar Foto del Ticket</span>
                </button>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-16 bg-white text-slate-900 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all",
                  isSubmitting ? "opacity-50" : ""
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                    Sincronizando...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    Finalizar Registro
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-32 h-32 bg-emerald-500 text-slate-900 rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
                <CheckCircle2 size={64} className="stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase font-display leading-[0.9]">Registro<br/>Exitoso</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic">El gasto ha sido enviado a la caja central del administrador.</p>
              </div>
              
              <div className="w-full frosted-card border-white/5 p-6 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ticket ID</span>
                  <span className="text-[10px] font-mono text-indigo-400">#ND-EXP-8472</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Efectivo Reintegrado</span>
                  <p className="text-2xl font-black text-white italic tracking-tighter font-mono italic">
                    {formatPrice(0)}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/seller')}
                className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                Volver a la Ruta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
