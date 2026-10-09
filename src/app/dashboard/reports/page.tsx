import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency/format";
import { formatDate, localDayKeyDaysAgo } from "@/lib/dates";
import { fetchAll, must } from "../_lib/queries";

export const dynamic = "force-dynamic";

interface DailyRow {
  day: string;
  orders_count: number;
  revenue: number;
  avg_ticket: number;
  currency_code: string | null;
}
interface TopRow {
  product_id: string | null;
  product_name: string;
  units_sold: number;
  revenue: number;
}

const DAYS = 14;

export default async function ReportsPage() {
  const { tenant, settings } = await getTenantContext();
  const supabase = await createClient();
  const currency = settings?.currency_code ?? "USD";

  // Los últimos 14 días de calendario (hoy incluido), no los últimos 14 con ventas: en un local
  // nuevo eso podía abarcar dos meses. `day` es una columna `date`; la clave es la de Costa Rica.
  const since = localDayKeyDaysAgo(DAYS - 1);
  const [daily, topRowsRaw] = await Promise.all([
    supabase
      .from("v_daily_sales")
      .select("*")
      // Defensa en profundidad (S1): la vista ya filtra por RLS (security_invoker).
      .eq("tenant_id", tenant.id)
      .gte("day", since)
      .order("day", { ascending: false })
      .then((r) => must<DailyRow>(r, "ventas por día")),
    // Una fila por platillo y día: se pagina para no quedarse con las primeras 1000.
    fetchAll<TopRow>("platillos más vendidos", (from, to) =>
      supabase
        .from("v_top_products")
        .select("product_id, product_name, units_sold, revenue")
        .eq("tenant_id", tenant.id)
        .gte("day", since)
        .order("day")
        .order("product_name")
        .order("product_id")
        .range(from, to)
    ),
  ]);
  const dailyRows = daily;

  // Sumar por platillo los días del período. Un platillo borrado (S15 deja `product_id` en null)
  // se agrupa por el nombre que tenía en la orden.
  const topMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const r of topRowsRaw) {
    const key = r.product_id ?? `nombre:${r.product_name}`;
    const cur = topMap.get(key) ?? { name: r.product_name, units: 0, revenue: 0 };
    cur.name = r.product_name; // vienen de la más vieja a la más nueva: queda el nombre actual
    cur.units += Number(r.units_sold);
    cur.revenue += Number(r.revenue);
    topMap.set(key, cur);
  }
  const topRows = [...topMap.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
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
        description="Lo vendido en los últimos 14 días (hoy incluido), el ticket promedio y los platillos que más salen en ese período."
      />

      <section aria-label="Cifras de los últimos 14 días" className="panel-stagger grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Vendido (últimos 14 días)" value={formatMoney(totalRevenue, currency)} icon="wallet" accent="accent" />
        <StatCard label="Órdenes (últimos 14 días)" value={totalOrders.toLocaleString("es-CR")} icon="receipt" />
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
                      <tr key={`${r.day}-${r.currency_code ?? ""}`}>
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
              <CardTitle>Platillos más vendidos (últimos 14 días)</CardTitle>
            </CardHeader>
            <CardBody>
              {topRows.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay datos de platillos.</p>
              ) : (
                <ol className="space-y-4">
                  {topRows.map((r) => (
                    <li key={r.key}>
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
