import { getTenantContext } from "@/lib/auth/tenant-context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shell/page-header";
import { MenuManager } from "./menu-manager";
import type { Category, Product } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const { settings } = await getTenantContext();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Menú"
        description="Administra tus categorías y platillos en varios idiomas."
      />
      <MenuManager
        categories={(categories as Category[]) ?? []}
        products={(products as Product[]) ?? []}
        currency={settings?.currency_code ?? "USD"}
      />
    </div>
  );
}
