import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type PlanSlug = 'starter' | 'pro' | 'enterprise' | 'custom';

export type Plan = {
  id: string;
  name: string;
  slug: PlanSlug;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    users: number;
    products: number;
    ordersPerMonth: number;
    storageGb: number;
    warehouses: number;
  };
  active: boolean;
  trialDays: number;
  color: string;
};

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'churned' | 'pending';

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  country: string;
  city: string;
  industry: string;
  status: TenantStatus;
  planId: string;
  createdAt: string;
  trialEndsAt?: string;
  notes?: string;
  metrics?: {
    users: number;
    products: number;
    ordersThisMonth: number;
    storageGb: number;
  };
};

export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'paused';

export type Subscription = {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startedAt: string;
  renewsAt: string;
  cancelledAt?: string;
  mrr: number;
  seats: number;
  discount: number;
};

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded';

export type PlatformInvoice = {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  concept: string;
  cycle: BillingCycle;
};

type ProviderState = {
  plans: Plan[];
  tenants: Tenant[];
  subscriptions: Subscription[];
  invoices: PlatformInvoice[];
  session: { user: string; name: string } | null;
};

type ProviderActions = {
  signIn: (user: string, password: string) => boolean;
  signOut: () => void;
  upsertTenant: (t: Tenant) => void;
  removeTenant: (id: string) => void;
  upsertPlan: (p: Plan) => void;
  removePlan: (id: string) => void;
  upsertSubscription: (s: Subscription) => void;
  cancelSubscription: (id: string) => void;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  addInvoice: (inv: PlatformInvoice) => void;
};

const ProviderCtx = createContext<(ProviderState & ProviderActions) | null>(null);

const STORE_KEY = 'nexdist:provider:v1';
const SESSION_KEY = 'nexdist:provider:session';

const SEED_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    monthlyPrice: 89000,
    annualPrice: 890000,
    features: ['1 bodega', 'Hasta 3 usuarios', '500 productos', 'Soporte por email'],
    limits: { users: 3, products: 500, ordersPerMonth: 500, storageGb: 2, warehouses: 1 },
    active: true,
    trialDays: 14,
    color: 'indigo',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    slug: 'pro',
    monthlyPrice: 229000,
    annualPrice: 2290000,
    features: ['3 bodegas', 'Hasta 15 usuarios', '5.000 productos', 'App móvil', 'Soporte prioritario'],
    limits: { users: 15, products: 5000, ordersPerMonth: 5000, storageGb: 20, warehouses: 3 },
    active: true,
    trialDays: 14,
    color: 'cyan',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyPrice: 599000,
    annualPrice: 5990000,
    features: ['Bodegas ilimitadas', 'Usuarios ilimitados', 'Productos ilimitados', 'API dedicada', 'Soporte 24/7', 'Onboarding premium'],
    limits: { users: 999, products: 999999, ordersPerMonth: 999999, storageGb: 500, warehouses: 99 },
    active: true,
    trialDays: 30,
    color: 'fuchsia',
  },
];

const d = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  return x.toISOString();
};

