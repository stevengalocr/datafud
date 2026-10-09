import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

// Devuelve el usuario autenticado y su perfil, o null. Un error de Supabase lanza (lo atrapa el
// `error.tsx` del panel) en vez de parecer «sin sesión» y mandar al login. `cache` lo comparte
// entre el layout y la página del mismo pedido.
export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[datafud] getSessionProfile:", error.code ?? "-", error.message ?? "");
    throw new Error("No se pudo verificar la sesión.");
  }

  return (profile as Profile | null) ?? null;
});

// Exige sesión + rol. Redirige a /login o a la home del rol correcto. Se llama en el layout y
// también en cada página y acción de /admin: el layout solo no alcanza como única verificación.
export async function requireRole(
  role: "super_admin" | "restaurant_admin"
): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) {
    redirect(profile.role === "super_admin" ? "/admin" : "/dashboard");
  }
  return profile;
}
