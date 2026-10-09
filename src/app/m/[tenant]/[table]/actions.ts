"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { OrderErrorCode } from "@/lib/i18n/dictionaries";

export interface CartLine {
  product_id: string;
  quantity: number;
}

// La carta recibe un código y lo traduce al idioma que eligió el comensal (AA-14). Nunca viaja
// el texto de la base: lo que no se reconoce sale como `generic` (S12).
export type PlaceOrderResult =
  | { orderId: string }
  | { error: OrderErrorCode };

// Mensajes de place_order que la carta sabe explicar. Se comparan por el comienzo del texto,
// así que un cambio de redacción en `schema.sql` tiene que venir acompañado de su línea acá.
// Una pista `datafud:<código>` en el `hint` de la excepción también sirve y no depende del texto.
const MENSAJES_CONOCIDOS: [prefijo: string, codigo: OrderErrorCode][] = [
  ["Restaurante no disponible", "restaurant_unavailable"],
  ["Mesa no válida", "table_invalid"],
  ["La orden no tiene platillos", "empty"],
  ["Un pedido lleva como máximo 30 platillos distintos", "too_many_lines"],
  ["Hay muchos pedidos seguidos desde esta mesa", "rate_table"],
  ["El restaurante está recibiendo muchos pedidos", "rate_tenant"],
  ["La cantidad máxima por platillo es 20", "max_quantity"],
  ["Ningún platillo válido en la orden", "items_unavailable"],
  ["Algunos platillos ya no están disponibles", "items_unavailable"],
  ["Este local no recibe pedidos", "ordering_off"],
];

const CODIGOS: ReadonlySet<string> = new Set<OrderErrorCode>([
  "restaurant_unavailable",
  "table_invalid",
  "empty",
  "too_many_lines",
  "rate_table",
  "rate_tenant",
  "max_quantity",
  "items_unavailable",
  "ordering_off",
  "note_too_long",
]);

const orderSchema = z.object({
  slug: z.string().min(1).max(60),
  token: z.string().uuid(),
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "empty")
    .max(30, "too_many_lines"),
  note: z.string().max(300, "note_too_long").optional(),
  // Referencia del envío (la genera la carta): un reintento con la misma no duplica la orden.
  clientRef: z.string().uuid().optional(),
});

function codigoDeBase(error: { message?: string | null; hint?: string | null }): OrderErrorCode | null {
  const pista = error.hint?.startsWith("datafud:") ? error.hint.slice("datafud:".length) : null;
  if (pista && CODIGOS.has(pista)) return pista as OrderErrorCode;
  const mensaje = error.message ?? "";
  return MENSAJES_CONOCIDOS.find(([prefijo]) => mensaje.startsWith(prefijo))?.[1] ?? null;
}

// Envía la orden de forma anónima mediante la RPC segura place_order. `clientRef` identifica el
// envío: si la red falló después de guardar, el reintento con la misma referencia devuelve la
// orden que ya existe (place_order busca por local + referencia) en vez de crear otra.
export async function placeOrder(
  slug: string,
  token: string,
  items: CartLine[],
  note: string,
  clientRef?: string
): Promise<PlaceOrderResult> {
  // La acción nunca lanza (regla 8): si `note` no llega como texto, que responda Zod.
  const parsed = orderSchema.safeParse({
    slug,
    token,
    items,
    note: typeof note === "string" ? note.trim() || undefined : note,
    clientRef: clientRef || undefined,
  });
  if (!parsed.success) {
    const mensaje = parsed.error.errors[0]?.message ?? "";
    return { error: CODIGOS.has(mensaje) ? (mensaje as OrderErrorCode) : "generic" };
  }

  const supabase = await createClient();

  // AA-15: si un platillo se agotó mientras el comensal armaba la orden, place_order rechaza la
  // orden entera («Algunos platillos ya no están disponibles», pista items_unavailable) y la carta
  // se recarga para que ajuste el carrito. Antes de 1.7.0 lo descartaba en silencio y esta acción
  // releía la carta antes de enviar; ya no hace falta (y un reintento de una orden ya guardada
  // tiene que llegar a place_order para recibir su número).
  const base = {
    p_slug: parsed.data.slug,
    p_token: parsed.data.token,
    p_items: parsed.data.items,
    p_note: parsed.data.note ?? null,
  };
  let { data, error } = await supabase.rpc("place_order", { ...base, p_client_ref: parsed.data.clientRef ?? null });

  // Base de antes de 1.7.0 (la app salió antes que schema.sql): no existe la firma con
  // p_client_ref. Se repite una vez con la de cuatro parámetros y, como esa place_order descarta
  // en silencio los agotados, antes se relee la carta como en 1.6.x.
  if (error && (error.code === "PGRST202" || error.code === "42883")) {
    console.error("[datafud] placeOrder: base sin la place_order de 1.7.0, se usa la anterior");
    const menu = await supabase.rpc("get_menu", { p_slug: base.p_slug, p_token: base.p_token });
    if (!menu.error) {
      if (!menu.data) return { error: "table_invalid" };
      const products = (menu.data as { products?: { id: string }[] }).products;
      const disponibles = new Set((products ?? []).map((p) => p.id));
      if (base.p_items.some((i) => !disponibles.has(i.product_id))) return { error: "items_unavailable" };
    }
    ({ data, error } = await supabase.rpc("place_order", base));
  }

  if (error || typeof data !== "string") {
    const codigo = error ? codigoDeBase(error) : null;
    if (!codigo) console.error("[datafud] placeOrder:", error?.code ?? "sin-id", error?.message ?? "");
    return { error: codigo ?? "generic" };
  }
  return { orderId: data };
}
