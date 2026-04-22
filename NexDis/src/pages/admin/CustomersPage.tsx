import { useState, useEffect, type FormEvent } from 'react';
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, CreditCard, ChevronRight, History } from 'lucide-react';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import { useRealtime } from '../../lib/realtime';
import { toast } from 'sonner';
import type { Customer } from '../../types';

export default function CustomersPage() {
  const { formatPrice } = useRegional();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lima',
    creditLimit: 1000,
  });

  const load = () =>
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });

  useEffect(() => {
    load();
  }, []);

  useRealtime({
    onEvent: (type) => {
      if (type === 'customers:created') load();
    }
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.address.trim()) {
      toast.error('Completa Nombre y Dirección');
      return;
    }

    const id = toast.loading('Registrando cliente...');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo registrar el cliente');
      }
      toast.success('Cliente registrado', { id });
      setIsCreateOpen(false);
      setCreateForm((p) => ({ ...p, name: '', contact: '', phone: '', email: '', address: '' }));
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Error al registrar cliente', { id });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10 transition-all duration-500">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">Hub de Clientes</h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">CRM Estratégico y Gestión de Cartera.</p>
        </div>
        <button className="btn-glass" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl frosted-card border-white/10">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Registrar Cliente</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Alta rápida (Admin)</p>
              </div>
              <button
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Nombre *</label>
                  <input
                    className="input-glass"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej. Minimarket La Esquina"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Contacto</label>
                  <input
                    className="input-glass"
                    value={createForm.contact}
                    onChange={(e) => setCreateForm((p) => ({ ...p, contact: e.target.value }))}
                    placeholder="Ej. Juan Perez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Teléfono</label>
                  <input
                    className="input-glass"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Ej. 999999999"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Email</label>
                  <input
                    className="input-glass"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="cliente@correo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Dirección *</label>
                  <input
                    className="input-glass"
                    value={createForm.address}
                    onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Av / Calle / Mz / Lt"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Ciudad</label>
                  <input
                    className="input-glass"
                    value={createForm.city}
                    onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Límite de crédito</label>
                  <input
                    type="number"
                    className="input-glass"
                    value={createForm.creditLimit}
                    onChange={(e) => setCreateForm((p) => ({ ...p, creditLimit: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={18} />
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scrollbar">
        <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <div className="col-span-3 space-y-6">
          <div className="frosted-card border-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic mb-6">Segmentación</h3>
            <div className="space-y-3">
              <SegmentItem label="Premium" count={12} color="bg-indigo-500" />
              <SegmentItem label="Mayoristas" count={45} color="bg-emerald-500" />
              <SegmentItem label="Minoristas" count={120} color="bg-orange-500" />
              <SegmentItem label="Inactivos" count={8} color="bg-slate-600" />
            </div>
          </div>
          
          <div className="frosted-card relative overflow-hidden bg-indigo-600/10 border-indigo-500/20 group">
             <CreditCard className="mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-500" size={32} />
             <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest italic">Cartera en Riesgo</p>
             <p className="text-4xl font-black text-white mt-1 font-mono tracking-tighter">{formatPrice(45200)}</p>
             <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all text-white backdrop-blur-md">
                Ver Morosos
             </button>
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>

        {/* Main List */}
        <div className="col-span-9 space-y-5">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-6 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Nombre, Contacto o RUC..." 
                  className="input-glass pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 transition-all rounded-xl border border-transparent hover:border-white/10">
                <Filter size={20} />
              </button>
           </div>

           <div className="grid grid-cols-1 gap-5">
              {customers
                .filter(c => 
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  c.contact.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  c.address.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(customer => (
                <div key={customer.id} className="frosted-card hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-slate-800 border border-white/5 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-inner group-hover:scale-110 transition-transform">
                        {customer.name.substring(0, 2)}
                      </div>
                      <div className="self-center">
                        <h4 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">{customer.name}</h4>
                        <div className="flex items-center gap-5 mt-2">
                           <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase italic tracking-tighter">
                             <Users size={12} className="text-indigo-400" /> {customer.contact}
                           </span>
                           <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase italic tracking-tighter">
                             <MapPin size={12} className="text-indigo-400" /> {customer.address}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Saldo Actual</p>
                       <p className={cn(
                         "text-3xl font-black font-mono tracking-tighter mt-1",
                         customer.currentBalance > (customer.creditLimit * 0.8) ? "text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "text-white"
                       )}>
                         {formatPrice(customer.currentBalance)}
                       </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex gap-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Canal</span>
                        <span className="text-sm font-bold text-indigo-400 uppercase italic">Tradicional</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Límite</span>
                        <span className="text-sm font-black text-white font-mono tracking-tighter">{formatPrice(customer.creditLimit)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Actividad</span>
                        <span className="text-sm font-bold text-emerald-400 uppercase italic">Hace 2 días</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                       <button className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 transition-all"><History size={18} /></button>
                       <button className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 transition-all"><Mail size={18} /></button>
                       <button className="btn-glass !px-5 !py-2.5">
                         <span>Ver Perfil</span>
                         <ChevronRight size={16} />
                       </button>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-all"></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  </div>
);
}

function SegmentItem({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", color)}></div>
        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest italic">{label}</span>
      </div>
      <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg italic font-mono">{count}</span>
    </div>
  );
}
