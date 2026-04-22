import React, { useMemo, useRef, useState } from 'react';
import { Search, Filter, Users, Plus, ChevronRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type CustomerMock = {
  id: string;
  name: string;
  zone: string;
  tier: 'VIP' | 'Regular' | 'Nuevo';
};

const MOCK_CUSTOMERS: CustomerMock[] = [
  { id: '1', name: 'Comercial Gloria 1', zone: 'Surquillo', tier: 'VIP' },
  { id: '2', name: 'Bodega El Sol', zone: 'San Borja', tier: 'Regular' },
  { id: '3', name: 'Minimarket Lily', zone: 'Lince', tier: 'VIP' },
  { id: '4', name: 'Mercado Central #24', zone: 'La Victoria', tier: 'Regular' },
  { id: '5', name: 'Tienda Don Jhon', zone: 'Gamarra', tier: 'Nuevo' },
  { id: '6', name: 'Distribuidora San Martín', zone: 'Miraflores', tier: 'Regular' },
  { id: '7', name: 'Abarrotes La Esquina', zone: 'Cercado', tier: 'Regular' },
  { id: '8', name: 'Kiosko Central', zone: 'Breña', tier: 'Nuevo' },
  { id: '9', name: 'Market Express', zone: 'Lince', tier: 'VIP' },
  { id: '10', name: 'Tienda El Progreso', zone: 'San Miguel', tier: 'Regular' },
  { id: '11', name: 'Bodega Doña Rosa', zone: 'Chorrillos', tier: 'Regular' },
  { id: '12', name: 'Minimarket Norte', zone: 'Comas', tier: 'Nuevo' },
];

export default function MyCustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.zone.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div
      className="flex-1 flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {/* Capa base estática */}
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

          <div className="p-4 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] italic text-slate-500">
                  Field • Directorio CRM
                </p>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mt-0.5">
                  Mis Clientes
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                  {filtered.length} cliente{filtered.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/seller/customers/new"
                  className="px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest italic transition-all active:scale-95 inline-flex items-center gap-2"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                    background: 'color-mix(in srgb, rgb(99 102 241 / 0.25) 70%, transparent)',
                    color: 'var(--app-fg)',
                  }}
                  title="Nuevo cliente"
                >
                  <UserPlus size={16} className="text-indigo-300" />
                  Nuevo
                </Link>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest italic transition-all active:scale-95"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                    background: 'color-mix(in srgb, var(--app-card) 40%, transparent)',
                    color: 'var(--app-fg)',
                  }}
                  title="Filtros"
                >
                  <span className="inline-flex items-center gap-2">
                    <Filter size={16} className="text-emerald-400" />
                    Filtros
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest italic"
                style={{
                  borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                  background: 'color-mix(in srgb, rgb(99 102 241 / 0.18) 60%, transparent)',
                  color: 'var(--app-fg)',
                }}
                title="Directorio"
              >
                <span className="inline-flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" />
                  Directorio
                </span>
              </div>

              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar cliente o zona…"
                  className="input-glass pl-10 !py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Listado de clientes */}
        <div className="flex-1 min-h-0 relative z-10 pt-4 px-6 flex flex-col overflow-hidden">
          <DragScrollList>
            <div className="space-y-4">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/seller/customers')}
                  className="frosted-card flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 border border-white/5 rounded-xl flex items-center justify-center text-indigo-400 font-black italic">
                      {c.name
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase italic">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {c.zone} • {c.tier}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="frosted-card text-center text-slate-400 text-sm">
                  No se encontraron clientes.
                </div>
              )}
            </div>
          </DragScrollList>
        </div>
      </div>
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
      className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-3 py-3 bg-transparent overscroll-contain relative z-10"
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
}
