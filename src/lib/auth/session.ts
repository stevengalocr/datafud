import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

// Devuelve el usuario autenticado y su perfil, o null.
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

// Exige sesión + rol. Redirige a /login o a la home del rol correcto.
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
