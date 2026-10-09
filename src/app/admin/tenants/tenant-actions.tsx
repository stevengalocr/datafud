"use client";

import { useState, useTransition } from "react";
import { setTenantStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { useConfirm, type ConfirmOptions } from "@/components/ui/confirm-dialog";
import type { TenantStatus } from "@/lib/supabase/types";

// Suspender o cancelar se confirma antes, diciendo exactamente qué pasa (lo hace cumplir
// `get_menu` / `place_order` para la carta y `writableTenant` para el panel).
const EFFECT =
  "Su carta deja de abrirse en las mesas y no entran pedidos. El dueño puede entrar al panel y ver sus datos, pero no guardar cambios. No se borra nada.";
const CONFIRM: Partial<Record<TenantStatus, (name: string) => ConfirmOptions>> = {
  suspended: (n) => ({
    title: `¿Suspender a ${n}?`,
    description: `${EFFECT} Lo podés reactivar cuando quieras; registrar un pago también lo reactiva.`,
    confirmLabel: "Suspender local",
    icon: "pause",
  }),
  cancelled: (n) => ({
    title: `¿Cancelar a ${n}?`,
    description: `${EFFECT} Un pago nuevo no lo reactiva solo: se reactiva a mano desde acá.`,
    confirmLabel: "Cancelar local",
  }),
};

export function TenantStatusActions({
  tenantId,
  tenantName,
  status,
}: {
  tenantId: string;
  tenantName: string;
  status: TenantStatus;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const change = async (next: TenantStatus) => {
    const ask = CONFIRM[next];
    if (ask && !(await confirm(ask(tenantName)))) return;
    setError(null);
    start(async () => {
      try {
        const res = await setTenantStatus(tenantId, next);
        if (!res.ok) setError(res.error);
      } catch {
        setError("No se pudo cambiar el estado. Revisá tu conexión y probá de nuevo.");
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end" aria-busy={pending}>
        {status !== "active" && (
          <Button size="sm" variant="soft" onClick={() => change("active")} disabled={pending}>
            {status === "trial" ? "Aprobar" : "Reactivar"}
          </Button>
        )}
        {status !== "suspended" && status !== "cancelled" && (
          <Button size="sm" variant="soft" onClick={() => change("suspended")} disabled={pending}>
            Suspender
          </Button>
        )}
        {status !== "cancelled" && (
          <Button size="sm" variant="danger-soft" onClick={() => change("cancelled")} disabled={pending}>
            Cancelar
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-800">
          {error}
        </p>
      )}
      {dialog}
    </div>
  );
}
