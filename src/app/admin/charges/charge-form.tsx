"use client";

import { useRef, useState } from "react";
import { registerCharge } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { formatUsdAmount } from "@/lib/currency/format";
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
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const onKindChange = (value: ChargeKind) => {
    setKind(value);
    setUnit(UNIT_BY_KIND[value]);
    if (value !== "nfc_cards") setQty(1);
  };

  const total = formatUsdAmount(Math.round(unit * qty * 100) / 100);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setSaving(true);
        setResult(null);
        // La acción lanza si los datos no pasan la validación: se avisa en vez de quedar trabado.
        try {
          const res = await registerCharge(fd);
          if (res.ok) {
            formRef.current?.reset();
            onKindChange("implementation");
            setResult({ tone: "ok", text: "Cargo registrado." });
          } else {
            setResult({ tone: "error", text: res.error });
          }
        } catch {
          setResult({ tone: "error", text: "No se pudo registrar el cargo. Revisá tu conexión y probá de nuevo." });
        } finally {
          setSaving(false);
        }
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
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
      <div className="lg:col-span-2">
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
          inputMode="numeric"
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
          inputMode="decimal"
          min={0}
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
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" placeholder="Ej. 10 tarjetas NFC para mesas" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-stone-600">
          Total:{" "}
          <span className="text-base font-semibold text-brand-950 tabular-nums">{total}</span>
        </p>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Registrando…" : "Registrar cargo"}
        </Button>
      </div>
      <div aria-live="polite" className="min-h-5 sm:col-span-2 lg:col-span-6">
        {result && (
          <FieldHint tone={result.tone === "error" ? "error" : "success"} className="font-medium">
            {result.text}
          </FieldHint>
        )}
      </div>
    </form>
  );
}
