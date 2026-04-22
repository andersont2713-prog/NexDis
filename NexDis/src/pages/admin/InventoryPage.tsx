import React, { useState, useEffect } from 'react';
import { Package, Plus, Filter, Search, MoreHorizontal, AlertCircle, ArrowUpRight, ArrowDownRight, Warehouse, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import { useRealtime } from '../../lib/realtime';
import type { Product } from '../../types';

export default function InventoryPage() {
  const { formatPrice } = useRegional();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

  useEffect(() => {
    load();
  }, []);

  useRealtime({
    onEvent: (type) => {
      if (type === 'inventory:updated') load();
      if (type === 'orders:created') load(); // orders can affect stock in future
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10 transition-all duration-500">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">Inventario Maestro</h2>
          <p className="text-slate-400 font-medium border-l-2 border-indigo-500/30 pl-4 py-1">Control logístico y trazabilidad de activos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="bg-white/5 border border-white/5 text-slate-300 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
            onClick={() => {
              const id = toast.loading('Exportando inventario...');
              setTimeout(() => {
                toast.success('Inventario exportado a Excel', { id });
              }, 1500);
            }}
          >
            <Warehouse size={18} />
            <span>Generar Reporte</span>
          </button>
          <button className="btn-glass">
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scrollbar">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-6">
          <InventoryStat title="Total SKUs" value={products.length.toString()} icon={<Package size={20} />} />
          <InventoryStat title="Valor Total" value={formatPrice(2400000)} icon={<TrendingUp />} />
          <InventoryStat title="Alertas" value="15" variant="warning" icon={<AlertCircle size={20} />} />
          <InventoryStat title="Vencimientos" value="4" variant="danger" icon={<AlertCircle size={20} />} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por SKU, Nombre o Lote..." 
                className="input-glass pl-10"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
              <Filter size={16} />
              Filtros
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Ordenar por:</span>
            <select className="input-glass !w-40 !py-1 text-xs">
              <option>Más recientes</option>
              <option>Menor Stock</option>
              <option>Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="frosted-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Producto</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">SKU / Lote</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Ubicación</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Stock</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Estado</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-white/5 group-hover:scale-110 transition-transform">
                       <img src={`https://picsum.photos/seed/${product.sku}/100/100`} alt="prod" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">{product.name}</p>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase italic tracking-widest">Perecedero</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-[11px] font-mono text-slate-300 font-black tracking-tighter uppercase">{product.sku}</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest">{product.lot}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 w-fit">
                    <Warehouse size={12} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.warehouse}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <p className={cn(
                      "text-lg font-black font-mono tracking-tighter",
                      product.stock < product.minStock ? "text-rose-400" : "text-white"
                    )}>
                      {product.stock.toLocaleString()} <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">und</span>
                    </p>
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          product.stock < product.minStock ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        )} 
                        style={{ width: `${Math.min((product.stock / product.maxStock) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full italic border",
                    product.stock < product.minStock ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  )}>
                    {product.stock < product.minStock ? 'Critical' : 'Optimized'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}

function InventoryStat({ title, value, icon, variant }: { title: string, value: string, icon: React.ReactNode, variant?: 'warning' | 'danger' }) {
  return (
    <div className={cn(
      "frosted-card relative overflow-hidden group border-white/5",
      variant === 'warning' ? "bg-orange-500/5" : 
      variant === 'danger' ? "bg-rose-500/5" : "bg-white/5"
    )}>
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border",
          variant === 'warning' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
          variant === 'danger' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        )}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{title}</p>
      </div>
      <p className="text-4xl font-black text-white font-mono tracking-tighter relative z-10">{value}</p>
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
    </div>
  );
}
