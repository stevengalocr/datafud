"use client";

// Entrada privada de super-admin (dueño del SaaS).
// Ruta no obvia y NO enlazada en ningún lugar público.
// La protección real es el rol en /admin (requireRole). Esta ruta solo
// evita exponer la puerta. No agregar enlaces a esta página.

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function OwnerAccessPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <h1 className="font-display text-2xl text-white">Acceso</h1>
          <p className="mt-1 text-sm text-slate-400">Panel interno</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-300">
                Correo
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
