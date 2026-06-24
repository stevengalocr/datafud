"use client";

import { useRef, useState } from "react";
import { registerCharge } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PRICING } from "@/lib/constants";
import type { ChargeKind } from "@/lib/supabase/types";

type TenantOption = { id: string; name: string };

const UNIT_BY_KIND: Record<ChargeKind, number> = {
  implementation: PRICING.setupFeeUsd,
  nfc_cards: PRICING.nfcUnitUsd,
  other: 0,
};

export function ChargeForm({ tenants }: { tenants: TenantOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<ChargeKind>("implementation");
  const [unit, setUnit] = useState<number>(PRICING.setupFeeUsd);
  const [qty, setQty] = useState<number>(1);

  const onKindChange = (value: ChargeKind) => {
    setKind(value);
    setUnit(UNIT_BY_KIND[value]);
    if (value !== "nfc_cards") setQty(1);
  };

  const total = (unit * qty).toFixed(2);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setSaving(true);
        await registerCharge(fd);
        setSaving(false);
        formRef.current?.reset();
        onKindChange("implementation");
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
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
        <Label htmlFor="kind">Concepto</Label>
        <Select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as ChargeKind)}
        >
          <option value="implementation">Implementación única</option>
          <option value="nfc_cards">Tarjetas NFC</option>
          <option value="other">Otro</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          required
        />
      </div>
      <div>
        <Label htmlFor="unit_amount_usd">Precio unidad (USD)</Label>
        <Input
          id="unit_amount_usd"
          name="unit_amount_usd"
          type="number"
          step="0.01"
          value={unit}
          onChange={(e) => setUnit(Number(e.target.value) || 0)}
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Estado</Label>
        <Select id="status" name="status" defaultValue="paid">
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
        </Select>
      </div>
      <div className="lg:col-span-4">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" placeholder="Ej. 10 tarjetas NFC para mesas" />
      </div>
      <div className="lg:col-span-2 flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900">${total}</span>
        </span>
        <Button type="submit" disabled={saving}>
          {saving ? "Registrando..." : "Registrar cargo"}
        </Button>
      </div>
    </form>
  );
}
