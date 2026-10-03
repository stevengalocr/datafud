import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency/format";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

interface DailyRow {
  day: string;
  orders_count: number;
  revenue: number;
  avg_ticket: number;
  currency_code: string | null;
}
interface TopRow {
  product_name: string;
  units_sold: number;
  revenue: number;
}

export default async function ReportsPage() {
  const { tenant, settings } = await getTenantContext();
  const supabase = await createClient();
  const currency = settings?.currency_code ?? "USD";

  const { data: daily } = await supabase
    .from("v_daily_sales")
    .select("*")
    // Defensa en profundidad (S1): la vista ya filtra por RLS (security_invoker).
    .eq("tenant_id", tenant.id)
    .order("day", { ascending: false })
    .limit(14);
  const { data: top } = await supabase
    .from("v_top_products")
    .select("product_name, units_sold, revenue")
    .eq("tenant_id", tenant.id);

  const dailyRows = (daily as DailyRow[]) ?? [];
  const topRowsRaw = (top as TopRow[]) ?? [];

  // Agregar top products (las vistas vienen por día; sumamos por nombre)
  const topMap = new Map<string, { units: number; revenue: number }>();
  for (const r of topRowsRaw) {
    const cur = topMap.get(r.product_name) ?? { units: 0, revenue: 0 };
    cur.units += Number(r.units_sold);
    cur.revenue += Number(r.revenue);
    topMap.set(r.product_name, cur);
  }
  const topRows = [...topMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);
  const maxUnits = Math.max(1, ...topRows.map((r) => r.units));

  const totalRevenue = dailyRows.reduce((s, r) => s + Number(r.revenue), 0);
  const totalOrders = dailyRows.reduce((s, r) => s + Number(r.orders_count), 0);
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

  const hasData = dailyRows.length > 0 || topRows.length > 0;

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Lo vendido en los últimos 14 días con ventas, el ticket promedio y los platillos que más salen."
      />

      <section aria-label="Cifras de los últimos 14 días" className="panel-stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Vendido (14 días)" value={formatMoney(totalRevenue, currency)} icon="wallet" accent="accent" />
        <StatCard label="Órdenes (14 días)" value={totalOrders.toLocaleString("es-CR")} icon="receipt" />
        <StatCard label="Ticket promedio" value={formatMoney(avgTicket, currency)} icon="chart" accent="slate" />
      </section>

      {!hasData ? (
        <EmptyState icon="chart" title="Todavía no hay ventas para mostrar" className="mt-6">
          Los reportes se arman con las órdenes pagadas o entregadas. Cuando entren las primeras,
          acá vas a ver las ventas de cada día y los platillos que más se piden.
        </EmptyState>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por día</CardTitle>
            </CardHeader>
            <CardBody className="pt-2">
              {dailyRows.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay ventas registradas.</p>
              ) : (
                <table className="w-full text-sm">
                  <caption className="sr-only">Órdenes y monto vendido por día</caption>
                  <thead className="text-left text-xs uppercase tracking-wide text-stone-600">
                    <tr>
                      <th scope="col" className="py-2 font-semibold">Día</th>
                      <th scope="col" className="py-2 text-right font-semibold">Órdenes</th>
                      <th scope="col" className="py-2 text-right font-semibold">Vendido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dailyRows.map((r) => (
                      <tr key={r.day}>
                        <td className="py-2.5 text-stone-800">{formatDate(r.day)}</td>
                        <td className="py-2.5 text-right text-stone-700 tabular-nums">{Number(r.orders_count).toLocaleString("es-CR")}</td>
                        <td className="py-2.5 text-right font-semibold text-brand-950 tabular-nums">
                          {formatMoney(Number(r.revenue), r.currency_code ?? currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platillos más vendidos</CardTitle>
            </CardHeader>
            <CardBody>
              {topRows.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay datos de platillos.</p>
              ) : (
                <ol className="space-y-4">
                  {topRows.map((r) => (
                    <li key={r.name}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="min-w-0 font-medium text-brand-950 [overflow-wrap:anywhere]">{r.name}</span>
                        <span className="shrink-0 text-stone-600 tabular-nums">{r.units} u.</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200" aria-hidden="true">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${(r.units / maxUnits) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
