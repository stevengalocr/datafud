import { PreviewBanner } from "@/components/preview/preview-banner";
import { StatCard } from "@/components/shell/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IconName } from "@/components/ui/icon";
import { formatMoney } from "@/lib/currency/format";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import { t } from "@/lib/i18n/dictionaries";
import {
  mockDailySales,
  mockOrderItems,
  mockOrders,
  mockProducts,
  mockSettings,
  mockTopProducts,
} from "@/lib/demo/mock";

export default function PreviewDashboard() {
  const currency = mockSettings.currency_code;
  const soldToday = mockOrders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = mockOrders.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status)
  ).length;
  const maxUnits = Math.max(...mockTopProducts.map((p) => p.units));

  const stats: { label: string; value: string; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Órdenes hoy", value: String(mockOrders.length), icon: "receipt", accent: "brand" },
    { label: "Vendido hoy", value: formatMoney(soldToday, currency), icon: "wallet", accent: "accent" },
    { label: "Órdenes activas", value: String(pending), icon: "clock", accent: "slate" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PreviewBanner active="/preview/dashboard" />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Hola, {mockSettings.restaurant_name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Resumen de tu negocio hoy.</p>
          </div>
          <Badge className="bg-brand-100 text-brand-800">Activo</Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Órdenes en vivo */}
          <Card>
            <CardHeader>
              <p className="font-medium text-slate-800">Órdenes en vivo</p>
            </CardHeader>
            <CardBody className="space-y-3">
              {mockOrders.map((o) => {
                const items = mockOrderItems[o.id] ?? [];
                return (
                  <div key={o.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {formatMoney(Number(o.total), currency)}
                      </p>
                      <Badge className={ORDER_STATUS_COLOR[o.status]}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </Badge>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                      {items.map((it) => (
                        <li key={it.id}>
                          {it.quantity}× {it.product_name_snapshot}
                        </li>
                      ))}
                    </ul>
                    {o.customer_note && (
                      <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        Nota: {o.customer_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* Reportes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <p className="font-medium text-slate-800">Ventas por día</p>
              </CardHeader>
              <CardBody>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {mockDailySales.map((r) => (
                      <tr key={r.day}>
                        <td className="py-2 text-slate-700">
                          {new Date(r.day).toLocaleDateString("es")}
                        </td>
                        <td className="py-2 text-slate-600">{r.orders_count} órdenes</td>
                        <td className="py-2 text-right font-medium text-slate-900">
                          {formatMoney(r.revenue, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <p className="font-medium text-slate-800">Platos más vendidos</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {mockTopProducts.map((r) => (
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
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Menú */}
        <h2 className="mb-3 mt-8 font-display text-2xl text-slate-900">Menú</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Platillo</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockProducts.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {t(p.name_i18n, "es")}
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {formatMoney(Number(p.price), currency)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      className={
                        p.is_available
                          ? "bg-brand-100 text-brand-800"
                          : "bg-slate-100 text-slate-500"
                      }
                    >
                      {p.is_available ? "Disponible" : "Agotado"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
