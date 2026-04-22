import React, { useState, FormEvent } from 'react';
import {
  ChevronLeft,
  MapPin,
  Camera,
  Save,
  User,
  Phone,
  Building2,
  CreditCard,
  RefreshCw,
  Image as ImageIcon,
  Navigation,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const MOCK_ZONES = [
  { id: 'Z-001', name: 'ZONA NORTE - METROPOLITANO' },
  { id: 'Z-002', name: 'ZONA SUR - LURÍN INDUSTRIAL' },
  { id: 'Z-003', name: 'ZONA CENTRO - GAMARRA' },
];

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    address: '',
    creditLimit: '1000',
    segment: 'Minorista',
    zoneId: '',
  });

  const captureGps = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast.success('Ubicación capturada con éxito');
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        toast.error('No se pudo obtener la ubicación. Verifique los permisos.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoAction = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhoto(ev.target?.result as string);
          toast.success('Foto capturada');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.address || !formData.zoneId) {
      toast.error('Complete los campos obligatorios, incluyendo la Zona');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creditLimit: parseFloat(formData.creditLimit),
          currentBalance: 0,
          gps,
          photo,
        }),
      });

      if (res.ok) {
        toast.success('Cliente registrado exitosamente');
        navigate('/seller/customers');
      } else {
        toast.error('No se pudo registrar el cliente');
      }
    } catch (error) {
      toast.error('Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}
    >
      <div className="decorative-blur top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/10"></div>

      <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          {/* Capa base estática */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--app-bg) 70%, transparent) 0%, color-mix(in srgb, var(--app-bg) 92%, transparent) 100%)',
            }}
          />

          {/* Cabecera principal */}
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
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white transition-all active:scale-95"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                      background: 'color-mix(in srgb, var(--app-card) 55%, transparent)',
                    }}
                    title="Volver"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h2 className="text-base font-black italic tracking-tight text-white uppercase leading-none">
                    Nuevo Cliente
                  </h2>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300/70">
                    registro
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 inline-flex items-center gap-1.5 disabled:opacity-50"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--app-border) 85%, transparent)',
                      background: 'color-mix(in srgb, rgb(99 102 241 / 0.3) 70%, transparent)',
                      color: 'var(--app-fg)',
                    }}
                    title="Guardar"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin text-indigo-300" />
                    ) : (
                      <Save size={14} className="text-indigo-300" />
                    )}
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="flex-1 min-h-0 relative z-10 pt-4 px-4 flex flex-col overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto no-scrollbar min-h-0 overscroll-contain"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
            >
              <div className="space-y-6">
                {/* Identidad */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic border-l-2 border-indigo-500/30 pl-3">
                    Identidad Comercial
                  </h3>
                  <div className="space-y-3">
                    <div className="relative group">
                      <Building2
                        className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Nombre del Negocio *"
                        required
                        className="input-glass pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="relative group">
                      <User
                        className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Nombre del Contacto"
                        className="input-glass pl-10"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>
                    <div className="relative group">
                      <Phone
                        className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                        size={18}
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono móvil"
                        className="input-glass pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic border-l-2 border-emerald-500/30 pl-3">
                    Geolocalización
                  </h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input
                        type="text"
                        placeholder="Dirección Física *"
                        required
                        className="input-glass pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={captureGps}
                        disabled={isLocating}
                        className={cn(
                          'flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2',
                          gps
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        )}
                      >
                        {isLocating ? (
                          <RefreshCw size={24} className="animate-spin" />
                        ) : (
                          <MapPin size={24} />
                        )}
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-center leading-tight">
                          {gps
                            ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`
                            : 'Capturar GPS'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePhotoAction}
                        className={cn(
                          'flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2',
                          photo
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        )}
                      >
                        {photo ? (
                          <div className="relative">
                            <ImageIcon size={24} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
                          </div>
                        ) : (
                          <Camera size={24} />
                        )}
                        <span className="text-[10px] font-black uppercase italic tracking-widest">
                          Foto Fachada
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Crédito & Zona */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic border-l-2 border-orange-500/30 pl-3">
                    Condiciones & Territorio
                  </h3>
                  <div className="space-y-3">
                    <div className="relative group">
                      <Navigation className="absolute left-3 top-3.5 text-indigo-400" size={18} />
                      <select
                        required
                        className="input-glass pl-10 border-indigo-500/20"
                        value={formData.zoneId}
                        onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                      >
                        <option value="" className="bg-slate-900">
                          Seleccionar Zona Obligatoria *
                        </option>
                        {MOCK_ZONES.map((z) => (
                          <option key={z.id} value={z.id} className="bg-slate-900">
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative group">
                      <CreditCard
                        className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors"
                        size={18}
                      />
                      <input
                        type="number"
                        placeholder="Límite de Crédito Proyectado"
                        className="input-glass pl-10"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      />
                    </div>
                    <select
                      className="input-glass"
                      value={formData.segment}
                      onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    >
                      <option value="Minorista" className="bg-slate-900">
                        Segmento: Minorista
                      </option>
                      <option value="Mayorista" className="bg-slate-900">
                        Segmento: Mayorista
                      </option>
                      <option value="Premium" className="bg-slate-900">
                        Segmento: Premium
                      </option>
                    </select>
                  </div>
                </div>

                {/* Botón guardar dentro del formulario */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all text-xs border border-white/10 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw size={20} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Save size={20} className="stroke-[3]" />
                      <span>Guardar Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
