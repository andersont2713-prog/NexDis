import React from 'react';
import { Settings, Globe, HardDrive, Bell, Shield, Wallet, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useRegional } from '../../context/RegionalContext';
import { CURRENCIES } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currency, setCurrencyByCode, timeZone } = useRegional();

  const handleCurrencyChange = (code: string) => {
    setCurrencyByCode(code);
    toast.success(`Configuración regional actualizada`);
  };

  const handleSave = () => {
    const id = toast.loading('Sincronizando preferencias con el servidor...');
    
    // Simulate API delay
    setTimeout(() => {
      toast.success('Configuración guardada correctamente', { id });
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-8 space-y-8 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Ajustes del Sistema</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Parametrización global y preferencias regionales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Localization Settings */}
        <div className="lg:col-span-2 space-y-6">
          <section className="frosted-card border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Regional & Moneda</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configura la unidad monetaria y localización</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    currency.code === c.code 
                      ? "bg-indigo-600 border-white/10 shadow-lg shadow-indigo-600/20" 
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
                      currency.code === c.code ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-400"
                    )}>
                      {c.symbol}
                    </div>
                    <div className="text-left">
                      <p className={cn(
                        "text-sm font-black uppercase italic",
                        currency.code === c.code ? "text-white" : "text-slate-300"
                      )}>{c.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{c.country}</p>
                    </div>
                  </div>
                  {currency.code === c.code && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-white uppercase italic">Zona Horaria Detectada</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{timeZone}</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase italic">Sincronizado</span>
            </div>
          </section>

          <section className="frosted-card border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Seguridad & Facturación</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Parámetros legales de impuestos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase italic">Impuesto (IVA/IGV)</span>
                </div>
                <div className="flex items-center gap-2">
                   <input 
                    type="number" 
                    defaultValue="18" 
                    className="w-16 bg-slate-800 border-none rounded-lg py-1 px-2 text-center text-xs font-black text-indigo-400 outline-none" 
                   />
                   <span className="text-[10px] font-bold text-slate-600">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase italic">Alertas de Stock Bajo</span>
                </div>
                <div className="flex items-center gap-2">
                   <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 accent-indigo-500 bg-slate-800 rounded border-none" 
                   />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Info & Info Cards */}
        <div className="space-y-6">
          <div className="frosted-card border-indigo-500/20 bg-indigo-500/5 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-4 italic flex items-center gap-2">
               <Settings size={14} />
               Versión del Sistema
             </h4>
             <p className="text-4xl font-black text-white italic tracking-tighter">v2.4.0</p>
             <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Última actualización: 21 de Abril, 2026</p>
          </div>

          <div className="frosted-card border-white/5 p-6 space-y-4">
             <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic mb-2">Información del Servidor</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-600">Almacenamiento</span>
                  <span className="text-emerald-400">75% Libre</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[25%] h-full bg-emerald-500"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase mt-4">
                  <span className="text-slate-600">Base de Datos</span>
                  <span className="text-indigo-400">Sincronizada</span>
                </div>
             </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-white/5 active:scale-95 group"
          >
             <span>Guardar Configuración</span>
             <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
