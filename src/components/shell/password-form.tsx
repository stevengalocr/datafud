"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { useFormSubmit } from "@/components/ui/use-form-submit";
import type { PasswordResult } from "@/lib/auth/change-password";

type Result = { tone: "success" | "error"; text: string } | null;

// Tarjeta «Cambiar contraseña», compartida por el panel del restaurante y el interno. Recibe la
// Server Action de cada panel (cada una verifica su rol). Es un formulario aparte (no se anidan).
// Si sale bien, los tres campos se vacían; si falla, se vacía solo lo que hay que volver a escribir.
export function PasswordForm({
  action,
  intro = "Si te dimos una contraseña inicial por WhatsApp, cambiala acá por una tuya. Mínimo 10 caracteres.",
}: {
  action: (formData: FormData) => Promise<PasswordResult>;
  intro?: string;
}) {
  const [result, setResult] = useState<Result>(null);
  const { onSubmit, pending } = useFormSubmit(async (fd, form) => {
    setResult(null);
    try {
      const res = await action(fd);
      if (res.ok) {
        form.reset();
        setResult({ tone: "success", text: res.data?.message ?? "Listo: tu contraseña cambió." });
      } else {
        const current = form.elements.namedItem("current_password");
        if (current instanceof HTMLInputElement) current.value = "";
        setResult({ tone: "error", text: res.error });
      }
    } catch {
      setResult({ tone: "error", text: "No se pudo cambiar la contraseña. Revisá tu conexión y probá de nuevo." });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3" aria-busy={pending}>
          <p className="text-sm text-stone-600 sm:col-span-3">
            {intro}
          </p>
          <div>
            <Label htmlFor="current_password">Contraseña actual</Label>
            <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
          </div>
          <div>
            <Label htmlFor="new_password">Contraseña nueva</Label>
            <Input id="new_password" name="new_password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required />
          </div>
          <div>
            <Label htmlFor="confirm_password">Repetí la nueva</Label>
            <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required />
          </div>
          <div className="flex flex-col gap-3 sm:col-span-3 sm:flex-row sm:items-center">
            <Button type="submit" pending={pending} pendingText="Cambiando…" className="w-full sm:w-auto">
              Cambiar contraseña
            </Button>
            <div aria-live="polite" className="min-h-5">
              {result && (
                <FieldHint tone={result.tone} className="font-medium">
                  {result.text}
                </FieldHint>
              )}
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
