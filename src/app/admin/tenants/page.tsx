import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TENANT_STATUS_COLOR, TENANT_STATUS_LABEL } from "@/lib/constants";
import { TenantStatusActions } from "./tenant-actions";
import type { Plan, Tenant } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: plans } = await supabase.from("plans").select("*");

  const list = (tenants as Tenant[]) ?? [];
  const planById = new Map((plans as Plan[] | null)?.map((p) => [p.id, p]) ?? []);

  return (
    <div>
      <PageHeader
        title="Restaurantes"
        description="Aprueba, suspende o cancela el acceso de cada cliente."
      />

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
            {list.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">
                    {t.owner_email ?? "—"} · /{t.slug}
                  </p>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {t.plan_id ? planById.get(t.plan_id)?.name ?? "—" : "—"}
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
                  <TenantStatusActions tenantId={t.id} status={t.status} />
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Aún no hay restaurantes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
