import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { SettingsForm } from "./settings-form";
import type { Currency } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { settings } = await getTenantContext();
  const supabase = await createClient();
  const { data: currencies } = await supabase
    .from("currencies")
    .select("*")
    .order("code");

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Personaliza tu negocio: moneda, idiomas, branding y colores."
      />
      <SettingsForm
        settings={settings}
        currencies={(currencies as Currency[]) ?? []}
      />
    </div>
  );
}
