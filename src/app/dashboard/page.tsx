import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/currency/format";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  TENANT_STATUS_COLOR,
  TENANT_STATUS_LABEL,
} from "@/lib/constants";
import type { Order } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { tenant, settings } = await getTenantContext();
  const supabase = await createClient();
  const currency = settings?.currency_code ?? "USD";

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const list = (orders as Order[]) ?? [];

  const today = new Date().toDateString();
  const todayOrders = list.filter(
    (o) => new Date(o.created_at).toDateString() === today
  );
  const soldToday = todayOrders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = list.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status)
  ).length;

  const stats = [
    { label: "Órdenes hoy", value: String(todayOrders.length), icon: "🧾" },
    { label: "Vendido hoy", value: formatMoney(soldToday, currency), icon: "💰" },
    { label: "Órdenes activas", value: String(pending), icon: "⏳" },
  ];

  return (
    <div>
      <PageHeader
        title={`Hola, ${tenant.name}`}
        description="Resumen de tu negocio hoy."
        action={
          <Badge className={TENANT_STATUS_COLOR[tenant.status]}>
            {TENANT_STATUS_LABEL[tenant.status]}
          </Badge>
        }
      />

      {tenant.status === "trial" && tenant.trial_ends_at && (
        <div className="mb-6 rounded-xl border border-accent-200 bg-accent-50 px-5 py-3 text-sm text-accent-800">
          Estás en periodo de prueba hasta el{" "}
          <strong>
            {new Date(tenant.trial_ends_at).toLocaleDateString("es")}
          </strong>
          .
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody>
          <p className="mb-3 text-sm font-medium text-slate-700">Órdenes recientes</p>
          <ul className="divide-y divide-slate-100">
            {list.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium text-slate-900">
                    {formatMoney(Number(o.total), o.currency_code ?? currency)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.created_at).toLocaleString("es")}
                  </p>
                </div>
                <Badge className={ORDER_STATUS_COLOR[o.status]}>
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">
                Aún no hay órdenes. Comparte el QR de tus mesas para empezar.
              </li>
            )}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
