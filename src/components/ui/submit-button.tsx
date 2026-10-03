"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Botón de envío que sabe solo si su formulario está enviando (`useFormStatus`): mientras dura
 * la acción queda deshabilitado (doble envío imposible), muestra `pendingText` y vuelve solo
 * cuando la acción termina, haya salido bien o mal. Tiene que ir DENTRO del `<form>`.
 *
 * Funciona con `<form action={fn}>` y con `useFormSubmit` (onSubmit), ver `use-form-submit.ts`.
 *
 *   <SubmitButton pendingText="Guardando…">Guardar platillo</SubmitButton>
 */
export function SubmitButton({
  pendingText = "Guardando…",
  ...props
}: Omit<ButtonProps, "type" | "pending">) {
  const { pending } = useFormStatus();
  return <Button type="submit" pending={pending} pendingText={pendingText} {...props} />;
}
