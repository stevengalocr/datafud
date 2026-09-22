import type { ChargeKind, OrderStatus, TenantStatus } from "@/lib/supabase/types";

// Fuente de verdad de la línea de venta. Debe coincidir con la landing
// (src/components/marketing/v2/pricing-v2.tsx) y con las semillas de
// supabase/schema.sql. Si cambias un precio o límite, cámbialo en los tres.
// Los plazos y el hardware se documentan también en docs/MARKETING.md y docs/PRODUCT.md.

/** Precio publicado: número en USD o "PENDIENTE" (se muestra "Cotizá por WhatsApp"). */
export type PublishedPrice = number | "PENDIENTE";

export type PlanCode = "basico" | "estandar" | "empresarial";

/** Tipo de implementación: la Carta es un montaje corto; el sistema incluye pedidos y panel. */
export type SetupKind = "carta" | "sistema";

/** Monto doble: USD es la moneda interna y de la BD; CRC es lo que ve primero un cliente tico. */
export type Money = { usd: number; crc: number };

export type Plan = {
  /** Nombre interno (coincide con la BD). */
  name: string;
  /** Nombre con el que se vende en la landing (Básico se vende como "Carta"). */
  marketingName: string;
  priceUsd: number;
  /** Mensualidad en colones que se muestra primero (decisión D-023). */
  priceCrc: number;
  maxLanguages: number;
  /** Idiomas incluidos, en texto corto para la landing. */
  languagesLabel: string;
  maxProducts: number | null;
  /** Topes que hace cumplir la BD (triggers de schema.sql); null = sin límite. */
  maxCategories: number | null;
  maxTables: number | null;
  /** Plazo prometido que muestra la landing. */
  deliveryLabel: string;
  /** Si el plan incluye pedidos desde la mesa (el plan Carta no). */
  tableOrdering: boolean;
  /** Qué implementación le corresponde. */
  setup: SetupKind;
};

export type HardwareItem = {
  code: "stand-qr-3d" | "tarjeta-nfc" | "stand-qr-3d-nfc" | "stand-resenas";
  name: string;
  /** Beneficio en una línea, para la landing. */
  benefit: string;
  /** "desde": precio base del modelo básico; "fijo": precio cerrado. */
  pricing: "desde" | "fijo";
  /** Referencia secundaria en dólares. */
  priceUsd: PublishedPrice;
  /** Precio en colones que se muestra primero. */
  priceCrc: number;
  unit: "unidad";
  /** Render o foto del producto. `photoIsRender` = true muestra la etiqueta "Render ilustrativo". */
  photo: string | null;
  photoIsRender: boolean;
};

const SETUP_FEE = {
  carta: { usd: 49, crc: 24900 },
  sistema: { usd: 249, crc: 125000 },
} as const satisfies Record<SetupKind, Money>;

export const PRICING = {
  /** Implementación por tipo, pago único (D-023). La Carta ya no paga la del sistema. */
  setupFee: SETUP_FEE,
  /** Alias que usa el panel de cargos del super admin: implementación del sistema completo. */
  setupFeeUsd: SETUP_FEE.sistema.usd,
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
      priceCrc: 14900,
      maxLanguages: 2,
      languagesLabel: "Español e inglés",
      maxProducts: 60,
      maxCategories: 5,
      maxTables: 8,
      deliveryLabel: "Carta lista en 48 horas",
      tableOrdering: false,
      setup: "carta",
    },
    estandar: {
      name: "Estándar",
      marketingName: "Estándar",
      priceUsd: 49,
      priceCrc: 24900,
      maxLanguages: 2,
      languagesLabel: "Español e inglés",
      maxProducts: 150,
      maxCategories: 20,
      maxTables: 30,
      deliveryLabel: "Sistema completo en 15 días",
      tableOrdering: true,
      setup: "sistema",
    },
    empresarial: {
      name: "Empresarial",
      marketingName: "Empresarial",
      priceUsd: 99,
      priceCrc: 49900,
      maxLanguages: 3,
      languagesLabel: "Español, inglés y portugués",
      maxProducts: null,
      maxCategories: null,
      maxTables: null,
      deliveryLabel: "Sistema completo en 15 días",
      tableOrdering: true,
      setup: "sistema",
    },
  } satisfies Record<PlanCode, Plan>,
  /** Pago anual de la Carta: 2 meses gratis y la implementación de la Carta incluida. */
  annualCarta: { usd: 290, crc: 149000 },
  /** Oferta de fundadores (D-024). Steven la apaga con `enabled: false` al llenarse. */
  founderOffer: {
    enabled: true,
    spots: 10,
    text: "Primeros 10 locales: implementación de la Carta sin costo y 1 stand QR 3D incluido, a cambio de dejarnos mostrar tu local como caso.",
    short: "Primeros 10 locales: implementación de la Carta sin costo",
  },
  /** Textos de la oferta que se repiten en planes, FAQ y legales (D-025). */
  terms: {
    guarantee48h:
      "Si tu carta no está publicada en 48 horas hábiles desde que recibimos menú, fotos y logo, no pagás la implementación.",
    /** Cómo se aplica la garantía si la implementación ya se pagó (se paga al aprobar la propuesta). */
    guaranteeRefund: "Si ya la pagaste, te la devolvemos completa.",
    support: "Soporte por WhatsApp incluido mientras tengás el plan activo",
    menuChanges: "Cambios de precios y platillos por WhatsApp incluidos en todos los planes",
    permanence: "Sin contrato de permanencia: cancelás con 15 días de aviso por WhatsApp o correo.",
    noticeDays: 15,
  },
  /** Hardware de mesa (decisión D-013). CRC primero desde 2026-09-22 (D-023); USD de referencia. */
  hardware: [
    {
      code: "stand-qr-3d",
      name: "Stand QR impreso en 3D",
      benefit: "Tu QR en relieve, en el color de tu marca y con tu logo. Se queda en la mesa sin arrugarse ni mancharse.",
      pricing: "desde",
      priceUsd: 12,
      priceCrc: 6000,
      unit: "unidad",
      photo: "/stand-qr-3d.webp",
      photoIsRender: true,
    },
    {
      code: "tarjeta-nfc",
      name: "Tarjeta NFC",
      benefit: "El comensal acerca el teléfono y la carta se abre sola. Sin cámara, sin apps.",
      pricing: "fijo",
      priceUsd: 15,
      priceCrc: 7500,
      unit: "unidad",
      photo: "/nfc.png",
      photoIsRender: true,
    },
    {
      code: "stand-qr-3d-nfc",
      name: "Stand QR 3D + NFC",
      benefit: "El mismo stand con chip NFC adentro: escaneás o tocás, como prefiera cada cliente.",
      pricing: "desde",
      priceUsd: 20,
      priceCrc: 10000,
      unit: "unidad",
      photo: "/stand-qr-3d-nfc.webp",
      photoIsRender: true,
    },
    {
      code: "stand-resenas",
      name: "Stand de reseñas de Google",
      benefit: "QR y NFC que llevan al comensal directo a tu ficha de Google para dejar la reseña, sin buscar nada.",
      pricing: "desde",
      priceUsd: 20,
      priceCrc: 10000,
      unit: "unidad",
      photo: "/stand-resenas.webp",
      photoIsRender: true,
    },
  ] satisfies readonly HardwareItem[],
  /** Entrega del hardware (D-023): sin mínimo, gratis en la GAM, Correos fuera. */
  hardwareDelivery: {
    minimum: "Sin pedido mínimo: desde 1 unidad.",
    custom: "Diseño 100 % personalizado (forma, colores, logo) se cotiza por WhatsApp.",
    gam: "Entrega gratis en la GAM, en persona.",
    outside: "Fuera de la GAM, envío por Correos de Costa Rica con el costo de la tarifa, que se cotiza por WhatsApp.",
    leadTime: "de 3 a 5 días hábiles",
  },
} as const;

