import type { MenuPayload } from "@/app/m/[tenant]/[table]/menu-client";

/**
 * Carta estática (D-040 · entrega sin backend).
 *
 * Mientras producción no tenga Supabase, la Carta de un local se publica desde el repo en
 * `/c/<slug>`. `menu` usa exactamente el formato que devuelve la RPC `get_menu`, así que el día
 * que el local pase a un plan con pedidos su carta se mueve a `/m/<tenant>/<mesa>` sin tocar la
 * UI: solo cambia de dónde salen los datos.
 *
 * - `slug`: minúsculas, sin tildes ni espacios. Es la URL pública (`/c/<slug>`).
 * - `indexable`: `false` mientras el local no confirme que quiere salir en Google.
 * - `menu.table`: en modo Carta no hay mesa; se usa `{ id: "carta", label: "" }` para que la
 *   cabecera muestre solo "Menú".
 */
export type CartaEstatica = {
  slug: string;
  indexable: boolean;
  menu: MenuPayload;
};
