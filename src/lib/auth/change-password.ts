import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, fail, ok, zodFail } from "@/lib/action-result";
import { SIN_SESION } from "./tenant-access";

// Cambio de contraseña con la actual, compartido por el panel del restaurante y el del super
// admin (cada uno lo llama desde su Server Action, después de verificar el rol). Las
// contraseñas nunca se registran ni se devuelven.
const passwordSchema = z
  .object({
    current: z.string().min(1, "Escribí tu contraseña actual.").max(200, "La contraseña es muy larga."),
    next: z
      .string()
      .min(10, "La contraseña nueva tiene que tener al menos 10 caracteres.")
      .max(72, "La contraseña nueva puede tener hasta 72 caracteres."),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Las dos contraseñas nuevas no coinciden.", path: ["confirm"] })
  .refine((v) => v.next !== v.current, { message: "La contraseña nueva tiene que ser distinta de la actual.", path: ["next"] });

const GENERIC = "No se pudo cambiar la contraseña. Probá de nuevo en un momento.";

export type PasswordResult = ActionResult<{ message: string }>;

export async function changeOwnPassword(formData: FormData): Promise<PasswordResult> {
  const parsed = passwordSchema.safeParse({
    current: formData.get("current_password") ?? "",
    next: formData.get("new_password") ?? "",
    confirm: formData.get("confirm_password") ?? "",
  });
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return fail(SIN_SESION);

  // Se vuelve a verificar la actual en el mismo cliente de la sesión: así la sesión queda recién
  // iniciada para `updateUser`. Las sesiones que sobren se cierran al final.
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current,
  });
  if (authErr) {
    console.error("[datafud] changePassword.verify:", authErr.status ?? "-", authErr.code ?? "-");
    if (authErr.status === 429) return fail("Hiciste muchos intentos seguidos. Esperá unos minutos y probá de nuevo.");
    if (authErr.code === "invalid_credentials" || authErr.status === 400) {
      return fail("La contraseña actual no es correcta.");
    }
    return fail("No pudimos verificar tu contraseña actual. Probá de nuevo en un momento.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
  if (error) {
    console.error("[datafud] changePassword.update:", error.status ?? "-", error.code ?? "-");
    if (error.code === "weak_password") return fail("Esa contraseña es muy fácil de adivinar. Probá con una más larga o con más variedad.");
    if (error.code === "same_password") return fail("La contraseña nueva tiene que ser distinta de la actual.");
    return fail(GENERIC);
  }

  // Con la contraseña nueva, cualquier otra sesión abierta (por ejemplo, alguien que entró con la
  // contraseña inicial) se cierra. Esta sesión sigue.
  const { error: outErr } = await supabase.auth.signOut({ scope: "others" });
  if (outErr) {
    console.error("[datafud] changePassword.signOutOthers:", outErr.status ?? "-", outErr.code ?? "-");
    return ok({ message: "Tu contraseña cambió, pero no pudimos cerrar tus otras sesiones. Si entraste en otro aparato, cerrá sesión ahí." });
  }
  return ok({ message: "Listo: tu contraseña cambió y se cerraron tus otras sesiones. La próxima vez entrá con la nueva." });
}
