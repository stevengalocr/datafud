"use client";

import { useTransition } from "react";
import { setTenantStatus } from "../actions";
import type { TenantStatus } from "@/lib/supabase/types";

export function TenantStatusActions({
  tenantId,
  status,
}: {
  tenantId: string;
  status: TenantStatus;
}) {
  const [pending, start] = useTransition();

  const change = (next: TenantStatus) =>
    start(() => {
      void setTenantStatus(tenantId, next);
    });

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status !== "active" && (
        <button
          onClick={() => change("active")}
          disabled={pending}
          className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
        >
          Aprobar
        </button>
      )}
      {status !== "suspended" && (
        <button
          onClick={() => change("suspended")}
          disabled={pending}
          className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
        >
          Suspender
        </button>
      )}
      {status !== "cancelled" && (
        <button
          onClick={() => change("cancelled")}
          disabled={pending}
          className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
