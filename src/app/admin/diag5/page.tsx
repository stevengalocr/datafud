// DIAGNÓSTICO TEMPORAL: solo importa el cliente de Supabase del servidor.
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Diag5() {
  const s = await createClient();
  return <p>diag5: cliente creado {typeof s.from}</p>;
}
