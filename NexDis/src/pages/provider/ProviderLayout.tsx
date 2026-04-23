import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Hexagon,
  LayoutDashboard,
  Building2,
  CreditCard,
  Receipt,
  Package,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react';
import { useProvider } from '../../context/ProviderContext';
import { cn } from '../../lib/utils';

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useProvider();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/provider/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#070513] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <aside className="w-64 shrink-0 relative z-10 border-r border-white/5 bg-[#0a0820]/80 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Hexagon size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] italic text-fuchsia-300">
                Console
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Panel del Proveedor
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <ProviderNavItem to="/provider" end icon={<LayoutDashboard size={16} />} label="Console" />
          <ProviderNavItem to="/provider/tenants" icon={<Building2 size={16} />} label="Empresas" />
          <ProviderNavItem to="/provider/plans" icon={<Package size={16} />} label="Planes" />
          <ProviderNavItem to="/provider/subscriptions" icon={<CreditCard size={16} />} label="Suscripciones" />
          <ProviderNavItem to="/provider/billing" icon={<Receipt size={16} />} label="Facturación" />
          <ProviderNavItem to="/provider/settings" icon={<Settings size={16} />} label="Ajustes" />
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">Conectado como</p>
            <p className="text-xs font-black italic text-white truncate">{session?.name ?? 'Super Admin'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-xl border border-white/5 bg-white/5 text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic transition-all"
          >
            <LogOut size={12} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <header className="shrink-0 h-14 px-6 border-b border-white/5 bg-[#0a0820]/60 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] italic text-fuchsia-300">
              NexDist · Console
            </p>
            <p className="text-xs font-bold text-slate-300 italic">
              Plataforma de comercialización del producto
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center">
              <Bell size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}

function ProviderNavItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest italic transition-all',
          isActive
            ? 'bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-white border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </RouterNavLink>
  );
}
