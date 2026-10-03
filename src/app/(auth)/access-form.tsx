"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type ActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AuthError } from "@/components/shell/auth-frame";

/**
 * Formulario de acceso compartido por /login y la entrada privada. Lo que cambia entre las dos
 * es el texto del botón y si el navegador puede autocompletar.
 *
 * Blindaje:
 * - Envío por `onSubmit` + `startTransition(formAction)`: con `<form action>` a secas React 19
 *   vacía los campos al enviar, y con un error de contraseña la persona tenía que volver a
 *   escribir también el correo. Ahora el correo se queda; la contraseña se borra y recibe el
 *   foco (lo único que hay que corregir). `action={formAction}` sigue puesto para que, si el
 *   JavaScript todavía no cargó, el formulario se envíe igual por POST y nunca por GET con la
 *   contraseña en la URL.
 * - Doble envío imposible: el botón queda deshabilitado mientras dura y un segundo Enter antes
 *   de que React pinte se ignora.
 * - El error se anuncia (`role="alert"`) y los dos campos lo referencian con `aria-describedby`.
 */
export function AccessForm({
  submitLabel,
  pendingLabel,
  autoComplete,
}: {
  submitLabel: string;
  pendingLabel: string;
  /** `false` en la entrada privada: que el navegador no ofrezca ni guarde la cuenta. */
  autoComplete: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    undefined
  );
  const busy = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const errorId = "acceso-error";
  // Sube con cada respuesta con error: el mismo mensaje dos veces se vuelve a anunciar.
  const [errorKey, setErrorKey] = useState(0);

  useEffect(() => {
    if (!pending) busy.current = false;
  }, [pending]);

  // Cada error nuevo: contraseña en blanco y con el foco, el correo intacto.
  useEffect(() => {
    if (!state?.error) return;
    setErrorKey((k) => k + 1);
    if (!passwordRef.current) return;
    passwordRef.current.value = "";
    passwordRef.current.focus();
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy.current) return;
        busy.current = true;
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-4"
      aria-busy={pending}
    >
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete={autoComplete ? "email" : "off"}
          autoCapitalize="none"
          spellCheck={false}
          placeholder={autoComplete ? "tu@correo.com" : undefined}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? errorId : undefined}
          maxLength={254}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete={autoComplete ? "current-password" : "off"}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? errorId : undefined}
          required
        />
      </div>

      {state?.error && (
        <AuthError key={errorKey} id={errorId}>
          {state.error}
        </AuthError>
      )}

      <Button type="submit" size="lg" className="w-full" pending={pending} pendingText={pendingLabel}>
        {submitLabel}
      </Button>
    </form>
  );
}
