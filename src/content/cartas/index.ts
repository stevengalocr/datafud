import { ejemplo } from "./ejemplo";
import type { CartaEstatica } from "./types";

/**
 * Cartas publicadas en `/c/<slug>`.
 *
 * **Esta lista y los `<slug>.ts` los escribe `scripts/carta-nueva.mjs`. No los edites a mano**:
 * el alta sale de una hoja de cálculo (D-046), porque con 60 platillos escribir el `.ts` es
 * lento y se cuelan erratas justo en los precios. El paso a paso completo, con lo que hay que
 * pedirle al local, está en `docs/ventas/OFERTA.md` §4. En corto:
 *
 *   node scripts/carta-nueva.mjs <slug>     # lee entregas/<slug>/{menu.csv,carta.json,fotos/}
 *   npm run build && commit                 # se commitean el .ts y public/cartas/<slug>/
 *   node scripts/carta-kit.mjs <slug>       # QR y PDF para mandarle al local
 *
 * Para dar de baja un local: `node scripts/carta-borrar.mjs <slug>`. Deja su código de QR
 * comentado en `src/content/qr.ts` **a propósito**, y ese cambio se commitea: el stand impreso
 * puede seguir en una mesa y el código no se le da nunca a otro local (D-014).
 *
 * Si alguna vez hay que tocar un `.ts` a mano, acordate de que el CSV queda desactualizado y la
 * próxima corrida del script pisa el cambio.
 */
export const CARTAS: CartaEstatica[] = [ejemplo];

export function cartaBySlug(slug: string): CartaEstatica | undefined {
  return CARTAS.find((c) => c.slug === slug);
}

export type { CartaEstatica };
