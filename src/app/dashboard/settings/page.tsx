import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { LANG_LABEL } from "@/lib/constants";
import { waProps } from "@/lib/site";
import type { PlanLimits } from "@/lib/auth/plan";
import { must } from "../_lib/queries";
import { SettingsForm } from "./settings-form";
import { PasswordForm } from "@/components/shell/password-form";
import { changePassword } from "./actions";
import type { Currency, Lang } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { settings, plan, readOnly } = await getTenantContext();
  const supabase = await createClient();
  const currencies = must<Currency>(
    await supabase.from("currencies").select("*").order("code"),
    "settings.currencies"
  );

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Los datos de tu local, la moneda, los idiomas, los colores de tu carta y tu contraseña."
      />
      <div className="space-y-6">
        <PlanCard plan={plan} />
        <SettingsForm
          settings={settings}
          currencies={currencies}
          maxLanguages={plan.maxLanguages}
          readOnly={readOnly}
        />
        <PasswordForm action={changePassword} />
      </div>
    </div>
  );
}

const LANGS: Lang[] = ["es", "en", "pt"];

// Lo que incluye el plan, dicho en claro: cuántos idiomas y si la carta recibe pedidos.
function PlanCard({ plan }: { plan: PlanLimits }) {
  const wa = waProps("contacto", "Hola, quiero cambiar el plan de DataFud de mi local.");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.label ? `Tu plan: ${plan.label}` : "Tu plan"}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3 text-sm text-stone-700">
        <p>
          Incluye {plan.maxLanguages} {plan.maxLanguages === 1 ? "idioma" : "idiomas"} en la carta
          {plan.maxLanguages < LANGS.length ? " (elegís cuáles abajo)" : `: ${LANGS.map((l) => LANG_LABEL[l]).join(", ")}`}.
        </p>
        {plan.tableOrdering ? (
          <p className="flex items-start gap-2">
            <Icon name="check-circle" size={18} className="mt-0.5 shrink-0 text-brand-700" />
            <span>Incluye pedidos desde la mesa: los comensales piden desde el teléfono y la orden entra en Órdenes.</span>
          </p>
        ) : (
          <p className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2.5 text-brand-900">
            <Icon name="utensils" size={18} className="mt-0.5 shrink-0 text-accent-800" />
            <span>
              Tu plan no incluye pedidos desde la mesa: los comensales ven la carta en el teléfono,
              pero piden como siempre, con quien los atiende. Para recibir pedidos en Órdenes, hace falta
              un plan que los incluya.
            </span>
          </p>
        )}
        <a
          {...wa}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4 hov:text-brand-900"
        >
          <Icon name="whatsapp" size={16} />
          ¿Querés cambiar de plan? Escribinos
        </a>
      </CardBody>
    </Card>
  );
}
