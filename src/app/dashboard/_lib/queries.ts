// Lecturas de las páginas del panel (Server Components). Dos reglas:
//
// 1. Un error de Supabase nunca se pinta como un vacío. Si una consulta falla (corte breve, JWT
//    vencido a mitad de la carga), la página lanza y entra `dashboard/error.tsx` con reintento y
//    código, en vez de decir «Todavía no hay órdenes» cuando sí las hay. El detalle queda en el
//    registro del servidor; la interfaz solo ve un mensaje genérico.
// 2. Nada se corta en silencio. PostgREST devuelve como mucho 1000 filas por pedido: `fetchAll`
//    pagina hasta traerlas todas (con un techo alto que, si se alcanza, también lanza).

type DbError = { code?: string; message?: string } | null;
type Result<T> = { data: T | null; error: DbError; count?: number | null };

function boom(where: string, error: DbError): never {
  console.error(`[datafud] ${where}:`, error?.code ?? "-", error?.message ?? "");
  throw new Error(`No se pudieron cargar los datos (${where}).`);
}

/** Datos de una consulta, o lanza si falló. Una lista vacía sigue siendo `[]`. */
export function must<T>(res: Result<T[]>, where: string): T[];
export function must<T>(res: Result<T>, where: string): T | null;
export function must<T>(res: Result<T>, where: string): T | null {
  if (res.error) boom(where, res.error);
  return res.data;
}

/** El `count` de una consulta con `{ count: "exact", head: true }`, o lanza si falló. */
export function mustCount(res: Result<unknown>, where: string): number {
  if (res.error) boom(where, res.error);
  return res.count ?? 0;
}

const PAGE = 1000;

/**
 * Trae todas las filas de una consulta, de a 1000. `page(from, to)` arma la consulta con
 * `.range(from, to)` y **un orden estable** (con desempate por `id`), o las páginas se pisan.
 */
export async function fetchAll<T>(
  where: string,
  page: (from: number, to: number) => PromiseLike<Result<T[]>>,
  max = 20_000
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const res = await page(from, from + PAGE - 1);
    const batch = must(res, where);
    rows.push(...batch);
    if (batch.length < PAGE) return rows;
    if (rows.length >= max) boom(where, { message: `más de ${max} filas` });
  }
}

/** Parte una lista en tramos (para filtros `.in()` que no deben armar URLs enormes). */
export function chunks<T>(list: T[], size = 150): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
