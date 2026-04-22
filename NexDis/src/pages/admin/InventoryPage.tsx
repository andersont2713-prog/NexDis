import React, { useRef, useState, useEffect } from 'react';
import { Package, Plus, Filter, Search, MoreHorizontal, AlertCircle, ArrowUpRight, ArrowDownRight, Warehouse, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import { useRealtime } from '../../lib/realtime';
import type { Product } from '../../types';

export default function InventoryPage() {
  const { formatPrice } = useRegional();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    sku: '',
    warehouse: 'Principal',
    category: 'General',
    stock: 0,
    minStock: 0,
    maxStock: 1000,
    lot: 'N/A',
    expiry: '2099-12-31',
    price: 0,
  });

  const loadInventory = () =>
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

  const loadCategories = () =>
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

  useEffect(() => {
    loadInventory();
    loadCategories();
  }, []);

  useRealtime({
    onEvent: (type) => {
      if (type === 'inventory:updated') loadInventory();
      if (type === 'orders:created') loadInventory(); // orders can affect stock in future
      if (type === 'categories:updated') loadCategories();
    }
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.sku.trim()) {
      toast.error('Completa Nombre y SKU');
      return;
    }

    const id = toast.loading('Creando producto...');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo crear el producto');
      }
      toast.success('Producto creado', { id });
      setIsCreateOpen(false);
      setCreateForm((p) => ({ ...p, name: '', sku: '' }));
      // load will also be triggered by SSE, but keep immediate UX
      loadInventory();
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear producto', { id });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    const id = toast.loading('Creando categoría...');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo crear la categoría');
      }
      toast.success('Categoría creada', {id});
      setNewCategoryName('');
      setIsCategoryOpen(false);
      setCreateForm((p) => ({...p, category: name}));
      loadCategories();
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear categoría', {id});
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoTarget, setPhotoTarget] = useState<Product | null>(null);

  const openPhotoPicker = (product: Product) => {
    setPhotoTarget(product);
    fileInputRef.current?.click();
  };

  const handlePhotoPicked = async (file: File | null) => {
    const product = photoTarget;
    setPhotoTarget(null);
    if (!product || !file) return;

    const id = toast.loading('Subiendo foto...');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`/api/inventory/${encodeURIComponent(product.id)}/photo`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo subir la foto');
      }
      toast.success('Foto actualizada', { id });
      loadInventory();
    } catch (e: any) {
      toast.error(e?.message || 'Error al subir foto', { id });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10 transition-all duration-500">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoPicked(e.target.files?.[0] ?? null)}
      />
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
          <button className="btn-glass" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl frosted-card border-white/10">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Nuevo Producto</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Alta rápida de inventario</p>
              </div>
              <button
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Nombre *</label>
                  <input
                    className="input-glass"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej. Arroz Premium 1kg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">SKU *</label>
                  <input
                    className="input-glass"
                    value={createForm.sku}
                    onChange={(e) => setCreateForm((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="Ej. ARZ-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Stock</label>
                  <input
                    type="number"
                    className="input-glass"
                    value={createForm.stock}
                    onChange={(e) => setCreateForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Mínimo</label>
                  <input
                    type="number"
                    className="input-glass"
                    value={createForm.minStock}
                    onChange={(e) => setCreateForm((p) => ({ ...p, minStock: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Máximo</label>
                  <input
                    type="number"
                    className="input-glass"
                    value={createForm.maxStock}
                    onChange={(e) => setCreateForm((p) => ({ ...p, maxStock: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Almacén</label>
                  <input
                    className="input-glass"
                    value={createForm.warehouse}
                    onChange={(e) => setCreateForm((p) => ({ ...p, warehouse: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Categoría</label>
                  <select
                    className="input-glass"
                    value={createForm.category}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '__create__') {
                        setIsCategoryOpen(true);
                        return;
                      }
                      setCreateForm((p) => ({ ...p, category: v }));
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                    <option value="__create__" className="bg-slate-900">
                      + Crear categoría…
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Precio</label>
                  <input
                    type="number"
                    className="input-glass"
                    value={createForm.price}
                    onChange={(e) => setCreateForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={18} />
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsCategoryOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md frosted-card border-white/10">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Crear categoría</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Disponible para todos los productos</p>
              </div>
              <button
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsCategoryOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Nombre</label>
                <input
                  className="input-glass"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej. Granos, Aceites, Snacks..."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                  onClick={() => setIsCategoryOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-glass">
                  <Plus size={18} />
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scrollbar">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-6">
          <InventoryKPI title="Total SKUs" value={products.length.toString()} icon={<Package size={18} />} accent="text-indigo-400" />
          <InventoryKPI title="Valor Total" value={formatPrice(2400000)} icon={<TrendingUp size={18} />} accent="text-emerald-400" />
          <InventoryKPI title="Alertas" value="15" icon={<AlertCircle size={18} />} accent="text-orange-400" />
          <InventoryKPI title="Vencimientos" value="4" icon={<AlertCircle size={18} />} accent="text-rose-400" />
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
                       <img
                         src={product.imageUrl || `https://picsum.photos/seed/${product.sku}/100/100`}
                         alt="prod"
                         className="w-full h-full object-cover"
                         referrerPolicy="no-referrer"
                       />
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      title="Subir foto"
                      onClick={() => openPhotoPicker(product)}
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
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

function InventoryKPI({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="frosted-card !p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={cn("p-1.5 bg-white/5 border border-white/10 rounded-lg", accent)}>{icon}</div>
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10 italic">{title}</p>
      <p className="text-2xl font-black mt-0.5 text-white font-mono relative z-10 tracking-tighter">{value}</p>
    </div>
  );
}
