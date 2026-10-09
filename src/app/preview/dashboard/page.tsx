import QRCode from "qrcode";
import { PreviewBanner } from "@/components/preview/preview-banner";
import {
  FakeAction,
  PanelFrame,
  PanelSectionBlock,
  type PanelSection,
} from "@/components/preview/panel-frame";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { NoTableOrderingNotice } from "@/components/shell/plan-notice";
import { ReadOnlyBanner } from "@/components/shell/read-only-banner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatMoney } from "@/lib/currency/format";
import { formatDate, formatTime, localDayKey } from "@/lib/dates";
import {
  LANG_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  TENANT_STATUS_COLOR,
  TENANT_STATUS_LABEL,
} from "@/lib/constants";
import { t } from "@/lib/i18n/dictionaries";
import { isActive, NEXT_ACTION } from "@/app/dashboard/_lib/order-status";
import { MESA_ELIMINADA } from "@/app/dashboard/_lib/orders";
import { QR_PRINT } from "@/app/dashboard/tables/qr";
import type { Order, OrderItem } from "@/lib/supabase/types";
import {
  mockCategories,
  mockDailySales,
  mockOrderItems,
  mockOrders,
  mockProducts,
  mockSettings,
  mockTableLabels,
  mockTenants,
  mockTopProducts,
} from "@/lib/demo/mock";

// Mismo contenido que las seis páginas del panel del restaurante (Resumen, Menú, Órdenes, Mesas y
// QR, Reportes y Configuración), con las mismas cabeceras y textos, en una sola página estática
// y con datos de ejemplo. Sin backend: los botones se dibujan y no hacen nada.

const SECTIONS: PanelSection[] = [
  { id: "resumen", label: "Resumen", icon: "grid" },
  { id: "menu", label: "Menú", icon: "utensils" },
  { id: "ordenes", label: "Órdenes", icon: "receipt" },
  { id: "mesas", label: "Mesas y QR", icon: "qr" },
  { id: "reportes", label: "Reportes", icon: "chart" },
  { id: "configuracion", label: "Configuración", icon: "settings" },
  { id: "avisos", label: "Avisos del panel", icon: "pause" },
];

// Un platillo agotado para enseñar «Agotado» y «Volver a ofrecer» sin sacarlo de la carta de la
// demo (en `mockProducts` todos están disponibles, y la carta del comensal solo muestra esos).
const AGOTADOS = new Set(["p-queque"]);

type View = Order & { tableLabel: string; items: OrderItem[] };

const view = (o: Order): View => ({
  ...o,
  tableLabel: (o.table_id && mockTableLabels[o.table_id]) || MESA_ELIMINADA,
  items: mockOrderItems[o.id] ?? [],
});

// Se vuelve a armar cada hora: «Hoy» y «Cerradas hoy» no quedan fijos hasta el próximo deploy.
export const revalidate = 3600;

