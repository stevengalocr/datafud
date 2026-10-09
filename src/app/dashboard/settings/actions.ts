"use server";

import { changeOwnPassword, type PasswordResult } from "@/lib/auth/change-password";

// Cambiar la contraseña desde el panel del restaurante (AA-20). Se permite también con el local
// suspendido: es la cuenta de la persona, no los datos del local. La sesión la exige
// `changeOwnPassword`.
export async function changePassword(formData: FormData): Promise<PasswordResult> {
  return changeOwnPassword(formData);
}
