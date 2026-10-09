// Cloudflare Turnstile, OPCIONAL. Solo actúa si existen las dos variables:
//  - NEXT_PUBLIC_TURNSTILE_SITE_KEY (cliente: carga el widget)
//  - TURNSTILE_SECRET_KEY (servidor: verifica el token)
// Sin ellas, el formulario funciona igual que antes. Sin dependencias: script oficial + fetch.
// Este módulo también lo importa el navegador (widget): la verificación del token, que usa el
// secreto, vive en src/lib/contact-guard.ts (solo servidor).

export const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function turnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null;
}

/** Turnstile está activo solo con clave pública y secreta presentes. */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}
