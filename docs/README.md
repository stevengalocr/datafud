# Documentación de DataFud

Centro de documentación del proyecto. Versión actual: **v1.0.1**.

## 📚 Índice

| Documento | Para qué sirve | Audiencia |
|---|---|---|
| [PRODUCT.md](PRODUCT.md) | Qué es, para qué sirve, arquitectura, modelo de datos, seguridad y estado | Equipo / nuevos integrantes / IA |
| [USER_MANUAL.md](USER_MANUAL.md) | Cómo se usa, paso a paso, por rol (comensal, restaurante, super admin) | Usuarios finales |
| [MARKETING.md](MARKETING.md) | Línea de venta: propuesta de valor, mensajes, oferta y precios | Ventas / marketing |
| [BRAND.md](BRAND.md) | Guía de marca: logo, color, tipografía, motion, voz, reglas | Diseño / contenido |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones y qué cambió en cada una | Todos |
| [specs/](specs) | Diseño técnico detallado | Ingeniería |
| [plans/](plans) | Planes de implementación por fase | Ingeniería |

## 🚀 Empezar rápido

1. Lee **[PRODUCT.md](PRODUCT.md)** para entender qué es y cómo está construido.
2. Recorre la demo en **`/preview`** (restaurante de ejemplo "Verde Limón", todo funcional).
3. Para correr local: ver "Puesta en marcha" en el [README raíz](../README.md).

## 🔑 Reglas que no se rompen

- **Precios y límites:** la **landing es la fuente de verdad**. Si cambias un precio/límite,
  actualízalo en `src/components/marketing/v2/pricing-v2.tsx`, `src/lib/constants.ts`
  (`PRICING`) y `supabase/schema.sql`.
- **Diseño:** seguir [BRAND.md](BRAND.md) y `.impeccable.md` (reglas anti-slop).
- **Seguridad:** aislamiento multi-tenant por RLS; el comensal anónimo solo accede vía las
  funciones `get_menu()` / `place_order()`.
