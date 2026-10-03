// Errores del servidor con su mensaje real en los logs de Vercel. En producción, Next
// solo muestra un "digest"; aquí se registra el error original para poder diagnosticarlo.
// Solo va a los logs del servidor (privados); nunca al navegador.
export async function register() {}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath: string; routeType: string; renderSource?: string }
) {
  const e = error as { message?: string; digest?: string; stack?: string };
  console.error(
    `[datafud] ${request.method} ${request.path} · ${context.routeType} ${context.routePath}` +
      `${context.renderSource ? ` (${context.renderSource})` : ""} · digest ${e.digest ?? "-"} · ${e.message ?? String(error)}`,
    e.stack?.split("\n").slice(0, 6).join("\n") ?? ""
  );
}
