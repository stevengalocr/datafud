"use client";

import { useCallback, useRef, useTransition } from "react";

/**
 * Envío de formulario blindado para los paneles. Uso:
 *
 *   const { onSubmit, pending } = useFormSubmit(async (fd, form) => {
 *     const res = await createProduct(fd);      // si lanza o devuelve error, se avisa
 *     if (res?.error) return setError(res.error);
 *     form.reset();                              // reset solo si salió bien
 *   });
 *   <form onSubmit={onSubmit}> … <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
 *
 * Por qué no `<form action={fn}>` a secas: en React 19, una acción de formulario pide el reset
 * del formulario ANTES de correr (`requestFormReset` en `startHostTransition`), así que los
 * campos se vacían aunque la acción falle y la función atrape el error. La persona pierde lo
 * que escribió justo cuando más lo necesita. Con `onSubmit` + `preventDefault` + transición:
 * - el navegador valida igual los `required`, `min`, `type="email"` antes de llegar acá;
 * - React marca el formulario como pendiente (`useFormStatus` y `SubmitButton` lo ven) sin
 *   pedir reset;
 * - un segundo envío mientras el primero sigue en curso se ignora (doble clic, Enter repetido);
 * - `pending` vuelve a `false` en cualquier caso. Si `handler` lanza sin atrapar, el error sube
 *   al `error.tsx` del panel: atrapalo en el handler y mostralo junto al formulario.
 */
export function useFormSubmit(
  handler: (formData: FormData, form: HTMLFormElement) => Promise<void> | void
) {
  const [pending, start] = useTransition();
  const busy = useRef(false);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (busy.current) return;
      const form = event.currentTarget;
      const submitter = (event.nativeEvent as SubmitEvent).submitter;
      const formData = submitter ? new FormData(form, submitter) : new FormData(form);
      busy.current = true;
      start(async () => {
        try {
          await handler(formData, form);
        } finally {
          busy.current = false;
        }
      });
    },
    [handler]
  );

  return { onSubmit, pending };
}
