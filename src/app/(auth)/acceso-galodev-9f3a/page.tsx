"use client";

// Entrada privada de super-admin (dueño del SaaS).
// Ruta no obvia y NO enlazada en ningún lugar público.
// La protección real es el rol en /admin (requireRole). Esta ruta solo
// evita exponer la puerta. No agregar enlaces a esta página.

import { AuthFrame } from "@/components/shell/auth-frame";
import { AccessForm } from "../access-form";

// Misma familia visual que /login (antes: tarjeta azul noche con los campos en blanco sobre
// blanco, porque `cn` no resuelve conflictos y `bg-white` del Input ganaba a `bg-slate-800`).
// Sin enlace a WhatsApp ni a la landing: es una puerta interna. El logo tampoco enlaza.
// Campos, envío y errores en `../access-form.tsx` (compartido con /login).
export default function OwnerAccessPage() {
  return (
    <AuthFrame eyebrow="DataFud · Panel interno" title="Acceso de administración" logoHref={null}>
      <AccessForm submitLabel="Entrar" pendingLabel="Verificando…" autoComplete={false} />
    </AuthFrame>
  );
}
