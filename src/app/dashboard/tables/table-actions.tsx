"use client";

import { useState, useTransition } from "react";
import { createTable, deleteTable } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useFormSubmit } from "@/components/ui/use-form-submit";

export function AddTableForm() {
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
          required
        />
        <Button type="submit" pending={pending} pendingText="Agregando…" className="shrink-0">
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

export function DeleteTableButton({ id, label }: { id: string; label: string }) {
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
