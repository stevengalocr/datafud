"use client";

import { useRef, useState, useTransition } from "react";
import { createTable, deleteTable } from "../actions";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function AddTableForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={ref}
      action={async (fd) => {
        setSaving(true);
        setError(null);
        try {
          const res = await createTable(fd);
          if (res.ok) ref.current?.reset();
          else setError(res.error);
        } catch {
          setError("No se pudo agregar la mesa. Revisá tu conexión y probá de nuevo.");
        } finally {
          setSaving(false);
        }
      }}
      className="w-full sm:w-auto"
      aria-busy={saving}
    >
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
        <Button type="submit" disabled={saving} className="shrink-0">
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
  return (
    <>
    <Button
      size="sm"
      variant="danger-soft"
      onClick={() => {
        // Borrar la mesa invalida su QR: si ya está impreso, deja de abrir la carta.
        if (window.confirm(`¿Eliminar ${label}? Su QR deja de funcionar, aunque ya esté impreso.`)) {
          setError(null);
          start(async () => {
            try {
              const res = await deleteTable(id);
              if (!res.ok) setError(res.error);
            } catch {
              setError("No se pudo eliminar la mesa. Probá de nuevo.");
            }
          });
        }
      }}
      disabled={pending}
      aria-label={`Eliminar ${label}`}
    >
      <Icon name="trash" size={16} />
      Eliminar
    </Button>
    {error && (
      <FieldHint tone="error" className="mt-1" role="alert">
        {error}
      </FieldHint>
    )}
    </>
  );
}
