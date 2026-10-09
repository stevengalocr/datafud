import { getTenantContext } from "@/lib/auth/tenant-context";
import { NoTableOrderingNotice } from "@/components/shell/plan-notice";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { startOfLocalDayIso } from "@/lib/dates";
import { fetchAll, must } from "../_lib/queries";
import { withDetails, type BoardSnapshot } from "../_lib/orders";
import { ACTIVE_STATUSES, CLOSED_STATUSES } from "../_lib/order-status";
import { OrderBoard } from "./order-board";
import { AutoRefresh } from "./auto-refresh";
import type { Order } from "@/lib/supabase/types";

type Db = Awaited<ReturnType<typeof createClient>>;

export const dynamic = "force-dynamic";

/** Cuántas cerradas de hoy se muestran. Las activas van todas: son las que esperan atención. */
const CLOSED_SHOWN = 60;

async function loadBoard(supabase: Db, tenantId: string): Promise<BoardSnapshot> {
  // Por atender: todas las activas, la más vieja primero (es la que más espera). Sin tope: una
  // orden «Lista» de la mañana no se cae del tablero porque entraron muchas después.
  // `tenant_id` en cada consulta: defensa en profundidad (S1); la garantía es RLS.
  const active = await fetchAll<Order>("órdenes activas", (from, to) =>
    supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("status", [...ACTIVE_STATUSES])
      .order("created_at", { ascending: true })
      .order("id")
      .range(from, to)
  );

  // Cerradas hoy (pagadas o canceladas desde el inicio del día de Costa Rica), la última primero.
  const closedRes = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .in("status", [...CLOSED_STATUSES])
    .gte("updated_at", startOfLocalDayIso())
    .order("updated_at", { ascending: false })
    .order("id")
    .limit(CLOSED_SHOWN);
  const closed = must<Order>(closedRes, "órdenes cerradas de hoy");

  const [activeView, closedView] = await Promise.all([
    withDetails(supabase, tenantId, active),
    withDetails(supabase, tenantId, closed),
  ]);
  return { active: activeView, closed: closedView, closedTotal: closedRes.count ?? closed.length };
}

export default async function OrdersPage() {
  const { tenant, settings, plan, readOnly } = await getTenantContext();
  const supabase = await createClient();

  // Si la carga falla, el tablero no se cambia por la página de error: el refresco de cada 15 s
  // dejaría de correr. `OrderBoard` conserva lo último que cargó bien y avisa; si nunca cargó,
  // muestra el error del panel con un código para buscarlo en los registros.
  let snapshot: BoardSnapshot | null = null;
  let errorRef: string | null = null;
  try {
    snapshot = await loadBoard(supabase, tenant.id);
  } catch (e) {
    errorRef = crypto.randomUUID().slice(0, 8);
    console.error(`[datafud] tablero ${errorRef}:`, e instanceof Error ? e.message : "-");
  }

  return (
    <div>
      <PageHeader
        title="Órdenes"
        description="Pasá cada orden de pendiente a pagada. Las nuevas aparecen solas."
        action={<AutoRefresh />}
      />
      {!plan.tableOrdering && <NoTableOrderingNotice where="orders" />}
      <OrderBoard
        snapshot={snapshot}
        errorRef={errorRef}
        currency={settings?.currency_code ?? "USD"}
        readOnly={readOnly}
      />
    </div>
  );
}
