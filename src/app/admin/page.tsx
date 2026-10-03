import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { StatCard } from "@/components/shell/stat-card";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { TENANT_STATUS_COLOR, TENANT_STATUS_LABEL } from "@/lib/constants";
import { formatUsdAmount } from "@/lib/currency/format";
import { formatDate } from "@/lib/dates";
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
    { label: "En prueba", value: trial, icon: "clock", accent: "accent" },
    { label: "Suspendidos", value: suspended, icon: "pause", accent: "slate" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Resumen"
        description="Cómo van los restaurantes que usan DataFud y lo que han pagado."
      />

      <section aria-label="Cifras generales" className="panel-stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
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
          {list.length > 0 && (
            <Link
              href="/admin/tenants"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hov:text-brand-900"
            >
              Ver todos
              <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </CardHeader>
        {list.length === 0 ? (
          <div className="p-5">
            <EmptyState icon="store" title="Todavía no hay restaurantes">
              Cuando se dé de alta el primero, aparece acá con su estado. Desde{" "}
              <Link href="/admin/tenants" className="font-semibold text-brand-700 underline decoration-accent-400 underline-offset-4">
                Restaurantes
              </Link>{" "}
              lo aprobás, lo suspendés o lo cancelás, y en Pagos y Cargos registrás lo que paga.
            </EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-950">{t.name}</p>
                  <p className="truncate text-xs text-stone-600">
                    /{t.slug} · desde el {formatDate(t.created_at)}
                  </p>
                </div>
                <Badge className={TENANT_STATUS_COLOR[t.status]}>
                  {TENANT_STATUS_LABEL[t.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
