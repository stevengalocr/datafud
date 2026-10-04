# Oleada única de pruebas en producción — propuesta (para revisar el 2026-10-04)

> Borrador para revisar con Steven antes de ejecutar. Junta en una sola pasada los pendientes que
> se prueban con los mismos pasos: el panel del restaurante, la carta del comensal, las órdenes,
> el aislamiento entre locales y lo impreso del bloque A. Fuente: `Pendientes.md` del vault al
> 2026-10-03 y el código de `main` @ `26b3ed4`.

## Punto de partida (verificado el 2026-10-03)

- `/admin` funciona en producción (P0 resuelto, `6382835`) y «Crear restaurante» creó el local **test**.
- La `service_role` ya está como Sensitive en Vercel.
- S1, S3 y S4 aplicados en producción. `verify.sql` en ok.
- **Nunca probado en producción:** todo `/dashboard`, la carta del comensal en `/m/<local>/<mesa>`,
  `place_order`, el tablero de órdenes, los reportes y el aislamiento con dos locales.

## Antes de la oleada (desarrollo, lo hace Claude por la mañana)

| # | Qué | Por qué antes | Tamaño |
|---|-----|---------------|--------|
| D1 | `updateProduct` + formulario de edición | Sin esto, un error de precio o nombre obliga a borrar y crear el producto; la oleada lo probaría a medias | Chico |
| D2 | Revisión de los triggers de límite de plan en la UI (mesas, categorías, productos) | La oleada intenta pasarse del tope y la UI tiene que mostrar el mensaje | Chico |
| D3 | *(a decidir)* Storage para fotos y logo | Si entra, se prueba en la misma oleada; si no, queda para otra | Mediano |

## La oleada (Steven con el teléfono, Claude mirando logs y base) · ~60–90 min

**1. Panel del restaurante con el usuario de «test»**
- Entrar con la contraseña temporal. Ajustes: nombre, moneda en colones, idiomas ES/EN.
- Menú: crear 2 categorías, editarlas y borrar una. Crear 4 productos (uno sin categoría), editar
  uno (D1), marcar uno como agotado y borrar otro.
- Mesas: crear 3 y descargar el QR de una. Pasarse del tope del plan y ver el mensaje (D2).

**2. Carta del comensal (el flujo que se vende)**
- Escanear el QR de la mesa con **iPhone y Android** → `/m/test/<mesa>`.
- Ver idiomas, precios en ₡ y el producto agotado. Hacer un pedido con nota.
- **Mismo momento, bloque A:** escanear el stand impreso y la tarjeta NFC hacia `/q/demo26` (si
  ya están impresos). Es el mismo gesto y el mismo par de teléfonos.

**3. Órdenes y reportes**
- El pedido aparece en el tablero en 15 s o menos. Recorrer los estados hasta «pagado».
- S4: mandar pedidos seguidos desde la misma mesa hasta topar el límite; la carta muestra un
  mensaje conocido, no un error crudo.
- Reportes: la venta aparece con el total correcto y la hora de Costa Rica.

**4. Aislamiento entre locales (cierra D-018)**
- Crear un segundo local, **test2**, desde `/admin`.
- Con el usuario de test2: no ve categorías, productos, mesas, órdenes ni reportes de test.
- Claude repite la prueba contra la API con la sesión de test2 (lecturas y escrituras con el
  `tenant_id` de test) y corre el Security Advisor de Supabase.
- Si todo pasa: decidir si se vuelve a enlazar «Ingresar» en la landing.

**5. Super admin**
- Registrar un pago y un cargo a test. Suspender test2: ¿qué ve su panel y qué ve su carta?
  Reactivarlo.

**6. Limpieza**
- Decidir si test y test2 se quedan como locales de prueba o se borran (y cómo, sin dejar usuarios
  huérfanos en Auth).

## Lo que queda fuera de la oleada (y por qué)

- Migrar las cartas de `/c/<slug>` a `/m/` y su `/q/`: solo tiene sentido con un cliente real con pedidos.
- SMTP propio (Resend) y backups: van antes del primer local con pedidos, no antes de probar.
- P2/P3 (límites finos por plan, MRR real, i18n de paneles, Playwright del flujo QR → orden): la
  oleada manual dice qué vale la pena automatizar.

## Para decidir mañana

1. ¿Storage (D3) entra antes de la oleada o después?
2. ¿Están impresos el stand y la tarjeta NFC para escanearlos en el mismo paso?
3. «Cobrado» en el Resumen: ¿suma también los cargos (implementación, NFC)?
4. ¿test y test2 se quedan como locales de prueba permanentes?

## Resultado

Cada paso se anota como ok o falla, con captura. Lo que falle se arregla en el día. Al cerrar, va
un bloque en `docs/vault-sync/` y se aplica al vault.
