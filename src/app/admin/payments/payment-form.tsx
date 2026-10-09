"use client";

import { useState } from "react";
import { registerPayment } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { useFormSubmit } from "@/components/ui/use-form-submit";
import { TENANT_STATUS_LABEL } from "@/lib/constants";
import type { TenantStatus } from "@/lib/supabase/types";

export type TenantOption = { id: string; name: string; status: TenantStatus; priceUsd: number | null };
type Result = { tone: "ok" | "error"; text: string } | null;

const amountFor = (t: TenantOption | undefined) => (t?.priceUsd != null ? String(t.priceUsd) : "");

export function PaymentForm({
  tenants,
  today,
  nextMonth,
}: {
  tenants: TenantOption[];
  /** Fechas propuestas, calculadas en el servidor en el día de Costa Rica. */
  today: string;
  nextMonth: string;
}) {
  const [result, setResult] = useState<Result>(null);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [amount, setAmount] = useState(amountFor(tenants[0]));
  const selected = tenants.find((t) => t.id === tenantId);
  // Si falla, lo escrito se queda; el formulario vuelve a sus valores solo si se registró.
  const { onSubmit, pending: saving } = useFormSubmit(async (fd, form) => {
    setResult(null);
    try {
      const res = await registerPayment(fd);
      if (res.ok) {
        form.reset();
        setAmount(amountFor(selected));
        setResult({ tone: "ok", text: res.data?.message ?? "Pago registrado." });
      } else {
        setResult({ tone: "error", text: res.error });
      }
    } catch {
      setResult({ tone: "error", text: "No se pudo registrar el pago. Revisá tu conexión y probá de nuevo." });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      aria-busy={saving}
    >
      <div className="sm:col-span-2">
        <Label htmlFor="tenant_id">Restaurante</Label>
        <Select
          id="tenant_id"
          name="tenant_id"
          value={tenantId}
          onChange={(e) => {
            setTenantId(e.target.value);
            setAmount(amountFor(tenants.find((t) => t.id === e.target.value)));
          }}
          aria-describedby="tenant-status-hint"
          required
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        {selected && (
          <FieldHint id="tenant-status-hint" className="mt-1.5">
            {selected.status === "suspended" || selected.status === "trial"
              ? `Hoy está «${TENANT_STATUS_LABEL[selected.status]}»: al registrar el pago queda activo.`
              : selected.status === "cancelled"
                ? "Está cancelado: el pago se registra, pero no lo reactiva. Si corresponde, reactivalo desde Restaurantes."
                : "Está activo."}
          </FieldHint>
        )}
      </div>
      <div>
        <Label htmlFor="amount_usd">Monto (USD)</Label>
        <Input id="amount_usd" name="amount_usd" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="period_start">Desde</Label>
        <Input id="period_start" name="period_start" type="date" defaultValue={today} required />
      </div>
      <div>
        <Label htmlFor="period_end">Hasta</Label>
        <Input id="period_end" name="period_end" type="date" defaultValue={nextMonth} required />
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
