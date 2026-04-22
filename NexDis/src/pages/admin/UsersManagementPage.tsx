import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Shield, 
  UserCircle2, 
  Mail, 
  Trash2, 
  Edit,
  UserPlus,
  X,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import type { User } from '../../types';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'seller' as 'admin' | 'seller' | 'warehouse',
    password: ''
  });

  useEffect(() => {
    // Mock initial users
    const initialUsers: User[] = [
      { id: 'USR-001', name: 'Administrador Principal', email: 'admin@nexdist.com', role: 'admin' },
      { id: 'USR-002', name: 'Anderson T.', email: 'anderson@nexdist.com', role: 'seller' },
      { id: 'USR-003', name: 'Gestor Almacén', email: 'marta@nexdist.com', role: 'warehouse' },
    ];
    setUsers(initialUsers);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newUser: User = {
        id: `USR-00${users.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      setUsers([...users, newUser]);
      setLoading(false);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'seller', password: '' });
      toast.success('Usuario creado exitosamente');
    }, 800);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.error('Usuario eliminado');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 pt-4 space-y-6 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Control de acceso y roles del personal.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="relative z-10">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-96 group focus-within:border-indigo-500/50 transition-all">
          <Search size={18} className="text-slate-500 mr-3 group-focus-within:text-indigo-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table/Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredUsers.map((user) => (
          <motion.div 
            layout
            key={user.id}
            className="frosted-card group border-white/5 p-6 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transform group-hover:rotate-3 transition-transform duration-500",
                  user.role === 'admin' ? "bg-indigo-600 shadow-indigo-600/20" : "bg-emerald-600 shadow-emerald-600/20"
                )}>
                  {user.role === 'admin' ? <Shield size={28} /> : <UserCircle2 size={28} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg uppercase italic tracking-tight">{user.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      user.role === 'admin' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      {user.role}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user.id}</span>
                  </div>
                </div>
              </div>
              <button className="text-slate-600 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={16} />
                <span className="text-xs font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase italic">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Activo
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-600 hover:text-indigo-400 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
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
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Alta de Usuario</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Complete los datos de la cuenta</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Nombre Completo</label>
                    <div className="relative group">
                      <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Juan Pérez"
                        className="input-glass pl-12"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Correo Electrónico</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        required
                        type="email" 
                        placeholder="usuario@nexdist.com"
                        className="input-glass pl-12"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Rol en el Sistema</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                        className={cn(
                          "py-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                          formData.role === 'admin' ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                        )}
                      >
                        <Shield size={24} />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">Administrador</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'seller' })}
                        className={cn(
                          "py-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                          formData.role === 'seller' ? "bg-emerald-600/10 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                        )}
                      >
                        <UserCircle2 size={24} />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">Vendedor</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Contraseña Temporal</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        className="input-glass pl-12"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Creando Usuario...' : (
                    <>
                      <span>Confirmar Registro</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
