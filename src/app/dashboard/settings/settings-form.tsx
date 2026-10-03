"use client";

import { useState } from "react";
import { updateSettings } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { LANG_LABEL } from "@/lib/constants";
import type { Currency, Lang, TenantSettings } from "@/lib/supabase/types";

const LANGS: Lang[] = ["es", "en", "pt"];

export function SettingsForm({
  settings,
  currencies,
}: {
  settings: TenantSettings | null;
  currencies: Currency[];
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const theme = settings?.theme ?? {};
  const enabled = settings?.enabled_languages ?? ["es"];

  return (
    <form
      action={async (fd) => {
        setStatus("saving");
        try {
          const res = await updateSettings(fd);
          if (res.ok) {
            setErrorText(null);
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 4000);
          } else {
            setErrorText(res.error);
            setStatus("error");
          }
        } catch {
          setErrorText(null);
          setStatus("error");
        }
      }}
      className="space-y-6"
      aria-busy={status === "saving"}
    >
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
              defaultValue={settings?.currency_code ?? "USD"}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </Select>
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
              {LANGS.map((l) => (
                <label key={l} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-stone-800">
                  <input
                    type="checkbox"
                    name="enabled_languages"
                    value={l}
                    defaultChecked={enabled.includes(l)}
                    className="h-5 w-5 cursor-pointer rounded border-stone-300 accent-brand-600"
                  />
                  {LANG_LABEL[l]}
                </label>
              ))}
            </div>
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
        <Button type="submit" disabled={status === "saving"} className="w-full sm:w-auto">
          {status === "saving" ? "Guardando…" : "Guardar configuración"}
        </Button>
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
    </form>
  );
}
