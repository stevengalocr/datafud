"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerAction, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    registerAction,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <Image src="/logo-main.png" alt="DataFud" width={170} height={70} priority className="h-11 w-auto" />
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Crea tu negocio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Empieza con 30 días de prueba, sin tarjeta.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="restaurant">Nombre del negocio</Label>
              <Input id="restaurant" name="restaurant" placeholder="Soda La Esquina" required />
            </div>
            <div>
              <Label htmlFor="ownerName">Tu nombre</Label>
              <Input id="ownerName" name="ownerName" placeholder="Juan Pérez" required />
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <Select id="plan" name="plan" defaultValue="estandar">
                <option value="basico">Básico — $29/mes</option>
                <option value="estandar">Estándar — $49/mes</option>
                <option value="empresarial">Empresarial — $99/mes</option>
              </Select>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Creando..." : "Crear cuenta gratis"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
