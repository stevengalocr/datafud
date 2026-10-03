"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AuthError, AuthFrame } from "@/components/shell/auth-frame";

type WaLinkProps = {
  href: string;
  target?: "_blank";
  rel?: "noopener noreferrer";
  "data-wa-origin": string;
};

// Formulario de acceso (cliente). Solo se monta cuando el servidor confirmó que hay backend.
// `wa` llega armado desde el servidor (page.tsx): el único canal de ayuda es WhatsApp (D-039).
export function LoginForm({ wa }: { wa: WaLinkProps }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

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
            className="inline-flex min-h-11 items-center font-semibold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4 hover:text-brand-900"
          >
            Escribinos por WhatsApp
          </a>
        </>
      }
    >
      <form action={formAction} className="space-y-4" aria-busy={pending}>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={state?.error ? true : undefined}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={state?.error ? true : undefined}
            required
          />
        </div>

        {state?.error && <AuthError>{state.error}</AuthError>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </AuthFrame>
  );
}
