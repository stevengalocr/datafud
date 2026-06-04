"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <Image src="/logo-main.png" alt="DataFud" width={170} height={70} priority className="h-11 w-auto" />
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl text-slate-900">Ingresar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accede al panel de tu negocio.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Cuenta demo</p>
            <p>demo@datfud.com · Datfud2026!</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Crea tu negocio
          </Link>
        </p>
      </div>
    </div>
  );
}
