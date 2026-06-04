import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TENANT_STATUS_COLOR, TENANT_STATUS_LABEL } from "@/lib/constants";
import type { IconName } from "@/components/ui/icon";
import type { Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (tenants as Tenant[]) ?? [];
  const total = list.length;
  const active = list.filter((t) => t.status === "active").length;
  const trial = list.filter((t) => t.status === "trial").length;
  const suspended = list.filter((t) => t.status === "suspended").length;

  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("amount_usd, paid_at");
  const mrr =
    (payments ?? [])
      .filter((p: { paid_at: string | null }) => p.paid_at)
      .reduce((s: number, p: { amount_usd: number }) => s + Number(p.amount_usd), 0) || 0;

  const stats: { label: string; value: number; icon: IconName; accent: "brand" | "accent" | "slate" }[] = [
    { label: "Restaurantes", value: total, icon: "store", accent: "brand" },
    { label: "Activos", value: active, icon: "check-circle", accent: "brand" },
    { label: "En prueba", value: trial, icon: "beaker", accent: "accent" },
    { label: "Suspendidos", value: suspended, icon: "pause", accent: "slate" },
  ];

  return (
    <div>
      <PageHeader
        title="Resumen"
        description="Vista general de todos tus clientes del SaaS."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <p className="text-sm text-slate-500">Ingresos registrados (acumulado)</p>
            <p className="mt-1 text-3xl font-bold text-brand-600">
              ${mrr.toLocaleString("es")}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Suma de pagos confirmados
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Últimos restaurantes
            </p>
            <ul className="divide-y divide-slate-100">
              {list.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">/{t.slug}</p>
                  </div>
                  <Badge className={TENANT_STATUS_COLOR[t.status]}>
                    {TENANT_STATUS_LABEL[t.status]}
                  </Badge>
                </li>
              ))}
              {list.length === 0 && (
                <li className="py-6 text-center text-sm text-slate-400">
                  Aún no hay restaurantes registrados.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
