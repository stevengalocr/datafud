# Vault-sync · 2026-10-25 · Portada fluida con scroll rápido

Aplicado en vault: sí

### F-01 · 1.15.1 · Portada fluida con scroll rápido · commit c8214e4 · despliegue Vercel (main)
**Pendientes.md** — sin cambios (no había un pendiente abierto para esto).
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): producción en 1.15.1, con la línea de la versión. `Imagenes-Y-Renders.md`: la fila del video de la portada pasa a `escaneo-1920.mp4` (7,7 MB), `escaneo-2560.mp4` (10,7 MB) y `escaneo-vertical-1080.mp4` (5,2 MB), todos con cada cuadro completo; reemplazan a `escaneo-4k.mp4` y `escaneo-vertical-hd.mp4`; el video se pide con la primera interacción o al terminar de cargar la página.
**log.md** — `## [2026-10-25] ingest | 1.15.1 · Portada fluida con scroll rápido`
- Pedido de Steven: la portada se sentía «pegada» con scroll rápido; el diseño no cambia.
- Causa medida: un cuadro completo cada 10 con B-frames; una búsqueda costaba 28 ms en escritorio (presupuesto 16,7 ms) y el ciclo del video se apagaba si bajaba el `readyState`.
- Videos recodificados con cada cuadro completo (9,7 ms en escritorio y 6 ms en teléfono por búsqueda, PSNR 38–40 dB contra los anteriores); visor y cámara siguen al cuadro presentado; sin lecturas de layout por cuadro.
- Medido en Chrome contra producción con scroll rápido: atraso del video de 35 a 18 cuadros y llega ~0,2 s después de soltar; cuadros perdidos en escritorio de ~21 a ~9. Capturas a cinco alturas: mismo diseño. `qa:landing` en verde.
