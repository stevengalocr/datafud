import { PreviewBanner } from "@/components/preview/preview-banner";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TENANT_STATUS_COLOR,
  TENANT_STATUS_LABEL,
} from "@/lib/constants";
import {
  mockPayments,
  mockPlans,
  mockTenants,
} from "@/lib/demo/mock";

const PAYMENT_COLOR: Record<string, string> = {
  paid: "bg-brand-100 text-brand-800",
  pending: "bg-amber-100 text-amber-800",
  overdue: "bg-rose-100 text-rose-700",
};

function limit(v: number | null) {
  return v === null ? "Ilimitado" : String(v);
}

export default function PreviewAdmin() {
  const tenants = mockTenants;
  const planById = new Map(mockPlans.map((p) => [p.id, p]));
  const nameById = new Map(tenants.map((t) => [t.id, t.name]));

  const total = tenants.length;
  const active = tenants.filter((t) => t.status === "active").length;
  const trial = tenants.filter((t) => t.status === "trial").length;
  const suspended = tenants.filter((t) => t.status === "suspended").length;
  const mrr = mockPayments
    .filter((p) => p.paid_at)
    .reduce((s, p) => s + Number(p.amount_usd), 0);

  const stats = [
    { label: "Restaurantes", value: total, icon: "🏬" },
    { label: "Activos", value: active, icon: "✅" },
    { label: "En prueba", value: trial, icon: "🧪" },
    { label: "Suspendidos", value: suspended, icon: "⏸️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PreviewBanner active="/preview/admin" />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel del dueño del SaaS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vista general de todos tus clientes del SaaS.
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardBody>
            <p className="text-sm text-slate-500">Ingresos registrados (acumulado)</p>
            <p className="mt-1 text-3xl font-bold text-brand-600">
              ${mrr.toLocaleString("es")}
            </p>
          </CardBody>
        </Card>

        {/* Restaurantes */}
        <h2 className="mb-3 mt-8 text-lg font-bold text-slate-900">Restaurantes</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Negocio</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Registro</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">
                      {t.owner_email} · /{t.slug}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {t.plan_id ? planById.get(t.plan_id)?.name : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={TENANT_STATUS_COLOR[t.status]}>
                      {TENANT_STATUS_LABEL[t.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(t.created_at).toLocaleDateString("es")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                        Aprobar
                      </span>
                      <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Suspender
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Pagos */}
        <h2 className="mb-3 mt-8 text-lg font-bold text-slate-900">Pagos</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Restaurante</th>
                <th className="px-5 py-3 font-medium">Monto</th>
                <th className="px-5 py-3 font-medium">Periodo</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPayments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {nameById.get(p.tenant_id)}
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    ${Number(p.amount_usd).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(p.period_start).toLocaleDateString("es")} –{" "}
                    {new Date(p.period_end).toLocaleDateString("es")}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={PAYMENT_COLOR[p.status]}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Planes */}
        <h2 className="mb-3 mt-8 text-lg font-bold text-slate-900">Planes</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {mockPlans.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="text-2xl font-bold text-brand-600">
                  ${p.price_usd.toFixed(0)}
                  <span className="text-sm font-normal text-slate-400">/mes</span>
                </p>
              </CardHeader>
              <CardBody>
                <dl className="space-y-2 text-sm">
                  <Row k="Idiomas" v={limit(p.features.max_languages)} />
                  <Row k="Platillos" v={limit(p.features.max_products)} />
                  <Row k="Categorías" v={limit(p.features.max_categories)} />
                  <Row k="Mesas / QR" v={limit(p.features.max_tables)} />
                  <Row k="Reportes avanzados" v={p.features.advanced_reports ? "Sí" : "No"} />
                </dl>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-slate-50 pb-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800">{v}</dd>
    </div>
  );
}
