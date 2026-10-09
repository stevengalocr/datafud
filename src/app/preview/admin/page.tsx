import type { Metadata } from "next";
import { PreviewBanner } from "@/components/preview/preview-banner";
import {
  FakeAction,
  PanelFrame,
  PanelSectionBlock,
  type PanelSection,
} from "@/components/preview/panel-frame";
import { StatCard } from "@/components/shell/stat-card";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  CHARGE_KIND_LABEL,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  PRICING,
  TENANT_STATUS_COLOR,
  TENANT_STATUS_LABEL,
} from "@/lib/constants";
import { formatUsd, formatUsdAmount } from "@/lib/currency/format";
import { formatDate, localDayKey } from "@/lib/dates";
import type { Tenant } from "@/lib/supabase/types";
import { mockCharges, mockPayments, mockPlans, mockTenants } from "@/lib/demo/mock";

// Vista interna del dueño del SaaS: fuera del recorrido público, sin enlaces y sin indexar.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Mismo contenido que las seis páginas del panel interno (Resumen, Restaurantes, Pagos, Cargos,
// Planes y Tu cuenta), con las mismas cabeceras y textos, en una sola página estática y con datos
// de ejemplo. Sin backend: los botones se dibujan y no hacen nada. Los correos de los dueños no
// se muestran (el panel real sí): en su lugar va el nombre de ejemplo.

const SECTIONS: PanelSection[] = [
  { id: "resumen", label: "Resumen", icon: "grid" },
  { id: "restaurantes", label: "Restaurantes", icon: "store" },
  { id: "pagos", label: "Pagos", icon: "card" },
  { id: "cargos", label: "Cargos", icon: "receipt" },
  { id: "planes", label: "Planes", icon: "sparkles" },
  { id: "cuenta", label: "Tu cuenta", icon: "shield" },
];

function limit(v: number | null | undefined) {
  if (v === null) return "Ilimitado";
  if (v === undefined) return "—";
  return String(v);
}

/** Los botones de estado de un local, igual que `TenantStatusActions`. */
function StatusActions({ status }: { status: Tenant["status"] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {status !== "active" && (
          <FakeAction className={buttonClasses("soft", "sm")}>{status === "trial" ? "Aprobar" : "Reactivar"}</FakeAction>
        )}
        {status !== "suspended" && status !== "cancelled" && (
          <FakeAction className={buttonClasses("soft", "sm")}>Suspender</FakeAction>
        )}
        {status !== "cancelled" && <FakeAction className={buttonClasses("danger-soft", "sm")}>Cancelar</FakeAction>}
      </div>
    </div>
  );
}

export const revalidate = 3600;

