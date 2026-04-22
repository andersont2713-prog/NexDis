import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  Menu, 
  X,
  Bell, 
  Search,
  MapPin,
  Camera,
  History,
  TrendingUp,
  Map as MapIcon,
  Plus,
  UserPlus,
  LogOut,
  Zap,
  ChevronRight,
  ChevronLeft,
  Filter,
  Phone,
  MessageCircle,
  Navigation,
  GripVertical,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useRegional } from './context/RegionalContext.tsx';
import { cn } from './lib/utils';
import type { Product, Customer, Order, User } from './types';

// Page Imports
import InventoryPage from './pages/admin/InventoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import OrdersManagementPage from './pages/admin/OrdersManagementPage';
import ZonesManagementPage from './pages/admin/ZonesManagementPage';
import PosPage from './pages/admin/PosPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import ReportsPage from './pages/admin/ReportsPage';
import CashControlPage from './pages/admin/CashControlPage';
import SettingsPage from './pages/admin/SettingsPage';
import CatalogPage from './pages/seller/CatalogPage';
import NewOrderPage from './pages/seller/NewOrderPage';
import NewCustomerPage from './pages/seller/NewCustomerPage';
import ZoneSelectionPage from './pages/seller/ZoneSelectionPage';
import FieldExpensesPage from './pages/seller/FieldExpensesPage';
import LoginPage from './pages/auth/LoginPage';
import type { Zone as ZoneType } from './types';

const MOCK_ZONES: ZoneType[] = [
  { id: 'Z-001', name: 'ZONA NORTE - METROPOLITANO', customers: ['1', '2'] },
  { id: 'Z-002', name: 'ZONA SUR - LURÍN INDUSTRIAL', customers: ['3', '4'] },
  { id: 'Z-003', name: 'ZONA CENTRO - GAMARRA', customers: ['5', '6'] },
];

const MOCK_STATS = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mie', sales: 2000 },
  { name: 'Jue', sales: 2780 },
  { name: 'Vie', sales: 1890 },
  { name: 'Sab', sales: 2390 },
  { name: 'Dom', sales: 3490 },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden text-slate-200">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 240,
          x: 0
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar flex flex-col relative z-20 overflow-hidden border-r border-white/5 shadow-2xl"
      >
        <div className="p-6 shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <Package className="text-white" size={24} />
          </div>
          <motion.div
            initial={false}
            animate={{ 
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : "auto",
              visibility: isCollapsed ? "hidden" : "visible"
            }}
            className="flex flex-col overflow-hidden"
          >
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">NexDist</h1>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-1 whitespace-nowrap">System v2.0</span>
          </motion.div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar py-2">
          <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" isCollapsed={isCollapsed} />
          <NavLink to="/admin/inventory" icon={<Package size={18} />} label="Inventario" isCollapsed={isCollapsed} />
          <NavLink to="/admin/customers" icon={<Users size={18} />} label="Clientes" isCollapsed={isCollapsed} />
          <NavLink to="/admin/pos" icon={<Zap size={18} />} label="Punto de Venta" isCollapsed={isCollapsed} />
          <NavLink to="/admin/users" icon={<UserPlus size={18} />} label="Usuarios" isCollapsed={isCollapsed} />
          <NavLink to="/admin/zones" icon={<MapIcon size={18} />} label="Zonas y Rutas" isCollapsed={isCollapsed} />
          <NavLink to="/admin/orders" icon={<ShoppingCart size={18} />} label="Pedidos" isCollapsed={isCollapsed} />
          <NavLink to="/admin/returns" icon={<RotateCcw size={18} />} label="Devoluciones" isCollapsed={isCollapsed} />
          <NavLink to="/admin/reports" icon={<BarChart3 size={18} />} label="Reportes" isCollapsed={isCollapsed} />
          <NavLink to="/admin/cash" icon={<Wallet size={18} />} label="Caja Chica" isCollapsed={isCollapsed} />
          <NavLink to="/admin/settings" icon={<Settings size={18} />} label="Configuración" isCollapsed={isCollapsed} />
        </div>

        <div className="p-3 mt-auto border-t border-white/5 shrink-0">
          <button 
            onClick={() => navigate('/login')}
            className={cn(
              "flex items-center p-4 rounded-xl hover:bg-rose-500/10 transition-all text-slate-500 hover:text-rose-400 font-black uppercase text-[10px] tracking-widest italic group w-full",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            <motion.span 
              animate={{ 
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto"
              }}
              className="whitespace-nowrap overflow-hidden"
            >
              Finalizar Turno
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="decorative-blur top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10"></div>
        <div className="decorative-blur bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10"></div>

        <header className="h-20 bg-slate-900/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-80">
              <Search size={18} className="text-slate-500 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-white/5 rounded-full">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0F172A]"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 bg-indigo-500 rounded-full border-2 border-white/10"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, isCollapsed }: { to: string, icon: React.ReactNode, label: string, isCollapsed: boolean }) {
  const currentPath = window.location.pathname;
  const active = currentPath === to;
  return (
    <Link to={to} className={cn(
      "flex items-center px-4 py-3 rounded-xl transition-all duration-300 border border-transparent font-black uppercase text-[10px] tracking-widest italic overflow-hidden group relative",
      active ? "sidebar-item-active text-indigo-400 shadow-lg shadow-indigo-600/5 bg-indigo-600/5" : "text-slate-500 hover:text-slate-200 hover:bg-white/5 hover:translate-x-1",
      isCollapsed ? "justify-center" : "gap-3"
    )}>
      <motion.div 
        animate={active ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
        className={cn("shrink-0 transition-colors z-10", active ? "text-indigo-400" : "group-hover:text-white")}
      >
        {icon}
      </motion.div>
      
      <motion.span 
        initial={false}
        animate={{ 
          width: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
          x: isCollapsed ? -10 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "whitespace-nowrap transition-colors z-10 block",
          active ? "font-black" : "font-bold"
        )}
      >
        {label}
      </motion.span>

      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute right-3 w-1 h-1 bg-indigo-500 rounded-full z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
        />
      )}
    </Link>
  );
}

