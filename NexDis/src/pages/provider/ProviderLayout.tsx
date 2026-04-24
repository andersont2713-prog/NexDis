import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
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
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProvider } from '../../context/ProviderContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useProvider();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { mode, toggle } = useTheme();

  const handleSignOut = () => {
    signOut();
    navigate('/provider/login', { replace: true });
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240, x: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar flex flex-col relative z-20 overflow-hidden border-r border-white/5 shadow-2xl"
      >
        <div className="p-6 shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 shrink-0">
            <Hexagon className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto',
              visibility: isCollapsed ? 'hidden' : 'visible',
            }}
            className="flex flex-col overflow-hidden"
          >
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
              Console
            </h1>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-fuchsia-300 mt-1 whitespace-nowrap">
              NexDist · Provider
            </span>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar py-2">
          <ProviderNavItem to="/provider" end icon={<LayoutDashboard size={18} />} label="Dashboard" isCollapsed={isCollapsed} />
          <ProviderNavItem to="/provider/tenants" icon={<Building2 size={18} />} label="Empresas" isCollapsed={isCollapsed} />
          <ProviderNavItem to="/provider/plans" icon={<Package size={18} />} label="Planes" isCollapsed={isCollapsed} />
          <ProviderNavItem to="/provider/subscriptions" icon={<CreditCard size={18} />} label="Suscripciones" isCollapsed={isCollapsed} />
          <ProviderNavItem to="/provider/billing" icon={<Receipt size={18} />} label="Facturación" isCollapsed={isCollapsed} />
          <ProviderNavItem to="/provider/settings" icon={<Settings size={18} />} label="Ajustes" isCollapsed={isCollapsed} />
        </div>

        <div className="p-3 mt-auto border-t border-white/5 shrink-0 space-y-2">
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              height: isCollapsed ? 0 : 'auto',
            }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">
                Conectado como
              </p>
              <p className="text-xs font-black italic text-white truncate">
                {session?.name ?? 'Super Admin'}
              </p>
            </div>
          </motion.div>

          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center p-4 rounded-xl hover:bg-rose-500/10 transition-all text-slate-500 hover:text-rose-400 font-black uppercase text-[10px] tracking-widest italic group w-full',
              isCollapsed ? 'justify-center' : 'gap-3'
            )}
          >
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            <motion.span
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
              }}
              className="whitespace-nowrap overflow-hidden"
            >
              Cerrar sesión
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="decorative-blur top-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10"></div>
        <div className="decorative-blur bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10"></div>

        <header
          className="h-20 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-10 border-b"
          style={{
            background: 'color-mix(in srgb, var(--app-bg) 70%, transparent)',
            borderColor: 'var(--app-border)',
          }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-80">
              <Search size={18} className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Buscar empresas, planes, facturas..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[10px] font-black uppercase tracking-widest italic text-slate-400 hover:text-fuchsia-300 transition-all hidden md:inline-flex items-center gap-1"
            >
              <ChevronLeft size={12} />
              Volver al sistema
            </Link>
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl border transition-all active:scale-90"
              style={{
                background: 'var(--app-card)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-fg)',
              }}
              title={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
            >
              {mode === 'dark' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button className="relative p-2 text-slate-400 hover:bg-white/5 rounded-full">
              <Bell size={20} />
              <span
                className="absolute top-2 right-2 w-2 h-2 bg-fuchsia-500 rounded-full border-2"
                style={{ borderColor: 'var(--app-bg)' }}
              ></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-black italic uppercase">
                  {(session?.name ?? 'SA').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative z-10 flex flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}

function ProviderNavItem({
  to,
  icon,
  label,
  end,
  isCollapsed,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
  isCollapsed: boolean;
}) {
  const { pathname } = useLocation();
  const active = end ? pathname === to : pathname.startsWith(to);

  return (
    <RouterNavLink
      to={to}
      end={end}
      className={cn(
        'flex items-center px-4 py-3 rounded-xl transition-all duration-300 border border-transparent font-black uppercase text-[10px] tracking-widest italic overflow-hidden group relative',
        active
          ? 'sidebar-item-active text-fuchsia-300 shadow-lg shadow-fuchsia-600/10 bg-fuchsia-600/5 border-fuchsia-500/20'
          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 hover:translate-x-1',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}
    >
      <motion.div
        animate={active ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
        className={cn(
          'shrink-0 transition-colors z-10',
          active ? 'text-fuchsia-300' : 'group-hover:text-white'
        )}
      >
        {icon}
      </motion.div>

      <motion.span
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
          x: isCollapsed ? -10 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'whitespace-nowrap transition-colors z-10 block',
          active ? 'font-black' : 'font-bold'
        )}
      >
        {label}
      </motion.span>

      {active && (
        <motion.div
          layoutId="provider-active-indicator"
          className="absolute right-3 w-1 h-1 bg-fuchsia-400 rounded-full z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
        />
      )}
    </RouterNavLink>
  );
}