const SEED_TENANTS: Tenant[] = [
  {
    id: 'tn-001',
    name: 'Distribuidora Los Andes',
    slug: 'losandes',
    adminName: 'Carlos Mejía',
    adminEmail: 'carlos@losandes.co',
    adminPhone: '+57 310 200 1122',
    country: 'Colombia',
    city: 'Bogotá',
    industry: 'Abarrotes',
    status: 'active',
    planId: 'plan-pro',
    createdAt: d(-120),
    metrics: { users: 8, products: 2400, ordersThisMonth: 1840, storageGb: 6.4 },
  },
  {
    id: 'tn-002',
    name: 'Market Express SAS',
    slug: 'marketexpress',
    adminName: 'Lucía Gómez',
    adminEmail: 'lucia@marketexpress.com',
    adminPhone: '+57 301 555 7788',
    country: 'Colombia',
    city: 'Medellín',
    industry: 'Minimarket',
    status: 'trial',
    planId: 'plan-starter',
    createdAt: d(-9),
    trialEndsAt: d(5),
    metrics: { users: 2, products: 180, ordersThisMonth: 42, storageGb: 0.4 },
  },
  {
    id: 'tn-003',
    name: 'Importadora del Pacífico',
    slug: 'pacifico',
    adminName: 'Ricardo Paz',
    adminEmail: 'ricardo@pacifico.pe',
    adminPhone: '+51 999 123 456',
    country: 'Perú',
    city: 'Lima',
    industry: 'Importaciones',
    status: 'active',
    planId: 'plan-enterprise',
    createdAt: d(-220),
    metrics: { users: 42, products: 18500, ordersThisMonth: 9600, storageGb: 120 },
  },
  {
    id: 'tn-004',
    name: 'Lácteos Cundi',
    slug: 'lacteoscundi',
    adminName: 'Ana Vargas',
    adminEmail: 'ana@lacteoscundi.co',
    adminPhone: '+57 320 444 3366',
    country: 'Colombia',
    city: 'Chía',
    industry: 'Lácteos',
    status: 'suspended',
    planId: 'plan-pro',
    createdAt: d(-85),
    metrics: { users: 6, products: 120, ordersThisMonth: 0, storageGb: 2.1 },
    notes: 'Suspendido por morosidad · contacto 12 abr',
  },
  {
    id: 'tn-005',
    name: 'Bodegas El Sol',
    slug: 'elsol',
    adminName: 'Mario Torres',
    adminEmail: 'mario@elsol.co',
    adminPhone: '+57 300 666 7788',
    country: 'Colombia',
    city: 'Cali',
    industry: 'Abarrotes',
    status: 'churned',
    planId: 'plan-starter',
    createdAt: d(-380),
    metrics: { users: 1, products: 90, ordersThisMonth: 0, storageGb: 0.2 },
    notes: 'Migró a competencia · mar 2026',
  },
  {
    id: 'tn-006',
    name: 'Snack Global SpA',
    slug: 'snackglobal',
    adminName: 'Paula Rivera',
    adminEmail: 'paula@snackglobal.cl',
    adminPhone: '+56 9 6644 2233',
    country: 'Chile',
    city: 'Santiago',
    industry: 'Snacks',
    status: 'pending',
    planId: 'plan-pro',
    createdAt: d(-1),
    notes: 'Onboarding agendado para próximo lunes',
  },
];

const SEED_SUBS: Subscription[] = [
  { id: 'sub-001', tenantId: 'tn-001', planId: 'plan-pro', status: 'active', billingCycle: 'monthly', startedAt: d(-120), renewsAt: d(12), mrr: 229000, seats: 8, discount: 0 },
  { id: 'sub-002', tenantId: 'tn-002', planId: 'plan-starter', status: 'trial', billingCycle: 'monthly', startedAt: d(-9), renewsAt: d(5), mrr: 0, seats: 2, discount: 0 },
  { id: 'sub-003', tenantId: 'tn-003', planId: 'plan-enterprise', status: 'active', billingCycle: 'annual', startedAt: d(-220), renewsAt: d(145), mrr: 499000, seats: 42, discount: 10 },
  { id: 'sub-004', tenantId: 'tn-004', planId: 'plan-pro', status: 'past_due', billingCycle: 'monthly', startedAt: d(-85), renewsAt: d(-12), mrr: 229000, seats: 6, discount: 0 },
  { id: 'sub-005', tenantId: 'tn-005', planId: 'plan-starter', status: 'cancelled', billingCycle: 'monthly', startedAt: d(-380), renewsAt: d(-40), cancelledAt: d(-30), mrr: 0, seats: 1, discount: 0 },
];

const SEED_INVOICES: PlatformInvoice[] = [
  { id: 'inv-2045', tenantId: 'tn-001', subscriptionId: 'sub-001', amount: 229000, status: 'paid', issuedAt: d(-30), dueAt: d(-15), paidAt: d(-14), concept: 'Renovación Pro mensual', cycle: 'monthly' },
  { id: 'inv-2046', tenantId: 'tn-003', subscriptionId: 'sub-003', amount: 5391000, status: 'paid', issuedAt: d(-220), dueAt: d(-205), paidAt: d(-204), concept: 'Enterprise anual (10% desc.)', cycle: 'annual' },
  { id: 'inv-2047', tenantId: 'tn-001', subscriptionId: 'sub-001', amount: 229000, status: 'pending', issuedAt: d(-2), dueAt: d(10), concept: 'Renovación Pro mensual', cycle: 'monthly' },
  { id: 'inv-2048', tenantId: 'tn-004', subscriptionId: 'sub-004', amount: 229000, status: 'overdue', issuedAt: d(-20), dueAt: d(-10), concept: 'Renovación Pro mensual', cycle: 'monthly' },
  { id: 'inv-2049', tenantId: 'tn-002', subscriptionId: 'sub-002', amount: 0, status: 'pending', issuedAt: d(-1), dueAt: d(5), concept: 'Conversión de trial a Starter', cycle: 'monthly' },
];

