import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody } from "@/components/ui/card";
import type { Plan } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function limit(v: number | null) {
  return v === null ? "Ilimitado" : String(v);
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
        title="Planes"
        description="Los planes y límites que ofreces a tus clientes."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardBody>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="text-2xl font-bold text-brand-600">
                  ${Number(p.price_usd).toFixed(0)}
                  <span className="text-sm font-normal text-slate-400">/mes</span>
                </p>
              </div>
              <dl className="mt-5 space-y-2 text-sm">
                <Row k="Idiomas" v={limit(p.features.max_languages)} />
                <Row k="Platillos" v={limit(p.features.max_products)} />
                <Row k="Categorías" v={limit(p.features.max_categories)} />
                <Row k="Mesas / QR" v={limit(p.features.max_tables)} />
                <Row
                  k="Reportes avanzados"
                  v={p.features.advanced_reports ? "Sí" : "No"}
                />
                <Row
                  k="Branding completo"
                  v={p.features.full_branding ? "Sí" : "No"}
                />
              </dl>
            </CardBody>
          </Card>
        ))}
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
