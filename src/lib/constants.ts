import type { OrderStatus, TenantStatus } from "@/lib/supabase/types";

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
