import React from 'react';
import { MapPin, ChevronRight, CheckCircle2, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Zone } from '../../types';

interface ZoneSelectionPageProps {
  zones: Zone[];
  selectedZone: Zone | null;
  onSelect: (zone: Zone) => void;
}

export default function ZoneSelectionPage({ zones, selectedZone, onSelect }: ZoneSelectionPageProps) {
  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 pb-32">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Módulo de Zonas</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">
          Selección de territorio asignado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {zones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <motion.button
              key={zone.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(zone)}
              className={cn(
                "frosted-card group flex items-center justify-between p-6 transition-all border",
                isSelected 
                  ? "bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-600/20" 
                  : "border-white/5 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                  isSelected ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "bg-white/5 text-slate-400"
                )}>
                  <Navigation size={28} className={cn(isSelected ? "animate-pulse" : "")} />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    "text-xl font-black italic tracking-tight uppercase transition-colors",
                    isSelected ? "text-white" : "text-slate-300"
                  )}>
                    {zone.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {zone.customers.length} Clientes asignados
                    </span>
                    <div className="w-1 h-1 rounded-full bg-indigo-500/50"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      Activa
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isSelected && (
                  <CheckCircle2 size={24} className="text-emerald-500 animate-in zoom-in" />
                )}
                {!isSelected && (
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedZone && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <MapPin size={20} className="text-indigo-400" />
                <h4 className="text-sm font-black text-white italic uppercase tracking-tight">Carga de Datos Completa</h4>
             </div>
             <p className="text-xs text-slate-400 font-medium leading-relaxed">
               Has seleccionado la zona <span className="text-white font-bold italic">{selectedZone.name}</span>. 
               Las rutas, inventario de tránsito y la lista de clientes se han sincronizado con el servidor central.
             </p>
             <div className="flex gap-4 pt-2">
                <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                   <p className="text-[9px] font-black text-slate-500 uppercase italic">Clientes</p>
                   <p className="text-lg font-black text-white font-mono">{selectedZone?.customers.length}</p>
                </div>
                <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                   <p className="text-[9px] font-black text-slate-500 uppercase italic">Rutas</p>
                   <p className="text-lg font-black text-white font-mono">12</p>
                </div>
             </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10"></div>
        </motion.div>
      )}

      {/* Admin Info Tip */}
      <div className="frosted-card border-dashed border-white/10 p-5 flex gap-4 items-start">
         <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
            <Lock size={16} />
         </div>
         <div className="flex-1">
            <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Nota del Administrador</h5>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase italic">
              Zonas asignadas por Carlos Admin. Para solicitar un cambio de zona, contacte al supervisor de logística.
            </p>
         </div>
      </div>
    </div>
  );
}

// Importing Lock from lucide-react if needed, or just define it in props/constants
import { Lock } from 'lucide-react';