export default function PreviewAdmin() {
  const tenants = [...mockTenants].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const planById = new Map(mockPlans.map((p) => [p.id, p]));
  const nameById = new Map(tenants.map((t) => [t.id, t.name]));
  const planName = (t: Tenant) => (t.plan_id ? planById.get(t.plan_id)?.name ?? "—" : "Sin plan");
  const payments = [...mockPayments].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const charges = [...mockCharges].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const plans = [...mockPlans].sort((a, b) => a.sort_order - b.sort_order);

  const total = tenants.length;
  const active = tenants.filter((t) => t.status === "active").length;
  const trial = tenants.filter((t) => t.status === "trial").length;
  const suspended = tenants.filter((t) => t.status === "suspended").length;
  const mrr = payments.filter((p) => p.paid_at).reduce((s, p) => s + Number(p.amount_usd), 0);

  const stats: { label: string; value: number; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Restaurantes", value: total, icon: "store", accent: "brand" },
    { label: "Activos", value: active, icon: "check-circle", accent: "brand" },
    { label: "En prueba", value: trial, icon: "clock", accent: "accent" },
    { label: "Suspendidos", value: suspended, icon: "pause", accent: "slate" },
  ];

  // Las cifras de Cargos salen de PRICING, como en el panel real (regla 6).
  const chargesDescription = `Cobros únicos de cada local: implementación (${formatUsd(
    PRICING.setupFee.sistema.usd
  )} el sistema completo, ${formatUsd(PRICING.setupFee.carta.usd)} la Carta) y tarjetas NFC (${formatUsd(
    PRICING.nfcUnitUsd
  )} c/u).`;

  // El formulario de pagos propone el monto del plan del primer local; la demo elige uno suspendido
  // para enseñar el texto que aparece al registrar el pago.
  const payTenant = tenants.find((t) => t.status === "suspended") ?? tenants[0];
  const payPlan = payTenant.plan_id ? planById.get(payTenant.plan_id) : undefined;
  const todayKey = localDayKey();
  const nextKey = localDayKey(new Date(Date.now() + 30 * 86400000));

  return (
    <div>
      <PreviewBanner />
      <PanelFrame label="Así se ve el panel interno de DataFud" sections={SECTIONS}>
        {/* Resumen */}
        <PanelSectionBlock
          id="resumen"
          eyebrow="Administración"
          title="Resumen"
          description="Cómo van los restaurantes que usan DataFud y lo que han pagado."
        >
          <section aria-label="Cifras generales" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
            <div className="col-span-2 lg:col-span-1">
              <StatCard
                label="Cobrado"
                value={formatUsdAmount(mrr)}
                icon="wallet"
                accent="accent"
                hint="Suma de mensualidades pagadas"
              />
            </div>
          </section>

          <Card className="mt-6">
            <CardHeader className="justify-between">
              <CardTitle>Últimos restaurantes</CardTitle>
              <a
                href="#restaurantes"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hov:text-brand-900"
              >
                Ver todos
                <Icon name="arrow-right" size={16} />
              </a>
            </CardHeader>
            <ul className="divide-y divide-stone-100">
              {tenants.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-950">{t.name}</p>
                    <p className="truncate text-xs text-stone-600">
                      /{t.slug} · desde el {formatDate(t.created_at)}
                    </p>
                  </div>
                  <Badge className={TENANT_STATUS_COLOR[t.status]}>{TENANT_STATUS_LABEL[t.status]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </PanelSectionBlock>

        {/* Restaurantes */}
        <PanelSectionBlock
          id="restaurantes"
          eyebrow="Administración"
          title="Restaurantes"
          description="Creá un local y aprobá, suspendé o cancelá su acceso."
        >
          <div className="mb-6">
            <FakeAction className={buttonClasses("primary", "md")}>
              <Icon name="plus" size={18} />
              Crear restaurante
            </FakeAction>
          </div>

          {/* Teléfono: una ficha por local, sin tabla que obligue a desplazarse de lado. */}
          <ul className="space-y-3 md:hidden">
            {tenants.map((t) => (
              <li key={t.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-brand-950">{t.name}</p>
                      <p className="mt-0.5 break-all text-xs text-stone-600">
                        {t.owner_name ?? "Sin nombre"} · /{t.slug}
                      </p>
                    </div>
                    <Badge className={TENANT_STATUS_COLOR[t.status]}>{TENANT_STATUS_LABEL[t.status]}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-stone-700">
                    {planName(t)} · desde el {formatDate(t.created_at)}
                  </p>
                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <StatusActions status={t.status} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Restaurantes con su plan, estado y acciones</caption>
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Negocio</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Plan</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Alta</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="align-top">
                      <td className="max-w-[22rem] px-5 py-3.5">
                        <p className="font-medium text-brand-950">{t.name}</p>
                        <p className="break-all text-xs text-stone-600">
                          {t.owner_name ?? "Sin nombre"} · /{t.slug}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-stone-700">{planName(t)}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={TENANT_STATUS_COLOR[t.status]}>{TENANT_STATUS_LABEL[t.status]}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">{formatDate(t.created_at)}</td>
                      <td className="px-5 py-3">
                        <StatusActions status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </PanelSectionBlock>

        {/* Pagos */}
        <PanelSectionBlock
          id="pagos"
          eyebrow="Administración"
          title="Pagos"
          description="Registrá las mensualidades y controlá los vencimientos de cada local."
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registrar pago manual</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                <div className="sm:col-span-2">
                  <Label htmlFor="demo-pago-restaurante">Restaurante</Label>
                  <Select id="demo-pago-restaurante" defaultValue={payTenant.id} aria-describedby="demo-pago-estado" disabled>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <FieldHint id="demo-pago-estado" className="mt-1.5">
                    Hoy está «{TENANT_STATUS_LABEL[payTenant.status]}»: al registrar el pago queda activo.
                  </FieldHint>
                </div>
                <div>
                  <Label htmlFor="demo-pago-monto">Monto (USD)</Label>
                  <Input id="demo-pago-monto" type="number" defaultValue={payPlan ? payPlan.price_usd : ""} readOnly />
                </div>
                <div>
                  <Label htmlFor="demo-pago-desde">Desde</Label>
                  <Input id="demo-pago-desde" type="date" defaultValue={todayKey} readOnly />
                </div>
                <div>
                  <Label htmlFor="demo-pago-hasta">Hasta</Label>
                  <Input id="demo-pago-hasta" type="date" defaultValue={nextKey} readOnly />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4 lg:col-span-5">
                  <FakeAction className={`${buttonClasses("primary", "md")} w-full sm:w-auto`}>Registrar pago</FakeAction>
                  <FieldHint tone="success" className="font-medium">
                    Pago registrado. El local quedó activo y su carta vuelve a abrirse.
                  </FieldHint>
                </div>
              </div>
            </CardBody>
          </Card>

          <h2 className="mb-3 text-base font-semibold text-brand-900">Historial</h2>
          <ul className="space-y-3 md:hidden">
            {payments.map((p) => (
              <li key={p.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-brand-950">
                      {nameById.get(p.tenant_id) ?? "Restaurante sin nombre"}
                    </p>
                    <Badge className={PAYMENT_STATUS_COLOR[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-brand-950 tabular-nums">
                    {formatUsdAmount(Number(p.amount_usd))}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatDate(p.period_start)} – {formatDate(p.period_end)}
                    {p.paid_at ? ` · pagado el ${formatDate(p.paid_at)}` : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Mensualidades registradas</caption>
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Restaurante</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Monto</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Periodo</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-3.5 font-medium text-brand-950">{nameById.get(p.tenant_id) ?? "—"}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-brand-950 tabular-nums">
                        {formatUsdAmount(Number(p.amount_usd))}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-700">
                        {formatDate(p.period_start)} – {formatDate(p.period_end)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={PAYMENT_STATUS_COLOR[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">
                        {p.paid_at ? formatDate(p.paid_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </PanelSectionBlock>

        {/* Cargos */}
        <PanelSectionBlock id="cargos" eyebrow="Administración" title="Cargos" description={chargesDescription}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registrar cargo puntual</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
                <div className="sm:col-span-2">
                  <Label htmlFor="demo-cargo-restaurante">Restaurante</Label>
                  <Select id="demo-cargo-restaurante" defaultValue={tenants[0].id} disabled>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="demo-cargo-concepto">Concepto</Label>
                  <Select id="demo-cargo-concepto" defaultValue="nfc_cards" disabled>
                    <option value="implementation">Implementación única</option>
                    <option value="nfc_cards">Tarjetas NFC</option>
                    <option value="other">Otro</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="demo-cargo-cantidad">Cantidad</Label>
                  <Input id="demo-cargo-cantidad" type="number" defaultValue={10} readOnly />
                </div>
                <div>
                  <Label htmlFor="demo-cargo-precio">Precio unidad (USD)</Label>
                  <Input id="demo-cargo-precio" type="number" defaultValue={PRICING.nfcUnitUsd} readOnly />
                </div>
                <div>
                  <Label htmlFor="demo-cargo-estado">Estado</Label>
                  <Select id="demo-cargo-estado" defaultValue="paid" disabled>
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente</option>
                  </Select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="demo-cargo-descripcion">Descripción (opcional)</Label>
                  <Input id="demo-cargo-descripcion" placeholder="Ej. 10 tarjetas NFC para mesas" readOnly />
                </div>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4">
                  <p className="text-sm text-stone-600">
                    Total:{" "}
                    <span className="text-base font-semibold text-brand-950 tabular-nums">
                      {formatUsdAmount(10 * PRICING.nfcUnitUsd)}
                    </span>
                  </p>
                  <FakeAction className={`${buttonClasses("primary", "md")} w-full sm:w-auto`}>Registrar cargo</FakeAction>
                </div>
              </div>
            </CardBody>
          </Card>

          <h2 className="mb-3 text-base font-semibold text-brand-900">Historial</h2>
          <ul className="space-y-3 md:hidden">
            {charges.map((c) => (
              <li key={c.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-brand-950">
                      {nameById.get(c.tenant_id) ?? "Restaurante sin nombre"}
                    </p>
                    <Badge className={PAYMENT_STATUS_COLOR[c.status]}>{PAYMENT_STATUS_LABEL[c.status]}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-brand-950 tabular-nums">
                    {formatUsdAmount(Number(c.amount_usd))}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    {CHARGE_KIND_LABEL[c.kind]} · {c.quantity} u. · {formatDate(c.created_at)}
                  </p>
                  {c.description && <p className="mt-1 text-sm text-stone-600">{c.description}</p>}
                </Card>
              </li>
            ))}
          </ul>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Cargos puntuales registrados</caption>
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Restaurante</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Concepto</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Cant.</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Total</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {charges.map((c) => (
                    <tr key={c.id} className="align-top">
                      <td className="px-5 py-3.5 font-medium text-brand-950">{nameById.get(c.tenant_id) ?? "—"}</td>
                      <td className="max-w-[20rem] px-5 py-3.5 text-stone-800">
                        {CHARGE_KIND_LABEL[c.kind]}
                        {c.description ? <span className="block text-xs text-stone-600">{c.description}</span> : null}
                      </td>
                      <td className="px-5 py-3.5 text-right text-stone-700 tabular-nums">{c.quantity}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-brand-950 tabular-nums">
                        {formatUsdAmount(Number(c.amount_usd))}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={PAYMENT_STATUS_COLOR[c.status]}>{PAYMENT_STATUS_LABEL[c.status]}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </PanelSectionBlock>

        {/* Planes */}
        <PanelSectionBlock
          id="planes"
          eyebrow="Administración"
          title="Planes"
          description="Los planes y los límites que ofrecemos, tal como están en la base de datos."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 className="min-w-0 font-display text-xl text-brand-900 [overflow-wrap:anywhere]">{p.name}</h2>
                  <p className="whitespace-nowrap text-xl font-semibold text-brand-700 tabular-nums">
                    {formatUsdAmount(Number(p.price_usd))}
                    <span className="text-sm font-normal text-stone-600">/mes</span>
                  </p>
                </div>
                <dl className="mt-5 divide-y divide-stone-100 text-sm">
                  <Row k="Idiomas" v={limit(p.features.max_languages)} />
                  <Row k="Platillos" v={limit(p.features.max_products)} />
                  <Row k="Categorías" v={limit(p.features.max_categories)} />
                  <Row k="Mesas / QR" v={limit(p.features.max_tables)} />
                  <Row k="Reportes avanzados" v={p.features.advanced_reports ? "Sí" : "No"} />
                  <Row k="Branding completo" v={p.features.full_branding ? "Sí" : "No"} />
                </dl>
              </Card>
            ))}
          </div>
        </PanelSectionBlock>

        {/* Tu cuenta */}
        <PanelSectionBlock
          id="cuenta"
          eyebrow="Administración"
          title="Tu cuenta"
          description="Cambiá la contraseña con la que entrás al panel interno."
        >
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-3">
                <p className="text-sm text-stone-600 sm:col-span-3">
                  Pide la contraseña actual. Al cambiarla se cierran las otras sesiones abiertas con tu usuario.
                  Mínimo 10 caracteres.
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
        </PanelSectionBlock>
      </PanelFrame>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-stone-600">{k}</dt>
      <dd className="font-medium text-brand-950 tabular-nums">{v}</dd>
    </div>
  );
}
