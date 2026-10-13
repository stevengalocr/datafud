import type { MenuPayload } from "@/app/m/[tenant]/[table]/menu-client";
import type { I18nText } from "@/lib/supabase/types";

/**
 * Paso de una Carta estática (`/c/<slug>`, D-040) a un local del sistema (`/m/<tenant>/<mesa>`).
 *
 * Es el día 11 del plan de 15 días de `docs/ventas/OFERTA.md` §4: el local de la Carta pasa a un
 * plan con pedidos y su carta sale de la base. Esta parte es pura (sin red ni base): arma las
 * filas y dice qué fotos hay que copiar. La acción del super admin (`importCarta`,
 * `src/app/admin/actions.ts`) las escribe con su sesión, que la RLS deja escribir en cualquier
 * local (`is_super_admin()`), sin `service_role`.
 *
 * Los topes son los mismos que los CHECK de la sección 14b de `schema.sql` (regla 8): si algo los
 * pasa, se avisa antes de escribir nada, en vez de dejar la carta a medias.
 */

export const TOPES = { categoria: 60, platillo: 80, descripcion: 300, precioMax: 10_000_000, orden: 999 } as const;

/** Rutas de fotos de una Carta que se pueden copiar: solo archivos de imagen del propio sitio. */
const RUTA_FOTO = /^\/(?:cartas|demo)\/[a-z0-9][a-z0-9/_-]*\.(?:webp|png|jpe?g)$/;

export type CategoriaFila = { clave: string; name_i18n: I18nText; sort_order: number };
/** `foto` es la ruta del sitio a copiar a Storage, o `null` si la imagen ya está en una URL https o no hay. */
export type PlatilloFila = {
  categoria: string | null;
  name_i18n: I18nText;
  description_i18n: I18nText;
  price: number;
  sort_order: number;
  image_url: string | null;
  foto: string | null;
};
export type PlanDeCarta = {
  categorias: CategoriaFila[];
  platillos: PlatilloFila[];
  ajustes: {
    restaurant_name: string;
    currency_code: string;
    default_language: string;
    enabled_languages: string[];
    theme: Record<string, string>;
    logo_url: string | null;
    logo: string | null;
  };
  /** Fotos distintas que hay que copiar (platillos y logo). */
  fotos: string[];
};

const LANGS = ["es", "en", "pt"] as const;

function limpio(t: I18nText | null | undefined, max: number, campo: string, errores: string[]): I18nText {
  const out: I18nText = {};
  for (const k of LANGS) {
    const v = t?.[k];
    if (typeof v !== "string") continue;
    const s = v.trim();
    if (!s) continue;
    if (s.length > max) errores.push(`${campo}: «${s.slice(0, 40)}…» pasa de ${max} caracteres.`);
    out[k] = s;
  }
  return out;
}

function foto(url: string | null | undefined): { image_url: string | null; foto: string | null } | "mala" {
  if (!url) return { image_url: null, foto: null };
  if (url.startsWith("https://") && url.length <= 2048) return { image_url: url, foto: null };
  if (RUTA_FOTO.test(url) && !url.includes("..")) return { image_url: null, foto: url };
  return "mala";
}

/** Valida la carta y arma las filas. Si algo no entra en la base, devuelve los errores y no arma nada. */
export function planDeCarta(menu: MenuPayload): { ok: true; plan: PlanDeCarta } | { ok: false; errores: string[] } {
  const errores: string[] = [];

  const ids = new Set<string>();
  const categorias: CategoriaFila[] = [...menu.categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c, i) => {
      ids.add(c.id);
      const name = limpio(c.name_i18n, TOPES.categoria, "Categoría", errores);
      if (!name.es && !name.en && !name.pt) errores.push(`Una categoría no tiene nombre (${c.id}).`);
      return { clave: c.id, name_i18n: name, sort_order: Math.min(i + 1, TOPES.orden) };
    });

  const platillos: PlatilloFila[] = [...menu.products]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p, i) => {
      const name = limpio(p.name_i18n, TOPES.platillo, "Platillo", errores);
      const nombre = name.es ?? name.en ?? name.pt;
      if (!nombre) errores.push(`Un platillo no tiene nombre (${p.id}).`);
      const price = Number(p.price);
      if (!Number.isFinite(price) || price < 0 || price > TOPES.precioMax) {
        errores.push(`El precio de «${nombre ?? p.id}» no es válido.`);
      }
      const f = foto(p.image_url);
      if (f === "mala") errores.push(`La foto de «${nombre ?? p.id}» no es una ruta del sitio ni una URL https.`);
      return {
        categoria: p.category_id && ids.has(p.category_id) ? p.category_id : null,
        name_i18n: name,
        description_i18n: limpio(p.description_i18n, TOPES.descripcion, `Descripción de «${nombre ?? p.id}»`, errores),
        price,
        sort_order: Math.min(i + 1, TOPES.orden),
        ...(f === "mala" ? { image_url: null, foto: null } : f),
      };
    });

  const s = menu.settings;
  const logo = foto(s.logo_url);
  if (logo === "mala") errores.push("El logo no es una ruta del sitio ni una URL https.");
  const enabled = s.enabled_languages.filter((l) => (LANGS as readonly string[]).includes(l));
  const theme: Record<string, string> = {};
  for (const k of ["primary", "accent"] as const) {
    if (typeof s.theme?.[k] === "string" && /^#[0-9a-fA-F]{6}$/.test(s.theme[k])) theme[k] = s.theme[k];
  }
  const restaurant_name = s.restaurant_name.trim();
  if (!restaurant_name || restaurant_name.length > 80) errores.push("El nombre del local falta o pasa de 80 caracteres.");
  if (!enabled.length || !enabled.includes(s.default_language)) errores.push("Los idiomas de la carta no son válidos.");

  if (errores.length) return { ok: false, errores };

  const ajustes = {
    restaurant_name,
    currency_code: s.currency_code,
    default_language: s.default_language,
    enabled_languages: enabled,
    theme,
    ...(logo === "mala" ? { logo_url: null, logo: null } : { logo_url: logo.image_url, logo: logo.foto }),
  };
  const fotos = [...new Set([...platillos.map((p) => p.foto), ajustes.logo].filter((x): x is string => !!x))];
  return { ok: true, plan: { categorias, platillos, ajustes, fotos } };
}

/** Destino de un código impreso cuando la carta pasa al sistema. */
export function destinoMesa(slug: string, token: string) {
  return `/m/${slug}/${token}`;
}
