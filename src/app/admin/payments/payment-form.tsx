"use client";

import { useState } from "react";
import { registerPayment } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { useFormSubmit } from "@/components/ui/use-form-submit";

type TenantOption = { id: string; name: string };
type Result = { tone: "ok" | "error"; text: string } | null;

export function PaymentForm({ tenants }: { tenants: TenantOption[] }) {
  const [result, setResult] = useState<Result>(null);
  // Si falla, lo escrito se queda; el formulario vuelve a sus valores solo si se registró.
  const { onSubmit, pending: saving } = useFormSubmit(async (fd, form) => {
    setResult(null);
    try {
      const res = await registerPayment(fd);
      if (res.ok) {
        form.reset();
        setResult({ tone: "ok", text: "Pago registrado." });
      } else {
        setResult({ tone: "error", text: res.error });
      }
    } catch {
      setResult({ tone: "error", text: "No se pudo registrar el pago. Revisá tu conexión y probá de nuevo." });
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().slice(0, 10);

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      aria-busy={saving}
    >
      <div className="sm:col-span-2">
        <Label htmlFor="tenant_id">Restaurante</Label>
        <Select id="tenant_id" name="tenant_id" required>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="amount_usd">Monto (USD)</Label>
        <Input id="amount_usd" name="amount_usd" type="number" inputMode="decimal" min="0" step="0.01" defaultValue="49" required />
      </div>
      <div>
        <Label htmlFor="period_start">Desde</Label>
        <Input id="period_start" name="period_start" type="date" defaultValue={today} required />
      </div>
      <div>
        <Label htmlFor="period_end">Hasta</Label>
        <Input id="period_end" name="period_end" type="date" defaultValue={nextMonthStr} required />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4 lg:col-span-5">
        <Button type="submit" pending={saving} pendingText="Registrando…" className="w-full sm:w-auto">
          Registrar pago
        </Button>
        <div aria-live="polite" className="min-h-5">
          {result && (
            <FieldHint tone={result.tone === "error" ? "error" : "success"} className="font-medium">
              {result.text}
            </FieldHint>
          )}
        </div>
      </div>
    </form>
  );
}
