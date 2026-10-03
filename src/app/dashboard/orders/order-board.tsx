"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "../actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shell/empty-state";
import { formatMoney } from "@/lib/currency/format";
import { formatDate, formatTime, localDayKey } from "@/lib/dates";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import type { Order, OrderItem, OrderStatus } from "@/lib/supabase/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: "paid",
};

// El botón dice lo que hace la persona, no el nombre del estado ("Pasar a En preparación").
const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  pending: "Empezar a preparar",
  preparing: "Marcar lista",
  ready: "Marcar entregada",
  delivered: "Marcar pagada",
};

export function OrderBoard({
  orders,
  itemsByOrder,
  currency,
}: {
  orders: Order[];
  itemsByOrder: Record<string, OrderItem[]>;
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <EmptyState icon="receipt" title="Todavía no hay órdenes">
        Cuando un cliente pida desde el QR de su mesa, la orden aparece acá. Recargá la página para
        ver las nuevas.
      </EmptyState>
    );
  }

  const today = localDayKey();
  const change = (id: string, status: OrderStatus) => {
    setError(null);
    setBusyId(id);
    start(async () => {
      try {
        await updateOrderStatus(id, status);
      } catch {
        setError("No se pudo cambiar el estado de la orden. Probá de nuevo.");
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      )}
      <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {orders.map((o) => {
          const items = itemsByOrder[o.id] ?? [];
          const next = NEXT_STATUS[o.status];
          const money = (n: number) => formatMoney(n, o.currency_code ?? currency);
          const when =
            localDayKey(o.created_at) === today
              ? `Hoy, ${formatTime(o.created_at)}`
              : `${formatDate(o.created_at)}, ${formatTime(o.created_at)}`;
          const busy = pending && busyId === o.id;
          return (
            <li key={o.id}>
              <Card className="flex h-full flex-col p-5" aria-busy={busy}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-brand-950 tabular-nums">
                      {money(Number(o.total))}
                    </p>
                    <p className="text-xs text-stone-600">{when}</p>
                  </div>
                  <Badge className={ORDER_STATUS_COLOR[o.status]}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </Badge>
                </div>

                <ul className="mt-4 space-y-1.5 text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-3">
                      <span className="text-brand-950">
                        <span className="font-semibold tabular-nums">{it.quantity}×</span>{" "}
                        {it.product_name_snapshot}
                      </span>
                      <span className="shrink-0 text-stone-600 tabular-nums">
                        {money(Number(it.line_total))}
                      </span>
                    </li>
                  ))}
                </ul>

                {o.customer_note && (
                  <p className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-900">
                    <span className="font-semibold">Nota:</span> {o.customer_note}
                  </p>
                )}

                {(next || (o.status !== "cancelled" && o.status !== "paid")) && (
                  <div className="mt-auto flex gap-2 pt-4">
                    {next && (
                      <Button
                        className="flex-1"
                        onClick={() => change(o.id, next)}
                        disabled={pending}
                      >
                        {busy ? "Guardando…" : NEXT_ACTION[o.status]}
                      </Button>
                    )}
                    {o.status !== "cancelled" && o.status !== "paid" && (
                      <Button
                        variant="danger-soft"
                        onClick={() => {
                          if (window.confirm("¿Cancelar esta orden?")) change(o.id, "cancelled");
                        }}
                        disabled={pending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
