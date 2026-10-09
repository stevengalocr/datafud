import Link from "next/link";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatMoney } from "@/lib/currency/format";
import { formatDate, formatTime, localDayKey, startOfLocalDayIso } from "@/lib/dates";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  TENANT_STATUS_COLOR,
  TENANT_STATUS_LABEL,
} from "@/lib/constants";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import { fetchAll, must, mustCount } from "./_lib/queries";
import { withDetails } from "./_lib/orders";
import { ACTIVE_STATUSES } from "./_lib/order-status";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { tenant, settings } = await getTenantContext();
  const supabase = await createClient();
  const currency = settings?.currency_code ?? "USD";

  // "Hoy" es el día de Costa Rica, no el del servidor (UTC en Vercel): a las 7 p. m. en San José
  // el servidor ya está en el día siguiente. Las cifras salen de todas las órdenes de hoy, no de
  // las últimas que entren en una página.
  const since = startOfLocalDayIso();
  const [todayRows, activeCount, recentRows] = await Promise.all([
    fetchAll<{ id: string; total: number; status: OrderStatus }>("órdenes de hoy", (from, to) =>
      supabase
        .from("orders")
        .select("id, total, status")
        .eq("tenant_id", tenant.id)
        .gte("created_at", since)
        .order("created_at")
        .order("id")
        .range(from, to)
    ),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .in("status", [...ACTIVE_STATUSES])
      .then((r) => mustCount(r, "órdenes activas")),
    supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .order("id")
      .limit(8)
      .then((r) => must<Order>(r, "órdenes recientes")),
  ]);
  const recent = await withDetails(supabase, tenant.id, recentRows, { items: false });

  const soldToday = todayRows
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);
  const today = localDayKey();

  const stats: { label: string; value: string; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Órdenes hoy", value: todayRows.length.toLocaleString("es-CR"), icon: "receipt", accent: "brand" },
    { label: "Vendido hoy", value: formatMoney(soldToday, currency), icon: "wallet", accent: "accent" },
    { label: "Por atender", value: activeCount.toLocaleString("es-CR"), icon: "clock", accent: "slate" },
  ];

  const displayName = settings?.restaurant_name || tenant.name;

  return (
    <div>
      <PageHeader
        eyebrow="Resumen de hoy"
        title={displayName}
        description="Lo que entró hoy y lo que todavía falta atender."
        action={
          <Badge className={TENANT_STATUS_COLOR[tenant.status]}>
            {TENANT_STATUS_LABEL[tenant.status]}
          </Badge>
        }
      />

      {tenant.status === "trial" && tenant.trial_ends_at && (
        <p className="mb-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-accent-700" />
          <span>
            Estás en periodo de prueba hasta el <strong>{formatDate(tenant.trial_ends_at)}</strong>.
          </span>
        </p>
      )}

      <section aria-label="Cifras de hoy" className="panel-stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <Card className="mt-6">
        <CardHeader className="justify-between">
          <CardTitle>Órdenes recientes</CardTitle>
          {recent.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hov:text-brand-900"
            >
              Ver órdenes
              <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </CardHeader>
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon="qr"
              title="Todavía no hay órdenes"
              action={
                <Link href="/dashboard/tables" className={buttonClasses("secondary", "md")}>
                  Ver mesas y QR
                </Link>
              }
            >
              Las órdenes llegan cuando un cliente escanea el QR de una mesa y pide desde el
              teléfono. Imprimí los QR de tus mesas para empezar.
            </EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-950 [overflow-wrap:anywhere]">{o.tableLabel}</p>
                  <p className="text-xs text-stone-600">
                    <span className="font-semibold text-brand-950 tabular-nums">
                      {formatMoney(Number(o.total), o.currency_code ?? currency)}
                    </span>
                    {" · "}
                    {localDayKey(o.created_at) === today
                      ? `Hoy, ${formatTime(o.created_at)}`
                      : formatDate(o.created_at)}
                  </p>
                </div>
                <Badge className={ORDER_STATUS_COLOR[o.status]}>
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
