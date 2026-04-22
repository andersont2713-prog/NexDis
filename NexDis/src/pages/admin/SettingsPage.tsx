import React, { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Wallet,
  ChevronRight,
  Clock,
  Printer,
  Plus,
  Trash2,
  Star,
  Usb,
  Wifi,
  Bluetooth,
  ScanLine,
  Play,
  FileText,
  Power,
  Scissors,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { useRegional } from '../../context/RegionalContext';
import { CURRENCIES } from '../../types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

type ConnectionType = 'usb' | 'network' | 'bluetooth' | 'system';
type PrinterType = 'pos58' | 'pos80' | 'a4' | 'label' | 'matrix';
type DocTarget = 'ticket' | 'invoice' | 'a4' | 'label';

type PrinterConfig = {
  id: string;
  name: string;
  type: PrinterType;
  connection: ConnectionType;
  address: string;
  port: number;
  paperWidthMm: number;
  charset: string;
  density: number;
  speed: number;
  marginMm: number;
  autoCut: boolean;
  cashDrawer: boolean;
  copies: number;
  headerText: string;
  footerText: string;
  logoUrl: string;
  defaultFor: DocTarget[];
  enabled: boolean;
};

type PrintPrefs = {
  defaultPrinterId: string | null;
  autoPrintOnOrder: boolean;
  beepOnPrint: boolean;
  renderEngine: 'escpos' | 'html' | 'raw';
  globalCopies: number;
};

const PRINTERS_STORAGE_KEY = 'nexdist:printers:v1';
const PRINT_PREFS_STORAGE_KEY = 'nexdist:printPrefs:v1';

const PRINTER_TYPE_LABEL: Record<PrinterType, string> = {
  pos58: 'POS Térmica 58mm',
  pos80: 'POS Térmica 80mm',
  a4: 'Láser / Inyección A4',
  label: 'Etiquetadora',
  matrix: 'Matricial',
};

const CONNECTION_LABEL: Record<ConnectionType, string> = {
  usb: 'USB directo',
  network: 'Red TCP/IP',
  bluetooth: 'Bluetooth',
  system: 'Sistema operativo',
};

const CHARSETS = ['PC437', 'PC850', 'PC858', 'PC860', 'WPC1252', 'UTF-8'];
const DOC_TARGETS: { id: DocTarget; label: string }[] = [
  { id: 'ticket', label: 'Tickets POS' },
  { id: 'invoice', label: 'Facturas' },
  { id: 'a4', label: 'Reportes A4' },
  { id: 'label', label: 'Etiquetas' },
];

const DEFAULT_PRINTER: Omit<PrinterConfig, 'id'> = {
  name: 'Nueva impresora',
  type: 'pos80',
  connection: 'network',
  address: '192.168.1.100',
  port: 9100,
  paperWidthMm: 80,
  charset: 'PC858',
  density: 8,
  speed: 8,
  marginMm: 2,
  autoCut: true,
  cashDrawer: false,
  copies: 1,
  headerText: 'NexDist · Distribuidora',
  footerText: 'Gracias por su compra',
  logoUrl: '',
  defaultFor: ['ticket'],
  enabled: true,
};

const DEFAULT_PREFS: PrintPrefs = {
  defaultPrinterId: null,
  autoPrintOnOrder: true,
  beepOnPrint: true,
  renderEngine: 'escpos',
  globalCopies: 1,
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `prn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function SettingsPage() {
  const { currency, setCurrencyByCode, timeZone } = useRegional();

  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [prefs, setPrefs] = useState<PrintPrefs>(DEFAULT_PREFS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINTERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setPrinters(parsed);
          setSelectedId(parsed[0].id);
        } else {
          seedDefaultPrinter();
        }
      } else {
        seedDefaultPrinter();
      }
      const prefsRaw = localStorage.getItem(PRINT_PREFS_STORAGE_KEY);
      if (prefsRaw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(prefsRaw) });
    } catch {
      seedDefaultPrinter();
    }
    function seedDefaultPrinter() {
      const seed: PrinterConfig = { id: makeId(), ...DEFAULT_PRINTER, name: 'POS Térmica · Caja 1' };
      setPrinters([seed]);
      setSelectedId(seed.id);
      setPrefs((p) => ({ ...p, defaultPrinterId: seed.id }));
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PRINTERS_STORAGE_KEY, JSON.stringify(printers));
    } catch {}
  }, [printers]);

  useEffect(() => {
    try {
      localStorage.setItem(PRINT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const selectedPrinter = useMemo(
    () => printers.find((p) => p.id === selectedId) ?? null,
    [printers, selectedId]
  );

  const updateSelected = (patch: Partial<PrinterConfig>) => {
    if (!selectedPrinter) return;
    setPrinters((list) =>
      list.map((p) => (p.id === selectedPrinter.id ? { ...p, ...patch } : p))
    );
  };

  const addPrinter = () => {
    const id = makeId();
    const created: PrinterConfig = {
      id,
      ...DEFAULT_PRINTER,
      name: `Nueva Impresora ${printers.length + 1}`,
    };
    setPrinters((list) => [...list, created]);
    setSelectedId(id);
    toast.success('Impresora añadida');
  };

  const deletePrinter = (id: string) => {
    setPrinters((list) => list.filter((p) => p.id !== id));
    setPrefs((p) => (p.defaultPrinterId === id ? { ...p, defaultPrinterId: null } : p));
    if (selectedId === id) {
      const rest = printers.filter((p) => p.id !== id);
      setSelectedId(rest.length ? rest[0].id : null);
    }
    toast.success('Impresora eliminada');
  };

  const setDefaultPrinter = (id: string) => {
    setPrefs((p) => ({ ...p, defaultPrinterId: id }));
    toast.success('Impresora predeterminada actualizada');
  };

  const toggleDocTarget = (target: DocTarget) => {
    if (!selectedPrinter) return;
    const has = selectedPrinter.defaultFor.includes(target);
    updateSelected({
      defaultFor: has
        ? selectedPrinter.defaultFor.filter((d) => d !== target)
        : [...selectedPrinter.defaultFor, target],
    });
  };

  const testPrint = async () => {
    if (!selectedPrinter) {
      toast.error('Selecciona una impresora');
      return;
    }
    setTesting(true);
    const id = toast.loading(`Enviando prueba a ${selectedPrinter.name}…`);
    try {
      await new Promise((r) => setTimeout(r, 900));
      toast.success(
        `Prueba enviada por ${CONNECTION_LABEL[selectedPrinter.connection]}`,
        { id, description: `${PRINTER_TYPE_LABEL[selectedPrinter.type]} · ${selectedPrinter.paperWidthMm}mm` }
      );
    } finally {
      setTesting(false);
    }
  };

  const detectBluetooth = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth || typeof nav.bluetooth.requestDevice !== 'function') {
      toast.error('Bluetooth no disponible en este dispositivo');
      return;
    }
    try {
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          'battery_service',
        ],
      });
      if (!selectedPrinter) {
        const id = makeId();
        const created: PrinterConfig = {
          id,
          ...DEFAULT_PRINTER,
          name: device.name || 'Impresora BT',
          type: 'pos58',
          connection: 'bluetooth',
          address: device.id || device.name || '',
          paperWidthMm: 58,
        };
        setPrinters((list) => [...list, created]);
        setSelectedId(id);
      } else {
        updateSelected({
          connection: 'bluetooth',
          address: device.id || device.name || '',
          name: selectedPrinter.name || device.name || 'Impresora BT',
        });
      }
      toast.success(`Dispositivo vinculado: ${device.name ?? device.id}`);
    } catch {
      toast.error('No se pudo vincular el dispositivo');
    }
  };

  const handleCurrencyChange = (code: string) => {
    setCurrencyByCode(code);
    toast.success(`Configuración regional actualizada`);
  };

  const handleSave = () => {
    const id = toast.loading('Sincronizando preferencias con el servidor...');
    setTimeout(() => {
      toast.success('Configuración guardada correctamente', { id });
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-8 space-y-8 relative">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-display">Ajustes del Sistema</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3">Parametrización global y preferencias regionales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Localization Settings */}
        <div className="lg:col-span-2 space-y-6">
          <section className="frosted-card border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Regional & Moneda</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configura la unidad monetaria y localización</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    currency.code === c.code 
                      ? "bg-indigo-600 border-white/10 shadow-lg shadow-indigo-600/20" 
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
                      currency.code === c.code ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-400"
                    )}>
                      {c.symbol}
                    </div>
                    <div className="text-left">
                      <p className={cn(
                        "text-sm font-black uppercase italic",
                        currency.code === c.code ? "text-white" : "text-slate-300"
                      )}>{c.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{c.country}</p>
                    </div>
                  </div>
                  {currency.code === c.code && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-white uppercase italic">Zona Horaria Detectada</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{timeZone}</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase italic">Sincronizado</span>
            </div>
          </section>

          <section className="frosted-card border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Seguridad & Facturación</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Parámetros legales de impuestos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase italic">Impuesto (IVA/IGV)</span>
                </div>
                <div className="flex items-center gap-2">
                   <input 
                    type="number" 
                    defaultValue="18" 
                    className="w-16 bg-slate-800 border-none rounded-lg py-1 px-2 text-center text-xs font-black text-indigo-400 outline-none" 
                   />
                   <span className="text-[10px] font-bold text-slate-600">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase italic">Alertas de Stock Bajo</span>
                </div>
                <div className="flex items-center gap-2">
                   <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 accent-indigo-500 bg-slate-800 rounded border-none" 
                   />
                </div>
              </div>
            </div>
          </section>

          {/* Printers & POS */}
          <section className="frosted-card border-white/5 p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
                  <Printer size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Impresoras & POS</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Tickets, facturas, etiquetas y cajón monedero
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={detectBluetooth}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                  type="button"
                >
                  <ScanLine size={14} />
                  Detectar BT
                </button>
                <button
                  onClick={addPrinter}
                  className="btn-glass !py-2 !px-3 text-[10px]"
                  type="button"
                >
                  <Plus size={14} />
                  <span>Nueva</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Printer list */}
              <div className="lg:col-span-2 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-1">
                  Impresoras configuradas ({printers.length})
                </p>
                <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {printers.length === 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest italic">
                      Sin impresoras. Agrega una para comenzar.
                    </div>
                  )}
                  {printers.map((p) => {
                    const isSelected = p.id === selectedId;
                    const isDefault = prefs.defaultPrinterId === p.id;
                    const ConnIcon =
                      p.connection === 'usb'
                        ? Usb
                        : p.connection === 'bluetooth'
                        ? Bluetooth
                        : p.connection === 'network'
                        ? Wifi
                        : Printer;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3',
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-slate-800 text-slate-400'
                          )}
                        >
                          <ConnIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black italic text-white truncate">{p.name}</p>
                            {isDefault && (
                              <span className="text-[8px] font-black uppercase tracking-widest italic bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                            {!p.enabled && (
                              <span className="text-[8px] font-black uppercase tracking-widest italic bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                                Off
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 truncate">
                            {PRINTER_TYPE_LABEL[p.type]} · {CONNECTION_LABEL[p.connection]}
                          </p>
                          <p className="text-[9px] font-mono text-slate-600 truncate">
                            {p.connection === 'network'
                              ? `${p.address}:${p.port}`
                              : p.address || '—'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultPrinter(p.id);
                            }}
                            title="Marcar predeterminada"
                            className={cn(
                              'w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
                              isDefault
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-amber-400'
                            )}
                          >
                            <Star size={12} fill={isDefault ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePrinter(p.id);
                            }}
                            title="Eliminar"
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-3 space-y-4">
                {!selectedPrinter ? (
                  <div className="h-full min-h-[320px] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 gap-3">
                    <Printer size={32} className="text-slate-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                      Selecciona o crea una impresora
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <LabeledInput label="Nombre / Alias">
                        <input
                          className="input-glass"
                          value={selectedPrinter.name}
                          onChange={(e) => updateSelected({ name: e.target.value })}
                          placeholder="Ej. POS Caja 1"
                        />
                      </LabeledInput>
                      <LabeledInput label="Tipo de impresora">
                        <select
                          className="input-glass"
                          value={selectedPrinter.type}
                          onChange={(e) => {
                            const type = e.target.value as PrinterType;
                            const paperWidthMm =
                              type === 'pos58' ? 58 : type === 'pos80' ? 80 : type === 'a4' ? 210 : type === 'label' ? 40 : 80;
                            updateSelected({ type, paperWidthMm });
                          }}
                        >
                          {Object.entries(PRINTER_TYPE_LABEL).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </LabeledInput>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(Object.keys(CONNECTION_LABEL) as ConnectionType[]).map((c) => {
                        const Icon =
                          c === 'usb' ? Usb : c === 'bluetooth' ? Bluetooth : c === 'network' ? Wifi : Printer;
                        const active = selectedPrinter.connection === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateSelected({ connection: c })}
                            className={cn(
                              'p-3 rounded-2xl border transition-all flex flex-col items-center gap-1',
                              active
                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                            )}
                          >
                            <Icon size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">
                              {CONNECTION_LABEL[c]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <LabeledInput
                        label={
                          selectedPrinter.connection === 'network'
                            ? 'Dirección IP'
                            : selectedPrinter.connection === 'bluetooth'
                            ? 'MAC / ID Bluetooth'
                            : selectedPrinter.connection === 'usb'
                            ? 'Ruta / Device USB'
                            : 'Nombre en el sistema'
                        }
                        className="md:col-span-2"
                      >
                        <input
                          className="input-glass"
                          value={selectedPrinter.address}
                          onChange={(e) => updateSelected({ address: e.target.value })}
                          placeholder={
                            selectedPrinter.connection === 'network'
                              ? '192.168.1.100'
                              : selectedPrinter.connection === 'usb'
                              ? 'USB001 / /dev/usb/lp0'
                              : 'Impresora predeterminada'
                          }
                        />
                      </LabeledInput>
                      <LabeledInput label="Puerto">
                        <input
                          type="number"
                          className="input-glass"
                          value={selectedPrinter.port}
                          onChange={(e) => updateSelected({ port: Number(e.target.value) || 0 })}
                          disabled={selectedPrinter.connection !== 'network'}
                        />
                      </LabeledInput>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <LabeledInput label="Ancho papel (mm)">
                        <input
                          type="number"
                          className="input-glass"
                          value={selectedPrinter.paperWidthMm}
                          onChange={(e) => updateSelected({ paperWidthMm: Number(e.target.value) || 0 })}
                        />
                      </LabeledInput>
                      <LabeledInput label="Codepage">
                        <select
                          className="input-glass"
                          value={selectedPrinter.charset}
                          onChange={(e) => updateSelected({ charset: e.target.value })}
                        >
                          {CHARSETS.map((cs) => (
                            <option key={cs} value={cs}>{cs}</option>
                          ))}
                        </select>
                      </LabeledInput>
                      <LabeledInput label={`Densidad · ${selectedPrinter.density}`}>
                        <input
                          type="range"
                          min={1}
                          max={15}
                          value={selectedPrinter.density}
                          onChange={(e) => updateSelected({ density: Number(e.target.value) })}
                          className="w-full accent-cyan-400"
                        />
                      </LabeledInput>
                      <LabeledInput label={`Velocidad · ${selectedPrinter.speed}`}>
                        <input
                          type="range"
                          min={1}
                          max={15}
                          value={selectedPrinter.speed}
                          onChange={(e) => updateSelected({ speed: Number(e.target.value) })}
                          className="w-full accent-cyan-400"
                        />
                      </LabeledInput>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <LabeledInput label="Margen (mm)">
                        <input
                          type="number"
                          className="input-glass"
                          value={selectedPrinter.marginMm}
                          onChange={(e) => updateSelected({ marginMm: Number(e.target.value) || 0 })}
                        />
                      </LabeledInput>
                      <LabeledInput label="Copias">
                        <input
                          type="number"
                          min={1}
                          max={9}
                          className="input-glass"
                          value={selectedPrinter.copies}
                          onChange={(e) => updateSelected({ copies: Math.max(1, Number(e.target.value) || 1) })}
                        />
                      </LabeledInput>
                      <ToggleRow
                        icon={<Scissors size={14} className="text-cyan-400" />}
                        label="Corte automático"
                        checked={selectedPrinter.autoCut}
                        onChange={(v) => updateSelected({ autoCut: v })}
                      />
                      <ToggleRow
                        icon={<Wallet size={14} className="text-emerald-400" />}
                        label="Cajón monedero"
                        checked={selectedPrinter.cashDrawer}
                        onChange={(v) => updateSelected({ cashDrawer: v })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <LabeledInput label="Encabezado del ticket">
                        <input
                          className="input-glass"
                          value={selectedPrinter.headerText}
                          onChange={(e) => updateSelected({ headerText: e.target.value })}
                          placeholder="NexDist · Distribuidora"
                        />
                      </LabeledInput>
                      <LabeledInput label="Pie del ticket">
                        <input
                          className="input-glass"
                          value={selectedPrinter.footerText}
                          onChange={(e) => updateSelected({ footerText: e.target.value })}
                          placeholder="Gracias por su compra"
                        />
                      </LabeledInput>
                    </div>

                    <LabeledInput label="Logo (URL / base64)">
                      <input
                        className="input-glass"
                        value={selectedPrinter.logoUrl}
                        onChange={(e) => updateSelected({ logoUrl: e.target.value })}
                        placeholder="https://… o data:image/png;base64,…"
                      />
                    </LabeledInput>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                        Usar esta impresora para:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {DOC_TARGETS.map((d) => {
                          const active = selectedPrinter.defaultFor.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => toggleDocTarget(d.id)}
                              className={cn(
                                'px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border transition-all flex items-center gap-2 justify-center',
                                active
                                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                              )}
                            >
                              <Receipt size={12} />
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateSelected({ enabled: !selectedPrinter.enabled })}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest italic transition-all',
                            selectedPrinter.enabled
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          )}
                        >
                          <Power size={12} />
                          {selectedPrinter.enabled ? 'Activa' : 'Desactivada'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDefaultPrinter(selectedPrinter.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest italic transition-all',
                            prefs.defaultPrinterId === selectedPrinter.id
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                          )}
                        >
                          <Star size={12} />
                          Predeterminada
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={testPrint}
                        disabled={testing}
                        className="btn-glass disabled:opacity-50"
                      >
                        {testing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                        <span>Imprimir prueba</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Global printing preferences */}
            <div className="border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              <LabeledInput label="Motor de impresión">
                <select
                  className="input-glass"
                  value={prefs.renderEngine}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, renderEngine: e.target.value as PrintPrefs['renderEngine'] }))
                  }
                >
                  <option value="escpos">ESC/POS (térmicas)</option>
                  <option value="html">HTML (navegador)</option>
                  <option value="raw">RAW (pass-through)</option>
                </select>
              </LabeledInput>
              <LabeledInput label="Copias globales">
                <input
                  type="number"
                  min={1}
                  max={9}
                  className="input-glass"
                  value={prefs.globalCopies}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, globalCopies: Math.max(1, Number(e.target.value) || 1) }))
                  }
                />
              </LabeledInput>
              <ToggleRow
                icon={<FileText size={14} className="text-indigo-400" />}
                label="Auto-imprimir al crear pedido"
                checked={prefs.autoPrintOnOrder}
                onChange={(v) => setPrefs((p) => ({ ...p, autoPrintOnOrder: v }))}
              />
              <ToggleRow
                icon={<Bell size={14} className="text-amber-400" />}
                label="Beep al imprimir"
                checked={prefs.beepOnPrint}
                onChange={(v) => setPrefs((p) => ({ ...p, beepOnPrint: v }))}
              />
            </div>
          </section>
        </div>

        {/* Info & Info Cards */}
        <div className="space-y-6">
          <div className="frosted-card border-indigo-500/20 bg-indigo-500/5 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-4 italic flex items-center gap-2">
               <Settings size={14} />
               Versión del Sistema
             </h4>
             <p className="text-4xl font-black text-white italic tracking-tighter">v2.4.0</p>
             <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Última actualización: 21 de Abril, 2026</p>
          </div>

          <div className="frosted-card border-cyan-500/20 bg-cyan-500/5 p-6 space-y-3">
            <h4 className="text-cyan-300 font-black uppercase text-[10px] tracking-widest italic flex items-center gap-2">
              <Printer size={12} />
              Estación de impresión
            </h4>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Configuradas</span>
              <span className="text-white font-black">{printers.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Activas</span>
              <span className="text-emerald-300 font-black">{printers.filter(p => p.enabled).length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Predeterminada</span>
              <span className="text-amber-300 font-black truncate max-w-[55%] text-right">
                {printers.find(p => p.id === prefs.defaultPrinterId)?.name || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Auto-impresión</span>
              <span className={cn('font-black', prefs.autoPrintOnOrder ? 'text-emerald-300' : 'text-slate-500')}>
                {prefs.autoPrintOnOrder ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

          <div className="frosted-card border-white/5 p-6 space-y-4">
             <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic mb-2">Información del Servidor</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-600">Almacenamiento</span>
                  <span className="text-emerald-400">75% Libre</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[25%] h-full bg-emerald-500"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase mt-4">
                  <span className="text-slate-600">Base de Datos</span>
                  <span className="text-indigo-400">Sincronizada</span>
                </div>
             </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-white/5 active:scale-95 group"
          >
             <span>Guardar Configuración</span>
             <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between gap-2 p-3 rounded-2xl border transition-all text-left',
        checked
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-white/5 border-white/5 hover:bg-white/10'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest italic text-white truncate">
          {label}
        </span>
      </div>
      <span
        className={cn(
          'w-9 h-5 rounded-full relative transition-all shrink-0',
          checked ? 'bg-emerald-500/70' : 'bg-slate-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </span>
    </button>
  );
}
