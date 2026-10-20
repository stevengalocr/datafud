// Contraseña temporal del dueño (auditoría base 2026-10-19). La que crea el super admin en
// `createTenant` viaja por WhatsApp: el usuario queda marcado y el panel lo lleva a cambiarla en su
// primer ingreso. La marca vive en `user_metadata` porque la quita el propio dueño al cambiarla
// (sin service_role, regla 5). No es una barrera de seguridad frente al dueño: es para que la
// contraseña que pasó por un chat deje de servir cuanto antes. Módulo puro (sin Next ni red).

/** Clave de `user_metadata` que marca una contraseña temporal. */
export const TEMP_PASSWORD_FLAG = "must_change_password";

/** Página del panel donde se cambia la contraseña. */
export const PASSWORD_PAGE = "/dashboard/settings";

/** Aviso que la página de Configuración muestra cuando llega por la contraseña temporal. */
export const TEMP_PASSWORD_REASON = "contrasena-temporal";

type MaybeUser = { user_metadata?: Record<string, unknown> | null } | null | undefined;

/** El usuario todavía entra con la contraseña temporal que le dio el super admin. */
export function mustChangePassword(user: MaybeUser): boolean {
  return user?.user_metadata?.[TEMP_PASSWORD_FLAG] === true;
}

/**
 * A dónde mandar a un usuario con contraseña temporal que pide `path`, o null si puede seguir.
 * Solo se intercepta el panel del restaurante: la página de la contraseña (y lo que cuelga de
 * ella) queda libre para poder cambiarla.
 */
export function passwordGateRedirect(path: string, user: MaybeUser): string | null {
  if (!mustChangePassword(user)) return null;
  if (path !== "/dashboard" && !path.startsWith("/dashboard/")) return null;
  if (path === PASSWORD_PAGE || path.startsWith(`${PASSWORD_PAGE}/`)) return null;
  return `${PASSWORD_PAGE}?motivo=${TEMP_PASSWORD_REASON}`;
}
