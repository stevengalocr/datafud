"use client";

import { track } from "@vercel/analytics";

// Eventos de conversión con UTMs. Un solo punto de salida hacia Vercel Web Analytics y, si está
// cargado, el píxel de Meta. Sin variables ni scripts, cada llamada degrada a nada sin errores.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_KEY = "datafud_utm";

type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;
type Props = Record<string, string>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Guarda en sessionStorage los utm_* de la URL de entrada (si vienen). */
export function captureUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k)?.trim().slice(0, 80);
      if (v) utm[k] = v;
    }
    if (Object.keys(utm).length) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Almacenamiento bloqueado o URL rara: seguimos sin UTMs.
  }
}

function storedUtm(): Utm {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return {};
    const utm: Utm = {};
    for (const k of UTM_KEYS) {
      const v = (parsed as Record<string, unknown>)[k];
      if (typeof v === "string") utm[k] = v;
    }
    return utm;
  } catch {
    return {};
  }
}

/** Evento estándar de Meta que corresponde a cada evento propio. */
const META_EVENT: Record<string, string> = {
  whatsapp_click: "Lead",
  contact_submit_ok: "Lead",
  demo_open: "ViewContent",
};

export function trackEvent(name: "whatsapp_click" | "demo_open" | "contact_submit", props: Props): void {
  const all = { ...props, ...storedUtm() };
  track(name, all);
  const metaKey = name === "contact_submit" ? (props.resultado === "ok" ? "contact_submit_ok" : "") : name;
  const metaEvent = META_EVENT[metaKey];
  if (metaEvent && typeof window.fbq === "function") window.fbq("track", metaEvent, all);
}
