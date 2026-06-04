import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuClient, type MenuPayload } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function CustomerMenuPage({
  params,
}: {
  params: Promise<{ tenant: string; table: string }>;
}) {
  const { tenant: slug, table: token } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_menu", {
    p_slug: slug,
    p_token: token,
  });

  if (error || !data) {
    notFound();
  }

  return <MenuClient data={data as MenuPayload} slug={slug} token={token} />;
}
