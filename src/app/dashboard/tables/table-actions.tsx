"use client";

import { useState, useTransition } from "react";
import { createTable, deleteTable, rotateTableToken } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useFormSubmit } from "@/components/ui/use-form-submit";

export function AddTableForm({ readOnly = false }: { readOnly?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  // El nombre escrito se queda si algo falla; el campo se vacía solo si la mesa se creó.
  const { onSubmit, pending } = useFormSubmit(async (fd, form) => {
    setError(null);
    try {
      const res = await createTable(fd);
      if (res.ok) form.reset();
      else setError(res.error);
    } catch {
      setError("No se pudo agregar la mesa. Revisá tu conexión y probá de nuevo.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="w-full sm:w-auto" aria-busy={pending}>
      <Label htmlFor="table_label" className="sr-only">
        Nombre de la mesa
      </Label>
      <div className="flex gap-2">
        <Input
          id="table_label"
          name="label"
          placeholder="Mesa 3"
          className="min-w-0 flex-1 sm:w-44 sm:flex-none"
          disabled={readOnly}
          required
        />
        <Button type="submit" pending={pending} pendingText="Agregando…" disabled={readOnly} className="shrink-0">
          <Icon name="plus" size={16} />
          Agregar mesa
        </Button>
      </div>
      {error && (
        <FieldHint tone="error" className="mt-2 max-w-xs">
          {error}
        </FieldHint>
      )}
    </form>
  );
}

export function DeleteTableButton({ id, label, readOnly = false }: { id: string; label: string; readOnly?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const onDelete = async () => {
    // Borrar la mesa invalida su QR: si ya está impreso, deja de abrir la carta.
    const ok = await confirm({
      title: `¿Eliminar ${label}?`,
      description: "Su QR deja de funcionar, aunque ya esté impreso.",
      confirmLabel: "Eliminar mesa",
    });
    if (!ok) return;
    setError(null);
    start(async () => {
      try {
        const res = await deleteTable(id);
        if (!res.ok) setError(res.error);
      } catch {
        setError("No se pudo eliminar la mesa. Revisá tu conexión y probá de nuevo.");
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="danger-soft"
        onClick={onDelete}
        pending={pending}
        pendingText="Eliminando…"
        disabled={readOnly}
        aria-label={`Eliminar ${label}`}
      >
        <Icon name="trash" size={16} />
        Eliminar
      </Button>
      {error && (
        <FieldHint tone="error" className="mt-1">
          {error}
        </FieldHint>
      )}
      {dialog}
    </>
  );
}

/**
 * Cambiar el QR de una mesa (S13): genera un código nuevo. El QR impreso deja de abrir la carta,
 * así que la confirmación lo dice antes, sin rodeos.
 */
export function RotateTokenButton({ id, label, readOnly = false }: { id: string; label: string; readOnly?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const onRotate = async () => {
    const ok = await confirm({
      title: `¿Cambiar el QR de ${label}?`,
      description:
        "El QR impreso y la tarjeta NFC de esta mesa dejan de servir desde ya: quien los use no va a ver la carta. Después descargá el QR nuevo e imprimilo; la tarjeta NFC hay que volver a grabarla. Si la mesa usa un código de DataFud (datafud.com/q/…), escribinos por WhatsApp para apuntarlo al nuevo.",
      confirmLabel: "Cambiar QR",
      icon: "qr",
    });
    if (!ok) return;
    setError(null);
    start(async () => {
      try {
        const res = await rotateTableToken(id);
        if (!res.ok) setError(res.error);
      } catch {
        setError("No se pudo cambiar el QR. Revisá tu conexión y probá de nuevo.");
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRotate}
        pending={pending}
        pendingText="Cambiando…"
        disabled={readOnly}
        aria-label={`Cambiar el QR de ${label}`}
      >
        <Icon name="qr" size={16} />
        Cambiar QR
      </Button>
      {error && (
        <FieldHint tone="error" className="mt-1">
          {error}
        </FieldHint>
      )}
      {dialog}
    </>
  );
}
