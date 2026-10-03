import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shell/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TENANT_STATUS_COLOR, TENANT_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { TenantStatusActions } from "./tenant-actions";
import { CreateTenantForm } from "./create-tenant-form";
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
  const planName = (t: Tenant) => (t.plan_id ? planById.get(t.plan_id)?.name ?? "—" : "Sin plan");

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Restaurantes"
        description="Creá un local y aprobá, suspendé o cancelá su acceso."
      />

      <div className="mb-6">
        <CreateTenantForm
          plans={((plans as Plan[] | null) ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => ({ code: p.code, name: p.name }))}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState icon="store" title="Todavía no hay restaurantes">
          Creá el primero con «Crear restaurante»: aparece acá con su plan y su estado.
        </EmptyState>
      ) : (
        <>
          {/* Teléfono: una ficha por local, sin tabla que obligue a desplazarse de lado. */}
          <ul className="space-y-3 md:hidden">
            {list.map((t) => (
              <li key={t.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-brand-950">{t.name}</p>
                      <p className="mt-0.5 break-all text-xs text-stone-600">
                        {t.owner_email ?? "Sin correo"} · /{t.slug}
                      </p>
                    </div>
                    <Badge className={TENANT_STATUS_COLOR[t.status]}>
                      {TENANT_STATUS_LABEL[t.status]}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-stone-700">
                    {planName(t)} · desde el {formatDate(t.created_at)}
                  </p>
                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <TenantStatusActions tenantId={t.id} tenantName={t.name} status={t.status} />
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
                  {list.map((t) => (
                    <tr key={t.id} className="align-top hover:bg-cream-50">
                      <td className="max-w-[22rem] px-5 py-3.5">
                        <p className="font-medium text-brand-950">{t.name}</p>
                        <p className="break-all text-xs text-stone-600">
                          {t.owner_email ?? "Sin correo"} · /{t.slug}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-stone-700">{planName(t)}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={TENANT_STATUS_COLOR[t.status]}>
                          {TENANT_STATUS_LABEL[t.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-600">
                        {formatDate(t.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <TenantStatusActions tenantId={t.id} tenantName={t.name} status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
