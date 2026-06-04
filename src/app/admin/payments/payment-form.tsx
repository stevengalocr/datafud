"use client";

import { useRef, useState } from "react";
import { registerPayment } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type TenantOption = { id: string; name: string };

export function PaymentForm({ tenants }: { tenants: TenantOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setSaving(true);
        await registerPayment(fd);
        setSaving(false);
        formRef.current?.reset();
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <div className="lg:col-span-2">
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
        <Input id="amount_usd" name="amount_usd" type="number" step="0.01" defaultValue="49" required />
      </div>
      <div>
        <Label htmlFor="period_start">Desde</Label>
        <Input id="period_start" name="period_start" type="date" defaultValue={today} required />
      </div>
      <div>
        <Label htmlFor="period_end">Hasta</Label>
        <Input id="period_end" name="period_end" type="date" defaultValue={nextMonthStr} required />
      </div>
      <div className="lg:col-span-5">
        <Button type="submit" disabled={saving}>
          {saving ? "Registrando..." : "Registrar pago"}
        </Button>
      </div>
    </form>
  );
}
