import { PRICING, type PlanCode } from "@/lib/constants";
import type { TenantStatus } from "@/lib/supabase/types";

// Lo que el plan de un local le deja hacer, leído de la fila de `plans` (la fuente que hace
// cumplir la base) y, si falta una clave, de `PRICING` (regla 6: deben coincidir).

export type PlanLimits = {
  code: PlanCode | null;
  /** Nombre con el que se vende el plan ("Carta", "Estándar"…), o null si el local no tiene plan. */
  label: string | null;
  maxLanguages: number;
  tableOrdering: boolean;
};

type PlanRow = { code?: string | null; features?: Record<string, unknown> | null } | null | undefined;

const isPlanCode = (v: unknown): v is PlanCode => typeof v === "string" && v in PRICING.plans;

/**
 * Límites del plan. Sin plan asignado no hay tope (igual que los triggers de `schema.sql`, que
 * con `plan_id` nulo dejan pasar todo).
 */
export function planLimits(plan: PlanRow): PlanLimits {
  const code = isPlanCode(plan?.code) ? plan.code : null;
  const pricing = code ? PRICING.plans[code] : null;
  const f = plan?.features ?? {};
  const maxLanguages =
    typeof f.max_languages === "number" ? f.max_languages : pricing?.maxLanguages ?? 3;
  const tableOrdering =
    typeof f.table_ordering === "boolean" ? f.table_ordering : pricing?.tableOrdering ?? true;
  return {
    code,
    label: pricing?.marketingName ?? null,
    maxLanguages: Math.max(1, Math.min(3, maxLanguages)),
    tableOrdering,
  };
}

/** Un local suspendido o cancelado ve su panel, pero no lo puede cambiar. */
export function isReadOnlyStatus(status: TenantStatus | string | null | undefined): boolean {
  return status === "suspended" || status === "cancelled";
}
