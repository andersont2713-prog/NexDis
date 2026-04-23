import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, type ReactNode } from 'react';
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
  Receipt,
  Truck,
  ShoppingBag,
  Warehouse as WarehouseIcon
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useRegional } from './context/RegionalContext.tsx';
import { useTheme } from './context/ThemeContext.tsx';
import { useRealtime } from './lib/realtime';
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
import SuppliersPage from './pages/admin/SuppliersPage';
import PurchasesPage from './pages/admin/PurchasesPage';
import AccountsReceivablePage from './pages/admin/AccountsReceivablePage';
import WarehousesPage from './pages/admin/WarehousesPage';
import ProviderLoginPage from './pages/provider/ProviderLoginPage';
import ProviderLayout from './pages/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import TenantsPage from './pages/provider/TenantsPage';
import PlansPage from './pages/provider/PlansPage';
import SubscriptionsPage from './pages/provider/SubscriptionsPage';
import PlatformBillingPage from './pages/provider/PlatformBillingPage';
import ProviderSettingsPage from './pages/provider/ProviderSettingsPage';
import { ProviderContextProvider, useProvider } from './context/ProviderContext';
import CatalogPage from './pages/seller/CatalogPage';
import NewOrderPage from './pages/seller/NewOrderPage';
import NewCustomerPage from './pages/seller/NewCustomerPage';
import ZoneSelectionPage from './pages/seller/ZoneSelectionPage';
import FieldExpensesPage from './pages/seller/FieldExpensesPage';
import OrdersHistoryPage from './pages/seller/OrdersHistoryPage';
import MyCustomersPage from './pages/seller/MyCustomersPage';
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
  const { mode, toggle } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}>
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
          <NavLink to="/admin/suppliers" icon={<Truck size={18} />} label="Proveedores" isCollapsed={isCollapsed} />
          <NavLink to="/admin/warehouses" icon={<WarehouseIcon size={18} />} label="Bodegas" isCollapsed={isCollapsed} />
          <NavLink to="/admin/pos" icon={<Zap size={18} />} label="Punto de Venta" isCollapsed={isCollapsed} />
          <NavLink to="/admin/users" icon={<UserPlus size={18} />} label="Usuarios" isCollapsed={isCollapsed} />
          <NavLink to="/admin/zones" icon={<MapIcon size={18} />} label="Zonas y Rutas" isCollapsed={isCollapsed} />
          <NavLink to="/admin/orders" icon={<ShoppingCart size={18} />} label="Pedidos" isCollapsed={isCollapsed} />
          <NavLink to="/admin/purchases" icon={<ShoppingBag size={18} />} label="Compras" isCollapsed={isCollapsed} />
          <NavLink to="/admin/receivables" icon={<Receipt size={18} />} label="Cuentas por Cobrar" isCollapsed={isCollapsed} />
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

        <header className="h-20 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-10 border-b" style={{ background: 'color-mix(in srgb, var(--app-bg) 70%, transparent)', borderColor: 'var(--app-border)' }}>
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
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl border transition-all active:scale-90"
              style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)', color: 'var(--app-fg)' }}
              title={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
            >
              {mode === 'dark' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button className="relative p-2 text-slate-400 hover:bg-white/5 rounded-full">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2" style={{ borderColor: 'var(--app-bg)' }}></span>
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

  const RECENT_ORDERS = [
    { id: 'ORD-2041', customer: 'Bodega El Sol', total: 1240, status: 'delivered', seller: 'Anderson' },
    { id: 'ORD-2040', customer: 'Minimarket Lily', total: 820, status: 'shipped', seller: 'Anderson' },
    { id: 'ORD-2039', customer: 'Mercado Central #24', total: 2150, status: 'processed', seller: 'Karla' },
    { id: 'ORD-2038', customer: 'Tienda Don Jhon', total: 540, status: 'pending', seller: 'Luis' },
    { id: 'ORD-2037', customer: 'Distribuidora San Martín', total: 3280, status: 'delivered', seller: 'Karla' },
    { id: 'ORD-2036', customer: 'Abarrotes La Esquina', total: 475, status: 'shipped', seller: 'Luis' },
    { id: 'ORD-2035', customer: 'Kiosko Central', total: 1180, status: 'processed', seller: 'Anderson' },
    { id: 'ORD-2034', customer: 'Market Express', total: 2640, status: 'delivered', seller: 'Karla' },
    { id: 'ORD-2033', customer: 'Tienda El Progreso', total: 960, status: 'pending', seller: 'Luis' },
    { id: 'ORD-2032', customer: 'Bodega Doña Rosa', total: 1420, status: 'shipped', seller: 'Anderson' },
    { id: 'ORD-2031', customer: 'Minimarket Norte', total: 3110, status: 'delivered', seller: 'Karla' },
    { id: 'ORD-2030', customer: 'Comercial Andes', total: 780, status: 'cancelled', seller: 'Luis' },
    { id: 'ORD-2029', customer: 'Tienda La Familia', total: 2050, status: 'processed', seller: 'Anderson' },
    { id: 'ORD-2028', customer: 'Bodega El Rápido', total: 635, status: 'pending', seller: 'Karla' },
    { id: 'ORD-2027', customer: 'Market Sur', total: 4120, status: 'delivered', seller: 'Anderson' },
  ] as const;

  const TOP_SELLERS = [
    { name: 'Karla Ríos', zone: 'Norte', sales: 24800, orders: 18 },
    { name: 'Anderson T.', zone: 'Centro', sales: 19650, orders: 15 },
    { name: 'Luis Vega', zone: 'Sur', sales: 14210, orders: 11 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10 transition-all duration-500">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Panel General
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
            Vista consolidada de operación, ventas y alertas.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/admin/pos"
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <Zap size={18} className="text-emerald-400" />
            <span>Punto de Venta</span>
          </Link>
          <Link to="/admin/orders" className="btn-glass">
            <ShoppingCart size={18} />
            <span>Ver Pedidos</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KPIItem
              title="Ventas Totales"
              value={formatPrice(124500)}
              trend="+12.5%"
              icon={<TrendingUp size={18} />}
              accent="indigo"
            />
            <KPIItem
              title="Pedidos Hoy"
              value="42"
              trend="+3"
              icon={<ShoppingCart size={18} />}
              accent="emerald"
            />
            <KPIItem
              title="Bajo Stock"
              value="12"
              trend="Crítico"
              icon={<Package size={18} />}
              accent="orange"
            />
            <KPIItem
              title="Nuevos Clientes"
              value="8"
              trend="+2"
              icon={<Users size={18} />}
              accent="cyan"
            />
          </div>

          {/* Main Charts + Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 frosted-card h-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] italic text-slate-500">
                    Global · Últimos 7 días
                  </p>
                  <h3 className="text-lg font-black italic tracking-tight text-white uppercase mt-0.5">
                    Ventas Semanales
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-widest italic inline-flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    +12.5%
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_STATS}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#f1f5f9',
                        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)',
                      }}
                      labelStyle={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="frosted-card h-[480px] flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] italic text-slate-500">
                    Inventario
                  </p>
                  <h3 className="text-lg font-black italic tracking-tight text-white uppercase mt-0.5">
                    Alertas de Stock
                  </h3>
                </div>
                <Link
                  to="/admin/inventory"
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest italic inline-flex items-center gap-1"
                >
                  Ver todo
                  <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                <StockAlertItem name="Aceite Girasol" stock={5} unit="und" status="Critico" />
                <StockAlertItem name="Arroz Premium" stock={140} unit="kg" status="Alerta" />
                <StockAlertItem name="Leche Entera" stock={2} unit="und" status="Critico" />
                <StockAlertItem name="Harina Trigo" stock={85} unit="kg" status="Alerta" />
                <StockAlertItem name="Azúcar Rubia 1kg" stock={18} unit="und" status="Alerta" />
                <StockAlertItem name="Fideos Spaghetti 500g" stock={6} unit="und" status="Critico" />
                <StockAlertItem name="Atún en lata 170g" stock={22} unit="und" status="Alerta" />
                <StockAlertItem name="Papel higiénico pack x4" stock={3} unit="pack" status="Critico" />
                <StockAlertItem name="Detergente 1L" stock={14} unit="und" status="Alerta" />
                <StockAlertItem name="Gaseosa 3L" stock={4} unit="und" status="Critico" />
                <StockAlertItem name="Café 200g" stock={25} unit="und" status="Alerta" />
                <StockAlertItem name="Galletas surtidas" stock={7} unit="und" status="Critico" />
              </div>
            </div>
          </div>

          {/* Recent orders + Top sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 frosted-card h-[420px] flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] italic text-slate-500">
                    Operación · Tiempo real
                  </p>
                  <h3 className="text-lg font-black italic tracking-tight text-white uppercase mt-0.5">
                    Pedidos Recientes
                  </h3>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest italic inline-flex items-center gap-1"
                >
                  Gestionar
                  <ChevronRight size={12} />
                </Link>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {RECENT_ORDERS.map((o) => (
                  <OrderRow
                    key={o.id}
                    id={o.id}
                    customer={o.customer}
                    total={formatPrice(o.total)}
                    status={o.status}
                    seller={o.seller}
                  />
                ))}
              </div>
            </div>

            <div className="frosted-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] italic text-slate-500">
                    Field Ops
                  </p>
                  <h3 className="text-lg font-black italic tracking-tight text-white uppercase mt-0.5">
                    Top Vendedores
                  </h3>
                </div>
                <Link
                  to="/admin/users"
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest italic inline-flex items-center gap-1"
                >
                  Todos
                  <ChevronRight size={12} />
                </Link>
              </div>

              <div className="space-y-3">
                {TOP_SELLERS.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 p-3 rounded-2xl border"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--app-border) 70%, transparent)',
                      background: 'color-mix(in srgb, var(--app-card) 45%, transparent)',
                    }}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm shrink-0',
                        i === 0
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : i === 1
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black italic tracking-tight text-white truncate">{s.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">
                        Zona {s.zone} · {s.orders} pedidos
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white font-mono tracking-tight">
                        {formatPrice(s.sales)}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest italic inline-flex items-center gap-1 justify-end">
                        <ArrowUpRight size={10} />
                        Activo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

function KPIItem({
  title,
  value,
  trend,
  icon,
  accent = 'indigo',
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  accent?: 'indigo' | 'emerald' | 'orange' | 'cyan';
}) {
  const accents: Record<string, { iconBg: string; glow: string; text: string; border: string }> = {
    indigo: {
      iconBg: 'bg-indigo-500/15',
      glow: 'rgba(99,102,241,0.35)',
      text: 'text-indigo-300',
      border: 'border-indigo-500/25',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15',
      glow: 'rgba(16,185,129,0.35)',
      text: 'text-emerald-300',
      border: 'border-emerald-500/25',
    },
    orange: {
      iconBg: 'bg-orange-500/15',
      glow: 'rgba(249,115,22,0.35)',
      text: 'text-orange-300',
      border: 'border-orange-500/25',
    },
    cyan: {
      iconBg: 'bg-cyan-500/15',
      glow: 'rgba(34,211,238,0.35)',
      text: 'text-cyan-300',
      border: 'border-cyan-500/25',
    },
  };
  const a = accents[accent];

  const isPositive = trend.startsWith('+');
  const isCritical = /cr[ií]tico/i.test(trend);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 transition-all group',
        a.border
      )}
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--app-card) 75%, transparent) 0%, color-mix(in srgb, var(--app-card) 50%, transparent) 100%)',
        boxShadow: `0 25px 50px -30px ${a.glow}`,
      }}
    >
      <div
        className="absolute -top-14 -right-14 w-32 h-32 rounded-full blur-3xl opacity-60"
        style={{ background: a.glow }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={cn('p-2 rounded-xl border', a.iconBg, a.border)}>
          <span className={a.text}>{icon}</span>
        </div>
        <span
          className={cn(
            'text-[9px] font-black px-2 py-1 rounded-full uppercase italic tracking-widest border',
            isCritical
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : isPositive
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
          )}
        >
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 italic">
        {title}
      </p>
      <p className="text-2xl font-black mt-0.5 text-white font-mono relative z-10 tracking-tighter">
        {value}
      </p>
    </div>
  );
}

function StockAlertItem({
  name,
  stock,
  unit,
  status,
}: {
  name: string;
  stock: number;
  unit: string;
  status: 'Critico' | 'Alerta';
}) {
  const isCritical = status === 'Critico';
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-1',
        isCritical
          ? 'bg-rose-500/5 border-rose-500/15'
          : 'bg-orange-500/5 border-orange-500/15'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0',
            isCritical
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-orange-500/15 border-orange-500/30 text-orange-300'
          )}
        >
          <Package size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">{name}</p>
          <p className="text-[10px] text-slate-500 font-mono italic">
            {stock} {unit} restantes
          </p>
        </div>
      </div>
      <span
        className={cn(
          'text-[9px] uppercase font-black px-2 py-1 rounded-lg italic tracking-widest border shrink-0',
          isCritical
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/25'
            : 'bg-orange-500/15 text-orange-300 border-orange-500/25'
        )}
      >
        {status}
      </span>
    </div>
  );
}

function OrderRow({
  id,
  customer,
  total,
  status,
  seller,
}: {
  id: string;
  customer: string;
  total: string;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  seller: string;
}) {
  const meta: Record<typeof status, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
    processed: { label: 'Procesado', cls: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25' },
    shipped: { label: 'En ruta', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
    delivered: { label: 'Entregado', cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25' },
    cancelled: { label: 'Cancelado', cls: 'bg-rose-500/10 text-rose-300 border-rose-500/25' },
  } as any;

  const m = meta[status];

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-1"
      style={{
        borderColor: 'color-mix(in srgb, var(--app-border) 75%, transparent)',
        background: 'color-mix(in srgb, var(--app-card) 45%, transparent)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center shrink-0">
          <ShoppingCart size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black italic tracking-tight text-white truncate">
            {customer}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">
            {id} · {seller}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            'text-[9px] font-black px-2 py-1 rounded-lg uppercase italic tracking-widest border',
            m.cls
          )}
        >
          {m.label}
        </span>
        <p className="text-sm font-black text-white font-mono tracking-tight">{total}</p>
      </div>
    </div>
  );
}

// Mobile View for Sellers
function SellerLayout({ children, currentZone }: { children: React.ReactNode, currentZone: ZoneType | null }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = window.location.pathname;
  const navigate = useNavigate();
  const { toggle } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const headerHeight = 76; // base header height (without safe-area)

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto border-x relative overflow-hidden"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-fg)',
        borderColor: 'var(--app-border)',
      }}
    >
      <div className="decorative-blur top-[-20%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/10"></div>

      {/* Capa global estática (debajo del header y del bottom nav) */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-[5]"
        style={{
          top: `calc(env(safe-area-inset-top) + ${headerHeight}px)`,
          bottom: 'calc(env(safe-area-inset-bottom) + 88px)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--app-card) 55%, transparent) 0%, color-mix(in srgb, var(--app-card) 35%, transparent) 100%)',
        }}
      />
      
      <header
        className="backdrop-blur-xl px-6 py-5 flex items-center justify-between shrink-0 border-b fixed top-0 left-0 right-0 max-w-md mx-auto z-50"
        style={{
          background: 'color-mix(in srgb, var(--app-bg) 75%, transparent)',
          borderColor: 'var(--app-border)',
          paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)',
        }}
      >
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
          <button
            onClick={toggle}
            className="p-2 rounded-xl border"
            style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)', color: 'var(--app-fg)' }}
            title="Cambiar tema"
          >
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* Spacer for fixed header (safe-area + header) */}
      <div
        style={{
          height: `calc(env(safe-area-inset-top) + ${headerHeight}px)`,
          flexShrink: 0,
        }}
      />

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

      {/* El contenedor principal NO debe scrollear; cada pantalla maneja su propio scroll */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col min-h-0">
        {children}
      </div>

      {/* Bottom Navigation (Seller) */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[55] border-t backdrop-blur-2xl"
        style={{
          borderColor: 'var(--app-border)',
          background: 'color-mix(in srgb, var(--app-bg) 82%, transparent)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="px-4 py-3 grid grid-cols-5 gap-2">
          <BottomNavItem
            active={location === '/seller'}
            label="Inicio"
            icon={<MapPin size={18} />}
            onClick={() => navigate('/seller')}
          />
          <BottomNavItem
            active={location.startsWith('/seller/order')}
            label="Pedido"
            icon={<Plus size={18} />}
            onClick={() => navigate('/seller/order/new')}
            primary
          />
          <BottomNavItem
            active={location.startsWith('/seller/catalog')}
            label="Catálogo"
            icon={<Package size={18} />}
            onClick={() => navigate('/seller/catalog')}
          />
          <BottomNavItem
            active={location.startsWith('/seller/customers')}
            label="Clientes"
            icon={<Users size={18} />}
            onClick={() => navigate('/seller/customers')}
          />
          <BottomNavItem
            active={location.startsWith('/seller/history')}
            label="Pedidos"
            icon={<History size={18} />}
            onClick={() => navigate('/seller/history')}
          />
        </div>
      </nav>
    </div>
  );
}

function BottomNavItem({
  active,
  label,
  icon,
  onClick,
  primary = false,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all active:scale-95 border',
        primary
          ? active
            ? 'bg-indigo-600 text-white border-indigo-500/30 shadow-lg shadow-indigo-600/30'
            : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/20'
          : active
            ? 'bg-white/10 text-white border-white/10'
            : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-200'
      )}
      title={label}
      type="button"
    >
      <div className={cn(primary ? '' : active ? 'text-white' : 'text-slate-500')}>{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest italic">{label}</span>
    </button>
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
  type Visit = {
    id: string;
    name: string;
    address: string;
    status: 'visited' | 'current' | 'pending';
    time: string;
    photo?: string | null;
  };

  const [visits, setVisits] = useState<Visit[]>([
    { id: '1', name: "Bodega El Sol", address: "Av. Las Camelias 450", status: "current", time: "08:30 AM" },
    { id: '2', name: "Minimarket Lily", address: "Calle Los Pinos 102", status: "pending", time: "10:15 AM" },
    { id: '3', name: "Mercado Central #24", address: "Jr. Huallaga 455", status: "pending", time: "11:30 AM" },
    { id: '4', name: "Tienda Don Jhon", address: "Prol. Gamarra 882", status: "pending", time: "02:00 PM" },
    { id: '5', name: "Distribuidora San Martín", address: "Av. Benavides 1200", status: "pending", time: "03:10 PM" },
    { id: '6', name: "Abarrotes La Esquina", address: "Jr. Lima 330", status: "pending", time: "03:45 PM" },
    { id: '7', name: "Kiosko Central", address: "Psje. Grau 88", status: "pending", time: "04:20 PM" },
    { id: '8', name: "Market Express", address: "Av. Arequipa 2150", status: "pending", time: "04:55 PM" },
    { id: '9', name: "Tienda El Progreso", address: "Calle Las Flores 701", status: "pending", time: "05:20 PM" },
    { id: '10', name: "Bodega Doña Rosa", address: "Av. Los Próceres 145", status: "pending", time: "05:45 PM" },
    { id: '11', name: "Minimarket Norte", address: "Av. Túpac Amaru 980", status: "pending", time: "06:10 PM" },
    { id: '12', name: "Comercial Andes", address: "Jr. Puno 410", status: "pending", time: "06:35 PM" },
    { id: '13', name: "Tienda La Familia", address: "Calle Unión 56", status: "pending", time: "07:00 PM" },
    { id: '14', name: "Bodega El Rápido", address: "Av. Colonial 775", status: "pending", time: "07:25 PM" },
    { id: '15', name: "Market Sur", address: "Av. Pachacútec 1620", status: "pending", time: "07:50 PM" },
  ]);

  const mergeCustomers = (list: any[]) => {
    if (!Array.isArray(list) || list.length === 0) return;
    setVisits(prev => {
      const byName = new Map(prev.map(v => [v.name.trim().toLowerCase(), v]));
      const byId = new Map(prev.map(v => [v.id, v]));
      const next: Visit[] = prev.map(v => ({ ...v }));

      list.forEach((c: any) => {
        const photo = c?.photo ?? null;
        const key = (c?.name ?? '').trim().toLowerCase();
        const match =
          (c?.id && byId.get(c.id)) ||
          (key && byName.get(key));

        if (match) {
          if (photo) {
            const idx = next.findIndex(v => v.id === match.id);
            if (idx >= 0) next[idx] = { ...next[idx], photo };
          }
          return;
        }

        next.push({
          id: c?.id ?? `CUST-${Math.random().toString(36).slice(2, 8)}`,
          name: c?.name ?? 'Cliente',
          address: c?.address ?? 'Sin dirección',
          status: 'pending',
          time: '—',
          photo,
        });
      });

      return next;
    });
  };

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(mergeCustomers)
      .catch(() => {});
  }, []);

  useRealtime({
    onEvent: (type, data) => {
      if (type === 'customers:created' && data) {
        mergeCustomers([data]);
      }
    },
  });

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
    <div className="flex-1 flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {/* Capa base estática */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--app-bg) 70%, transparent) 0%, color-mix(in srgb, var(--app-bg) 92%, transparent) 100%)',
          }}
        />

        {/* Cabecera principal: ancho completo */}
        <div
          className="shrink-0 relative z-20 border-b backdrop-blur-2xl overflow-hidden sticky top-0"
          style={{
            borderColor: 'color-mix(in srgb, rgb(99 102 241) 45%, transparent)',
            background:
              'linear-gradient(135deg, color-mix(in srgb, rgb(99 102 241) 28%, var(--app-bg)) 0%, color-mix(in srgb, rgb(34 211 238) 22%, var(--app-bg)) 100%)',
            boxShadow:
              '0 30px 80px -45px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-25 bg-indigo-500" />
          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full blur-[60px] opacity-20 bg-emerald-500" />

          <div className="px-4 py-2.5 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <h2 className="text-base font-black italic tracking-tight text-white uppercase leading-none">
                  Ruta de Hoy
                </h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300/70">
                  {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                    background: 'color-mix(in srgb, var(--app-card) 55%, transparent)',
                    color: 'var(--app-fg)',
                  }}
                  title="Ver ruta en mapa"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MapIcon size={14} className="text-indigo-400" />
                    Mapa
                  </span>
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                    background: 'color-mix(in srgb, var(--app-card) 40%, transparent)',
                    color: 'var(--app-fg)',
                  }}
                  title="Filtros"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Filter size={14} className="text-emerald-400" />
                    Filtros
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar cliente en la ruta…"
                className="input-glass pl-9 !py-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tarjetas: se deslizan sobre la capa */}
        <div className="flex-1 min-h-0 relative z-10 pt-4 px-2 flex flex-col overflow-hidden">
          <DragScrollList>
            <Reorder.Group axis="y" values={visits} onReorder={setVisits} className="space-y-4">
              <AnimatePresence>
                {visits.map((visit) => (
                  <VisitCardWrapper
                    key={visit.id}
                    visit={visit}
                    onCheckIn={() => handleCheckIn(visit.id)}
                    onSelect={() => handleSelect(visit.id)}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </DragScrollList>
        </div>
      </div>
    </div>
  );
}

/** Contenedor con scroll vertical que además permite arrastrar con el dedo/mouse. */
function DragScrollList({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const state = React.useRef({
    dragging: false,
    startY: 0,
    startScroll: 0,
    pointerId: 0 as number | null,
    moved: false,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Solo para mouse/pen: el touch ya hace scroll nativo con pan-y
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    state.current.dragging = true;
    state.current.startY = e.clientY;
    state.current.startScroll = el.scrollTop;
    state.current.pointerId = e.pointerId;
    state.current.moved = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.dragging) return;
    const el = ref.current;
    if (!el) return;
    const dy = e.clientY - state.current.startY;
    if (Math.abs(dy) > 3) state.current.moved = true;
    el.scrollTop = state.current.startScroll - dy;
  };

  const endDrag = () => {
    state.current.dragging = false;
    state.current.pointerId = null;
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-3 pt-3 bg-transparent overscroll-contain relative z-10"
      style={{ touchAction: 'pan-y', cursor: state.current.dragging ? 'grabbing' : 'grab', paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
    >
      {children}
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
        photo={visit.photo}
        isDraggable={isDraggable}
        onCheckIn={onCheckIn}
        onSelect={onSelect}
      />
    </Reorder.Item>
  );
}

function VisitCard({ name, address, status, time, orderValue, photo, isDraggable, onCheckIn, onSelect }: { name: string, address: string, status: 'visited' | 'current' | 'pending', time: string, orderValue?: number, photo?: string | null, isDraggable?: boolean, onCheckIn: () => void, onSelect: () => void }) {
  const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); window.location.href = 'tel:+51900000000'; };
  const handleWhatsApp = (e: React.MouseEvent) => { e.stopPropagation(); window.location.href = 'https://wa.me/51900000000'; };
  const handleNavigation = (e: React.MouseEvent) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank'); };

  return (
    <div 
      onClick={status === 'pending' ? onSelect : undefined}
      className={cn(
      "p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md select-none",
      status === 'current'
        ? "border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
        : "border-white/5 cursor-pointer",
      isDraggable ? "cursor-grabbing ring-2 ring-indigo-500 scale-[1.02]" : ""
    )}>
      <div
        className="absolute inset-0"
        style={{
          background:
            status === 'current'
              ? 'color-mix(in srgb, rgb(16 185 129 / 0.14) 55%, transparent)'
              : 'color-mix(in srgb, var(--app-card) 55%, transparent)',
        }}
      />
      <div className={cn("absolute top-2 right-2 transition-opacity duration-300", isDraggable ? "text-indigo-400 opacity-100" : "text-slate-700 opacity-50")}>
         <GripVertical size={20} />
      </div>
      
      <div className="flex items-start justify-between gap-3 relative z-10 mr-4">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center bg-slate-800",
            status === 'current'
              ? 'border-emerald-500/40'
              : 'border-white/10'
          )}
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-400">
              {name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-black text-white italic tracking-tight truncate">{name}</h4>
            {status === 'visited' && <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shrink-0"><Plus size={10} className="text-black rotate-45 stroke-[3]" /></div>}
            {status === 'current' && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 tracking-tighter truncate">
            <MapPin size={12} className="text-indigo-400 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>
        <span className="text-[10px] font-black text-slate-500 font-mono italic shrink-0">{time}</span>
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
      
      <div className="mt-6 flex items-center justify-end relative z-10">
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
    <ProviderContextProvider>
    <Router>
      <Toaster position="top-right" closeButton richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/roles" element={<Navigate to="/seller" replace />} />

        {/* Provider / Console (SaaS Platform) */}
        <Route path="/provider/login" element={<ProviderLoginPage />} />
        <Route path="/provider/*" element={
          <ProviderGuard>
            <ProviderLayout>
              <Routes>
                <Route path="/" element={<ProviderDashboard />} />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/billing" element={<PlatformBillingPage />} />
                <Route path="/settings" element={<ProviderSettingsPage />} />
              </Routes>
            </ProviderLayout>
          </ProviderGuard>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/warehouses" element={<WarehousesPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/users" element={<UsersManagementPage />} />
              <Route path="/zones" element={<ZonesManagementPage />} />
              <Route path="/orders" element={<OrdersManagementPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/receivables" element={<AccountsReceivablePage />} />
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
              <Route path="/customers" element={<MyCustomersPage />} />
              <Route path="/customers/new" element={<NewCustomerPage />} />
              <Route path="/order/new" element={<NewOrderPage />} />
              <Route path="/expenses" element={<FieldExpensesPage />} />
              <Route path="/history" element={<OrdersHistoryPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
            </Routes>
          </SellerLayout>
        } />
      </Routes>
    </Router>
    </ProviderContextProvider>
  );
}

function ProviderGuard({ children }: { children: ReactNode }) {
  const { session } = useProvider();
  if (!session) return <Navigate to="/provider/login" replace />;
  return <>{children}</>;
}
