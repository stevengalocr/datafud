"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "../actions";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/currency/format";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import type { Order, OrderItem, OrderStatus } from "@/lib/supabase/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: "paid",
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center text-sm text-slate-400">
          No hay órdenes todavía. Cuando un cliente pida por QR, aparecerá aquí.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {orders.map((o) => {
        const items = itemsByOrder[o.id] ?? [];
        const next = NEXT_STATUS[o.status];
        return (
          <Card key={o.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatMoney(Number(o.total), o.currency_code ?? currency)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.created_at).toLocaleString("es")}
                  </p>
                </div>
                <Badge className={ORDER_STATUS_COLOR[o.status]}>
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity}× {it.product_name_snapshot}
                    </span>
                    <span className="text-slate-400">
                      {formatMoney(Number(it.line_total), o.currency_code ?? currency)}
                    </span>
                  </li>
                ))}
              </ul>

              {o.customer_note && (
                <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  Nota: {o.customer_note}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                {next && (
                  <button
                    onClick={() => start(() => void updateOrderStatus(o.id, next))}
                    disabled={pending}
                    className="flex-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    Pasar a {ORDER_STATUS_LABEL[next]}
                  </button>
                )}
                {o.status !== "cancelled" && o.status !== "paid" && (
                  <button
                    onClick={() =>
                      start(() => void updateOrderStatus(o.id, "cancelled"))
                    }
                    disabled={pending}
                    className="rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
