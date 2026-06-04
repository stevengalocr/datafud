"use client";

import { useRef, useTransition } from "react";
import { createTable, deleteTable } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddTableForm() {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await createTable(fd);
        ref.current?.reset();
      }}
      className="flex gap-2"
    >
      <Input name="label" placeholder="Mesa 3" className="w-40" required />
      <Button type="submit" size="md">
        + Agregar mesa
      </Button>
    </form>
  );
}

export function DeleteTableButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => void deleteTable(id))}
      disabled={pending}
      className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
