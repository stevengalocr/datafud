"use client";

import { useEffect, useState, useTransition } from "react";
import { updateOrderStatus } from "../actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/shell/empty-state";
import { PanelError } from "@/components/shell/panel-states";
import { formatMoney } from "@/lib/currency/format";
import { formatDate, formatTime, localDayKey } from "@/lib/dates";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import type { OrderStatus } from "@/lib/supabase/types";
import { isActive, NEXT_ACTION, NEXT_STATUS, UNDO_UI_MS } from "../_lib/order-status";
import type { BoardSnapshot, OrderView } from "../_lib/orders";

/** El último cambio hecho desde este tablero, para poder deshacerlo un rato. */
type LastChange = { id: string; from: OrderStatus; to: OrderStatus };

export function OrderBoard({
  snapshot,
  errorRef,
  currency,
  readOnly = false,
}: {
  /** Local suspendido o cancelado: las órdenes se ven, pero no se mueven (el servidor también lo rechaza). */
  readOnly?: boolean;
  /** null si la última carga falló. */
  snapshot: BoardSnapshot | null;
  /** Código de la falla en los registros del servidor. */
  errorRef: string | null;
  currency: string;
}) {
  // Lo último que cargó bien. Si un refresco falla, el tablero sigue a la vista (con aviso) y el
  // refresco automático sigue corriendo; la página de error solo sale si nunca cargó.
  const [lastGood, setLastGood] = useState<BoardSnapshot | null>(snapshot);
  if (snapshot && snapshot !== lastGood) setLastGood(snapshot);
  const board = snapshot ?? lastGood;

  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<LastChange | null>(null);
  const { confirm, dialog } = useConfirm();

  // «Deshacer» dura un minuto: después la orden sigue su curso normal.
  useEffect(() => {
    if (!last) return;
    const id = window.setTimeout(() => setLast(null), UNDO_UI_MS);
    return () => window.clearTimeout(id);
  }, [last]);

  if (!board) {
    return (
      <PanelError
        error={Object.assign(new Error("tablero"), { digest: errorRef ?? undefined })}
        reset={() => {}}
      />
    );
  }
  const { active, closed, closedTotal } = board;
  const stale = !snapshot && (
    <p role="status" className="rounded-lg border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
      No se pudo actualizar el tablero. Se muestra lo último que cargó; se vuelve a intentar solo en
      unos segundos.
    </p>
  );

  if (active.length === 0 && closed.length === 0) {
    return (
      <div className="space-y-4">
        {stale}
        <EmptyState icon="receipt" title="Todavía no hay órdenes">
          Cuando un cliente pida desde el QR de su mesa, la orden aparece acá. El tablero se actualiza
          solo cada 15 segundos.
        </EmptyState>
      </div>
    );
  }

  const change = (o: OrderView, to: OrderStatus, undo = false) => {
    setError(null);
    setBusyId(o.id);
    start(async () => {
      try {
        const res = await updateOrderStatus(o.id, o.status, to);
        if (!res.ok) setError(`${o.tableLabel}: ${res.error}`);
        else setLast(undo ? null : { id: o.id, from: o.status, to });
      } catch {
        setError("No se pudo cambiar el estado de la orden. Revisá la conexión y probá de nuevo.");
      } finally {
        setBusyId(null);
      }
    });
  };

  const askCancel = async (o: OrderView) => {
    const ok = await confirm({
      title: `¿Cancelar la orden de ${o.tableLabel}?`,
      description:
        "Pasa a «Cerradas hoy» y deja de contar como pendiente. Si el cliente ya estaba esperando, avisale.",
      confirmLabel: "Cancelar orden",
      cancelLabel: "Volver",
    });
    if (ok) change(o, "cancelled");
  };

  const today = localDayKey();
  const card = (o: OrderView) => (
    <OrderCard
      key={o.id}
      order={o}
      currency={currency}
      today={today}
      busy={pending && busyId === o.id}
      disabled={pending || readOnly}
      // Solo el último cambio, y solo si la base todavía lo tiene como último (previous_status).
      undo={last && last.id === o.id && last.to === o.status && (o.previous_status ?? last.from) === last.from ? last.from : null}
      onNext={(to) => change(o, to)}
      onUndo={(to) => change(o, to, true)}
      onCancel={() => askCancel(o)}
    />
  );

  return (
    <div className="space-y-8">
      {stale}
      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 [overflow-wrap:anywhere]">
          {error}
        </p>
      )}

      <section aria-labelledby="por-atender">
        <h2 id="por-atender" className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
          Por atender <span className="font-normal tabular-nums">({active.length})</span>
        </h2>
        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 bg-cream-50 px-4 py-3 text-sm text-stone-600">
            Nada por atender ahora. Las órdenes nuevas aparecen acá, la más vieja primero.
          </p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{active.map(card)}</ul>
        )}
      </section>

      {closed.length > 0 && (
        <section aria-labelledby="cerradas-hoy">
          <h2 id="cerradas-hoy" className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
            Cerradas hoy <span className="font-normal tabular-nums">({closedTotal})</span>
          </h2>
          {closedTotal > closed.length && (
            <p className="mb-3 text-sm text-stone-600">
              Se muestran las últimas {closed.length} de {closedTotal}. El total del día está en
              Resumen y en Reportes.
            </p>
          )}
          <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{closed.map(card)}</ul>
        </section>
      )}
      {dialog}
    </div>
  );
}

