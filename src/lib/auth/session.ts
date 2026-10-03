import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

// Devuelve el usuario autenticado y su perfil, o null.
export async function getSessionProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) console.error("[datafud] getUser:", userError.name, userError.message);
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) console.error("[datafud] profiles:", error.code, error.message);

    return (profile as Profile) ?? null;
  } catch (e) {
    const err = e as Error;
    console.error("[datafud] getSessionProfile lanzó:", err?.name, err?.message, err?.stack?.split("\n").slice(0, 5).join(" | "));
    throw e;
  }
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
