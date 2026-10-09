import type { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/supabase/types";
import { chunks, fetchAll, must } from "./queries";

type Db = Awaited<ReturnType<typeof createClient>>;

/** Lo que el panel muestra cuando la orden ya no tiene mesa (se borró: S15 deja `table_id` en null). */
export const MESA_ELIMINADA = "Mesa eliminada";

/** Una orden con el nombre de su mesa y sus líneas, lista para pintar. */
export type OrderView = Order & { tableLabel: string; items: OrderItem[] };

/** Lo que pinta el tablero: activas, cerradas de hoy (las que se muestran) y cuántas cerradas hay. */
export type BoardSnapshot = { active: OrderView[]; closed: OrderView[]; closedTotal: number };

// Toda consulta filtra además por `tenant_id`: defensa en profundidad (S1). La garantía es RLS.

/** Nombre de la mesa de cada orden, en una sola consulta por tramo. */
async function tableLabels(supabase: Db, tenantId: string, orders: Order[]): Promise<Map<string, string>> {
  const ids = [...new Set(orders.map((o) => o.table_id).filter((id): id is string => !!id))];
  const labels = new Map<string, string>();
  for (const part of chunks(ids)) {
    const rows = must<{ id: string; label: string }>(
      await supabase.from("tables").select("id, label").eq("tenant_id", tenantId).in("id", part),
      "mesas de las órdenes"
    );
    for (const r of rows) labels.set(r.id, r.label);
  }
  return labels;
}

/** Líneas de cada orden. Pagina y va por tramos: nunca se queda con las primeras 1000 filas. */
async function orderItems(supabase: Db, tenantId: string, orders: Order[]): Promise<Map<string, OrderItem[]>> {
  const byOrder = new Map<string, OrderItem[]>();
  for (const part of chunks(orders.map((o) => o.id))) {
    const rows = await fetchAll<OrderItem>("líneas de las órdenes", (from, to) =>
      supabase
        .from("order_items")
        .select("*")
        .eq("tenant_id", tenantId)
        .in("order_id", part)
        .order("id")
        .range(from, to)
    );
    for (const it of rows) {
      const list = byOrder.get(it.order_id);
      if (list) list.push(it);
      else byOrder.set(it.order_id, [it]);
    }
  }
  return byOrder;
}

/** Completa órdenes con su mesa y, si se pide, sus líneas. */
export async function withDetails(
  supabase: Db,
  tenantId: string,
  orders: Order[],
  { items = true }: { items?: boolean } = {}
): Promise<OrderView[]> {
  if (orders.length === 0) return [];
  const [labels, lines] = await Promise.all([
    tableLabels(supabase, tenantId, orders),
    items ? orderItems(supabase, tenantId, orders) : Promise.resolve(new Map<string, OrderItem[]>()),
  ]);
  return orders.map((o) => ({
    ...o,
    tableLabel: (o.table_id && labels.get(o.table_id)) || MESA_ELIMINADA,
    items: lines.get(o.id) ?? [],
  }));
}