function OrderCard({
  order: o,
  currency,
  today,
  busy,
  disabled,
  undo,
  onNext,
  onUndo,
  onCancel,
}: {
  order: OrderView;
  currency: string;
  today: string;
  busy: boolean;
  disabled: boolean;
  /** Estado al que se puede volver, si esta orden fue la del último cambio. */
  undo: OrderStatus | null;
  onNext: (to: OrderStatus) => void;
  onUndo: (to: OrderStatus) => void;
  onCancel: () => void;
}) {
  const next = NEXT_STATUS[o.status];
  const money = (n: number) => formatMoney(n, o.currency_code ?? currency);
  const when =
    localDayKey(o.created_at) === today
      ? `Hoy, ${formatTime(o.created_at)}`
      : `${formatDate(o.created_at)}, ${formatTime(o.created_at)}`;
  const open = isActive(o.status);

  return (
    <li>
      <Card className="flex h-full flex-col p-5" aria-busy={busy}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight text-brand-950 [overflow-wrap:anywhere]">
              {o.tableLabel}
            </h3>
            <p className="mt-1 text-sm text-stone-700">
              <span className="font-semibold text-brand-950 tabular-nums">{money(Number(o.total))}</span>
              <span className="text-stone-600"> · {when}</span>
            </p>
          </div>
          <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
        </div>

        <ul className="mt-4 space-y-1.5 text-sm">
          {o.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <span className="min-w-0 text-brand-950 [overflow-wrap:anywhere]">
                <span className="font-semibold tabular-nums">{it.quantity}×</span> {it.product_name_snapshot}
                {it.note && <span className="block text-xs text-stone-600">{it.note}</span>}
              </span>
              <span className="shrink-0 text-stone-600 tabular-nums">{money(Number(it.line_total))}</span>
            </li>
          ))}
        </ul>

        {o.customer_note && (
          <p className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-900 [overflow-wrap:anywhere]">
            <span className="font-semibold">Nota:</span> {o.customer_note}
          </p>
        )}

        {undo && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream-100 px-3 py-2 text-sm text-brand-900">
            <span className="min-w-0">
              Pasó de «{ORDER_STATUS_LABEL[undo]}» a «{ORDER_STATUS_LABEL[o.status]}».
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUndo(undo)}
              disabled={disabled}
              aria-label={`Deshacer: volver a «${ORDER_STATUS_LABEL[undo]}»`}
            >
              Deshacer
            </Button>
          </div>
        )}

        {(next || open) && (
          <div className="mt-auto flex gap-2 pt-4">
            {next && (
              <Button className="flex-1" onClick={() => onNext(next)} disabled={disabled}>
                {busy ? "Guardando…" : NEXT_ACTION[o.status]}
              </Button>
            )}
            {open && (
              <Button variant="danger-soft" onClick={onCancel} disabled={disabled}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </Card>
    </li>
  );
}
