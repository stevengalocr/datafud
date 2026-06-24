# DataFud — Guía de marca

> La identidad visual y verbal de DataFud. Define cómo se ve, cómo suena y qué reglas
> sigue el producto para sentirse premium y coherente. Fuente técnica viva: `.impeccable.md`
> (contexto de diseño) + `tailwind.config.ts` (tokens) + `src/app/globals.css` (motion).

---

## 1. Esencia de marca

- **Nombre:** DataFud · **dominio:** datafud.com · **fabricante:** GaloDev.
- **Tagline:** *"QR Menus. Orders. Analytics."*
- **Personalidad (3 palabras):** cálida · artesanal · premium con confianza.
- **Sensación:** una marca gastronómica editorial, no un template SaaS genérico.
- **Cierre de marca:** "© DATAFUD · UN PRODUCTO DE GALODEV · HECHO EN LATINOAMÉRICA".

### Logo y símbolo
- Logo principal: `public/logo-main.png` (sobre fondo claro; en fondos oscuros va dentro de una placa blanca con esquinas redondeadas).
- Isotipo / favicon: `public/icono-main.png`.
- Motivo de marca: la **"D" construida con píxeles de QR + un tenedor**. Se usa como textura decorativa firma (la retícula `.qr-grid`).
- Libro de marca: `public/libro-marca.png`.

---

## 2. Color

Dirección: **Editorial Culinary** — verde bosque + oro sobre neutros crema cálidos
tintados hacia el verde. **Nunca negro/blanco puro.** El oro es el acento del ~10%.

### Primario — Verde bosque (`brand`)
| Token | Hex | Uso |
|---|---|---|
| brand-600 | `#22503a` | **Primario** (botones, superficies de marca) |
| brand-700 | `#1b4030` | Hover de primario |
| brand-900 | `#112a20` | Texto display sobre claro |
| brand-950 | `#0a1a13` | Fondos oscuros (cierres, banners) |
| brand-50 / 100 | `#f0f7f3` / `#dcede4` | Tintes suaves de fondo |

### Acento — Oro / mostaza (`accent`)
| Token | Hex | Uso |
|---|---|---|
| accent-500 | `#b8923f` | **Acento** (detalles, NFC, glow) — úsalo con moderación |
| accent-300 | `#dcb65a` | Acento sobre fondos oscuros |
| accent-50 | `#fbf6ea` | Tinte de fondo |

### Neutros cálidos (`cream` / `stone`)
| Token | Hex | Uso |
|---|---|---|
| cream-50 | `#fbfaf6` | **Fondo base** de la app |
| cream-100 | `#f5f3ea` | Superficies suaves |
| stone-250 | `#dedbd9` | Bordes / divisores |

> **Tema claro** en todo el producto: la comida se ve de día y el panel se usa en servicio.
> Los neutros están tintados hacia el verde de marca para cohesión subconsciente.

---

## 3. Tipografía

- **Display (títulos):** **Young Serif** — serif editorial con carácter. Token `font-display`.
- **Texto / UI:** **Hanken Grotesk** — sans limpia y legible. Token `font-sans`.
- **Escala:** fluida con `clamp()` en titulares de marketing; fija en `rem` para UI de paneles.
- **Reglas:** pocos tamaños con alto contraste (ratio ≥ 1.25); líneas de cuerpo ≤ 65–75 caracteres; mayúsculas solo para etiquetas/labels cortos (con `tracking` amplio).

Se evitan deliberadamente las fuentes "de defecto" (Inter, Playfair, Fraunces, etc.).

---

## 4. Motion

- **Propósito sobre decoración.** Una carga bien orquestada > micro-animaciones dispersas.
- **Easing:** `cubic-bezier(0.23, 1, 0.32, 1)` (out-expo). Sin bounce/elastic.
- **Solo `transform`/`opacity`** (60fps). Nunca animar layout (width/height/margin).
- **Firmas:** reveal escalonado en carga, scroll-spy + secciones pinneadas, parallax sutil, count-up, marquee de monedas, motivo QR que se ensambla, CTA magnético.
- **Accesibilidad:** todo se neutraliza con `prefers-reduced-motion: reduce`.

---

## 5. Voz y tono

- **Idioma:** español de Latinoamérica, cercano pero profesional. EN/PT en el producto.
- **Voz:** cálida, apetitosa, segura. Verbos de acción, frases cortas.
- **Léxico de marca:** "comensal", "carta", "soda", "llave en mano", "a tu marca".
- **Evitar:** jerga corporativa fría, promesas vagas, anglicismos innecesarios.

---

## 6. Reglas anti-slop (qué NO hacer)

Para no parecer "hecho por IA genérica":
- ❌ Emojis como iconos → ✅ solo SVG (`src/components/ui/icon.tsx`).
- ❌ Texto con degradado (`background-clip: text`).
- ❌ Franjas de color en `border-left/right` de tarjetas/alertas.
- ❌ Glassmorphism por todos lados; sombras genéricas en cajas redondeadas.
- ❌ Paleta IA (cian sobre oscuro, degradados morado→azul, neón).
- ❌ Todo centrado y encajonado en grids idénticos de tarjetas.
- ✅ Jerarquía editorial, asimetría intencional, fotografía de comida real, oro como 10%.

---

## 7. Aplicación por superficie

| Superficie | Tratamiento |
|---|---|
| **Landing** | Editorial audaz, tema claro con act-breaks oscuros; oro como acento; motion firmado |
| **Menú del comensal** | Inmersivo, mobile-first; el color del tenant manda (theming por `tenant_settings.theme`) |
| **Paneles (dashboard/admin)** | Cream/verde, claros y legibles para uso en servicio; datos primero |
| **Cierres / banners** | `brand-950` con glow dorado tenue y textura `qr-grid` |

> **Multi-tenant:** cada restaurante puede tener su propia paleta (`tenant_settings.theme`
> `primary`/`accent`); la carta del comensal se pinta con esos colores. La marca DataFud
> (verde/oro) gobierna la landing y los paneles del producto.
