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
export function LoginForm({ wa }: { wa: WaLinkProps }) {
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
      <AccessForm submitLabel="Ingresar" pendingLabel="Ingresando…" autoComplete />
    </AuthFrame>
  );
}
