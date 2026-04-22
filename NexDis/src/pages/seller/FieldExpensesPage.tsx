import React, { useState, FormEvent } from 'react';
import {
  ChevronLeft,
  Fuel,
  Coffee,
  Wrench,
  Receipt,
  Camera,
  CheckCircle2,
  Save,
  RefreshCw,
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
    {
      id: 'Combustible',
      label: 'Combustible',
      icon: <Fuel size={20} />,
      color: 'bg-amber-500/20 text-amber-500',
    },
    {
      id: 'Alimentación',
      label: 'Alimentación',
      icon: <Coffee size={20} />,
      color: 'bg-rose-500/20 text-rose-500',
    },
    {
      id: 'Mantenimiento',
      label: 'Mantenimiento',
      icon: <Wrench size={20} />,
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      id: 'Peajes',
      label: 'Peajes/Estac.',
      icon: <Receipt size={20} />,
      color: 'bg-emerald-500/20 text-emerald-500',
    },
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      toast.success('Gasto registrado y sincronizado');
    }, 1200);
  };

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      <div className="decorative-blur top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/10"></div>

      <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          {/* Capa base estática */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--app-bg) 70%, transparent) 0%, color-mix(in srgb, var(--app-bg) 92%, transparent) 100%)',
            }}
          />

          {/* Cabecera principal */}
          <div
            className="shrink-0 relative z-20 border-b backdrop-blur-2xl overflow-hidden sticky top-0"
            style={{
              borderColor: 'color-mix(in srgb, rgb(99 102 241) 45%, transparent)',
              background:
                'linear-gradient(135deg, color-mix(in srgb, rgb(99 102 241) 28%, var(--app-bg)) 0%, color-mix(in srgb, rgb(34 211 238) 22%, var(--app-bg)) 100%)',
              boxShadow:
                '0 30px 80px -45px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-25 bg-indigo-500" />
            <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full blur-[60px] opacity-20 bg-emerald-500" />

            <div className="px-4 py-2.5 relative">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white transition-all active:scale-95"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                      background: 'color-mix(in srgb, var(--app-card) 55%, transparent)',
                    }}
                    title="Volver"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h2 className="text-base font-black italic tracking-tight text-white uppercase leading-none">
                    Registrar Gasto
                  </h2>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300/70">
                    campo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-h-0 relative z-10 pt-4 px-2 flex flex-col overflow-hidden">
            <div
              className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-3 pt-1 bg-transparent overscroll-contain relative z-10"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)',
              }}
            >
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Monto */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                        Monto del Gasto
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 italic">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          className="w-full bg-slate-900/60 border border-white/10 rounded-2xl h-20 pl-12 pr-6 text-4xl font-black text-white italic tracking-tighter outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    {/* Categorías */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                        Categoría
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                          <label
                            key={cat.id}
                            className="relative cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={cat.id}
                              className="peer sr-only"
                              defaultChecked={cat.id === 'Combustible'}
                            />
                            <div className="h-20 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 group-active:scale-95 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-400 peer-checked:shadow-lg peer-checked:shadow-indigo-600/20">
                              <div
                                className={cn(
                                  'p-2 rounded-lg transition-colors',
                                  cat.color,
                                  'peer-checked:bg-white peer-checked:text-indigo-600'
                                )}
                              >
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

                    {/* Descripción */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                        Descripción / Notas
                      </label>
                      <textarea
                        placeholder="Ej: Gasolina para la ruta sur de hoy..."
                        className="input-glass min-h-[100px] py-3 text-sm"
                        required
                      ></textarea>
                    </div>

                    {/* Evidencia */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                        Evidencia (Opcional)
                      </label>
                      <button
                        type="button"
                        className="w-full h-14 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Camera size={18} />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">
                          Tomar Foto del Ticket
                        </span>
                      </button>
                    </div>

                    {/* Guardar */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all text-xs border border-white/10 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Sincronizando…</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} className="stroke-[2.5]" />
                          <span>Guardar Gasto</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 flex flex-col items-center text-center space-y-5"
                  >
                    <div className="w-24 h-24 bg-emerald-500 text-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
                      <CheckCircle2 size={48} className="stroke-[3]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display leading-[0.9]">
                        Registro<br />Exitoso
                      </h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic">
                        El gasto fue enviado a la caja central.
                      </p>
                    </div>

                    <div className="w-full frosted-card border-white/5 p-5 bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Ticket ID
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          #ND-EXP-8472
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                          Efectivo Reintegrado
                        </span>
                        <p className="text-2xl font-black text-white italic tracking-tighter font-mono">
                          {formatPrice(0)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/seller')}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all text-xs border border-white/10"
                    >
                      Volver a la Ruta
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
