"use client";

import { useState } from "react";
import { createTenant, type CreatedTenant } from "../actions";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useFormSubmit } from "@/components/ui/use-form-submit";

type PlanOption = { code: string; name: string };

// Alta de un local desde el super admin (S10). Crea el local, el usuario del dueño, su perfil y
// la configuración; si algo falla, el servidor deshace todo. La contraseña temporal se ve una vez.
export function CreateTenantForm({ plans }: { plans: PlanOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionResult<CreatedTenant> | null>(null);
  const [done, setDone] = useState<CreatedTenant | null>(null);
  // Si el alta falla (correo repetido, dirección tomada), lo escrito se queda para corregirlo.
  const { onSubmit, pending } = useFormSubmit(async (fd, form) => {
    setState(null);
    try {
      const res = await createTenant(null, fd);
      setState(res);
      if (res.ok && res.data) {
        form.reset();
        setDone(res.data);
      }
    } catch {
      setState({ ok: false, error: "No se pudo crear el local. Revisá tu conexión y probá de nuevo." });
    }
  });

  if (done)
    return (
      <CreatedPanel
        created={done}
        onClose={() => {
          setDone(null);
          setState(null);
          setOpen(false);
        }}
      />
    );

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Icon name="plus" size={18} />
        Crear restaurante
      </Button>
    );
  }

  return (
    <Card className="w-full p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-brand-900">Nuevo restaurante</h2>
          <p className="mt-1 text-sm text-stone-600">
            Se crea activo, con el usuario del dueño y una contraseña temporal para pasársela por WhatsApp.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending} aria-label="Cerrar el formulario">
          <Icon name="x" size={18} />
        </Button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" aria-busy={pending}>
        <div className="sm:col-span-2">
          <Label htmlFor="ct-name">Nombre del local</Label>
          <Input autoFocus id="ct-name" name="name" required minLength={2} maxLength={80} autoComplete="organization" placeholder="Soda La Esquina" />
        </div>
        <div>
          <Label htmlFor="ct-slug">Dirección (opcional)</Label>
          <Input id="ct-slug" name="slug" maxLength={40} pattern="[a-z0-9-]*" placeholder="se arma con el nombre" autoCapitalize="none" spellCheck={false} />
          <FieldHint>Minúsculas, números y guiones. Queda en datafud.com/m/…</FieldHint>
        </div>
        <div>
          <Label htmlFor="ct-plan">Plan</Label>
          <Select id="ct-plan" name="plan" defaultValue="estandar" required>
            {plans.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ct-owner">Nombre del dueño</Label>
          <Input id="ct-owner" name="owner_name" required minLength={2} maxLength={80} autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="ct-email">Correo del dueño</Label>
          <Input id="ct-email" name="owner_email" type="email" required autoComplete="off" autoCapitalize="none" spellCheck={false} />
        </div>
        <div>
          <Label htmlFor="ct-phone">Teléfono (opcional)</Label>
          <Input id="ct-phone" name="phone" type="tel" inputMode="tel" maxLength={30} autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="ct-currency">Moneda de la carta</Label>
          <Select id="ct-currency" name="currency" defaultValue="CRC">
            <option value="CRC">Colones (₡)</option>
            <option value="USD">Dólares (US$)</option>
          </Select>
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          <Button type="submit" pending={pending} pendingText="Creando el local…" className="w-full sm:w-auto">
            Crear restaurante
          </Button>
          <div aria-live="polite" className="min-h-5">
            {state && !state.ok && (
              <FieldHint tone="error" className="font-medium">
                {state.error}
              </FieldHint>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}

function CreatedPanel({ created, onClose }: { created: CreatedTenant; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const message =
    `Hola ${created.name}: ya está listo su panel de DataFud.\n` +
    `Entran en https://datafud.com/login\n` +
    `Correo: ${created.email}\n` +
    `Contraseña temporal: ${created.password}
` +
    `Al entrar, cámbienla en Configuración > Cambiar contraseña.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="w-full border-brand-200 p-5 sm:p-6" role="status">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check-circle" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-brand-900">{created.name} ya está creado</h2>
          <p className="mt-1 text-sm text-stone-600">
            Esta contraseña temporal se muestra <strong className="font-semibold text-brand-900">solo esta vez</strong>. Copiala y mandásela al dueño: la cambia él mismo en Configuración.
          </p>
          <dl className="mt-4 grid gap-3 rounded-lg bg-cream-100 p-4 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Dirección</dt>
              <dd className="mt-0.5 break-all font-medium text-brand-950">/{created.slug}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Correo</dt>
              <dd className="mt-0.5 break-all font-medium text-brand-950">{created.email}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Contraseña temporal</dt>
              <dd className="mt-0.5 break-all font-mono font-medium text-brand-950">{created.password}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={copy}>
              <Icon name={copied ? "check-circle" : "whatsapp"} size={18} />
              {copied ? "Mensaje copiado" : "Copiar mensaje para WhatsApp"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Ya lo envié
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
