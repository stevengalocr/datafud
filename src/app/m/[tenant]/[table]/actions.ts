"use server";

import { createClient } from "@/lib/supabase/server";

export interface CartLine {
  product_id: string;
  quantity: number;
}

export type PlaceOrderResult =
  | { orderId: string }
  | { error: string };

// Envía la orden de forma anónima mediante la RPC segura place_order.
export async function placeOrder(
  slug: string,
  token: string,
  items: CartLine[],
  note: string
): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_slug: slug,
    p_token: token,
    p_items: items,
    p_note: note || null,
  });
  if (error) {
    return { error: error.message };
  }
  return { orderId: data as string };
}
