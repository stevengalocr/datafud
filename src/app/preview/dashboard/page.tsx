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
  const pending = mockOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length;
  const maxUnits = Math.max(...mockTopProducts.map((p) => p.units));
  const liveOrders = mockOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));

  const stats: { label: string; value: string; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Órdenes hoy", value: String(mockOrders.length), icon: "receipt", accent: "brand" },
    { label: "Vendido hoy", value: formatMoney(soldToday, currency), icon: "wallet", accent: "accent" },
    { label: "Órdenes activas", value: String(pending), icon: "clock", accent: "slate" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 text-brand-900">
      <PreviewBanner active="/preview/dashboard" />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Panel del restaurante</p>
            <h1 className="mt-1 font-display text-3xl text-brand-900">Hola, {mockSettings.restaurant_name}</h1>
            <p className="mt-1 text-sm text-brand-700/70">Esto es lo que pasa en tu local hoy.</p>
          </div>
          <Badge className="bg-brand-100 text-brand-800">Activo</Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Comandas en vivo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-brand-900">Comandas en vivo</p>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" /> {liveOrders.length} activas
                </span>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {mockOrders.map((o) => {
                const items = mockOrderItems[o.id] ?? [];
                return (
                  <div key={o.id} className="rounded-xl border border-stone-200/70 bg-cream-50/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg text-brand-900">{formatMoney(Number(o.total), currency)}</p>
                      <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-sm text-brand-700/80">
                      {items.map((it) => (
                        <li key={it.id}>{it.quantity}× {it.product_name_snapshot}</li>
                      ))}
                    </ul>
                    {o.customer_note && (
                      <p className="mt-2 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs font-medium text-accent-800">
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
                <p className="font-semibold text-brand-900">Ventas por día</p>
              </CardHeader>
              <CardBody>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-stone-200/60">
                    {mockDailySales.map((r) => (
                      <tr key={r.day}>
                        <td className="py-2 text-brand-700/80">{new Date(r.day).toLocaleDateString("es", { weekday: "short", day: "numeric" })}</td>
                        <td className="py-2 text-brand-700/60">{r.orders_count} órdenes</td>
                        <td className="py-2 text-right font-semibold text-brand-900">{formatMoney(r.revenue, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <p className="font-semibold text-brand-900">Platillos más vendidos</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3.5">
                  {mockTopProducts.map((r) => (
                    <li key={r.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-brand-800">{r.name}</span>
                        <span className="text-brand-700/55">{r.units} uds.</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/70">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${(r.units / maxUnits) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Menú */}
        <h2 className="mb-3 mt-8 font-display text-2xl text-brand-900">Tu menú</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brand-700/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">Platillo</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60">
                {mockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {p.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-brand-900">{t(p.name_i18n, "es")}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brand-700/80">{formatMoney(Number(p.price), currency)}</td>
                    <td className="px-5 py-3">
                      <Badge className={p.is_available ? "bg-brand-100 text-brand-800" : "bg-stone-100 text-brand-700/50"}>
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
