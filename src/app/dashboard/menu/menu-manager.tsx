"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  createCategory,
  createProduct,
  deleteCategory,
  updateCategory,
  deleteProduct,
  toggleProductAvailability,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/shell/empty-state";
import { formatMoney } from "@/lib/currency/format";
import { t } from "@/lib/i18n/dictionaries";
import type { Category, Product } from "@/lib/supabase/types";

// Las acciones devuelven el motivo cuando fallan (S10). Esto solo cubre un fallo de red.
const FAIL = "No se pudo guardar. Revisá tu conexión y probá de nuevo.";
type Res = { ok: boolean; error?: string } | undefined | void;

export function MenuManager({
  categories,
  products,
  currency,
}: {
  categories: Category[];
  products: Product[];
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [showCat, setShowCat] = useState(false);
  const [showProd, setShowProd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // Corre una acción y muestra su error, si lo hay. Devuelve si salió bien.
  const exec = async (fn: () => Promise<Res>) => {
    setError(null);
    try {
      const r = await fn();
      if (r && !r.ok) {
        setError(r.error ?? FAIL);
        return false;
      }
      return true;
    } catch {
      setError(FAIL);
      return false;
    }
  };
  const run = (fn: () => Promise<Res>) => start(async () => void (await exec(fn)));

  const catName = (c: Category) => t(c.name_i18n, "es");
  const productsIn = (id: string) => products.filter((p) => p.category_id === id).length;

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      )}

      {/* Categorías */}
      <Card>
        <CardHeader className="justify-between">
          <CardTitle>
            Categorías <span className="font-normal text-stone-600">({categories.length})</span>
          </CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowCat((v) => !v)}
            aria-expanded={showCat}
            aria-controls="form-categoria"
          >
            <Icon name={showCat ? "x" : "plus"} size={16} />
            {showCat ? "Cerrar" : "Nueva categoría"}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showCat && (
            <form
              id="form-categoria"
              action={async (fd) => {
                if (await exec(() => createCategory(fd))) setShowCat(false);
              }}
              className="grid gap-3 rounded-lg border border-stone-200 bg-cream-50 p-4 sm:grid-cols-3"
            >
              <div>
                <Label htmlFor="cat_name_es">Nombre (español)</Label>
                <Input id="cat_name_es" name="name_es" placeholder="Casados" required autoFocus />
              </div>
              <div>
                <Label htmlFor="cat_name_en">Nombre (inglés)</Label>
                <Input id="cat_name_en" name="name_en" placeholder="Meals" />
              </div>
              <div>
                <Label htmlFor="cat_name_pt">Nombre (portugués)</Label>
                <Input id="cat_name_pt" name="name_pt" placeholder="Refeições" />
              </div>
              <div className="sm:col-span-3">
                <SubmitButton>Guardar categoría</SubmitButton>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            !showCat && (
              <EmptyState icon="utensils" title="Empezá por las categorías">
                Por ejemplo: Desayunos, Casados, Bebidas. Después agregás los platillos dentro de cada una.
              </EmptyState>
            )
          ) : (
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-1 rounded-full border border-stone-200 bg-white py-1 pl-3.5 pr-1 text-sm text-brand-950"
                >
                  <button
                    type="button"
                    onClick={() => setEditing(editing === c.id ? null : c.id)}
                    className="cursor-pointer rounded-full py-1 underline-offset-4 hover:underline"
                    aria-expanded={editing === c.id}
                    aria-label={`Editar la categoría ${catName(c)}`}
                  >
                    {catName(c)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const n = productsIn(c.id);
                      const extra = n > 0 ? ` Tiene ${n} platillo${n === 1 ? "" : "s"}.` : "";
                      if (window.confirm(`¿Eliminar la categoría «${catName(c)}»?${extra}`)) {
                        run(() => deleteCategory(c.id));
                      }
                    }}
                    disabled={pending}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-stone-500 sm:h-8 sm:w-8 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                    aria-label={`Eliminar la categoría ${catName(c)}`}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {editing && categories.some((c) => c.id === editing) && (() => {
            const c = categories.find((x) => x.id === editing)!;
            return (
              <form
                key={c.id}
                action={async (fd) => {
                  if (await exec(() => updateCategory(fd))) setEditing(null);
                }}
                className="grid gap-3 rounded-lg border border-stone-200 bg-cream-50 p-4 sm:grid-cols-4"
                aria-label={`Editar la categoría ${catName(c)}`}
              >
                <input type="hidden" name="id" value={c.id} />
                <div>
                  <Label htmlFor="ecat_es">Nombre (español)</Label>
                  <Input id="ecat_es" name="name_es" defaultValue={c.name_i18n?.es ?? ""} required maxLength={60} autoFocus />
                </div>
                <div>
                  <Label htmlFor="ecat_en">Nombre (inglés)</Label>
                  <Input id="ecat_en" name="name_en" defaultValue={c.name_i18n?.en ?? ""} maxLength={60} />
                </div>
                <div>
                  <Label htmlFor="ecat_pt">Nombre (portugués)</Label>
                  <Input id="ecat_pt" name="name_pt" defaultValue={c.name_i18n?.pt ?? ""} maxLength={60} />
                </div>
                <div>
                  <Label htmlFor="ecat_ord">Orden en la carta</Label>
                  <Input id="ecat_ord" name="sort_order" type="number" inputMode="numeric" min="0" max="999" step="1" defaultValue={c.sort_order ?? 0} />
                </div>
                <div className="flex gap-2 sm:col-span-4">
                  <SubmitButton>Guardar cambios</SubmitButton>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            );
          })()}
        </CardBody>
      </Card>

      {/* Platillos */}
      <Card>
        <CardHeader className="justify-between">
          <CardTitle>
            Platillos <span className="font-normal text-stone-600">({products.length})</span>
          </CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowProd((v) => !v)}
            disabled={categories.length === 0}
            aria-expanded={showProd}
            aria-controls="form-platillo"
          >
            <Icon name={showProd ? "x" : "plus"} size={16} />
            {showProd ? "Cerrar" : "Nuevo platillo"}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showProd && categories.length > 0 && (
            <form
              id="form-platillo"
              action={async (fd) => {
                if (await exec(() => createProduct(fd))) setShowProd(false);
              }}
              className="grid gap-3 rounded-lg border border-stone-200 bg-cream-50 p-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="p_name_es">Nombre (español)</Label>
                <Input id="p_name_es" name="name_es" placeholder="Casado con pollo" required autoFocus />
              </div>
              <div>
                <Label htmlFor="p_cat">Categoría</Label>
                <Select id="p_cat" name="category_id" required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {catName(c)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="p_name_en">Nombre (inglés)</Label>
                <Input id="p_name_en" name="name_en" placeholder="Chicken casado" />
              </div>
              <div>
                <Label htmlFor="p_name_pt">Nombre (portugués)</Label>
                <Input id="p_name_pt" name="name_pt" placeholder="Casado de frango" />
              </div>
              <div>
                <Label htmlFor="p_price">Precio ({currency})</Label>
                <Input id="p_price" name="price" type="number" inputMode="decimal" min="0" step="0.01" placeholder="3500" required />
              </div>
              <div>
                <Label htmlFor="p_image">Foto (enlace, opcional)</Label>
                <Input id="p_image" name="image_url" type="url" inputMode="url" placeholder="https://…" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p_desc_es">Descripción (español)</Label>
                <Textarea id="p_desc_es" name="description_es" rows={2} placeholder="Arroz, frijoles, ensalada y maduro" />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton>Guardar platillo</SubmitButton>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <FieldHint>Creá al menos una categoría antes de agregar platillos.</FieldHint>
          ) : products.length === 0 ? (
            !showProd && (
              <EmptyState icon="utensils" title="Todavía no hay platillos">
                Agregá el primero con «Nuevo platillo». Lo que marqués como agotado deja de ofrecerse en la carta.
              </EmptyState>
            )
          ) : (
            <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-brand-950">{t(p.name_i18n, "es")}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-stone-700">
                      <span className="tabular-nums">{formatMoney(Number(p.price), currency)}</span>
                      <Badge
                        className={
                          p.is_available ? "bg-brand-100 text-brand-800" : "bg-stone-200 text-stone-800"
                        }
                      >
                        {p.is_available ? "Disponible" : "Agotado"}
                      </Badge>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => run(() => toggleProductAvailability(p.id, !p.is_available))}
                      disabled={pending}
                    >
                      {p.is_available ? "Marcar agotado" : "Volver a ofrecer"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger-soft"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar «${t(p.name_i18n, "es")}» de la carta?`)) {
                          run(() => deleteProduct(p.id));
                        }
                      }}
                      disabled={pending}
                      aria-label={`Eliminar ${t(p.name_i18n, "es")}`}
                    >
                      <Icon name="trash" size={16} />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// Botón de envío que se bloquea mientras el formulario se guarda: evita el doble envío.
function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Guardando…" : children}
    </Button>
  );
}
