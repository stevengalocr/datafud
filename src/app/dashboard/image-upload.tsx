"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "./actions";
import { Button } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/input";

// Las Server Actions aceptan 1 MB de cuerpo: la imagen se reduce en el navegador antes de subirla.
const MAX_SIDE = 1600;
const MAX_BYTES = 1_000_000;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Reduce a 1600 px de lado como máximo y pasa a WebP (o JPG si el navegador no sabe WebP). */
async function shrink(file: File): Promise<File | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const g = canvas.getContext("2d");
  if (!g) {
    bitmap.close();
    return null;
  }
  try {
    g.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  } finally {
    // También si drawImage falla: el bitmap no se queda en memoria.
    bitmap.close();
  }
  let blob = await toBlob(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") {
    // JPG no tiene transparencia: sin fondo blanco, los píxeles transparentes de un PNG salen negros.
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = "#fff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }
  if (!blob) return null;
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `imagen.${ext}`, { type: blob.type });
}

/** Dirección https válida para la vista previa; si no, no hay vista previa. */
function previewable(value: string) {
  try {
    return new URL(value.trim()).protocol === "https:" ? value.trim() : "";
  } catch {
    return "";
  }
}

type State = { phase: "idle" | "uploading" | "done" | "error"; text: string };

/**
 * Botón «Subir foto» / «Subir logo» que va junto a un campo de URL (`targetId`): al terminar llena ese campo
 * con la dirección pública y muestra la vista previa. Si la subida no está activa, el campo de URL sigue sirviendo.
 */
export function ImageUpload({
  kind,
  targetId,
  label,
  initialUrl = "",
}: {
  kind: "products" | "logo";
  targetId: string;
  label: string;
  initialUrl?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(initialUrl);
  const [state, setState] = useState<State>({ phase: "idle", text: "" });

  // Si el formulario se limpia (platillo nuevo guardado), la vista previa también. Y si la dirección
  // se escribe o se pega a mano, la vista previa la sigue (o se oculta si no es una https válida).
  useEffect(() => {
    const input = document.getElementById(targetId) as HTMLInputElement | null;
    const form = input?.form;
    if (!input) return;
    const onInput = () => setPreview(previewable(input.value));
    input.addEventListener("input", onInput);
    const onReset = () => {
      setPreview("");
      setState({ phase: "idle", text: "" });
    };
    form?.addEventListener("reset", onReset);
    return () => {
      input.removeEventListener("input", onInput);
      form?.removeEventListener("reset", onReset);
    };
  }, [targetId]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setState({ phase: "uploading", text: "Subiendo…" });
    let small: File | null = null;
    try {
      small = await shrink(picked);
    } catch {
      small = null;
    }
    if (!small) {
      setState({ phase: "error", text: "No pudimos leer esa imagen. Probá con otra (JPG, PNG o WebP)." });
      return;
    }
    if (small.size > MAX_BYTES) {
      setState({ phase: "error", text: "La imagen sigue siendo muy pesada. Probá con una más chica." });
      return;
    }
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("file", small);
    try {
      const res = await uploadImage(fd);
      if (!res.ok || !res.data) {
        setState({ phase: "error", text: res.ok ? "No se pudo subir la imagen. Probá de nuevo." : res.error });
        return;
      }
      const input = document.getElementById(targetId) as HTMLInputElement | null;
      if (input) {
        input.value = res.data.url;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setPreview(res.data.url);
      setState({ phase: "done", text: "Listo. Guardá para aplicar el cambio." });
    } catch {
      setState({
        phase: "error",
        text: `No se pudo subir ${kind === "logo" ? "el logo" : "la foto"}. Recargá la página y probá de nuevo, o pegá la dirección.`,
      });
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="hidden" tabIndex={-1} aria-hidden="true" />
      <Button type="button" variant="secondary" size="sm" aria-controls={targetId} aria-describedby={targetId} pending={state.phase === "uploading"} pendingText="Subiendo…" onClick={() => fileRef.current?.click()}>
        {label}
      </Button>
      {preview && (
        <Image src={preview} alt="Vista previa" width={44} height={44} unoptimized className="h-11 w-11 rounded-lg border border-stone-300 object-cover" />
      )}
      <div aria-live="polite" className="min-w-0 text-sm">
        {state.phase === "uploading" && <FieldHint>{state.text}</FieldHint>}
        {state.phase === "done" && <FieldHint tone="success">{state.text}</FieldHint>}
        {state.phase === "error" && <FieldHint tone="error">{state.text}</FieldHint>}
      </div>
    </div>
  );
}
