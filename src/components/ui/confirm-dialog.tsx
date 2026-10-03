"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";

export type ConfirmOptions = {
  /** Pregunta completa, con el nombre de lo que se toca: "¿Eliminar la Mesa 3?". */
  title: string;
  /** La consecuencia, en una o dos frases: "Su QR deja de funcionar, aunque ya esté impreso." */
  description?: React.ReactNode;
  /** El verbo de la acción, nunca "Aceptar": "Eliminar mesa", "Suspender local". */
  confirmLabel: string;
  /** Salir sin hacer nada. Por defecto "Volver" (no "Cancelar": choca con "Cancelar orden"). */
  cancelLabel?: string;
  /** `danger` (por defecto) pinta la acción en rojo; `default`, en el verde de marca. */
  tone?: "danger" | "default";
  icon?: IconName;
};

/**
 * Confirmación con la marca, en lugar de `window.confirm` (gris, del sistema, y en el teléfono
 * con el dominio arriba). Usa `<dialog>` nativo con `showModal()`: capa superior, foco atrapado,
 * Escape cierra, el foco vuelve al botón que lo abrió y la página de atrás queda inerte.
 *
 *   const { confirm, dialog } = useConfirm();
 *   …
 *   if (await confirm({ title: `¿Eliminar ${label}?`, confirmLabel: "Eliminar mesa" })) run();
 *   …
 *   return <>{…}{dialog}</>;
 *
 * El foco inicial cae en "Volver": en una acción destructiva, Enter por reflejo no destruye.
 */
export function useConfirm() {
  const [request, setRequest] = useState<
    (ConfirmOptions & { resolve: (ok: boolean) => void }) | null
  >(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    []
  );

  const dialog = request ? (
    <ConfirmDialog
      {...request}
      onClose={(ok) => {
        request.resolve(ok);
        setRequest(null);
      }}
    />
  ) : null;

  return { confirm, dialog };
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Volver",
  tone = "danger",
  icon,
  onClose,
}: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  // Se decide una sola vez: el evento `close` llega tanto por botón como por Escape.
  const result = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const onCloseEvent = () => onClose(result.current);
    el.addEventListener("close", onCloseEvent);
    return () => el.removeEventListener("close", onCloseEvent);
    // onClose cambia en cada render del padre; el diálogo vive lo que dura una pregunta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (ok: boolean) => {
    result.current = ok;
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      // Un toque en el velo (fuera de la tarjeta) es "volver".
      onClick={(e) => {
        if (e.target === e.currentTarget) finish(false);
      }}
      // `!m-auto`: el diálogo suele quedar dentro de un `space-y-*`, que le pone margen arriba y
      // lo saca del centro. Con `!` el centrado nativo gana siempre.
      className="confirm-dialog !m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-stone-200 bg-white p-0 text-brand-950 shadow-panel-lg"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className={
              tone === "danger"
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
            }
          >
            <Icon name={icon ?? (tone === "danger" ? "trash" : "check")} size={20} />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]">
              {title}
            </h2>
            {description && (
              <div id={descId} className="mt-1.5 text-sm leading-relaxed text-stone-600 [overflow-wrap:anywhere]">
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" autoFocus onClick={() => finish(false)}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={() => finish(true)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
