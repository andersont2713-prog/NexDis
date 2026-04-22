import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Search, 
  Plus, 
  MapPin, 
  User, 
  Users, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Navigation,
  CheckCircle2,
  MoreVertical,
  X,
  Save,
  Route
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import type { Zone, User as UserType } from '../../types';

const MOCK_ZONES: Zone[] = [
  { id: 'Z-001', name: 'ZONA NORTE - METROPOLITANO', customers: ['1', '2'], sellerId: 'USR-002' },
  { id: 'Z-002', name: 'ZONA SUR - LURÍN INDUSTRIAL', customers: ['3', '4'], sellerId: 'USR-002' },
  { id: 'Z-003', name: 'ZONA CENTRO - GAMARRA', customers: ['5', '6'], sellerId: 'admin' },
];

const MOCK_SELLERS: UserType[] = [
  { id: 'USR-002', name: 'Anderson T.', email: 'anderson@nexdist.com', role: 'seller' },
  { id: 'admin', name: 'Administrador Principal', email: 'admin@nexdist.com', role: 'admin' },
];

export default function ZonesManagementPage() {
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sellerId: ''
  });

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({ name: zone.name, sellerId: zone.sellerId || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      setZones(zones.map(z => z.id === editingZone.id ? { ...z, name: formData.name, sellerId: formData.sellerId } : z));
      toast.success('Zona y Ruta actualizadas');
    } else {
      const newZone: Zone = {
        id: `Z-00${zones.length + 1}`,
        name: formData.name,
        customers: [],
        sellerId: formData.sellerId
      };
      setZones([...zones, newZone]);
      toast.success('Nueva Zona creada');
    }
    setIsModalOpen(false);
    setEditingZone(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 pt-4 space-y-6 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Territorios & Rutas</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Asignación de zonas geográficas a vendedores.</p>
        </div>
        <button 
          onClick={() => { setEditingZone(null); setFormData({ name: '', sellerId: '' }); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Crear Territorio</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 pb-8">
          {zones.map((zone) => {
          const seller = MOCK_SELLERS.find(s => s.id === zone.sellerId);
          return (
            <motion.div 
              layout
              key={zone.id}
              className="frosted-card border-white/5 p-8 group hover:border-indigo-500/30 transition-all flex flex-col gap-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner transform group-hover:rotate-6 transition-transform duration-500">
                    <MapIcon size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{zone.name}</h4>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{zone.id}</span>
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase italic">
                         <CheckCircle2 size={12} />
                         {zone.customers.length} Clientes Vinculados
                       </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(zone)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Vendedor Asignado</p>
                    <Route size={14} className="text-indigo-500/50" />
                 </div>
                 
                 {seller ? (
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <User size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-white uppercase italic">{seller.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{seller.email}</p>
                      </div>
                      <div className="h-6 px-2 bg-indigo-500/10 border border-indigo-500/20 rounded-md flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase italic">
                         <Navigation size={10} />
                         En Ruta
                      </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center py-2 text-slate-600 italic text-[10px] uppercase font-bold tracking-widest border-2 border-dashed border-white/5 rounded-xl">
                      Sin Vendedor Asignado
                   </div>
                 )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                  <MapPin size={12} />
                  Ver Cobertura Geográfica
                </button>
                <button className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                  Gestionar Rutas
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zone CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative z-11"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Navigation size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                      {editingZone ? 'Configurar Territorio' : 'Nuevo Territorio'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Define la zona y su responsable</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Nombre de la Zona</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: SUR - LURÍN"
                        className="input-glass pl-12"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Asignar Vendedor de Ruta</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <select 
                        required
                        className="input-glass pl-12 border-indigo-400/10"
                        value={formData.sellerId}
                        onChange={e => setFormData({ ...formData, sellerId: e.target.value })}
                      >
                        <option value="" className="bg-slate-900">Seleccionar Vendedor Responsable</option>
                        {MOCK_SELLERS.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  <Save size={18} />
                  <span>{editingZone ? 'Guardar Cambios' : 'Activar Territorio'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
