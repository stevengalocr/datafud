"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface CartLine {
  product_id: string;
  quantity: number;
}

export type PlaceOrderResult =
  | { orderId: string }
  | { error: string };

// Mensajes de place_order que se pueden mostrar al cliente tal cual; cualquier otro error de la
// base se cambia por uno genérico, para no filtrar detalles internos.
const MENSAJES_SEGUROS = [
  "Restaurante no disponible",
  "Mesa no válida",
  "La orden no tiene platillos",
  "Un pedido lleva como máximo 30 platillos distintos",
  "Hay muchos pedidos seguidos desde esta mesa. Esperá unos minutos o llamá al salonero",
  "El restaurante está recibiendo muchos pedidos. Probá de nuevo en un minuto",
  "La cantidad máxima por platillo es 20",
  "Ningún platillo válido en la orden",
];

const orderSchema = z.object({
  slug: z.string().min(1).max(60),
  token: z.string().uuid(),
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "La orden no tiene platillos")
    .max(30, "Un pedido lleva como máximo 30 platillos distintos"),
  note: z.string().max(300).optional(),
});

// Envía la orden de forma anónima mediante la RPC segura place_order.
export async function placeOrder(
  slug: string,
  token: string,
  items: CartLine[],
  note: string
): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse({ slug, token, items, note: note || undefined });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Revisá tu pedido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_slug: parsed.data.slug,
    p_token: parsed.data.token,
    p_items: parsed.data.items,
    p_note: parsed.data.note ?? null,
  });
  if (error) {
    const seguro = MENSAJES_SEGUROS.find((m) => error.message?.startsWith(m));
    if (!seguro) console.error("[datafud] placeOrder:", error.code ?? "-", error.message ?? "");
    return { error: seguro ? `${seguro}.` : "No se pudo enviar el pedido. Probá de nuevo." };
  }
  return { orderId: data as string };
}
