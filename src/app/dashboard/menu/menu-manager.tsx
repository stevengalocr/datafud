"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  toggleProductAvailability,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/currency/format";
import { t } from "@/lib/i18n/dictionaries";
import type { Category, Product } from "@/lib/supabase/types";

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

  return (
    <div className="space-y-6">
      {/* Categorías */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <p className="font-medium text-slate-800">
            Categorías ({categories.length})
          </p>
          <Button size="sm" variant="secondary" onClick={() => setShowCat((v) => !v)}>
            {showCat ? "Cerrar" : "+ Nueva categoría"}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showCat && (
            <form
              action={async (fd) => {
                await createCategory(fd);
                setShowCat(false);
              }}
              className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3"
            >
              <div>
                <Label htmlFor="cat_name_es">Nombre (ES)</Label>
                <Input id="cat_name_es" name="name_es" placeholder="Comidas" required />
              </div>
              <div>
                <Label htmlFor="cat_name_en">Nombre (EN)</Label>
                <Input id="cat_name_en" name="name_en" placeholder="Meals" />
              </div>
              <div>
                <Label htmlFor="cat_name_pt">Nombre (PT)</Label>
                <Input id="cat_name_pt" name="name_pt" placeholder="Refeições" />
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" size="sm">
                  Guardar categoría
                </Button>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no tienes categorías.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
                >
                  <span>{t(c.name_i18n, "es")}</span>
                  <button
                    onClick={() => start(() => void deleteCategory(c.id))}
                    disabled={pending}
                    className="text-slate-400 hover:text-rose-600"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <p className="font-medium text-slate-800">
            Platillos ({products.length})
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowProd((v) => !v)}
            disabled={categories.length === 0}
          >
            {showProd ? "Cerrar" : "+ Nuevo platillo"}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {categories.length === 0 && (
            <p className="text-sm text-amber-600">
              Crea al menos una categoría antes de agregar platillos.
            </p>
          )}

          {showProd && categories.length > 0 && (
            <form
              action={async (fd) => {
                await createProduct(fd);
                setShowProd(false);
              }}
              className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="p_name_es">Nombre (ES)</Label>
                <Input id="p_name_es" name="name_es" placeholder="Casado" required />
              </div>
              <div>
                <Label htmlFor="p_cat">Categoría</Label>
                <Select id="p_cat" name="category_id" required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {t(c.name_i18n, "es")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="p_name_en">Nombre (EN)</Label>
                <Input id="p_name_en" name="name_en" placeholder="Casado" />
              </div>
              <div>
                <Label htmlFor="p_name_pt">Nombre (PT)</Label>
                <Input id="p_name_pt" name="name_pt" placeholder="Casado" />
              </div>
              <div>
                <Label htmlFor="p_price">Precio</Label>
                <Input id="p_price" name="price" type="number" step="0.01" placeholder="3500" required />
              </div>
              <div>
                <Label htmlFor="p_image">URL de imagen (opcional)</Label>
                <Input id="p_image" name="image_url" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p_desc_es">Descripción (ES)</Label>
                <Textarea id="p_desc_es" name="description_es" rows={2} placeholder="Arroz, frijoles, carne y ensalada" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="sm">
                  Guardar platillo
                </Button>
              </div>
            </form>
          )}

          {products.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no tienes platillos.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Platillo</th>
                    <th className="px-4 py-2 font-medium">Precio</th>
                    <th className="px-4 py-2 font-medium">Estado</th>
                    <th className="px-4 py-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {t(p.name_i18n, "es")}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {formatMoney(Number(p.price), currency)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          className={
                            p.is_available
                              ? "bg-brand-100 text-brand-800"
                              : "bg-slate-100 text-slate-500"
                          }
                        >
                          {p.is_available ? "Disponible" : "Agotado"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              start(() =>
                                void toggleProductAvailability(p.id, !p.is_available)
                              )
                            }
                            disabled={pending}
                            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            {p.is_available ? "Marcar agotado" : "Reactivar"}
                          </button>
                          <button
                            onClick={() => start(() => void deleteProduct(p.id))}
                            disabled={pending}
                            className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
