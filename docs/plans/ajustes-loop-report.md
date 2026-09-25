# Informe del loop — Ajustes finales (2026-09-25)

> Octavo bucle autónomo sobre `main`, de `44f24d6` (1.4.0) a la versión **1.4.1**.
> Estado detallado: `docs/plans/ajustes-loop-state.md`. Puente al vault:
> `docs/vault-sync/2026-09-25-ajustes.md`. Prompt maestro: `LOOP-Ajustes-Finales-Datafud.md` (v1).

## Resumen

Cierra lo que dejaron abiertos los revisores de 1.4.0, con las decisiones D-057 a D-062.

| Qué | Antes (1.4.0) | Ahora (1.4.1) |
|---|---|---|
| Oferta de fundadores | Solo hablaba de la Carta | Vale en cualquier plan: Carta sin costo de implementación; Estándar o Empresarial, ₡24 900 menos; 1 stand en los dos (D-057) |
| Descuento de Carta a sistema | "Lo que pagaste", sin casos borde | ₡24 900 también con pago anual; el fundador no tiene descuento; 6 meses desde la publicación (D-058) |
| Hardware pedido después | "Junto con la implementación" | Por adelantado: con la implementación o, si se pide después, al aprobar el diseño (D-059) |
| Desde cuándo corre el plazo | Desde el material | Desde el material y el pago de la implementación, lo que llegue último (D-060) |
| "48 horas" sin "hábiles" | H1, OG, meta description y dos guías | Solo el H1; debajo, "Garantía: carta en 48 horas hábiles" (D-061) |
| A quién le paga el cliente | Los términos nombraban a una persona con otro nombre comercial | "DataFud es el nombre comercial con el que opera Steven Galo, responsable legal del servicio" en `#confianza` y los términos (D-062) |
| Botón flotante de WhatsApp (móvil) | Tapaba la esquina del render del hero | Aparece al pasar el hero |
| "≈ US$" en planes y hardware | A veces en la línea del precio, a veces abajo | Siempre en su propia línea |
| Teléfono de `#demo` | "SODA TICA" | "Nuestra carta.", como `/c/ejemplo` |
| FAQ en escritorio | Parecía una columna vacía | Ya era *sticky*: medido en el viewport real, sin cambio de código |
| Términos | 1.1 | 1.2 (25 de setiembre de 2026) |

## Unidades

| ID | Título | Estado | Commit | Despliegue |
|---|---|---|---|---|
| A01 | Estado y línea base | hecho | `ae568e2` | READY `dpl_Ay1LH5qL…` |
| A02 | Condiciones (D-057 a D-061) | hecho | `96b3527` | READY `dpl_FnuznXxm…` |
| A03 | Pulido visual | hecho | `bef7c02` | READY `dpl_DyNvGYak…` |
| A04 | Nombre comercial (D-062) | hecho | `215a69b` | ver estado |
| A05 | Verificación, release 1.4.1 y puente | hecho | ver estado | ver estado |

Ninguna unidad bloqueada.

## Revisores sin contexto

- **A02 (frase por frase contra §2):** dos frases que no decían que el plazo también espera el pago
  y una pastilla del hero sin "en cualquier plan"; corregidas. 0 "48 horas" sin "hábiles" fuera del H1.
- **A04 (dueño de soda):** entendió que le paga a Steven Galo; dos nombres comerciales seguidos en
  los términos lo confundían y se dejó uno. "Empresa costarricense" y la cédula quedan para Steven.

## Puertas en producción

Ver el bloque de A05 en el estado.

## PENDIENTES-STEVEN

Ver `docs/plans/ajustes-loop-state.md`.