export default async function PreviewDashboard() {
  const currency = mockSettings.currency_code;
  const money = (n: number) => formatMoney(n, currency);
  const today = localDayKey();

  const ofToday = mockOrders.filter((o) => localDayKey(o.created_at) === today);
  const soldToday = ofToday
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);
  // Por atender: todas las activas, la más vieja primero. Cerradas hoy: la última primero.
  const active = mockOrders
    .filter((o) => isActive(o.status))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(view);
  const closed = mockOrders
    .filter((o) => !isActive(o.status) && localDayKey(o.updated_at) === today)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map(view);
  const recent = [...mockOrders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8).map(view);

  const stats: { label: string; value: string; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Órdenes hoy", value: ofToday.length.toLocaleString("es-CR"), icon: "receipt", accent: "brand" },
    { label: "Vendido hoy", value: money(soldToday), icon: "wallet", accent: "accent" },
    { label: "Por atender", value: active.length.toLocaleString("es-CR"), icon: "clock", accent: "slate" },
  ];

  // Reportes: los últimos 14 días, el más reciente primero.
  const dailyRows = [...mockDailySales].sort((a, b) => b.day.localeCompare(a.day));
  const totalRevenue = dailyRows.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = dailyRows.reduce((s, r) => s + r.orders_count, 0);
  const topRows = mockTopProducts.slice(0, 8);
  const maxUnits = Math.max(1, ...topRows.map((r) => r.units));

  // Mesas: el QR de la demo decodifica a la dirección de demostración, como todo QR dibujado.
  const qr = await QRCode.toDataURL("https://datafud.com/q/demo26", { width: 240, ...QR_PRINT });
  const tables = Object.entries(mockTableLabels).map(([id, label]) => ({ id, label }));

  // Menú: agrupado por categoría, en el orden de la carta.
  const categories = [...mockCategories].sort((a, b) => a.sort_order - b.sort_order);
  const groups = categories.map((c) => ({
    id: c.id,
    title: t(c.name_i18n, "es"),
    items: mockProducts.filter((p) => p.category_id === c.id),
  }));

  const demoTenant = mockTenants[0];
  const displayName = mockSettings.restaurant_name || demoTenant.name;

  const orderCard = (o: View, undo = false) => {
    const open = isActive(o.status);
    const next = NEXT_ACTION[o.status];
    const when =
      localDayKey(o.created_at) === today
        ? `Hoy, ${formatTime(o.created_at)}`
        : `${formatDate(o.created_at)}, ${formatTime(o.created_at)}`;
    return (
      <li key={o.id}>
        <Card className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-xl leading-tight text-brand-950 [overflow-wrap:anywhere]">
                {o.tableLabel}
              </h3>
              <p className="mt-1 text-sm text-stone-700">
                <span className="font-semibold text-brand-950 tabular-nums">{money(Number(o.total))}</span>
                <span className="text-stone-600"> · {when}</span>
              </p>
            </div>
            <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm">
            {o.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="min-w-0 text-brand-950 [overflow-wrap:anywhere]">
                  <span className="font-semibold tabular-nums">{it.quantity}×</span> {it.product_name_snapshot}
                  {it.note && <span className="block text-xs text-stone-600">{it.note}</span>}
                </span>
                <span className="shrink-0 text-stone-600 tabular-nums">{money(Number(it.line_total))}</span>
              </li>
            ))}
          </ul>

          {o.customer_note && (
            <p className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-900 [overflow-wrap:anywhere]">
              <span className="font-semibold">Nota:</span> {o.customer_note}
            </p>
          )}

          {undo && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream-100 px-3 py-2 text-sm text-brand-900">
              <span className="min-w-0">
                Pasó de «{ORDER_STATUS_LABEL.pending}» a «{ORDER_STATUS_LABEL[o.status]}».
              </span>
              <FakeAction className={buttonClasses("secondary", "sm")}>Deshacer</FakeAction>
            </div>
          )}

          {(next || open) && (
            <div className="mt-auto flex gap-2 pt-4">
              {next && <FakeAction className={`${buttonClasses("primary", "md")} flex-1`}>{next}</FakeAction>}
              {open && <FakeAction className={buttonClasses("danger-soft", "md")}>Cancelar</FakeAction>}
            </div>
          )}
        </Card>
      </li>
    );
  };

  return (
    <div>
      <PreviewBanner active="/preview/dashboard" />
      <PanelFrame label="Así se ve el panel del restaurante" sections={SECTIONS}>
        {/* Resumen */}
        <PanelSectionBlock
          id="resumen"
          eyebrow="Resumen de hoy"
          title={displayName}
          description="Lo que entró hoy y lo que todavía falta atender."
          action={
            <Badge className={TENANT_STATUS_COLOR[demoTenant.status]}>
              {TENANT_STATUS_LABEL[demoTenant.status]}
            </Badge>
          }
        >
          <section aria-label="Cifras de hoy" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </section>

          <Card className="mt-6">
            <CardHeader className="justify-between">
              <CardTitle>Órdenes recientes</CardTitle>
              <a
                href="#ordenes"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hov:text-brand-900"
              >
                Ver órdenes
                <Icon name="arrow-right" size={16} />
              </a>
            </CardHeader>
            <ul className="divide-y divide-stone-100">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-950 [overflow-wrap:anywhere]">{o.tableLabel}</p>
                    <p className="text-xs text-stone-600">
                      <span className="font-semibold text-brand-950 tabular-nums">{money(Number(o.total))}</span>
                      {" · "}
                      {localDayKey(o.created_at) === today
                        ? `Hoy, ${formatTime(o.created_at)}`
                        : formatDate(o.created_at)}
                    </p>
                  </div>
                  <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </PanelSectionBlock>

        {/* Menú */}
        <PanelSectionBlock
          id="menu"
          title="Menú"
          description="Tus categorías y platillos, en los idiomas de tu plan. Lo que cambiés acá se ve en la carta de tus mesas."
        >
          <div className="space-y-6">
            <Card>
              <CardHeader className="justify-between">
                <CardTitle>
                  Categorías <span className="font-normal text-stone-600">({categories.length})</span>
                </CardTitle>
                <FakeAction className={buttonClasses("secondary", "sm")}>
                  <Icon name="plus" size={16} />
                  Nueva categoría
                </FakeAction>
              </CardHeader>
              <CardBody>
                <ul className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li
                      key={c.id}
                      className="flex min-w-0 max-w-full items-center gap-1 rounded-full border border-stone-200 bg-white py-1 pl-3.5 pr-1 text-sm text-brand-950"
                    >
                      <span className="min-w-0 py-1 [overflow-wrap:anywhere]">{t(c.name_i18n, "es")}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 sm:h-8 sm:w-8">
                        <Icon name="x" size={14} />
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="justify-between">
                <CardTitle>
                  Platillos <span className="font-normal text-stone-600">({mockProducts.length})</span>
                </CardTitle>
                <FakeAction className={buttonClasses("secondary", "sm")}>
                  <Icon name="plus" size={16} />
                  Nuevo platillo
                </FakeAction>
              </CardHeader>
              <CardBody className="space-y-5">
                <div className="max-w-sm">
                  <Label htmlFor="demo-buscar-platillo">Buscar platillo</Label>
                  <Input
                    id="demo-buscar-platillo"
                    type="search"
                    placeholder="Nombre del platillo"
                    autoComplete="off"
                    readOnly
                  />
                </div>

                {groups.map((g) => (
                  <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
                    <h3
                      id={`grupo-${g.id}`}
                      className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-900 [overflow-wrap:anywhere]"
                    >
                      <span className="min-w-0">{g.title}</span>
                      <span className="font-normal text-stone-600 tabular-nums">({g.items.length})</span>
                    </h3>
                    <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                      {g.items.map((p) => {
                        const available = p.is_available && !AGOTADOS.has(p.id);
                        return (
                          <li
                            key={p.id}
                            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-brand-950 [overflow-wrap:anywhere]">
                                {t(p.name_i18n, "es")}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-stone-700">
                                <span className="tabular-nums">{money(Number(p.price))}</span>
                                <Badge className={available ? "bg-brand-100 text-brand-800" : "bg-stone-200 text-stone-800"}>
                                  {available ? "Disponible" : "Agotado"}
                                </Badge>
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <FakeAction className={buttonClasses("soft", "sm")}>
                                {available ? "Marcar agotado" : "Volver a ofrecer"}
                              </FakeAction>
                              <FakeAction className={buttonClasses("soft", "sm")}>Editar</FakeAction>
                              <FakeAction className={buttonClasses("danger-soft", "sm")}>
                                <Icon name="trash" size={16} />
                                <span className="sr-only sm:not-sr-only">Eliminar</span>
                              </FakeAction>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </CardBody>
            </Card>
          </div>
        </PanelSectionBlock>

        {/* Órdenes */}
        <PanelSectionBlock
          id="ordenes"
          title="Órdenes"
          description="Pasá cada orden de pendiente a pagada. Las nuevas aparecen solas."
          action={
            <p className="flex items-center gap-2 text-xs text-stone-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-500" />
              Actualizado recién
              <span className="text-stone-500">· se actualiza solo cada 15 s</span>
            </p>
          }
        >
          <div className="space-y-8">
            <section aria-labelledby="por-atender">
              <h2 id="por-atender" className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
                Por atender <span className="font-normal tabular-nums">({active.length})</span>
              </h2>
              <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {active.map((o) => orderCard(o, o.id === "o-3"))}
              </ul>
            </section>
            {closed.length > 0 && (
              <section aria-labelledby="cerradas-hoy">
                <h2 id="cerradas-hoy" className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
                  Cerradas hoy <span className="font-normal tabular-nums">({closed.length})</span>
                </h2>
                <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{closed.map((o) => orderCard(o))}</ul>
              </section>
            )}
          </div>
        </PanelSectionBlock>

        {/* Mesas y QR */}
        <PanelSectionBlock
          id="mesas"
          title="Mesas y QR"
          description="Cada mesa tiene su propio QR. Descargalo, imprimilo y ponelo en la mesa: así sabemos de qué mesa viene cada orden."
          action={
            <div className="flex w-full gap-2 sm:w-auto">
              <Input placeholder="Mesa 3" aria-label="Nombre de la mesa" className="min-w-0 flex-1 sm:w-44 sm:flex-none" readOnly />
              <FakeAction className={`${buttonClasses("primary", "md")} shrink-0`}>
                <Icon name="plus" size={16} />
                Agregar mesa
              </FakeAction>
            </div>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tables.map((table) => (
              <li key={table.id}>
                <Card className="flex h-full flex-col items-center p-5 text-center">
                  <h2 className="font-semibold text-brand-950">{table.label}</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt={`Código QR de ${table.label}`}
                    width={160}
                    height={160}
                    className="my-3 h-40 w-40 rounded-lg border border-stone-200"
                  />
                  <a
                    href="/preview/cliente"
                    className="inline-flex min-h-11 max-w-full items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-900"
                  >
                    <span className="truncate">Abrir la carta de esta mesa</span>
                    <Icon name="arrow-right" size={14} className="shrink-0" />
                  </a>
                  <div className="mt-auto flex flex-wrap justify-center gap-2 pt-3">
                    <FakeAction className={buttonClasses("soft", "sm")}>
                      <Icon name="printer" size={16} />
                      Descargar
                    </FakeAction>
                    <FakeAction className={buttonClasses("ghost", "sm")}>SVG</FakeAction>
                    <FakeAction className={buttonClasses("ghost", "sm")}>
                      <Icon name="qr" size={16} />
                      Cambiar QR
                    </FakeAction>
                    <FakeAction className={buttonClasses("danger-soft", "sm")}>
                      <Icon name="trash" size={16} />
                      Eliminar
                    </FakeAction>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </PanelSectionBlock>

        {/* Reportes */}
        <PanelSectionBlock
          id="reportes"
          title="Reportes"
          description="Lo vendido en los últimos 14 días (hoy incluido), el ticket promedio y los platillos que más salen en ese período."
        >
          <section aria-label="Cifras de los últimos 14 días" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard label="Vendido (últimos 14 días)" value={money(totalRevenue)} icon="wallet" accent="accent" />
            <StatCard label="Órdenes (últimos 14 días)" value={totalOrders.toLocaleString("es-CR")} icon="receipt" />
            <StatCard label="Ticket promedio" value={money(totalOrders ? totalRevenue / totalOrders : 0)} icon="chart" accent="slate" />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por día</CardTitle>
              </CardHeader>
              <CardBody className="pt-2">
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
                        <td className="py-2.5 text-right text-stone-700 tabular-nums">{r.orders_count.toLocaleString("es-CR")}</td>
                        <td className="py-2.5 text-right font-semibold text-brand-950 tabular-nums">{money(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platillos más vendidos (últimos 14 días)</CardTitle>
              </CardHeader>
              <CardBody>
                <ol className="space-y-4">
                  {topRows.map((r) => (
                    <li key={r.name}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="min-w-0 font-medium text-brand-950 [overflow-wrap:anywhere]">{r.name}</span>
                        <span className="shrink-0 text-stone-600 tabular-nums">{r.units} u.</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200" aria-hidden="true">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(r.units / maxUnits) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          </div>
        </PanelSectionBlock>

        {/* Configuración */}
        <PanelSectionBlock
          id="configuracion"
          title="Configuración"
          description="Los datos de tu local, la moneda, los idiomas, los colores de tu carta y tu contraseña."
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tu plan: Estándar</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 text-sm text-stone-700">
                <p>Incluye 2 idiomas en la carta (elegís cuáles abajo).</p>
                <p className="flex items-start gap-2">
                  <Icon name="check-circle" size={18} className="mt-0.5 shrink-0 text-brand-700" />
                  <span>Incluye pedidos desde la mesa: los comensales piden desde el teléfono y la orden entra en Órdenes.</span>
                </p>
                <span className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4">
                  <Icon name="whatsapp" size={16} />
                  ¿Querés cambiar de plan? Escribinos
                </span>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos del negocio</CardTitle>
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="demo-nombre">Nombre del local</Label>
                  <Input id="demo-nombre" defaultValue={mockSettings.restaurant_name ?? ""} readOnly />
                </div>
                <div>
                  <Label htmlFor="demo-telefono">Teléfono</Label>
                  <Input id="demo-telefono" defaultValue={mockSettings.phone ?? ""} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="demo-direccion">Dirección</Label>
                  <Input id="demo-direccion" defaultValue={mockSettings.address ?? ""} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="demo-logo">Logo (enlace a la imagen)</Label>
                  <Input id="demo-logo" placeholder="https://…" readOnly />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moneda e idiomas</CardTitle>
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="demo-moneda">Moneda</Label>
                  <Select id="demo-moneda" defaultValue="CRC" disabled>
                    <option value="CRC">CRC — Colón costarricense (₡)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="demo-idioma">Idioma por defecto</Label>
                  <Select id="demo-idioma" defaultValue="es" disabled>
                    <option value="es">{LANG_LABEL.es}</option>
                  </Select>
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className="mb-1.5 block text-sm font-medium text-stone-800">Idiomas de la carta</legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    {(["es", "en", "pt"] as const).map((l) => {
                      const checked = mockSettings.enabled_languages.includes(l);
                      return (
                        <label
                          key={l}
                          className={`flex min-h-11 items-center gap-2.5 text-sm ${checked ? "text-stone-800" : "text-stone-500"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled
                            readOnly
                            className="h-5 w-5 rounded border-stone-300 accent-brand-600"
                          />
                          {LANG_LABEL[l]}
                        </label>
                      );
                    })}
                  </div>
                  <FieldHint className="mt-1">Tu plan incluye 2 idiomas: para activar otro, desactivá uno.</FieldHint>
                </fieldset>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colores de la carta</CardTitle>
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="demo-color-principal">Color principal</Label>
                  <input
                    id="demo-color-principal"
                    type="color"
                    defaultValue={mockSettings.theme.primary}
                    disabled
                    className="h-11 w-full rounded-lg border border-stone-300 bg-white p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="demo-color-acento">Color de acento</Label>
                  <input
                    id="demo-color-acento"
                    type="color"
                    defaultValue={mockSettings.theme.accent}
                    disabled
                    className="h-11 w-full rounded-lg border border-stone-300 bg-white p-1"
                  />
                </div>
              </CardBody>
            </Card>

            <div>
              <FakeAction className={`${buttonClasses("primary", "md")} w-full sm:w-auto`}>Guardar configuración</FakeAction>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 sm:grid-cols-3">
                  <p className="text-sm text-stone-600 sm:col-span-3">
                    Si te dimos una contraseña inicial por WhatsApp, cambiala acá por una tuya. Mínimo 10 caracteres.
                  </p>
                  <div>
                    <Label htmlFor="demo-pw-actual">Contraseña actual</Label>
                    <Input id="demo-pw-actual" type="password" autoComplete="off" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="demo-pw-nueva">Contraseña nueva</Label>
                    <Input id="demo-pw-nueva" type="password" autoComplete="off" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="demo-pw-repetir">Repetí la nueva</Label>
                    <Input id="demo-pw-repetir" type="password" autoComplete="off" readOnly />
                  </div>
                  <div className="sm:col-span-3">
                    <FakeAction className={`${buttonClasses("primary", "md")} w-full sm:w-auto`}>
                      Cambiar contraseña
                    </FakeAction>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </PanelSectionBlock>

        {/* Avisos que el panel real muestra según el plan y el estado del local */}
        <PanelSectionBlock
          id="avisos"
          title="Avisos del panel"
          description="Lo que se ve cuando el plan no incluye pedidos, cuando el local está suspendido o cancelado y en otros casos."
        >
          <div className="space-y-8">
            <div>
              <h2 className="mb-3 text-base font-semibold text-brand-900">Plan Carta, en Órdenes y en Mesas y QR</h2>
              <NoTableOrderingNotice where="orders" planHref="#configuracion" />
              <NoTableOrderingNotice where="tables" planHref="#configuracion" />
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold text-brand-900">Local suspendido o cancelado</h2>
              <ReadOnlyBanner status="suspended" name={displayName} demo />
              <ReadOnlyBanner status="cancelled" name={displayName} demo />
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold text-brand-900">Periodo de prueba y descarga de QR</h2>
              <p className="mb-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
                <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-accent-700" />
                <span>
                  Estás en periodo de prueba hasta el <strong>{formatDate(new Date(Date.now() + 18 * 86400000))}</strong>.
                </span>
              </p>
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                No se pudo descargar ese QR: la mesa ya no existe o la conexión falló. Probá de nuevo desde la lista.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-base font-semibold text-brand-900">Sin órdenes todavía</h2>
              <EmptyState icon="receipt" title="Todavía no hay órdenes">
                Cuando un cliente pida desde el QR de su mesa, la orden aparece acá. El tablero se actualiza
                solo cada 15 segundos.
              </EmptyState>
            </div>
          </div>
        </PanelSectionBlock>
      </PanelFrame>
    </div>
  );
}
