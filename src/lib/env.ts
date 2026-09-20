// Comprobaciones de entorno que deciden en el servidor qué se renderiza.
// Ninguna lanza: sin variables, la interfaz degrada con un aviso.

/** Hay backend configurado (Supabase) para autenticación y paneles. */
export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