function Dashboard() {
  const { formatPrice } = useRegional();
  return (
    <div className="flex-1 flex flex-col p-6 pt-4 space-y-4">
      <div className="space-y-4 pr-1">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          <KPIItem title="Ventas Totales" value={formatPrice(124500)} trend="+12.5%" icon={<TrendingUp className="text-indigo-400" />} />
          <KPIItem title="Pedidos Hoy" value="42" trend="+3" icon={<ShoppingCart className="text-emerald-400" />} />
          <KPIItem title="Bajo Stock" value="12" trend="Crítico" icon={<Package className="text-orange-400" />} />
          <KPIItem title="Nuevos Clientes" value="8" trend="+2" icon={<Users className="text-indigo-400" />} />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 frosted-card h-[520px]">
            <h3 className="text-lg font-bold mb-6 text-white flex items-center justify-between">
              Ventas Semanales
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Global</span>
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={MOCK_STATS}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="frosted-card h-[520px] flex flex-col">
            <h3 className="text-lg font-bold mb-6 text-white uppercase italic tracking-tight">Alertas de Stock</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <StockAlertItem name="Aceite Girasol" stock={5} unit="und" status="Critico" />
              <StockAlertItem name="Arroz Premium" stock={140} unit="kg" status="Alerta" />
              <StockAlertItem name="Leche Entera" stock={2} unit="und" status="Critico" />
              <StockAlertItem name="Harina Trigo" stock={85} unit="kg" status="Alerta" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIItem({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="frosted-card !p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg">{icon}</div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase italic tracking-widest",
          trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10 italic">{title}</p>
      <p className="text-2xl font-black mt-0.5 text-white font-mono relative z-10 tracking-tighter">{value}</p>
    </div>
  );
}

function StockAlertItem({ name, stock, unit, status }: { name: string, stock: number, unit: string, status: 'Critico' | 'Alerta' }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
      <div>
        <p className="text-sm font-bold text-slate-200">{name}</p>
        <p className="text-[10px] text-slate-500 font-mono italic">{stock} {unit} restantes</p>
      </div>
      <span className={cn(
        "text-[10px] uppercase font-black px-2 py-1 rounded italic tracking-tighter",
        status === 'Critico' ? "bg-rose-500/20 text-rose-400" : "bg-orange-500/20 text-orange-400"
      )}>
        {status}
      </span>
    </div>
  );
}

// Mobile View for Sellers
function SellerLayout({ children, currentZone }: { children: React.ReactNode, currentZone: ZoneType | null }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = window.location.pathname;
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col max-w-md mx-auto border-x border-white/5 text-slate-200 relative overflow-hidden">
      <div className="decorative-blur top-[-20%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/10"></div>
      
      <header className="bg-slate-900/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between shrink-0 border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-white/5 active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg shadow-indigo-600/20">ND</div>
            <div className="flex flex-col">
              <span className="font-black text-white italic tracking-tighter text-sm leading-none">NexDist <span className="text-indigo-400 uppercase text-[8px] not-italic tracking-widest font-bold">FIELD</span></span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate max-w-[100px] italic">
                {currentZone?.name || 'SIN ZONA'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(!currentZone && location !== '/seller/zones') && (
            <Link to="/seller/zones" className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase italic rounded-lg animate-pulse">
              Fijar Zona
            </Link>
          )}
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-900"></span>
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] max-w-md mx-auto"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 rotate-3">
                    <Package className="text-white" size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
                      NexDist
                    </h1>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-1">System v2.0</span>
                  </div>
                </div>
                <button onClick={toggleSidebar} className="p-2 rounded-xl bg-white/5 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
                <SidebarNavLink to="/seller" icon={<MapPin size={18} />} label="Ruta de Hoy" active={location === '/seller'} onClick={toggleSidebar} />
                <SidebarNavLink to="/seller/zones" icon={<Navigation size={18} />} label="Cambiar Zona" active={location === '/seller/zones'} onClick={toggleSidebar} />
                <SidebarNavLink to="/seller/customers" icon={<Users size={18} />} label="Directorio CRM" active={location === '/seller/customers'} onClick={toggleSidebar} />
                <SidebarNavLink to="/seller/history" icon={<History size={18} />} label="Mis Pedidos" active={location === '/seller/history'} onClick={toggleSidebar} />
                <SidebarNavLink to="/seller/expenses" icon={<Receipt size={18} />} label="Registrar Gasto" active={location === '/seller/expenses'} onClick={toggleSidebar} />
                <SidebarNavLink to="/seller/catalog" icon={<Package size={18} />} label="Catálogo de Productos" active={location === '/seller/catalog'} onClick={toggleSidebar} />
                
                <div className="pt-4 mt-4 border-t border-white/5 space-y-1 pr-1">
                   <SidebarNavLink 
                    to="/seller/order/new" 
                    icon={<Plus size={18} />} 
                    label="Nuevo Pedido" 
                    active={location === '/seller/order/new'} 
                    onClick={toggleSidebar} 
                    className="!text-indigo-400 border-indigo-400/20 bg-indigo-400/5" 
                   />
                </div>
              </div>

              <div className="mt-auto px-4 pb-10 pt-6 border-t border-white/5 bg-slate-900/50">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all font-black uppercase text-[10px] tracking-widest italic group"
                >
                  <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                  <span>Finalizar Turno</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {children}
      </div>
    </div>
  );
}

