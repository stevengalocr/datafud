"use client";

// Entrada privada de super-admin (dueño del SaaS).
// Ruta no obvia y NO enlazada en ningún lugar público.
// La protección real es el rol en /admin (requireRole). Esta ruta solo
// evita exponer la puerta. No agregar enlaces a esta página.

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AuthError, AuthFrame } from "@/components/shell/auth-frame";

// Misma familia visual que /login (antes: tarjeta azul noche con los campos en blanco sobre
// blanco, porque `cn` no resuelve conflictos y `bg-white` del Input ganaba a `bg-slate-800`).
// Sin enlace a WhatsApp ni a la landing: es una puerta interna. El logo tampoco enlaza.
export default function OwnerAccessPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

  return (
    <AuthFrame eyebrow="DataFud · Panel interno" title="Acceso de administración" logoHref={null}>
      <form action={formAction} className="space-y-4" aria-busy={pending}>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
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
            autoComplete="off"
            aria-invalid={state?.error ? true : undefined}
            required
          />
        </div>

        {state?.error && <AuthError>{state.error}</AuthError>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Verificando…" : "Entrar"}
        </Button>
      </form>
    </AuthFrame>
  );
}
