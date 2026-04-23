import { useEffect, useState, type ReactNode } from 'react';
import {
  Hexagon,
  Copy,
  RefreshCw,
  Shield,
  Globe,
  Bell,
  Zap,
  Key,
  Mail,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

type PlatformSettings = {
  brandName: string;
  brandDomain: string;
  supportEmail: string;
  apiKey: string;
  webhookUrl: string;
  notifyNewSignup: boolean;
  notifyPaymentFailed: boolean;
  notifyChurn: boolean;
  autoBillingEnabled: boolean;
  trialRemindersEnabled: boolean;
};

const STORAGE_KEY = 'nexdist:provider:settings';

const DEFAULT: PlatformSettings = {
  brandName: 'NexDist',
  brandDomain: 'nexdist.app',
  supportEmail: 'soporte@nexdist.app',
  apiKey: 'nxd_live_•••••••••••••••••',
  webhookUrl: 'https://api.nexdist.app/webhooks/platform',
  notifyNewSignup: true,
  notifyPaymentFailed: true,
  notifyChurn: true,
  autoBillingEnabled: true,
  trialRemindersEnabled: true,
};

const generateKey = () =>
  'nxd_live_' + Array.from({ length: 24 }).map(() => Math.random().toString(36)[2]).join('');

export default function ProviderSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('Ajustes guardados');
    } catch {
      toast.error('No se pudieron guardar los ajustes');
    }
  };

  const regenKey = () => {
    const key = generateKey();
    setSettings((s) => ({ ...s, apiKey: key }));
    toast.success('API Key regenerada · guarda los cambios');
  };

  const copy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copiado`);
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 pt-2 space-y-6 relative z-10">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1 font-display">
            Ajustes
          </h2>
          <p className="text-slate-400 font-medium border-l-2 border-fuchsia-500/30 pl-4 py-1">
            Branding del SaaS, claves de API y preferencias del operador.
          </p>
        </div>
        <button
          onClick={save}
          className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/40 transition-all flex items-center gap-2"
        >
          <Save size={14} />
          <span>Guardar</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 frosted-card border-white/5 p-6 space-y-5">
            <header className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center">
                <Hexagon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Marca & Branding</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Datos públicos de la plataforma
                </p>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nombre comercial">
                <input className="input-glass" value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} />
              </Field>
              <Field label="Dominio principal">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <span className="px-3 text-[10px] text-slate-500 font-black uppercase tracking-widest italic border-r border-white/5">
                    https://
                  </span>
                  <input
                    className="bg-transparent px-3 py-2 text-sm text-white font-mono flex-1 outline-none"
                    value={settings.brandDomain}
                    onChange={(e) => setSettings({ ...settings, brandDomain: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="Email de soporte">
                <input className="input-glass" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
              </Field>
              <Field label="URL de webhook">
                <input className="input-glass" value={settings.webhookUrl} onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} />
              </Field>
            </div>
          </section>

          <section className="frosted-card border-fuchsia-500/20 bg-fuchsia-500/5 p-6 space-y-4">
            <header className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center">
                <Key size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">API Key</h3>
                <p className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">
                  Clave privada del operador
                </p>
              </div>
            </header>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-fuchsia-200 text-xs font-mono outline-none"
                  type={showKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => copy(settings.apiKey, 'API Key')}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
                >
                  <Copy size={14} />
                </button>
              </div>
              <button
                onClick={regenKey}
                className="w-full px-3 py-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest italic hover:bg-fuchsia-500/20 flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} /> Regenerar clave
              </button>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic text-fuchsia-300 pt-1">
                <ShieldCheck size={10} />
                Cifrado AES-256 · rota cada 90 días
              </div>
            </div>
          </section>
        </div>

        <section className="frosted-card border-white/5 p-6 space-y-5">
          <header className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Notificaciones del Operador</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Eventos que disparan correos y webhooks
              </p>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle
              icon={<Zap size={14} className="text-emerald-300" />}
              label="Nuevo registro de empresa"
              description="Recibe email cuando una empresa se da de alta"
              checked={settings.notifyNewSignup}
              onChange={(v) => setSettings({ ...settings, notifyNewSignup: v })}
            />
            <Toggle
              icon={<Shield size={14} className="text-amber-300" />}
              label="Pago fallido"
              description="Alerta inmediata al fallar un cobro"
              checked={settings.notifyPaymentFailed}
              onChange={(v) => setSettings({ ...settings, notifyPaymentFailed: v })}
            />
            <Toggle
              icon={<Globe size={14} className="text-rose-300" />}
              label="Cancelación (churn)"
              description="Notifícame cuando una empresa se cancele"
              checked={settings.notifyChurn}
              onChange={(v) => setSettings({ ...settings, notifyChurn: v })}
            />
            <Toggle
              icon={<Mail size={14} className="text-fuchsia-300" />}
              label="Recordatorios de trial"
              description="Emails automáticos 3/1/0 días antes del fin de trial"
              checked={settings.trialRemindersEnabled}
              onChange={(v) => setSettings({ ...settings, trialRemindersEnabled: v })}
            />
          </div>
        </section>

        <section className="frosted-card border-white/5 p-6 space-y-4">
          <header className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Automatización de Cobro</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Genera facturas y cobros automáticos al renovar suscripciones
              </p>
            </div>
          </header>
          <Toggle
            icon={<RefreshCw size={14} className="text-emerald-300" />}
            label="Cobro automático en renovación"
            description="Genera factura y ejecuta cobro del método de pago del tenant"
            checked={settings.autoBillingEnabled}
            onChange={(v) => setSettings({ ...settings, autoBillingEnabled: v })}
          />
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'p-4 rounded-2xl border text-left transition-all flex items-start gap-3',
        checked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
      )}
    >
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase italic tracking-tighter text-white truncate">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium">{description}</p>
      </div>
      <span
        className={cn(
          'w-9 h-5 rounded-full relative transition-all shrink-0 mt-1',
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
