"use client";

import { useEffect, useState } from "react";
import { updateSettings } from "../actions";
import { ImageUpload } from "../image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { useFormSubmit } from "@/components/ui/use-form-submit";
import { LANG_LABEL } from "@/lib/constants";
import type { Currency, Lang, TenantSettings } from "@/lib/supabase/types";

const LANGS: Lang[] = ["es", "en", "pt"];

export function SettingsForm({
  settings,
  currencies,
  maxLanguages,
  readOnly,
}: {
  settings: TenantSettings | null;
  currencies: Currency[];
  /** Idiomas que incluye el plan del local (el servidor lo vuelve a revisar al guardar). */
  maxLanguages: number;
  /** Local suspendido o cancelado: el servidor rechaza el guardado; el botón ya lo dice. */
  readOnly: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  // Configuración: nunca se resetea (lo que se guardó es lo que queda en pantalla).
  const { onSubmit, pending: saving } = useFormSubmit(async (fd) => {
    setStatus("idle");
    try {
      const res = await updateSettings(fd);
      if (res.ok) {
        setErrorText(null);
        setStatus("saved");
      } else {
        setErrorText(res.error);
        setStatus("error");
      }
    } catch {
      setErrorText(null);
      setStatus("error");
    }
  });
  // "Cambios guardados" se va solo a los 4 s; si se vuelve a guardar antes, el plazo empieza de nuevo.
  useEffect(() => {
    if (status !== "saved") return;
    const id = setTimeout(() => setStatus("idle"), 4000);
    return () => clearTimeout(id);
  }, [status]);
  const theme = settings?.theme ?? {};
  const initialCurrency = settings?.currency_code ?? "USD";
  const [currency, setCurrency] = useState(initialCurrency);
  const [enabled, setEnabled] = useState<Lang[]>(() =>
    (settings?.enabled_languages ?? ["es"]).filter((l): l is Lang => LANGS.includes(l as Lang))
  );
  const atLimit = enabled.length >= maxLanguages;
  const toggleLang = (l: Lang, on: boolean) =>
    setEnabled((prev) => (on ? [...prev.filter((x) => x !== l), l] : prev.filter((x) => x !== l)));

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      aria-busy={saving}
    >
      {/* Solo lectura: el fieldset deshabilita todos los campos y botones, también el de subir logo. */}
      <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-6 border-0 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Datos del negocio</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="restaurant_name">Nombre del local</Label>
            <Input
              id="restaurant_name"
              name="restaurant_name"
              defaultValue={settings?.restaurant_name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={settings?.phone ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={settings?.address ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="logo_url">Logo (enlace a la imagen)</Label>
            <Input id="logo_url" name="logo_url" type="url" inputMode="url" defaultValue={settings?.logo_url ?? ""} placeholder="https://…" />
            <ImageUpload kind="logo" targetId="logo_url" label="Subir logo" initialUrl={settings?.logo_url ?? ""} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moneda e idiomas</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="currency_code">Moneda</Label>
            <Select
              id="currency_code"
              name="currency_code"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-describedby={currency !== initialCurrency ? "currency-hint" : undefined}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </Select>
            {currency !== initialCurrency && (
              <FieldHint id="currency-hint" className="mt-1.5">
                Cambiar la moneda no convierte los precios: después de guardar, revisalos en Menú.
              </FieldHint>
            )}
          </div>
          <div>
            <Label htmlFor="default_language">Idioma por defecto</Label>
            <Select
              id="default_language"
              name="default_language"
              defaultValue={settings?.default_language ?? "es"}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_LABEL[l]}
                </option>
              ))}
            </Select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 block text-sm font-medium text-stone-800">Idiomas de la carta</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {LANGS.map((l) => {
                const checked = enabled.includes(l);
                const blocked = !checked && atLimit;
                return (
                  <label
                    key={l}
                    className={`flex min-h-11 items-center gap-2.5 text-sm ${blocked ? "cursor-not-allowed text-stone-500" : "cursor-pointer text-stone-800"}`}
                  >
                    <input
                      type="checkbox"
                      name="enabled_languages"
                      value={l}
                      checked={checked}
                      disabled={blocked}
                      onChange={(e) => toggleLang(l, e.target.checked)}
                      aria-describedby="langs-hint"
                      className="h-5 w-5 cursor-pointer rounded border-stone-300 accent-brand-600 disabled:cursor-not-allowed"
                    />
                    {LANG_LABEL[l]}
                  </label>
                );
              })}
            </div>
            <FieldHint id="langs-hint" className="mt-1">
              {maxLanguages >= LANGS.length
                ? "Tu plan incluye los tres idiomas."
                : enabled.length > maxLanguages
                  ? `Tu plan incluye ${maxLanguages} ${maxLanguages === 1 ? "idioma" : "idiomas"} y tenés ${enabled.length} activos: desactivá ${enabled.length - maxLanguages === 1 ? "uno" : "los que sobran"} para poder guardar.`
                  : `Tu plan incluye ${maxLanguages} ${maxLanguages === 1 ? "idioma" : "idiomas"}${atLimit ? ": para activar otro, desactivá uno." : "."}`}
            </FieldHint>
          </fieldset>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colores de la carta</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="theme_primary">Color principal</Label>
            <input
              id="theme_primary"
              name="theme_primary"
              type="color"
              defaultValue={theme.primary ?? "#22503a"}
              className="h-11 w-full cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
            />
          </div>
          <div>
            <Label htmlFor="theme_accent">Color de acento</Label>
            <input
              id="theme_accent"
              name="theme_accent"
              type="color"
              defaultValue={theme.accent ?? "#b8923f"}
              className="h-11 w-full cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" pending={saving} pendingText="Guardando…" disabled={readOnly} className="w-full sm:w-auto">
          Guardar configuración
        </Button>
        {readOnly && (
          <FieldHint className="font-medium">Tu panel está en solo lectura: los cambios no se pueden guardar.</FieldHint>
        )}
        <div aria-live="polite" className="min-h-5">
          {status === "saved" && (
            <FieldHint tone="success" className="font-medium">Cambios guardados.</FieldHint>
          )}
          {status === "error" && (
            <FieldHint tone="error" className="font-medium">
              {errorText ?? "No se pudieron guardar los cambios. Revisá tu conexión y probá de nuevo."}
            </FieldHint>
          )}
        </div>
      </div>
      </fieldset>
    </form>
  );
}