const DEFAULT_STATE: Omit<ProviderState, 'session'> = {
  plans: SEED_PLANS,
  tenants: SEED_TENANTS,
  subscriptions: SEED_SUBS,
  invoices: SEED_INVOICES,
};

export function ProviderContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<ProviderState, 'session'>>(DEFAULT_STATE);
  const [session, setSession] = useState<ProviderState['session']>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          plans: parsed.plans?.length ? parsed.plans : SEED_PLANS,
          tenants: parsed.tenants?.length ? parsed.tenants : SEED_TENANTS,
          subscriptions: parsed.subscriptions?.length ? parsed.subscriptions : SEED_SUBS,
          invoices: parsed.invoices?.length ? parsed.invoices : SEED_INVOICES,
        });
      }
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const actions: ProviderActions = useMemo(() => ({
    signIn: (user: string, password: string) => {
      if ((user === 'superadmin' || user === 'platform') && password === 'nexus2026') {
        const sess = { user, name: 'Super Admin · NexDist' };
        setSession(sess);
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch {}
        return true;
      }
      return false;
    },
    signOut: () => {
      setSession(null);
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    },
    upsertTenant: (t) => setState((s) => {
      const exists = s.tenants.some((x) => x.id === t.id);
      return { ...s, tenants: exists ? s.tenants.map((x) => x.id === t.id ? t : x) : [t, ...s.tenants] };
    }),
    removeTenant: (id) => setState((s) => ({
      ...s,
      tenants: s.tenants.filter((t) => t.id !== id),
      subscriptions: s.subscriptions.filter((sb) => sb.tenantId !== id),
      invoices: s.invoices.filter((i) => i.tenantId !== id),
    })),
    upsertPlan: (p) => setState((s) => {
      const exists = s.plans.some((x) => x.id === p.id);
      return { ...s, plans: exists ? s.plans.map((x) => x.id === p.id ? p : x) : [...s.plans, p] };
    }),
    removePlan: (id) => setState((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) })),
    upsertSubscription: (sub) => setState((s) => {
      const exists = s.subscriptions.some((x) => x.id === sub.id);
      return { ...s, subscriptions: exists ? s.subscriptions.map((x) => x.id === sub.id ? sub : x) : [sub, ...s.subscriptions] };
    }),
    cancelSubscription: (id) => setState((s) => ({
      ...s,
      subscriptions: s.subscriptions.map((x) => x.id === id ? { ...x, status: 'cancelled', cancelledAt: new Date().toISOString() } : x),
    })),
    pauseSubscription: (id) => setState((s) => ({
      ...s,
      subscriptions: s.subscriptions.map((x) => x.id === id ? { ...x, status: 'paused' } : x),
    })),
    resumeSubscription: (id) => setState((s) => ({
      ...s,
      subscriptions: s.subscriptions.map((x) => x.id === id ? { ...x, status: 'active' } : x),
    })),
    markInvoicePaid: (id) => setState((s) => ({
      ...s,
      invoices: s.invoices.map((i) => i.id === id ? { ...i, status: 'paid', paidAt: new Date().toISOString() } : i),
    })),
    addInvoice: (inv) => setState((s) => ({ ...s, invoices: [inv, ...s.invoices] })),
  }), []);

  const value = useMemo(() => ({ ...state, session, ...actions }), [state, session, actions]);

  return <ProviderCtx.Provider value={value}>{children}</ProviderCtx.Provider>;
}

export function useProvider() {
  const v = useContext(ProviderCtx);
  if (!v) throw new Error('useProvider must be used inside ProviderContextProvider');
  return v;
}

export const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  fuchsia: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  rose: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
};
