import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/shell/page-header";
import { PasswordForm } from "@/components/shell/password-form";
import { changeAdminPassword } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  await requireRole("super_admin");
  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Tu cuenta"
        description="Cambiá la contraseña con la que entrás al panel interno."
      />
      <PasswordForm
        action={changeAdminPassword}
        intro="Pide la contraseña actual. Al cambiarla se cierran las otras sesiones abiertas con tu usuario. Mínimo 10 caracteres."
      />
    </div>
  );
}
