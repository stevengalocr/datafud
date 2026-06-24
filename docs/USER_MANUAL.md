# DataFud — Manual de usuario

> Guía paso a paso para usar DataFud. Está escrita para que **cualquier persona** la
> entienda, sin conocimientos técnicos. Cubre los tres roles del sistema.

---

## 1. ¿Qué es DataFud?

DataFud es un **menú digital** para restaurantes, sodas y cafeterías. El comensal escanea
un **código QR** (o toca una **tarjeta NFC**) en su mesa, ve la carta en su teléfono y envía
su pedido a la cocina — **sin instalar apps ni crear cuenta**. El restaurante gestiona su
menú y sus pedidos desde un panel, y el dueño del servicio administra a todos los clientes.

**Tres tipos de usuario:**
1. 🧑‍🍳 **Comensal** — el cliente en la mesa. No necesita cuenta.
2. 🏪 **Restaurante** — dueño o encargado. Gestiona su negocio en `/dashboard`.
3. 🛡️ **Super admin** — dueño del SaaS (DataFud/GaloDev). Administra todo en `/admin`.

> ¿Quieres verlo sin instalar nada? Entra a **`/preview`**: es un recorrido por un
> restaurante de ejemplo ("Verde Limón") con todo funcionando.

---

## 2. 🧑‍🍳 Para el comensal — pedir desde la mesa

1. **Escanea el QR** de la mesa con la cámara del teléfono (o **acerca el teléfono** a la
   tarjeta NFC). Se abre la carta al instante, sin descargar nada.
2. **Explora el menú.** Usa las pestañas de categoría (Desayunos, Bebidas, etc.) para saltar
   entre secciones. Cada platillo muestra foto, descripción y precio.
3. **Cambia de idioma** (si el restaurante lo ofrece) con el selector arriba a la derecha.
4. **Agrega platillos** con el botón **Agregar**. Ajusta cantidades con **−** y **+**.
5. **Revisa tu orden**: toca la barra **"Tu orden"** abajo para abrir el carrito. Ahí puedes
   cambiar cantidades y escribir una **nota para la cocina** (ej. "sin cebolla").
6. **Envía la orden** con **Enviar orden**. Verás la confirmación *"¡Orden enviada!"* y la
   comanda llega de inmediato al panel de la cocina.
7. **Pagas en el local** — DataFud no cobra al comensal; solo toma el pedido.

---

## 3. 🏪 Para el restaurante — el panel (`/dashboard`)

### Ingresar
- Entra a **`/login`** con el correo y contraseña de tu negocio. Te lleva a tu panel.

### Resumen
Al entrar ves el **resumen del día**: órdenes de hoy, vendido hoy y órdenes activas.

### Comandas en vivo (Órdenes)
- Cada pedido aparece con su mesa, platillos, nota y **estado**.
- Avanza el estado conforme cocinas: **Pendiente → En preparación → Lista → Entregada → Pagada**.
- Las notas del comensal se resaltan para no pasarlas por alto.

### Menú (categorías y platillos)
- Crea **categorías** (ej. Desayunos, Bebidas) y dentro de ellas tus **platillos**.
- Cada platillo lleva nombre, descripción, **precio**, foto y disponibilidad.
- Marca un platillo como **agotado** para ocultarlo temporalmente sin borrarlo.
- Los límites (cantidad de platillos/categorías) dependen de tu **plan**.

### Mesas y QR
- Crea tus **mesas**; cada una genera un **código QR** único. Imprímelo y colócalo en la mesa
  (o grábalo en una tarjeta NFC).

### Reportes
- **Ventas por día**, **ticket promedio** y **platillos más vendidos**. Te dicen qué funciona.

### Configuración
- **Moneda** (todas las de Latam + USD), **idiomas** activos, **nombre, dirección y branding**
  (colores y logo de tu marca, según tu plan).

---

## 4. 🛡️ Para el super admin — administración (`/admin`)

> Acceso por una **ruta privada y no listada** (no aparece en menús públicos).

### Restaurantes (tenants)
- Ve todos los negocios con su **estado**: Prueba, Activo, Suspendido o Cancelado.
- **Aprueba, suspende o reactiva** un restaurante.

### Pagos
- Registra las **mensualidades** de cada restaurante (monto, periodo, estado). Al registrar
  un pago, el restaurante se mantiene **Activo**.

### Cargos (`/admin/charges`)
- Registra los **cargos puntuales** que no son mensualidad:
  - **Implementación única** ($249, llave en mano).
  - **Tarjetas NFC** ($15 por unidad).
  - Otros cargos.
- El total se calcula solo (precio × cantidad) y puedes marcarlo Pagado o Pendiente.

### Planes
- Consulta los planes (Básico $29 / Estándar $49 / Empresarial $99) y sus límites.

---

## 5. 💳 Planes y cómo empezar

| | Básico | Estándar ⭐ | Empresarial |
|---|---|---|---|
| Mensualidad | $29 | $49 | $99 |
| Idiomas | 1 | 2 | 3 |
| Platillos | 20 | 70 | Ilimitados |

- **Implementación única: $249** (llave en mano, dominio propio, 1 año de soporte).
- **Tarjetas NFC: $15/unidad.**
- **Prueba gratis de 30 días** al registrarte en **`/register`**.

**Para registrar tu restaurante:** entra a `/register`, elige tu plan, completa los datos del
negocio y crea tu cuenta. Entras directo a tu panel con un periodo de prueba activo.

---

## 6. ❓ Preguntas frecuentes

- **¿El comensal necesita una app o cuenta?** No. Solo escanea o toca y pide.
- **¿Cómo se paga el pedido?** En el local. DataFud registra el monto, no cobra al comensal.
- **¿Puedo cambiar precios o platillos cuando quiera?** Sí, al instante y se ve en todas las mesas.
- **¿Sirve para clientes extranjeros?** Sí: carta en español, inglés y portugués.
- **¿En qué monedas funciona?** En todas las de Latinoamérica + USD.
- **¿Mis datos están separados de otros negocios?** Sí, totalmente: el aislamiento se
  garantiza a nivel de base de datos (un negocio nunca ve datos de otro).

---

## 7. 🔐 Cuentas de demostración (entorno de pruebas)

Creadas por las semillas de `supabase/schema.sql` (contraseña temporal `Datfud2026!`):
- **Super admin:** `stevengalocr@gmail.com`
- **Restaurante demo:** `demo@datfud.com`

> Cámbialas antes de usar en producción. Para una vista sin backend, usa **`/preview`**.
