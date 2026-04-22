import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, ArrowLeft, Plus, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import type { Product } from '../../types';

export default function CatalogPage() {
  const { formatPrice } = useRegional();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className="flex-1 flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {/* Capa base estática detrás del contenido */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--app-bg) 70%, transparent) 0%, color-mix(in srgb, var(--app-bg) 92%, transparent) 100%)',
          }}
        />

        {/* Cabecera principal (ancho completo) */}
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
                <button
                  onClick={() => navigate('/seller')}
                  className="p-1.5 rounded-lg border text-slate-300 hover:text-white transition-all active:scale-95"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                    background: 'color-mix(in srgb, var(--app-card) 55%, transparent)',
                  }}
                  title="Volver"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base font-black italic tracking-tight text-white uppercase leading-none">
                  Catálogo Express
                </h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300/70">
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
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
                placeholder="Buscar nombre o SKU…"
                className="input-glass pl-9 !py-1.5 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Listado de productos */}
        <div className="flex-1 min-h-0 relative z-10 pt-4 px-2 flex flex-col overflow-hidden">
          <DragScrollList>
            <div className="space-y-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  price={formatPrice(product.price ?? 4.5)}
                />
              ))}
            </div>
          </DragScrollList>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, price }: { product: Product; price: string }) {
  return (
    <div className="frosted-card flex gap-5 hover:border-indigo-500/30 transition-all active:scale-[0.98] group relative overflow-hidden">
      <div className="w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500 shadow-inner">
        <img
          src={product.imageUrl || `https://picsum.photos/seed/${product.sku}/200/200`}
          alt="p"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h4 className="font-black text-white italic tracking-tight leading-tight uppercase text-base">
            {product.name}
          </h4>
          <p className="text-[10px] text-indigo-400 font-bold uppercase italic tracking-widest mt-1">
            PRODUCT SKU: {product.sku}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-black text-white font-mono tracking-tighter uppercase">{price}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shadow-[0_0_8px]',
                  product.stock > 100
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                )}
              ></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">
                En Stock: {product.stock}
              </p>
            </div>
          </div>
          <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-90 transition-all active:rotate-12 border border-white/10 hover:bg-indigo-500 translate-y-1">
            <Plus size={24} className="stroke-[3]" />
          </button>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30 group-hover:bg-indigo-500 transition-all"></div>
    </div>
  );
}

/** Contenedor con scroll vertical que además permite arrastrar con el dedo/mouse. */
function DragScrollList({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const state = useRef({
    dragging: false,
    startY: 0,
    startScroll: 0,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    state.current.dragging = true;
    state.current.startY = e.clientY;
    state.current.startScroll = el.scrollTop;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.dragging) return;
    const el = ref.current;
    if (!el) return;
    const dy = e.clientY - state.current.startY;
    el.scrollTop = state.current.startScroll - dy;
  };

  const endDrag = () => {
    state.current.dragging = false;
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
      style={{ touchAction: 'pan-y', paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
    >
      {children}
    </div>
  );
}