/**
 * Testimonios reales. Lista vacía = la sección no se renderiza. Nunca se inventa uno: cada
 * entrada necesita permiso por escrito del local (ver docs/MARKETING.md, "Cómo cargar un testimonio").
 */
export type Testimonial = {
  business: string;
  person: string;
  city: string;
  quote: string;
  /** Foto propia del local en public/clientes/, o null. */
  photo: string | null;
};

export const TESTIMONIALS: readonly Testimonial[] = [];

export const PLAN_CODES = Object.keys(PRICING.plans) as PlanCode[];

/** Hardware por código (no por posición en el arreglo). */
export function hardwareBy(code: HardwareItem["code"]): HardwareItem {
  const item = PRICING.hardware.find((h) => h.code === code);
  if (!item) throw new Error(`Hardware desconocido: ${code}`);
  return item;
}

/** "Hasta 5 categorías y 8 mesas con QR" o "Categorías y mesas sin límite". */
export function tablesLabel(code: PlanCode): string {
  const p = PRICING.plans[code];
  if (p.maxCategories === null && p.maxTables === null) return "Categorías y mesas sin límite";
  return `Hasta ${p.maxCategories} categorías y ${p.maxTables} mesas con QR`;
}

/** Límites del plan en una línea: "60 platillos · 5 categorías · 8 mesas con QR". */
export function limitsLabel(code: PlanCode): string {
  const p = PRICING.plans[code];
  if (p.maxProducts === null) return "Platillos, categorías y mesas sin límite";
  return `${p.maxProducts} platillos · ${p.maxCategories} categorías · ${p.maxTables} mesas con QR`;
}

/** Total del primer año pagando mes a mes: implementación + 12 mensualidades. */
export function firstYearMonthly(code: PlanCode): Money {
  const setup = setupFeeFor(code);
  const p = PRICING.plans[code];
  return { usd: setup.usd + 12 * p.priceUsd, crc: setup.crc + 12 * p.priceCrc };
}

/** Implementación que le toca a un plan. */
export function setupFeeFor(code: PlanCode): Money {
  return PRICING.setupFee[PRICING.plans[code].setup];
}

/** Primer pago de un plan: implementación + primer mes (para que no haya sorpresas). */
export function firstPaymentFor(code: PlanCode): Money {
  const setup = setupFeeFor(code);
  const plan = PRICING.plans[code];
  return { usd: setup.usd + plan.priceUsd, crc: setup.crc + plan.priceCrc };
}

/** Texto de precio en USD de referencia: "US$12" o "Cotizá por WhatsApp" si está pendiente. */
export function formatPublishedPrice(price: PublishedPrice, hasWhatsApp = true): string {
  if (price === "PENDIENTE") return hasWhatsApp ? "Cotizá por WhatsApp" : "Cotizá tu diseño";
  return `US$${price}`;
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
