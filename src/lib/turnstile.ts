// Cloudflare Turnstile, OPCIONAL. Solo actúa si existen las dos variables:
//  - NEXT_PUBLIC_TURNSTILE_SITE_KEY (cliente: carga el widget)
//  - TURNSTILE_SECRET_KEY (servidor: verifica el token)
// Sin ellas, el formulario funciona igual que antes. Sin dependencias: script oficial + fetch.

export const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;
}

/** Turnstile está activo solo con clave pública y secreta presentes. */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}

/** Verifica el token contra siteverify. Devuelve false ante token vacío, error de red o respuesta inválida. */
export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // sin secreto no se exige verificación
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body, cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[contacto] Turnstile siteverify falló:", err);
    return false;
  }
}
