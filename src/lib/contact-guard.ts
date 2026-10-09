import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { MAX_FILL_MS, MIN_FILL_MS } from "@/lib/contact";
import { SITE } from "@/lib/site";

// Defensas del formulario de contacto que viven solo en el servidor (AS-5).
// Sin dependencias ni infraestructura nueva: firma con HMAC, verificación de Turnstile y un
// tope de envíos en memoria.

// ---------------------------------------------------------------------------------------------
// Sello de tiempo firmado: el servidor lo emite cuando se monta el formulario y lo comprueba al
// enviar. El tiempo de llenado se mide con el reloj del servidor, no con lo que mande el navegador.
// La clave se deriva de RESEND_API_KEY (sin ella el formulario no existe): no hace falta otra
// variable de entorno.
// ---------------------------------------------------------------------------------------------

function signingKey(): Buffer | null {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) return null;
  return createHmac("sha256", secret).update("datafud:contacto:sello:v1").digest();
}

function sign(issuedAt: string, key: Buffer): string {
  return createHmac("sha256", key).update(issuedAt).digest("base64url");
}

/** Emite un sello `<ms>.<firma>`; null si el formulario no está configurado. */
export function issueFormStamp(now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt, key)}`;
}

export type StampCheck = "ok" | "invalid" | "too-fast" | "expired" | "used";

/** Comprueba firma y tiempo transcurrido desde que se emitió el sello. */
export function checkFormStamp(stamp: unknown, now = Date.now()): StampCheck {
  const key = signingKey();
  if (!key || typeof stamp !== "string" || stamp.length > 128) return "invalid";
  const [issuedAt, mac, extra] = stamp.split(".");
  if (!issuedAt || !mac || extra !== undefined || !/^\d{10,16}$/.test(issuedAt)) return "invalid";
  const expected = Buffer.from(sign(issuedAt, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const elapsed = now - Number(issuedAt);
  if (elapsed < MIN_FILL_MS) return "too-fast";
  if (elapsed > MAX_FILL_MS) return "expired";
  if (usedStamps.has(stamp)) return "used";
  return "ok";
}

// Un sello sirve para un solo envío. Como el tope por IP, vive en la memoria de cada instancia
// (mejor esfuerzo): otra instancia de Vercel no sabe qué sellos se usaron, pero igual vencen a los
// 45 min y el tope por IP y Turnstile siguen en pie.
const usedStamps = new Map<string, number>();
const MAX_USED = 5_000;

/** Marca el sello como usado hasta que vence. */
export function consumeFormStamp(stamp: string, now = Date.now()): void {
  for (const [s, exp] of usedStamps) {
    if (exp > now && usedStamps.size < MAX_USED) break;
    usedStamps.delete(s);
  }
  const issuedAt = Number(stamp.split(".")[0]);
  usedStamps.set(stamp, issuedAt + MAX_FILL_MS);
}

// ---------------------------------------------------------------------------------------------
// Tope de envíos por IP. En Vercel cada instancia tiene su propia memoria y se recicla, así que
// es un freno de mejor esfuerzo, no una garantía: el tope firme va en el Firewall de Vercel.
// Sin IP conocida no se limita (degrada sin bloquear a nadie).
// ---------------------------------------------------------------------------------------------

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_TRACKED = 5_000;
const hits = new Map<string, number[]>();

/** true si la IP todavía puede enviar; registra el intento. */
export function allowContactAttempt(ip: string | null, now = Date.now()): boolean {
  if (!ip) return true;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.delete(ip);
  hits.set(ip, recent);
  // Memoria acotada: se suelta la IP más vieja (el Map conserva el orden de inserción).
  while (hits.size > MAX_TRACKED) {
    const oldest = hits.keys().next().value;
    if (oldest === undefined) break;
    hits.delete(oldest);
  }
  return true;
}

/** IP del visitante según el proxy de Vercel; null si no viene. */
export function clientIp(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || null;
}

// ---------------------------------------------------------------------------------------------
// Cloudflare Turnstile: verificación del token en el servidor, atada a nuestro dominio.
// ---------------------------------------------------------------------------------------------

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Dominios donde el formulario es legítimo: el sitio y su www, `datafud.vercel.app`, las vistas
 * previas del proyecto (terminan en el sufijo del equipo de Vercel, que nadie más puede usar), la
 * URL exacta de este despliegue y, fuera de producción, localhost.
 */
const SITE_HOST = new URL(SITE.url).hostname;
const TEAM_PREVIEW = /^datafud-[a-z0-9-]+-stevengalocrs-projects\.vercel\.app$/;

const hostOf = (url: string | undefined) => url?.trim().replace(/^https?:\/\//, "").split("/")[0] || null;

export function isAllowedHostname(hostname: string): boolean {
  const exact = new Set([SITE_HOST, `www.${SITE_HOST}`, "datafud.vercel.app"]);
  for (const env of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    const h = hostOf(env);
    if (h) exact.add(h);
  }
  if (process.env.NODE_ENV !== "production") {
    exact.add("localhost");
    exact.add("127.0.0.1");
  }
  return exact.has(hostname) || TEAM_PREVIEW.test(hostname);
}

/** Verifica el token contra siteverify. false ante token vacío, error de red, respuesta inválida u otro dominio. */
export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // sin secreto no se exige verificación
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body, cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    if (!data.hostname || !isAllowedHostname(data.hostname)) {
      console.info(`[contacto] Turnstile resuelto en otro dominio: ${data.hostname ?? "sin dominio"}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[contacto] Turnstile siteverify falló:", err);
    return false;
  }
}
