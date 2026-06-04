"use client";

import { useState } from "react";
import { updateSettings } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
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
  const [saved, setSaved] = useState(false);
  const theme = settings?.theme ?? {};
  const enabled = settings?.enabled_languages ?? ["es"];

  return (
    <form
      action={async (fd) => {
        await updateSettings(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <p className="font-medium text-slate-800">Datos del negocio</p>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="restaurant_name">Nombre</Label>
            <Input
              id="restaurant_name"
              name="restaurant_name"
              defaultValue={settings?.restaurant_name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" defaultValue={settings?.phone ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={settings?.address ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="logo_url">URL del logo</Label>
            <Input id="logo_url" name="logo_url" defaultValue={settings?.logo_url ?? ""} placeholder="https://..." />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="font-medium text-slate-800">Moneda e idiomas</p>
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
          <div className="sm:col-span-2">
            <Label>Idiomas habilitados</Label>
            <div className="flex gap-4">
              {LANGS.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="enabled_languages"
                    value={l}
                    defaultChecked={enabled.includes(l)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500"
                  />
                  {LANG_LABEL[l]}
                </label>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="font-medium text-slate-800">Colores del menú</p>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="theme_primary">Color primario</Label>
            <input
              id="theme_primary"
              name="theme_primary"
              type="color"
              defaultValue={theme.primary ?? "#22503a"}
              className="h-10 w-full rounded-lg border border-slate-200"
            />
          </div>
          <div>
            <Label htmlFor="theme_accent">Color de acento</Label>
            <input
              id="theme_accent"
              name="theme_accent"
              type="color"
              defaultValue={theme.accent ?? "#b8923f"}
              className="h-10 w-full rounded-lg border border-slate-200"
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit">Guardar configuración</Button>
        {saved && (
          <span className="text-sm font-medium text-brand-600">¡Guardado!</span>
        )}
      </div>
    </form>
  );
}