function SidebarNavLink({ to, icon, label, active = false, onClick, className }: { to: string, icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, className?: string }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all border border-transparent font-black italic uppercase text-[10px] tracking-widest relative overflow-hidden group",
        active ? "sidebar-item-active text-indigo-400 shadow-lg shadow-indigo-600/5 bg-indigo-600/5" : "text-slate-500 hover:text-slate-200 hover:bg-white/5",
        className
      )}
    >
      <div className={cn("shrink-0 transition-colors", active ? "text-indigo-400" : "group-hover:text-white")}>
        {icon}
      </div>
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <motion.div 
          layoutId="mobile-active-indicator"
          className="absolute right-2 w-1 h-1 bg-indigo-500 rounded-full"
        />
      )}
    </Link>
  );
}

function SellerHome() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([
    { id: '1', name: "Bodega El Sol", address: "Av. Las Camelias 450", status: "current" as const, time: "08:30 AM" },
    { id: '2', name: "Minimarket Lily", address: "Calle Los Pinos 102", status: "pending" as const, time: "10:15 AM" },
    { id: '3', name: "Mercado Central #24", address: "Jr. Huallaga 455", status: "pending" as const, time: "11:30 AM" },
    { id: '4', name: "Tienda Don Jhon", address: "Prol. Gamarra 882", status: "pending" as const, time: "02:00 PM" },
  ]);

  const handleSelect = (id: string) => {
    setVisits(prev => prev.map(v => {
      if (v.id === id) return { ...v, status: 'current' as const };
      if (v.status === 'current') return { ...v, status: 'pending' as const };
      return v;
    }));
  };

  const handleCheckIn = (id: string) => {
    setVisits(prev => {
      const newVisits = prev.filter(v => v.id !== id);
      // Change next pending to current if no current exists
      if (!newVisits.some(v => v.status === 'current') && newVisits.length > 0) {
        newVisits[0] = { ...newVisits[0], status: 'current' };
      }
      return newVisits;
    });
    toast.success('📍 Check-in registrado. ¡Éxito en la gestión!');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F172A] relative overflow-hidden">
      <div className="shrink-0 z-40 bg-black/80 backdrop-blur-xl px-6 pt-6 pb-4 border-b border-white/5 shadow-2xl shadow-black relative">
        <div className="frosted-card bg-indigo-600/10 border-indigo-500/20 shadow-indigo-500/5 relative overflow-hidden p-4 rounded-2xl flex items-center justify-between">
          <div className="relative z-10">
            <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-0.5 italic">Rendimiento</p>
            <div className="flex items-end gap-1.5">
              <h2 className="text-2xl font-black text-white font-mono tracking-tighter">$4,250</h2>
              <span className="text-emerald-400 text-[10px] font-bold mb-1 italic">+15%</span>
            </div>
          </div>
          <div className="flex gap-2 relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 px-3 backdrop-blur-md text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Visitas</p>
              <p className="text-sm font-black text-white font-mono leading-none mt-1">12/15</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 px-3 backdrop-blur-md text-center">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Tickets</p>
              <p className="text-sm font-black text-white font-mono leading-none mt-1">08</p>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2 tracking-tight">Ruta de Hoy</h3>
          <button className="text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-400/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-indigo-400/5">
            <MapIcon size={14} />
            Ruta Mapa
          </button>
        </div>
        
        <Reorder.Group axis="y" values={visits} onReorder={setVisits} className="space-y-4">
          <AnimatePresence>
            {visits.map((visit) => (
              <VisitCardWrapper key={visit.id} visit={visit} onCheckIn={() => handleCheckIn(visit.id)} onSelect={() => handleSelect(visit.id)} />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}

function VisitCardWrapper({ visit, onCheckIn, onSelect }: { visit: any, key?: string | number, onCheckIn: () => void, onSelect: () => void }) {
  const dragControls = useDragControls();
  const [isDraggable, setIsDraggable] = useState(false);
  const pressTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const startInteraction = (e: React.PointerEvent) => {
    pressTimeout.current = setTimeout(() => {
      setIsDraggable(true);
      dragControls.start(e);
      navigator.vibrate?.(50); // Optional haptic feedback for long press
    }, 3000); // 3 seconds long press
  };

  const endInteraction = () => {
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
    setIsDraggable(false);
  };

  const handlePointerMove = () => {
    // If we move before the long press triggers, cancel it (allows normal scrolling)
    if (!isDraggable && pressTimeout.current) {
      clearTimeout(pressTimeout.current);
    }
  };

  return (
    <Reorder.Item 
      value={visit} 
      dragListener={false} 
      dragControls={dragControls}
      onPointerDown={startInteraction}
      onPointerUp={endInteraction}
      onPointerLeave={endInteraction}
      onPointerCancel={endInteraction}
      onPointerMove={handlePointerMove}
      style={{ touchAction: isDraggable ? 'none' : 'pan-y' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
    >
      <VisitCard 
        name={visit.name} 
        address={visit.address} 
        status={visit.status} 
        time={visit.time}
        orderValue={visit.orderValue}
        isDraggable={isDraggable}
        onCheckIn={onCheckIn}
        onSelect={onSelect}
      />
    </Reorder.Item>
  );
}

function VisitCard({ name, address, status, time, orderValue, isDraggable, onCheckIn, onSelect }: { name: string, address: string, status: 'visited' | 'current' | 'pending', time: string, orderValue?: number, isDraggable?: boolean, onCheckIn: () => void, onSelect: () => void }) {
  const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); window.location.href = 'tel:+51900000000'; };
  const handleWhatsApp = (e: React.MouseEvent) => { e.stopPropagation(); window.location.href = 'https://wa.me/51900000000'; };
  const handleNavigation = (e: React.MouseEvent) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank'); };

  return (
    <div 
      onClick={status === 'pending' ? onSelect : undefined}
      className={cn(
      "p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md select-none",
      status === 'current' ? "border-emerald-500/50 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10" : "border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer",
      isDraggable ? "cursor-grabbing ring-2 ring-indigo-500 scale-[1.02]" : ""
    )}>
      <div className={cn("absolute top-2 right-2 transition-opacity duration-300", isDraggable ? "text-indigo-400 opacity-100" : "text-slate-700 opacity-50")}>
         <GripVertical size={20} />
      </div>
      
      <div className="flex items-start justify-between relative z-10 mr-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-black text-white italic tracking-tight">{name}</h4>
            {status === 'visited' && <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"><Plus size={10} className="text-black rotate-45 stroke-[3]" /></div>}
            {status === 'current' && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 tracking-tighter">
            <MapPin size={12} className="text-indigo-400" />
            {address}
          </p>
        </div>
        <span className="text-[10px] font-black text-slate-500 font-mono italic">{time}</span>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2 relative z-10">
        <button 
          onClick={handleCall}
          className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-indigo-400 italic hover:bg-white/10 transition-all"
        >
          <Phone size={14} />
          Llamar
        </button>
        <button 
          onClick={handleWhatsApp}
          className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-emerald-400 italic hover:bg-white/10 transition-all"
        >
          <MessageCircle size={14} />
          WhatsApp
        </button>
        <button 
          onClick={handleNavigation}
          className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-orange-400 italic hover:bg-white/10 transition-all"
        >
          <Navigation size={14} />
          GPS
        </button>
      </div>
      
      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden ring-1 ring-white/10">
               <img src={`https://picsum.photos/seed/shop${i}/100/100`} alt="shop" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
        
        {status === 'visited' ? (
          <p className="text-xl font-black text-emerald-400 font-mono tracking-tighter">${orderValue?.toLocaleString() || '0'}</p>
        ) : status === 'current' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
            className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-xs font-black uppercase italic shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            Check-In
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-50">
             <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
             PRÓXIMO
          </div>
        )}
      </div>
    </div>
  );
}

function RoleSelector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      <div className="decorative-blur top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/20"></div>
      <div className="decorative-blur bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-600/10"></div>

      <div className="max-w-4xl w-full grid grid-cols-2 gap-12 relative z-10">
        <div className="space-y-6 self-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-2xl shadow-indigo-600/40 transform rotate-3 transition-transform hover:rotate-0">
             <Package size={32} />
          </div>
          <h1 className="text-6xl italic font-black text-white leading-[0.9] tracking-tighter">NexDist<br/><span className="text-indigo-500 uppercase not-italic text-3xl tracking-[0.2em] font-black">LOGISTICS</span></h1>
          <p className="text-lg text-slate-400 max-w-sm font-medium border-l-2 border-indigo-500/30 pl-4 py-2">Gestión integral de distribución. Acceda a su portal de operaciones con tecnología de vanguardia.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Link to="/admin" className="frosted-card group flex items-center justify-between p-8 border-white/5 hover:border-indigo-500/50">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all duration-500">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white tracking-tight">Portal ADMIN</h3>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Backoffice Intelligence</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
          </Link>

          <Link to="/seller" className="frosted-card group flex items-center justify-between p-8 border-white/5 hover:border-emerald-500/50">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600/20 transition-all duration-500">
                <MapPin size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white tracking-tight">App FIELD</h3>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">Sales & Field Ops</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentZone, setCurrentZone] = useState<ZoneType | null>(null);

  return (
    <Router>
      <Toaster position="top-right" closeButton richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/roles" element={<RoleSelector />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/users" element={<UsersManagementPage />} />
              <Route path="/zones" element={<ZonesManagementPage />} />
              <Route path="/orders" element={<OrdersManagementPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/cash" element={<CashControlPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AdminLayout>
        } />

        {/* Seller Routes */}
        <Route path="/seller/*" element={
          <SellerLayout currentZone={currentZone}>
            <Routes>
              <Route path="/" element={<SellerHome />} />
              <Route path="/zones" element={
                <ZoneSelectionPage 
                  zones={MOCK_ZONES} 
                  selectedZone={currentZone} 
                  onSelect={setCurrentZone} 
                />
              } />
              <Route path="/customers" element={
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Mis Clientes</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Directorio de Cartera.</p>
                    </div>
                    <Link to="/seller/customers/new" className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                      <Plus size={24} />
                    </Link>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="Buscar cliente..." className="input-glass pl-10" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="frosted-card flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-800 border border-white/5 rounded-xl flex items-center justify-center text-indigo-400 font-black italic">CL</div>
                          <div>
                            <h4 className="font-bold text-white text-sm uppercase italic">Comercial Gloria {i}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Surquillo • VIP</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="/customers/new" element={<NewCustomerPage />} />
              <Route path="/order/new" element={<NewOrderPage />} />
              <Route path="/expenses" element={<FieldExpensesPage />} />
              <Route path="/history" element={
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Historial</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-emerald-500/30 pl-3">Pedidos enviados recientemente.</p>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="frosted-card bg-emerald-500/5 border-emerald-500/10 group">
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Sincronizado</span>
                              <span className="text-[10px] font-mono text-slate-500">2026-04-21 09:1{i}</span>
                           </div>
                           <h4 className="font-bold text-white uppercase italic tracking-tight">PED-#992{i}</h4>
                           <div className="flex items-center justify-between mt-4">
                              <p className="text-xl font-black text-white font-mono tracking-tighter">$1,240.00</p>
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase italic">
                                 <Package size={12} className="text-indigo-400" />
                                 12 Items
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              } />
              <Route path="/catalog" element={<CatalogPage />} />
            </Routes>
          </SellerLayout>
        } />
      </Routes>
    </Router>
  );
}
