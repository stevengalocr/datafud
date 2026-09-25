import { ejemplo } from "./ejemplo";
import type { CartaEstatica } from "./types";

/**
 * Cartas publicadas en `/c/<slug>`. Alta de una carta nueva (los 4 pasos):
 *
 * 1. Crear `src/content/cartas/<slug>.ts` con un `CartaEstatica` (categorías, productos,
 *    precios, nombre y colores del local). El formato es el de la RPC `get_menu`.
 * 2. Importarlo acá y agregarlo a `CARTAS`.
 * 3. Si el local va a llevar QR o NFC impreso, darle un código en `src/content/qr.ts`
 *    apuntando a `/c/<slug>` (D-014: el código impreso nunca se reutiliza).
 * 4. `npm run build` y desplegar. Probar `/c/<slug>` en un teléfono de verdad antes de entregar.
 */
export const CARTAS: CartaEstatica[] = [ejemplo];

export function cartaBySlug(slug: string): CartaEstatica | undefined {
  return CARTAS.find((c) => c.slug === slug);
}

export type { CartaEstatica };
