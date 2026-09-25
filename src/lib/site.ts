// Datos de contacto y de marca de DataFud, en un solo lugar.
// Los valores vienen de la CONFIG de Steven (docs/plans/landing-loop-state.md).
// Regla: nunca inventar un dato. Lo que no se sabe va como "PENDIENTE" con TODO-STEVEN
// y la interfaz degrada sin enlaces rotos.

export const SITE = {
  name: "DataFud",
  url: "https://datafud.com",
  maker: "GaloDev",
  // Responsable legal (D-027). No se publica cédula ni dirección exacta: el repo es público.
  legalName: "GaloDev",
  owner: "Steven Galo",
  legalResponsible: "Steven Galo, que opera bajo el nombre comercial GaloDev",
  country: "Costa Rica",
  region: "Costa Rica",
  // Formato internacional sin "+", como lo exige wa.me.
  whatsapp: "50672874779",
  // Destino interno de los leads del formulario (D-039). NUNCA se renderiza: el único canal
  // público de DataFud es WhatsApp. No agregar enlaces mailto ni mostrarlo en ninguna página.
  leadsEmail: "galodevcr@gmail.com",
  // Redes de la marca: vacías hasta que existan. El footer muestra solo las que tengan URL.
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  } as Record<"instagram" | "facebook" | "tiktok", string>,
  // Fundador. La foto se usa solo si el archivo existe en public/; si no, avatar con iniciales.
  founder: {
    name: "Steven Galo",
    initials: "SG",
    role: "Ingeniero en sistemas, en Costa Rica",
    photo: "/equipo/steven.webp",
  },
} as const;

export const SOCIAL_LABEL: Record<keyof typeof SITE.social, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

/** Redes con URL cargada, en orden. */
export function socialLinks(): { key: keyof typeof SITE.social; label: string; href: string }[] {
  return (Object.keys(SITE.social) as (keyof typeof SITE.social)[])
    .filter((k) => /^https:\/\//.test(SITE.social[k]))
    .map((k) => ({ key: k, label: SOCIAL_LABEL[k], href: SITE.social[k] }));
}

/** Lugares de la landing desde donde se abre WhatsApp. Sirve para el mensaje y la analítica. */
export type WaOrigin =
  | "nav"
  | "hero"
  | "flotante"
  | "hardware"
  | "demo"
  | "implementacion"
  | "confianza"
  | "preguntas"
  | "contacto"
  | "cierre"
  | "footer"
  | "plan-basico"
  | "plan-estandar"
  | "plan-empresarial"
  | "fundadores"
  | "guia-costa-rica"
  | "guia-sodas"
  | "guia-turisticos";

/** Mensaje prellenado por origen. Español de Latam, voseo natural, sin promesas. */
export const WA_MESSAGES: Record<WaOrigin, string> = {
  nav: "Hola, vengo de datafud.com y quiero saber más del menú digital.",
  hero: "Hola, vi datafud.com y quiero la Carta digital con QR para mi local. ¿Cómo empezamos?",
  flotante: "Hola, estoy viendo datafud.com y tengo una consulta.",
  hardware: "Hola, quiero cotizar hardware de mesa (stands QR 3D / NFC) para mi local.",
  demo: "Hola, probé la demo de datafud.com y quiero una carta así para mi local.",
  implementacion: "Hola, quiero saber cómo sería la implementación de DataFud en mi local.",
  confianza: "Hola, tengo unas preguntas sobre DataFud antes de decidirme.",
  preguntas: "Hola, tengo una pregunta que no encontré en las preguntas frecuentes de datafud.com.",
  contacto: "Hola, quiero hablar con alguien de DataFud sobre mi local.",
  cierre: "Hola, quiero llevar la carta de mi local a DataFud. ¿Cómo empezamos?",
  footer: "Hola, vengo de datafud.com y quiero más información.",
  "plan-basico": "Hola, me interesa el plan Carta de DataFud para mi local.",
  fundadores: "Hola, quiero uno de los cupos de fundadores de DataFud para mi local.",
  "plan-estandar": "Hola, me interesa el plan Estándar de DataFud para mi local.",
  "plan-empresarial": "Hola, me interesa el plan Empresarial de DataFud para mi local.",
  "guia-costa-rica": "Hola, leí la guía de menú digital en Costa Rica de datafud.com y quiero cotizar para mi local.",
  "guia-sodas": "Hola, tengo una soda y quiero la carta digital con QR de DataFud. ¿Cómo empezamos?",
  "guia-turisticos": "Hola, tengo un restaurante con clientes turistas y quiero la carta en español e inglés de DataFud.",
};

/** Ancla de la sección de contacto: el destino de todo CTA cuando falta WhatsApp. */
export const CONTACT_ANCHOR = "#contacto";

export function hasWhatsApp(): boolean {
  return /^\d{8,15}$/.test(SITE.whatsapp);
}

/** Número con formato legible para mostrar: "+506 7287 4779". */
export function whatsappDisplay(): string {
  if (!hasWhatsApp()) return "";
  const n = SITE.whatsapp;
  if (n.startsWith("506") && n.length === 11) {
    return `+506 ${n.slice(3, 7)} ${n.slice(7)}`;
  }
  return `+${n}`;
}

/**
 * Enlace a WhatsApp con el mensaje codificado. Si el mensaje viene vacío se usa el del
 * origen. Sin número configurado devuelve "#contacto": nunca un enlace roto.
 */
export function waLink(message: string, origin: WaOrigin): string {
  if (!hasWhatsApp()) return CONTACT_ANCHOR;
  const text = (message || WA_MESSAGES[origin]).trim();
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Props listas para un <a> de WhatsApp: href, pestaña nueva y origen para analítica. */
export function waProps(origin: WaOrigin, message = WA_MESSAGES[origin]) {
  const href = waLink(message, origin);
  const external = href !== CONTACT_ANCHOR;
  return {
    href,
    target: external ? ("_blank" as const) : undefined,
    rel: external ? ("noopener noreferrer" as const) : undefined,
    "data-wa-origin": origin,
  };
}

/**
 * Meta Pixel opcional (V09). Solo se carga si NEXT_PUBLIC_META_PIXEL_ID tiene un ID numérico.
 * Sin la variable no se descarga nada de facebook.net ni se crea window.fbq.
 */
export function metaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id && /^\d{6,20}$/.test(id) ? id : null;
}

export function isPixelEnabled(): boolean {
  return metaPixelId() !== null;
}
