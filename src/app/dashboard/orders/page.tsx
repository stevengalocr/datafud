import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { OrderBoard } from "./order-board";
import type { Order, OrderItem } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { settings } = await getTenantContext();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = (orders as Order[]) ?? [];

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      list.map((o) => o.id)
    );

  const itemsByOrder: Record<string, OrderItem[]> = {};
  for (const it of (items as OrderItem[]) ?? []) {
    (itemsByOrder[it.order_id] ??= []).push(it);
  }

  return (
    <div>
      <PageHeader
        title="Órdenes"
        description="Controla el estado de cada orden en tiempo real."
      />
      <OrderBoard
        orders={list}
        itemsByOrder={itemsByOrder}
        currency={settings?.currency_code ?? "USD"}
      />
    </div>
  );
}
