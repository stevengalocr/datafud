"use client";

import { AuthFrame } from "@/components/shell/auth-frame";
import { AccessForm } from "../access-form";

type WaLinkProps = {
  href: string;
  target?: "_blank";
  rel?: "noopener noreferrer";
  "data-wa-origin": string;
};

// Formulario de acceso (cliente). Solo se monta cuando el servidor confirmó que hay backend.
// `wa` llega armado desde el servidor (page.tsx): el único canal de ayuda es WhatsApp (D-039).
// Los campos, el envío y los errores viven en `../access-form.tsx` (compartido con la entrada
// privada).
export function LoginForm({
  wa,
  redirectTo,
  notice,
}: {
  wa: WaLinkProps;
  /** Ruta interna del panel a la que volver después de entrar (ya validada en el servidor). */
  redirectTo?: string;
  /** Aviso de por qué se volvió al login (por ejemplo, un usuario sin local). */
  notice?: string;
}) {
  return (
    <AuthFrame
      eyebrow="Panel de tu local"
      title="Ingresá a tu panel"
      description="Con el correo y la contraseña que te entregamos cuando arrancamos con tu local."
      footer={
        <>
          ¿Olvidaste la contraseña o todavía no sos cliente?{" "}
          <a
            {...wa}
            className="inline-flex min-h-11 items-center font-semibold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4 hov:text-brand-900"
          >
            Escribinos por WhatsApp
          </a>
        </>
      }
    >
      {notice && (
        <p role="status" className="mb-4 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2.5 text-sm font-medium text-brand-900">
          {notice}
        </p>
      )}
      <AccessForm submitLabel="Ingresar" pendingLabel="Ingresando…" autoComplete redirectTo={redirectTo} />
    </AuthFrame>
  );
}
