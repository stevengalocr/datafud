"use client";

import { useState, useTransition } from "react";
import { setTenantStatus } from "../actions";
import { Button } from "@/components/ui/button";
import type { TenantStatus } from "@/lib/supabase/types";

// Suspender o cancelar le corta la carta y el panel a un local: se confirma antes.
const CONFIRM: Partial<Record<TenantStatus, (name: string) => string>> = {
  suspended: (n) => `¿Suspender a ${n}? Su carta y su panel dejan de funcionar hasta que lo reactivés.`,
  cancelled: (n) => `¿Cancelar a ${n}? Su carta y su panel dejan de funcionar.`,
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

  const change = (next: TenantStatus) => {
    const ask = CONFIRM[next];
    if (ask && !window.confirm(ask(tenantName))) return;
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
    </div>
  );
}
