import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Eye, 
  MoreVertical,
  Download,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  PackageCheck,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { generateOrderPDF } from '../../lib/pdfGenerator';
import { cn } from '../../lib/utils';
import type { Order } from '../../types';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-7521',
    customerId: 'C-001',
    customerName: 'Abarrotes El Porvenir',
    sellerId: 'USR-002',
    total: 1250.50,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    items: [],
    gps: { lat: -12.046374, lng: -77.042793 }
  },
  {
    id: 'ORD-7520',
    customerId: 'C-003',
    customerName: 'Minimarket Los Olivos',
    sellerId: 'USR-002',
    total: 890.00,
    status: 'processed',
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    items: [],
  },
  {
    id: 'ORD-7519',
    customerId: 'C-005',
    customerName: 'Bodega Central Gamarra',
    sellerId: 'admin',
    total: 3200.00,
    status: 'shipped',
    createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    items: [],
  }
];

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: <Clock size={14} /> },
  processed: { label: 'Procesado', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', icon: <PackageCheck size={14} /> },
  shipped: { label: 'En Ruta', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: <Truck size={14} /> },
  delivered: { label: 'Entregado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Cancelado', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: <XCircle size={14} /> },
};

export default function OrdersManagementPage() {
  const { formatPrice, formatTime, currency, formatDate } = useRegional();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const updateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Pedido ${orderId} actualizado a ${STATUS_CONFIG[newStatus].label}`);
  };

  const filteredOrders = orders.filter(o => {
    // Status Filter
    const statusMatch = filter === 'all' || o.status === filter;
    
    // Date Range Filter
    let dateMatch = true;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      dateMatch = dateMatch && o.createdAt >= from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && o.createdAt <= to;
    }

    return statusMatch && dateMatch;
  });

  const handlePrintInvoice = (order: Order) => {
    const id = toast.loading('Generando Factura Legal...');
    try {
      const doc = generateOrderPDF({
        id: order.id,
        customerName: order.customerName,
        date: formatDate(order.createdAt),
        total: order.total,
        currencySymbol: currency.symbol,
        items: [
          { productId: '1', productName: 'Arroz Extra Costeño 1kg', quantity: 24, price: 4.50 },
          { productId: '2', productName: 'Aceite Girasol Primor 1L', quantity: 12, price: 9.80 }
        ]
      });
      doc.save(`Factura_${order.id}.pdf`);
      toast.success('Factura generada correctamente', { id });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar la factura', { id });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 pt-4 space-y-6 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Control de Pedidos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Gestión de ventas en campo y despacho central.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-slate-900 rounded-2xl p-1 border border-white/5 h-12">
            <div className="flex items-center px-4 gap-3">
              <Calendar size={14} className="text-slate-500" />
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold text-slate-300 outline-none uppercase tracking-widest cursor-pointer [color-scheme:dark]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-slate-700 text-[10px] font-black italic">AL</span>
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold text-slate-300 outline-none uppercase tracking-widest cursor-pointer [color-scheme:dark]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {(dateFrom || dateTo) && (
                <button 
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest ml-2"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
           <button 
            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl transition-all border border-white/5"
            onClick={() => {
              const id = toast.loading('Generando reporte de pedidos...');
              setTimeout(() => {
                toast.success('Reporte de pedidos listo para descarga', { id });
              }, 2000);
            }}
           >
            <Download size={20} />
          </button>
          <div className="flex bg-slate-900 rounded-2xl p-1 border border-white/5">
            {['all', 'pending', 'processed', 'shipped'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'processed' ? 'Procesados' : 'En Ruta'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-4 relative z-10">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div 
              layout
              key={order.id}
              className="frosted-card group border-white/5 p-5 hover:border-indigo-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                  <ShoppingCart size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-white text-lg uppercase italic tracking-tighter">{order.id}</h4>
                    <span className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border",
                      STATUS_CONFIG[order.status].color,
                      STATUS_CONFIG[order.status].bg,
                      STATUS_CONFIG[order.status].border
                    )}>
                      {STATUS_CONFIG[order.status].icon}
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </div>
                    <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                      <User size={12} className="text-indigo-500/50" />
                      {order.customerName}
                    </div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                      <Calendar size={12} className="text-indigo-500/50" />
                      {formatTime(order.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Total del Pedido</p>
                  <p className="text-xl font-black text-white italic tracking-tighter uppercase">
                    {formatPrice(order.total)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'processed'); }}
                      className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all active:scale-95"
                    >
                      Aprobar
                    </button>
                  )}
                  {order.status === 'processed' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'shipped'); }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all active:scale-95"
                    >
                      Despachar
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'cancelled'); }}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                  <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 text-slate-600 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
            <Calendar size={48} className="opacity-20" />
            <div className="text-center">
              <p className="text-sm font-black uppercase italic tracking-widest">No se encontraron pedidos</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">Intenta ajustar los filtros de fecha o estado</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-xl h-full bg-slate-900 border-l border-white/5 overflow-y-auto relative z-11 shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Detalles del Pedido</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-2 italic">{selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Vendedor Responsable</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                        <User size={16} />
                      </div>
                      <p className="text-xs font-bold text-white uppercase italic">{selectedOrder.sellerId === 'USR-002' ? 'Anderson Seller' : 'Administrador'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Estado Logístico</p>
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-bold uppercase italic",
                      STATUS_CONFIG[selectedOrder.status].color
                    )}>
                      {STATUS_CONFIG[selectedOrder.status].icon}
                      {STATUS_CONFIG[selectedOrder.status].label}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic border-l-2 border-emerald-500 pl-3">Información del Cliente</h4>
                  <div className="frosted-card border-white/5 p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white uppercase italic tracking-tight leading-none">{selectedOrder.customerName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Lurín Industrial, Calle Las Frutas 452</p>
                      </div>
                    </div>
                    {selectedOrder.gps && (
                      <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase">Ubicación GPS Verificada</span>
                        </div>
                        <button className="text-[9px] font-black text-white hover:text-emerald-400 underline uppercase tracking-widest transition-colors">
                          Ver Mapa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Placeholder */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic border-l-2 border-indigo-500 pl-3">Resumen de Productos</h4>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                            <ShoppingCart size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase italic">Soda Tropical 500ml</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase">SKU: PROD-742{i}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-indigo-400 italic">24 Unid.</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{formatPrice(48.00)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                 <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-black text-slate-500 uppercase italic tracking-tighter">Total Final</p>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] border border-white/10"
                    >
                      <Printer size={20} />
                      Imprimir Factura
                    </button>
                    <button className="h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]">
                      <PackageCheck size={20} />
                      Guía Remisión
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
