import type { ChargeKind, OrderStatus, TenantStatus } from "@/lib/supabase/types";

// Fuente de verdad de la línea de venta. Debe coincidir con la landing
// (src/components/marketing/v2/pricing-v2.tsx) y con las semillas de
// supabase/schema.sql. Si cambias un precio o límite, cámbialo en los tres.
// Los plazos y el hardware se documentan también en docs/MARKETING.md y docs/PRODUCT.md.

/** Precio publicado: número en USD o "PENDIENTE" (se muestra "Cotizá por WhatsApp"). */
export type PublishedPrice = number | "PENDIENTE";

export type PlanCode = "basico" | "estandar" | "empresarial";

export type Plan = {
  /** Nombre interno (coincide con la BD). */
  name: string;
  /** Nombre con el que se vende en la landing (Básico se vende como "Carta"). */
  marketingName: string;
  priceUsd: number;
  maxLanguages: number;
  maxProducts: number | null;
  /** Plazo prometido que muestra la landing. */
  deliveryLabel: string;
  /** Si el plan incluye pedidos desde la mesa (el plan Carta no). */
  tableOrdering: boolean;
};

export type HardwareItem = {
  code: "stand-qr-3d" | "tarjeta-nfc" | "stand-qr-3d-nfc" | "stand-resenas";
  name: string;
  /** Beneficio en una línea, para la landing. */
  benefit: string;
  /** "desde": precio base del modelo básico; "fijo": precio cerrado. */
  pricing: "desde" | "fijo";
  priceUsd: PublishedPrice;
  unit: "unidad";
  /** Foto real pendiente (TODO-FOTO): mientras tanto se usa una composición de marca. */
  photo: string | null;
};

export const PRICING = {
  setupFeeUsd: 249, // Implementación única llave en mano (pago único)
  nfcUnitUsd: 15, // Tarjeta NFC física por unidad (también en hardware)
  /** Plazos prometidos (decisión D-012): 48 h solo la carta; sistema completo en 15 días. */
  delivery: {
    menuHours: 48,
    fullSystemDays: 15,
  },
  plans: {
    basico: {
      name: "Básico",
      marketingName: "Carta",
      priceUsd: 29,
      maxLanguages: 1,
      maxProducts: 20,
      deliveryLabel: "Carta lista en 48 horas",
      tableOrdering: false,
    },
    estandar: {
      name: "Estándar",
      marketingName: "Estándar",
      priceUsd: 49,
      maxLanguages: 2,
      maxProducts: 70,
      deliveryLabel: "Sistema completo en 15 días",
      tableOrdering: true,
    },
    empresarial: {
      name: "Empresarial",
      marketingName: "Empresarial",
      priceUsd: 99,
      maxLanguages: 3,
      maxProducts: null,
      deliveryLabel: "Sistema completo en 15 días",
      tableOrdering: true,
    },
  } satisfies Record<PlanCode, Plan>,
  /** Hardware de mesa (decisión D-013). Precios base confirmados por Steven el 2026-09-19. */
  hardware: [
    {
      code: "stand-qr-3d",
      name: "Stand QR impreso en 3D",
      benefit: "Tu QR en relieve, en el color de tu marca y con tu logo. Se queda en la mesa sin arrugarse ni mancharse.",
      pricing: "desde",
      priceUsd: 12,
      unit: "unidad",
      photo: null, // TODO-FOTO: foto real del stand QR 3D
    },
    {
      code: "tarjeta-nfc",
      name: "Tarjeta NFC",
      benefit: "El comensal acerca el teléfono y la carta se abre sola. Sin cámara, sin apps.",
      pricing: "fijo",
      priceUsd: 15,
      unit: "unidad",
      photo: "/nfc.png",
    },
    {
      code: "stand-qr-3d-nfc",
      name: "Stand QR 3D + NFC",
      benefit: "El mismo stand con chip NFC adentro: escaneás o tocás, como prefiera cada cliente.",
      pricing: "desde",
      priceUsd: 20,
      unit: "unidad",
      photo: null, // TODO-FOTO: foto real del stand QR 3D + NFC
    },
    {
      code: "stand-resenas",
      name: "Stand de reseñas de Google",
      benefit: "QR y NFC que llevan al comensal directo a tu ficha de Google para dejar la reseña, sin buscar nada.",
      pricing: "desde",
      priceUsd: 20,
      unit: "unidad",
      photo: null, // TODO-FOTO: foto real del stand de reseñas
    },
  ] satisfies readonly HardwareItem[],
} as const;

export const PLAN_CODES = Object.keys(PRICING.plans) as PlanCode[];

/** Texto de precio para la landing: "$12" o "Cotizá por WhatsApp" si está pendiente. */
export function formatPublishedPrice(price: PublishedPrice, hasWhatsApp = true): string {
  if (price === "PENDIENTE") return hasWhatsApp ? "Cotizá por WhatsApp" : "Cotizá tu diseño";
  return `$${price}`;
}

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
