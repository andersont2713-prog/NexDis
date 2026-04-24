import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { X, Navigation, MapPin, Clock, CheckCircle2, Radio, Route as RouteIcon, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';

export type RouteMapVisit = {
  id: string;
  name: string;
  address: string;
  status: 'visited' | 'current' | 'pending';
  time: string;
  lat?: number;
  lng?: number;
  photo?: string | null;
};

type Props = {
  visits: RouteMapVisit[];
  open: boolean;
  onClose: () => void;
  onCheckIn?: (id: string) => void;
  onSelect?: (id: string) => void;
};

/* Coordenadas base (Lima, Perú) para generar posiciones deterministas
   cuando una visita no tiene lat/lng todavía. */
const DEFAULT_CENTER: [number, number] = [-12.046374, -77.042793];

function syntheticCoord(id: string, seed = 0): [number, number] {
  const h = [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, seed);
  const dLat = ((h & 0xffff) / 0xffff - 0.5) * 0.06;
  const dLng = (((h >> 16) & 0xffff) / 0xffff - 0.5) * 0.06;
  return [DEFAULT_CENTER[0] + dLat, DEFAULT_CENTER[1] + dLng];
}

function statusStyles(status: RouteMapVisit['status']) {
  switch (status) {
    case 'current':
      return {
        ring: 'ring-indigo-400/60',
        grad: 'from-indigo-500 to-violet-600',
        glow: 'shadow-[0_0_30px_rgba(99,102,241,0.75)]',
        pulseColor: 'rgba(99,102,241,0.55)',
        label: 'En curso',
        icon: Radio,
        accent: 'text-indigo-300',
      };
    case 'visited':
      return {
        ring: 'ring-emerald-400/60',
        grad: 'from-emerald-500 to-teal-600',
        glow: 'shadow-[0_0_24px_rgba(16,185,129,0.55)]',
        pulseColor: 'rgba(16,185,129,0.45)',
        label: 'Visitado',
        icon: CheckCircle2,
        accent: 'text-emerald-300',
      };
    default:
      return {
        ring: 'ring-slate-400/30',
        grad: 'from-slate-600 to-slate-800',
        glow: 'shadow-[0_10px_20px_rgba(15,23,42,0.55)]',
        pulseColor: 'rgba(148,163,184,0.35)',
        label: 'Pendiente',
        icon: Clock,
        accent: 'text-slate-300',
      };
  }
}

function buildPinHTML(index: number, status: RouteMapVisit['status']) {
  const s = statusStyles(status);
  const gradMap: Record<string, [string, string]> = {
    current: ['#6366f1', '#7c3aed'],
    visited: ['#10b981', '#0d9488'],
    pending: ['#475569', '#1e293b'],
  };
  const [c1, c2] = gradMap[status];

  return `
    <div class="nx-pin">
      ${status === 'current' ? `<span class="nx-pin-pulse" style="background:${s.pulseColor}"></span>` : ''}
      <div class="nx-pin-core" style="background:linear-gradient(135deg, ${c1} 0%, ${c2} 100%);">
        <span class="nx-pin-num">${index + 1}</span>
      </div>
      <div class="nx-pin-stem" style="background:linear-gradient(180deg, ${c2} 0%, rgba(0,0,0,0.35) 100%);"></div>
    </div>
  `;
}

function buildDivIcon(index: number, status: RouteMapVisit['status']) {
  return L.divIcon({
    html: buildPinHTML(index, status),
    className: 'nx-pin-wrapper',
    iconSize: [40, 56],
    iconAnchor: [20, 52],
    popupAnchor: [0, -46],
  });
}

/** Ajusta el viewport del mapa para que se vean todos los marcadores. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [map, points]);
  return null;
}

/** Hook mínimo para que el mapa se recalcule al abrir el modal (animación). */
function InvalidateOnMount({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map, trigger]);
  return null;
}

