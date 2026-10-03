import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card } from "@/components/ui/card";
import { formatUsdAmount } from "@/lib/currency/format";
import type { Plan } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function limit(v: number | null | undefined) {
  if (v === null) return "Ilimitado";
  if (v === undefined) return "—";
  return String(v);
}

export default async function PlansPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  const plans = (data as Plan[]) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Planes"
        description="Los planes y los límites que ofrecemos, tal como están en la base de datos."
      />

      {plans.length === 0 ? (
        <EmptyState icon="sparkles" title="No hay planes cargados">
          Los planes vienen de las semillas de <code className="text-brand-900">supabase/schema.sql</code>.
          Si esta lista está vacía, falta correr el esquema en este proyecto de Supabase.
        </EmptyState>
      ) : (
        <div className="panel-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      )}
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
