import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { MenuManager } from "./menu-manager";
import type { Category, Product } from "@/lib/supabase/types";
import { fetchAll, must } from "../_lib/queries";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { tenant, settings, readOnly } = await getTenantContext();
  const supabase = await createClient();

  // Un error de la base no se pinta como «Empezá por las categorías»: entra error.tsx (AA-5).
  const [categories, products] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      // Defensa en profundidad (S1): la garantía es RLS.
      .eq("tenant_id", tenant.id)
      .order("sort_order", { ascending: true })
      .order("created_at")
      .then((r) => must<Category>(r, "categorías")),
    fetchAll<Product>("platillos", (from, to) =>
      supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("sort_order", { ascending: true })
        .order("created_at")
        .order("id")
        .range(from, to)
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Menú"
        description="Tus categorías y platillos, en los idiomas de tu plan. Lo que cambiés acá se ve en la carta de tus mesas."
      />
      <MenuManager
        categories={categories}
        products={products}
        currency={settings?.currency_code ?? "USD"}
        readOnly={readOnly}
      />
    </div>
  );
}
