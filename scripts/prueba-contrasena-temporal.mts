// Prueba de la parte pura de la contraseña temporal del dueño (src/lib/auth/temporary-password.ts).
// npm run test:auth · sin red ni base. Node 22.6+ (tipos quitados con --experimental-strip-types).
import assert from "node:assert/strict";
import {
  mustChangePassword,
  passwordGateRedirect,
  PASSWORD_PAGE,
  TEMP_PASSWORD_FLAG,
} from "../src/lib/auth/temporary-password.ts";

const temporal = { user_metadata: { full_name: "Doña Ana", [TEMP_PASSWORD_FLAG]: true } };
const cambiada = { user_metadata: { full_name: "Doña Ana", [TEMP_PASSWORD_FLAG]: false } };
const vieja = { user_metadata: { full_name: "Local creado antes de 1.9.0" } };
const destino = `${PASSWORD_PAGE}?motivo=contrasena-temporal`;

// Solo `true` exacto marca la contraseña como temporal: un texto o un número no cuentan.
assert.equal(mustChangePassword(temporal), true);
assert.equal(mustChangePassword(cambiada), false);
assert.equal(mustChangePassword(vieja), false);
assert.equal(mustChangePassword({ user_metadata: { [TEMP_PASSWORD_FLAG]: "true" } }), false);
assert.equal(mustChangePassword({ user_metadata: null }), false);
assert.equal(mustChangePassword(null), false);
assert.equal(mustChangePassword(undefined), false);

// Con la marca, todo el panel del restaurante lleva a Configuración…
for (const path of ["/dashboard", "/dashboard/", "/dashboard/menu", "/dashboard/orders", "/dashboard/tables/abc/qr"]) {
  assert.equal(passwordGateRedirect(path, temporal), destino, path);
}
// …menos la propia página de la contraseña (si no, no habría dónde cambiarla).
assert.equal(passwordGateRedirect(PASSWORD_PAGE, temporal), null);
assert.equal(passwordGateRedirect(`${PASSWORD_PAGE}/`, temporal), null);
// Fuera del panel del restaurante no se intercepta nada (ni rutas que solo se parecen).
for (const path of ["/login", "/admin", "/admin/tenants", "/dashboards", "/dashboard-x", "/acceso-galodev-9f3a"]) {
  assert.equal(passwordGateRedirect(path, temporal), null, path);
}
// Sin la marca, nunca redirige.
for (const user of [cambiada, vieja, null]) {
  assert.equal(passwordGateRedirect("/dashboard/menu", user), null);
}
// Una página que solo empieza igual que la de la contraseña no queda libre.
assert.equal(passwordGateRedirect(`${PASSWORD_PAGE}-x`, temporal), destino);

console.log("contraseña temporal: ok");
