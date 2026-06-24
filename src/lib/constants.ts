import type { ChargeKind, OrderStatus, TenantStatus } from "@/lib/supabase/types";

// Fuente de verdad de la línea de venta. Debe coincidir con la landing
// (src/components/marketing/v2/pricing-v2.tsx) y con las semillas de
// supabase/schema.sql. Si cambias un precio o límite, cámbialo en los tres.
export const PRICING = {
  setupFeeUsd: 249, // Implementación única llave en mano (pago único)
  nfcUnitUsd: 15, // Tarjeta NFC física por unidad
  trialDays: 30,
  plans: {
    basico: { name: "Básico", priceUsd: 29, maxLanguages: 1, maxProducts: 20 },
    estandar: { name: "Estándar", priceUsd: 49, maxLanguages: 2, maxProducts: 70 },
    empresarial: { name: "Empresarial", priceUsd: 99, maxLanguages: 3, maxProducts: null },
  },
} as const;

export const CHARGE_KIND_LABEL: Record<ChargeKind, string> = {
  implementation: "Implementación única",
  nfc_cards: "Tarjetas NFC",
  other: "Otro cargo",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "En preparación",
  ready: "Lista",
  delivered: "Entregada",
  paid: "Pagada",
  cancelled: "Cancelada",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  paid: "bg-brand-100 text-brand-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export const TENANT_STATUS_LABEL: Record<TenantStatus, string> = {
  trial: "Prueba",
  active: "Activo",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

export const TENANT_STATUS_COLOR: Record<TenantStatus, string> = {
  trial: "bg-blue-100 text-blue-800",
  active: "bg-brand-100 text-brand-800",
  suspended: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export const LANG_LABEL: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};
