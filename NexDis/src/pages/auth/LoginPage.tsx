import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const user = formData.email.trim().toLowerCase();
    const pass = formData.password;

    setTimeout(() => {
      setIsLoading(false);

      // Admin
      if ((user === 'admin' || user === 'admin@nexdist.com') && pass === 'admin') {
        toast.success('Bienvenido Administrador');
        navigate('/admin');
        return;
      }

      // Vendedor demo
      if (
        (user === 'anderson@nexdist.com' || user === 'vendedor' || user === 'seller') &&
        pass === 'ruta2026'
      ) {
        toast.success('Bienvenido a NexDist');
        navigate('/seller');
        return;
      }

      // Cualquier otra combinación: por defecto vendedor (demo)
      toast.success('Bienvenido a NexDist');
      navigate('/seller');
    }, 900);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      {/* Background luxe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-[140px] bg-indigo-600/25" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-[140px] bg-cyan-500/15" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        {/* Gradient border */}
        <div
          className="rounded-[28px] p-[1px] shadow-2xl"
          style={{
            background:
              'linear-gradient(145deg, rgba(99,102,241,0.55) 0%, rgba(34,211,238,0.25) 45%, rgba(255,255,255,0.06) 100%)',
            boxShadow:
              '0 40px 90px -30px rgba(99,102,241,0.45), 0 10px 30px -10px rgba(0,0,0,0.55)',
          }}
        >
          <div
            className="rounded-[27px] backdrop-blur-2xl px-6 py-6 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--app-bg) 78%, transparent) 0%, color-mix(in srgb, var(--app-bg) 94%, transparent) 100%)',
            }}
          >
            {/* Shine strip */}
            <div
              className="absolute inset-x-0 top-0 h-px opacity-70"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
              }}
            />

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(99 102 241) 0%, rgb(34 211 238) 100%)',
                  boxShadow: '0 10px 30px -10px rgba(99,102,241,0.6)',
                }}
              >
                <Package size={22} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic inline-flex items-center gap-1.5">
                  <Sparkles size={10} className="text-indigo-400" />
                  NexDist · Premium
                </p>
                <h3 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mt-0.5">
                  Bienvenido
                </h3>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Usuario o correo"
                  required
                  autoComplete="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  size={16}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:bg-white/10 transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-0.5">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 accent-indigo-500"
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  ¿Olvidó su clave?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full h-11 rounded-xl font-black uppercase italic tracking-[0.2em] text-xs text-white inline-flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(99 102 241) 0%, rgb(79 70 229) 60%, rgb(34 211 238) 120%)',
                  boxShadow:
                    '0 15px 35px -15px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Package size={18} />
                  </motion.div>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <ArrowRight size={16} className="stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Demo credentials */}
              <div
                className="rounded-xl border p-2.5 mt-1 flex items-center gap-2"
                style={{
                  borderColor: 'color-mix(in srgb, rgb(99 102 241) 25%, transparent)',
                  background:
                    'color-mix(in srgb, rgb(99 102 241) 8%, transparent)',
                }}
              >
                <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider leading-tight">
                  <span className="text-slate-400">Demo:</span>{' '}
                  <span className="text-white select-all">admin / admin</span>
                  <span className="text-slate-600 mx-1">·</span>
                  <span className="text-white select-all">ruta2026</span>
                </div>
              </div>
            </form>

            {/* Provider Console access */}
            <button
              type="button"
              onClick={() => navigate('/provider/login')}
              className="mt-3 w-full rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-300 px-3 py-2 text-[10px] font-black uppercase tracking-widest italic hover:bg-fuchsia-500/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500" />
              Soy proveedor · Console →
            </button>

            {/* Footer minimal */}
            <div className="mt-4 flex items-center justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              <span>v2.4.0</span>
              <span>© 2026 NEXDIST</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
