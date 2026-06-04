import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency/format";

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
  const { settings } = await getTenantContext();
  const supabase = await createClient();
  const currency = settings?.currency_code ?? "USD";

  const { data: daily } = await supabase
    .from("v_daily_sales")
    .select("*")
    .order("day", { ascending: false })
    .limit(14);
  const { data: top } = await supabase
    .from("v_top_products")
    .select("product_name, units_sold, revenue");

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

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Platos del día, montos vendidos y ticket promedio."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Ingresos (14 días)" value={formatMoney(totalRevenue, currency)} />
        <Stat label="Órdenes (14 días)" value={String(totalOrders)} />
        <Stat label="Ticket promedio" value={formatMoney(avgTicket, currency)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="font-medium text-slate-800">Ventas por día</p>
          </CardHeader>
          <CardBody>
            {dailyRows.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no hay ventas registradas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 font-medium">Día</th>
                    <th className="py-2 font-medium">Órdenes</th>
                    <th className="py-2 text-right font-medium">Vendido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyRows.map((r) => (
                    <tr key={r.day}>
                      <td className="py-2 text-slate-700">
                        {new Date(r.day).toLocaleDateString("es")}
                      </td>
                      <td className="py-2 text-slate-600">{r.orders_count}</td>
                      <td className="py-2 text-right font-medium text-slate-900">
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
            <p className="font-medium text-slate-800">Platos más vendidos</p>
          </CardHeader>
          <CardBody>
            {topRows.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no hay datos de platillos.</p>
            ) : (
              <ul className="space-y-3">
                {topRows.map((r) => (
                  <li key={r.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-800">{r.name}</span>
                      <span className="text-slate-500">{r.units} uds.</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(r.units / maxUnits) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  );
}
