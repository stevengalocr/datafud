"use client";

import { useState } from "react";
import { importCarta, type CartaImportada } from "../actions";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useFormSubmit } from "@/components/ui/use-form-submit";

type Opcion = { value: string; label: string };

// Paso de una Carta (/c/<slug>) a un local del sistema (OFERTA.md §4, día 11). El servidor copia
// categorías, platillos, fotos, logo y colores sobre un menú vacío y crea la mesa del stand; si
// algo falla, deshace todo. El código impreso se mueve después con scripts/qr-mover.mjs.
export function ImportCartaForm({ tenants, cartas }: { tenants: Opcion[]; cartas: Opcion[] }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionResult<CartaImportada> | null>(null);
  const [done, setDone] = useState<CartaImportada | null>(null);
  const { onSubmit, pending } = useFormSubmit(async (fd) => {
    setState(null);
    try {
      const res = await importCarta(null, fd);
      setState(res);
      if (res.ok && res.data) setDone(res.data);
    } catch {
      setState({ ok: false, error: "No se pudo pasar la carta. Revisá tu conexión y probá de nuevo." });
    }
  });

  if (done)
    return (
      <ImportadaPanel
        hecho={done}
        onClose={() => {
          setDone(null);
          setState(null);
          setOpen(false);
        }}
      />
    );

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} disabled={!tenants.length || !cartas.length}>
        <Icon name="utensils" size={18} />
        Pasar una Carta al sistema
      </Button>
    );
  }

  return (
    <Card className="w-full p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-brand-900">Pasar una Carta al sistema</h2>
          <p className="mt-1 text-sm text-stone-600">
            Para un local de Carta que sube a un plan con pedidos. Copia su menú, fotos, logo y colores a un
            local ya creado con el menú vacío, y le crea la mesa del stand.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending} aria-label="Cerrar el formulario">
          <Icon name="x" size={18} />
        </Button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" aria-busy={pending}>
        <div>
          <Label htmlFor="ic-carta">Carta publicada</Label>
          <Select id="ic-carta" name="carta" required defaultValue={cartas[0]?.value}>
            {cartas.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ic-tenant">Local que la recibe</Label>
          <Select id="ic-tenant" name="tenant_id" required defaultValue="">
            <option value="" disabled>
              Elegí un local
            </option>
            {tenants.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <FieldHint>Activo o en prueba, con el menú vacío y un plan que alcance.</FieldHint>
        </div>
        <div>
          <Label htmlFor="ic-mesa">Mesa del stand</Label>
          <Input id="ic-mesa" name="mesa" defaultValue="Stand" required maxLength={40} autoComplete="off" />
          <FieldHint>El código impreso va a abrir la carta de esta mesa.</FieldHint>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 self-center text-sm text-stone-800">
          <input
            type="checkbox"
            name="fotos"
            defaultChecked
            className="h-5 w-5 cursor-pointer rounded border-stone-300 accent-brand-600"
          />
          Copiar las fotos y el logo
        </label>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          <Button type="submit" pending={pending} pendingText="Pasando la carta…" className="w-full sm:w-auto">
            Pasar la carta
          </Button>
          <div aria-live="polite" className="min-h-5">
            {state && !state.ok && (
              <FieldHint tone="error" className="font-medium">
                {state.error}
              </FieldHint>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}

function ImportadaPanel({ hecho, onClose }: { hecho: CartaImportada; onClose: () => void }) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const comandos = hecho.codigos.map((c) => `node scripts/qr-mover.mjs ${c} ${hecho.destino}`);
  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(texto);
    } catch {
      setCopiado(null);
    }
  };

  return (
    <Card className="w-full border-brand-200 p-5 sm:p-6" role="status">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check-circle" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-brand-900">La carta de {hecho.local} ya está en el sistema</h2>
          <p className="mt-1 text-sm text-stone-600">
            {hecho.categorias} categorías y {hecho.platillos} platillos.
            {hecho.fotosCopiadas > 0 && ` ${hecho.fotosCopiadas} fotos copiadas.`}
            {hecho.fotosSinCopiar > 0 &&
              ` ${hecho.fotosSinCopiar} no se pudieron copiar: subilas desde el panel del local.`}
          </p>
          <dl className="mt-4 rounded-lg bg-cream-100 p-4 text-sm">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Carta nueva del stand</dt>
            <dd className="mt-0.5 break-all font-mono font-medium text-brand-950">{hecho.destino}</dd>
          </dl>
          {comandos.length > 0 ? (
            <div className="mt-4 text-sm text-stone-700">
              <p>
                Falta mover el código impreso para que el stand abra la carta nueva. En la compu, desde el repo,
                corré y después publicá:
              </p>
              <ul className="mt-2 space-y-2">
                {comandos.map((cmd) => (
                  <li key={cmd} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 break-all rounded-md bg-stone-100 px-3 py-2 font-mono text-xs text-brand-950">
                      {cmd}
                    </code>
                    <Button size="sm" variant="soft" onClick={() => copiar(cmd)}>
                      <Icon name={copiado === cmd ? "check-circle" : "check"} size={16} />
                      {copiado === cmd ? "Copiado" : "Copiar"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-700">
              Ningún código impreso apunta a esa carta: el stand nuevo se imprime con la mesa desde el panel del local.
            </p>
          )}
          <div className="mt-4">
            <Button variant="secondary" onClick={onClose}>
              Listo
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