export default function RouteMapModal({ visits, open, onClose, onCheckIn, onSelect }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const withCoords = useMemo(
    () =>
      visits.map((v) => {
        const [lat, lng] =
          v.lat != null && v.lng != null ? [v.lat, v.lng] : syntheticCoord(v.id);
        return { ...v, lat, lng };
      }),
    [visits]
  );

  const routePoints = useMemo<[number, number][]>(
    () => withCoords.map((v) => [v.lat!, v.lng!] as [number, number]),
    [withCoords]
  );

  const selected = useMemo(
    () => withCoords.find((v) => v.id === selectedId) ?? null,
    [selectedId, withCoords]
  );

  // reset selección al abrir
  useEffect(() => {
    if (open) {
      const currentVisit = withCoords.find((v) => v.status === 'current');
      setSelectedId(currentVisit?.id ?? withCoords[0]?.id ?? null);
    }
  }, [open, withCoords]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] max-w-md mx-auto"
      style={{ backgroundColor: 'rgba(2,6,23,0.92)' }}
      ref={containerRef}
    >
      {/* Mapa */}
      <div className="absolute inset-0">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom
          zoomControl={false}
          style={{ width: '100%', height: '100%', background: '#030712' }}
        >
          {/* Tile dark premium (CartoDB Dark Matter, gratis) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
            subdomains={['a', 'b', 'c', 'd']}
          />

          <FitBounds points={routePoints} />
          <InvalidateOnMount trigger={open} />

          {/* Línea de ruta sugerida */}
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: '#818cf8',
                weight: 3,
                opacity: 0.6,
                dashArray: '6 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}

          {withCoords.map((v, i) => (
            <Marker
              key={v.id}
              position={[v.lat!, v.lng!]}
              icon={buildDivIcon(i, v.status)}
              eventHandlers={{
                click: () => {
                  setSelectedId(v.id);
                  onSelect?.(v.id);
                },
              }}
            >
              <Popup className="nx-popup" closeButton={false}>
                <div className="min-w-[180px]">
                  <p className="text-[10px] font-black uppercase tracking-widest italic text-indigo-300">
                    Parada #{i + 1}
                  </p>
                  <p className="text-sm font-black italic text-white leading-tight mt-0.5">
                    {v.name}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">{v.address}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    {v.time}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {/* Header flotante */}
      <div className="absolute top-0 left-0 right-0 z-[10]">
        <div
          className="px-4 py-3 flex items-center justify-between gap-2 backdrop-blur-xl border-b"
          style={{
            background: 'linear-gradient(180deg, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.55) 100%)',
            borderColor: 'rgba(99,102,241,0.25)',
            paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 shrink-0">
              <RouteIcon size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] italic text-indigo-300 leading-none">
                Mapa de ruta
              </p>
              <p className="text-sm font-black italic text-white leading-tight mt-0.5 truncate">
                {withCoords.length} {withCoords.length === 1 ? 'parada' : 'paradas'} ·{' '}
                <span className="text-emerald-300">
                  {withCoords.filter((v) => v.status === 'visited').length} ok
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white flex items-center justify-center active:scale-95 transition-all shrink-0"
            title="Cerrar mapa"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mini leyenda */}
        <div className="px-4 pt-2 pb-1 flex items-center gap-2 flex-wrap">
          <LegendDot color="from-indigo-500 to-violet-600" label="En curso" />
          <LegendDot color="from-emerald-500 to-teal-600" label="Visitado" />
          <LegendDot color="from-slate-600 to-slate-800" label="Pendiente" />
        </div>
      </div>

      {/* Tarjeta inferior (cliente seleccionado) */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="absolute left-3 right-3 z-[10]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        >
          <SelectedCard
            visit={selected}
            index={withCoords.findIndex((v) => v.id === selected.id)}
            onCheckIn={() => {
              onCheckIn?.(selected.id);
              setSelectedId(null);
            }}
          />
        </motion.div>
      )}

      <style>{`
        /* Contenedor del pin: Leaflet añade un wrapper con fondo; lo hacemos transparente */
        .nx-pin-wrapper { background: transparent !important; border: 0 !important; }
        .nx-pin { position: relative; width: 40px; height: 56px; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.45)); }
        .nx-pin-core {
          width: 34px; height: 34px; border-radius: 50%;
          position: absolute; left: 3px; top: 2px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .nx-pin-num {
          color: #fff; font-size: 13px; font-weight: 900; font-style: italic;
          text-shadow: 0 1px 2px rgba(0,0,0,0.45); line-height: 1;
        }
        .nx-pin-stem {
          position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
          width: 3px; height: 20px; border-radius: 2px;
        }
        .nx-pin-pulse {
          position: absolute; left: 50%; top: 18px; transform: translate(-50%, -50%);
          width: 34px; height: 34px; border-radius: 50%;
          animation: nx-pulse 1.8s ease-out infinite;
          z-index: -1;
        }
        @keyframes nx-pulse {
          0%   { transform: translate(-50%, -50%) scale(0.9); opacity: 0.9; }
          70%  { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        /* Popup premium */
        .nx-popup .leaflet-popup-content-wrapper {
          background: rgba(15,23,42,0.95);
          color: #e2e8f0;
          border: 1px solid rgba(99,102,241,0.35);
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
        }
        .nx-popup .leaflet-popup-content { margin: 10px 14px; font-family: inherit; }
        .nx-popup .leaflet-popup-tip { background: rgba(15,23,42,0.95); border: 1px solid rgba(99,102,241,0.35); }
        /* Controles Leaflet: tema oscuro */
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.85) !important;
          color: #e2e8f0 !important;
          border-color: rgba(99,102,241,0.3) !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(30,41,59,0.95) !important; }
        .leaflet-control-attribution {
          background: rgba(2,6,23,0.75) !important;
          color: #64748b !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
      `}</style>
    </motion.div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
      <span className={cn('w-2.5 h-2.5 rounded-full bg-gradient-to-br', color)} />
      <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-200">
        {label}
      </span>
    </div>
  );
}

function SelectedCard({
  visit,
  index,
  onCheckIn,
}: {
  visit: RouteMapVisit;
  index: number;
  onCheckIn: () => void;
}) {
  const s = statusStyles(visit.status);
  const Icon = s.icon;
  return (
    <div
      className="rounded-2xl border backdrop-blur-xl overflow-hidden"
      style={{
        background:
          'linear-gradient(140deg, rgba(15,23,42,0.92) 0%, rgba(30,27,75,0.88) 100%)',
        borderColor: 'rgba(99,102,241,0.35)',
        boxShadow: '0 30px 60px -15px rgba(2,6,23,0.7)',
      }}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 ring-2',
            `bg-gradient-to-br ${s.grad}`,
            s.ring,
            s.glow
          )}
        >
          {visit.photo ? (
            <img
              src={visit.photo}
              alt={visit.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-white text-base font-black italic">{index + 1}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest italic',
                visit.status === 'current'
                  ? 'border-indigo-400/40 bg-indigo-500/10 text-indigo-300'
                  : visit.status === 'visited'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-500/40 bg-slate-500/10 text-slate-300'
              )}
            >
              <Icon size={10} />
              {s.label}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {visit.time}
            </span>
          </div>
          <p className="text-sm font-black italic text-white leading-tight mt-0.5 truncate">
            {visit.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate inline-flex items-center gap-1">
            <MapPin size={10} /> {visit.address}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${visit.lat},${visit.lng}`;
            window.open(url, '_blank');
          }}
          className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Navigation size={12} className="text-indigo-300" />
          Cómo llegar
        </button>
        <button
          type="button"
          onClick={onCheckIn}
          disabled={visit.status === 'visited'}
          className="px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/40 hover:shadow-indigo-600/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Crosshair size={12} />
          {visit.status === 'visited' ? 'Completado' : 'Check-in'}
        </button>
      </div>
    </div>
  );
}
