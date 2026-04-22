import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  Truck,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Bienvenido a NexDist');
      navigate('/seller');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-900/50 backdrop-blur-2xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden lg:flex flex-col p-12 bg-gradient-to-br from-indigo-600 to-indigo-900 relative overflow-hidden group">
          <div className="relative z-10 space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-white/20">
                <Package size={28} className="stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase font-display">NexDist</span>
            </div>

            <div className="space-y-6 pt-12">
              <h2 className="text-5xl font-black text-white tracking-tighter italic leading-none uppercase">
                Optimiza<br/>tu Poder de<br/><span className="text-indigo-200">Distribución</span>
              </h2>
              <p className="text-indigo-100/70 max-w-sm text-lg font-medium leading-relaxed">
                Gestión Inteligente en Campo, Control Total desde el Centro. La herramienta definitiva para el éxito logístico.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <ShieldCheck size={20} className="text-indigo-200 mb-2" />
                <p className="text-xs font-bold text-white uppercase tracking-widest italic">Acceso Seguro</p>
                <p className="text-[10px] text-indigo-200 uppercase mt-1">Encriptación 256-bit</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <Globe size={20} className="text-indigo-200 mb-2" />
                <p className="text-xs font-bold text-white uppercase tracking-widest italic">Multi-Zona</p>
                <p className="text-[10px] text-indigo-200 uppercase mt-1">Sincronización Real</p>
              </div>
            </div>
          </div>

          {/* Abstract Shapes */}
          <div className="absolute -right-20 top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 -right-10 opacity-10 pointer-events-none"
          >
            <Truck size={300} className="text-white" />
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="lg:hidden flex justify-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40">
              <Package size={32} />
            </div>
          </div>

          <div className="space-y-2 mb-10">
            <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Bienvenido</h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Portal de Acceso Corporativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Usuario o Correo"
                  required
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-slate-800/80 transition-all font-medium"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Contraseña"
                  required
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-slate-800/80 transition-all font-medium"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest px-1">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/5 bg-slate-800/80 accent-indigo-500 text-indigo-500" />
                <span>Recordarme</span>
              </label>
              <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidó su clave?</button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Package size={24} />
                </motion.div>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>

            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 mt-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck size={12} />
                Credenciales de Acceso (Demo)
              </p>
              <div className="grid grid-cols-1 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <p>Admin: <span className="text-slate-300 select-all">admin</span> / <span className="text-slate-300">admin</span></p>
                <p>Vendedor: <span className="text-slate-300 select-all">{formData.email || 'anderson@nexdist.com'}</span> / <span className="text-slate-300">ruta2026</span></p>
              </div>
            </div>
          </form>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Soporte Técnico</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Database size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">v2.4.0 Stable</span>
              </div>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">© 2026 NEXDIST LOGISTICS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
