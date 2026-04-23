import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Lock, User, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useProvider } from '../../context/ProviderContext';

export default function ProviderLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useProvider();
  const [user, setUser] = useState('superadmin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = signIn(user.trim(), password);
    setTimeout(() => {
      setLoading(false);
      if (ok) {
        toast.success('Acceso concedido · Panel Proveedor');
        navigate('/provider', { replace: true });
      } else {
        toast.error('Credenciales no válidas');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080614]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-br from-fuchsia-500/60 via-violet-500/40 to-indigo-500/60">
          <div className="rounded-[26px] bg-[#0b0920]/90 backdrop-blur-2xl p-7 space-y-6 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                <Hexagon size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic text-fuchsia-300">
                  NexDist · Console
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Panel del proveedor SaaS
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-white leading-tight">
                Bienvenido, operador
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 italic mt-1">
                Administra tus empresas clientes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400/70" size={16} />
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Usuario"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400/70" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white font-black uppercase tracking-[0.25em] italic text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Validando…' : 'Ingresar al Console'}</span>
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-3 space-y-1">
              <div className="flex items-center gap-2 text-fuchsia-300">
                <Sparkles size={12} />
                <p className="text-[9px] font-black uppercase tracking-widest italic">Credencial demo</p>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">superadmin / nexus2026</p>
            </div>

            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-600">
              <div className="flex items-center gap-1">
                <Shield size={10} />
                Zona segura
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-slate-500 hover:text-fuchsia-300 transition-colors"
              >
                ← Volver al acceso de empresa
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 italic mt-4">
          © 2026 NexDist · Plataforma de distribución
        </p>
      </div>
    </div>
  );
}
