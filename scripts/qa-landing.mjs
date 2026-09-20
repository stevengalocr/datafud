#!/usr/bin/env node
// QA de la landing de DataFud en navegador real (Playwright + Chromium).
//
//   npm run build && npm run qa:landing
//
// Si no hay nada escuchando en el puerto, levanta `next start` solo y lo apaga al final.
// Variables: QA_BASE (default http://localhost:3000), QA_CHROMIUM (ruta a un Chromium;
// si existe /opt/pw-browsers/chromium se usa; si no, el de Playwright: `npx playwright install chromium`).
// Capturas por sección en .qa/ (ignorada por git). Sale con código 1 si hay fallos.
//
// Comprueba en 375×812, 768×1024 y 1440×900: errores de consola propios, requests fallidos,
// scroll horizontal y elementos fuera del viewport, anclas que resuelven, CTAs de WhatsApp
// (wa.me + target/rel + data-wa-origin), un solo h1, alt en imágenes, áreas táctiles ≥ 44 px,
// sin "TODO"/"PENDIENTE" visible, acordeón y menú móvil por teclado, y las rutas
// /, /login, /register (307 → /#contacto), /terminos, /privacidad, /robots.txt, /sitemap.xml.
// Las fotos remotas que fallen por falta de red (500 en /_next/image?url=https…) se reportan
// como aviso, no como fallo, porque dependen del entorno.

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.QA_BASE || "http://localhost:3000";
const PORT = Number(new URL(BASE).port || 80);
const OUT = path.resolve(".qa");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "375x812", width: 375, height: 812, mobile: true },
  { name: "768x1024", width: 768, height: 1024, mobile: false },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];
const PAGES = ["/", "/login", "/terminos", "/privacidad"];
const IGNORED_URL = /_vercel\/insights/;
const REMOTE_IMAGE = /\/_next\/image\?url=https?%3A/;

const failures = [];
const warnings = new Set();
const fail = (m) => failures.push(m);
const warn = (m) => warnings.add(m);

async function isUp() {
  try {
    const r = await fetch(BASE, { redirect: "manual" });
    return r.status > 0;
  } catch {
    return false;
  }
}

let server = null;
if (!(await isUp())) {
  console.log(`· No hay servidor en ${BASE}: levantando next start en :${PORT}`);
  // detached: el grupo de procesos completo (next + next-server) se apaga al final.
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], { stdio: "ignore", detached: true });
  for (let i = 0; i < 60 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 1000));
  if (!(await isUp())) {
    console.error("No se pudo levantar next start. ¿Corriste npm run build?");
    process.exit(1);
  }
}

const executablePath = process.env.QA_CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch({ executablePath });

try {
  // Rutas sin navegador
  for (const [p, expect] of [["/robots.txt", 200], ["/sitemap.xml", 200], ["/register", 307]]) {
    const r = await fetch(BASE + p, { redirect: "manual" });
    if (r.status !== expect) fail(`${p}: status ${r.status} (esperado ${expect})`);
    if (p === "/register" && !/#contacto$/.test(r.headers.get("location") || "")) fail(`/register no redirige a /#contacto`);
    if (p === "/robots.txt" && /acceso/.test(await r.text())) fail(`/robots.txt anuncia la ruta privada`);
  }
  const sitemap = await (await fetch(BASE + "/sitemap.xml")).text();
  if (/login|register|acceso/.test(sitemap)) fail("sitemap.xml lista rutas privadas");

  for (const p of PAGES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        reducedMotion: "reduce",
      });
      const page = await ctx.newPage();
      const consoleErrors = [];
      const failed = [];
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        if (/Failed to load resource/.test(m.text())) return; // los recursos se evalúan por request abajo
        consoleErrors.push(m.text());
      });
      page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
      page.on("response", (r) => {
        const url = r.url();
        if (r.status() < 400 || IGNORED_URL.test(url)) return;
        if (REMOTE_IMAGE.test(url)) warn(`${p} @ ${vp.name}: foto remota no cargó (${r.status()}); depende de la red del entorno`);
        else failed.push(`${r.status()} ${url}`);
      });
      page.on("requestfailed", (r) => {
        const url = r.url();
        if (IGNORED_URL.test(url) || REMOTE_IMAGE.test(url)) return;
        failed.push(`${url} ${r.failure()?.errorText}`);
      });

      // "load" + una pausa corta: networkidle se cuelga si alguna foto remota tarda en fallar.
      const res = await page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(800);
      if (!res || res.status() !== 200) fail(`${p} @ ${vp.name}: status ${res?.status()}`);
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);

      const m = await page.evaluate(() => {
        // Anclas de la misma página ("#x") siempre; las absolutas ("/#x") solo cuando estamos en "/".
        const onHome = location.pathname === "/";
        const anchors = [...document.querySelectorAll('a[href^="#"], a[href^="/#"]')]
          .map((a) => a.getAttribute("href"))
          .filter((h) => h.startsWith("#") || onHome)
          .map((h) => h.replace(/^\//, ""));
        const missing = [...new Set(anchors.filter((h) => h.length > 1 && !document.querySelector(h)))];
        const wa = [...document.querySelectorAll('a[href^="https://wa.me/"]')];
        const waBad = wa.filter((a) => a.target !== "_blank" || !/noopener/.test(a.rel) || !a.dataset.waOrigin).length;
        const overflow = [...document.querySelectorAll("body *")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed" && !el.closest(".marquee-host, .overflow-hidden");
        }).length;
        const small = [...document.querySelectorAll("a, button")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && getComputedStyle(el).display !== "none";
        }).map((el) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
        return {
          hscroll: document.documentElement.scrollWidth > window.innerWidth,
          overflow,
          missing,
          waCount: wa.length,
          waBad,
          h1: document.querySelectorAll("h1").length,
          imgsNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
          todo: /\bTODO\b|\bPENDIENTE\b/.test(document.body.innerText),
          emptyHrefs: [...document.querySelectorAll("a")].filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#" || a.getAttribute("href").startsWith("/register")).length,
          small,
        };
      });
      const tag = `${p} @ ${vp.name}`;
      if (consoleErrors.length) fail(`${tag}: errores de consola: ${consoleErrors.slice(0, 3).join(" | ")}`);
      if (failed.length) fail(`${tag}: requests fallidos: ${failed.slice(0, 3).join(" | ")}`);
      if (m.hscroll) fail(`${tag}: scroll horizontal`);
      if (m.overflow) fail(`${tag}: ${m.overflow} elementos fuera del viewport`);
      if (m.missing.length) fail(`${tag}: anclas sin destino: ${m.missing.join(", ")}`);
      if (m.waBad) fail(`${tag}: ${m.waBad} enlaces de WhatsApp sin target/rel/data-wa-origin`);
      if (p === "/" && m.waCount < 5) fail(`${tag}: solo ${m.waCount} enlaces de WhatsApp`);
      if (m.h1 !== 1) fail(`${tag}: ${m.h1} h1`);
      if (m.imgsNoAlt) fail(`${tag}: ${m.imgsNoAlt} imágenes sin alt`);
      if (m.todo) fail(`${tag}: TODO/PENDIENTE visible`);
      if (m.emptyHrefs) fail(`${tag}: ${m.emptyHrefs} enlaces vacíos o a /register`);
      if (m.small.length) warn(`${tag}: áreas táctiles < 44 px: ${m.small.join(", ")}`);

      if (p === "/") {
        for (const sel of ["#como-funciona", "#sistema", "#hardware", "#demo", "#implementacion", "#planes", "#confianza", "#preguntas", "#contacto", "footer"]) {
          const el = page.locator(sel).first();
          if (await el.count()) {
            await el.scrollIntoViewIfNeeded();
            await el.screenshot({ path: path.join(OUT, `${sel.replace("#", "")}-${vp.name}.png`) }).catch(() => {});
          } else fail(`${tag}: falta la sección ${sel}`);
        }
      }
      await ctx.close();
    }
  }

  // Acordeón por teclado (escritorio)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await page.goto(BASE + "/#preguntas", { waitUntil: "load" });
    await page.waitForTimeout(500);
    const btns = page.locator("#preguntas button[aria-expanded]");
    const n = await btns.count();
    if (n < 9) fail(`acordeón: ${n} preguntas (mínimo 9)`);
    await btns.nth(1).focus();
    await page.keyboard.press("Enter");
    if ((await btns.nth(1).getAttribute("aria-expanded")) !== "true") fail("acordeón: Enter no abre");
    const controls = await btns.nth(1).getAttribute("aria-controls");
    if (!controls || !(await page.locator(`[id="${controls}"]`).isVisible())) fail("acordeón: aria-controls no apunta a un panel visible");
    await page.keyboard.press("ArrowDown");
    const focusedIsThird = await page.evaluate(() => document.activeElement === document.querySelectorAll("#preguntas button[aria-expanded]")[2]);
    if (!focusedIsThird) fail("acordeón: ArrowDown no mueve el foco");
    await page.close();
  }
  // Menú móvil por teclado
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(500);
    const btn = page.locator("header button[aria-controls]");
    if (!(await btn.isVisible())) fail("menú móvil: botón no visible en 375");
    await btn.click();
    const panelId = await btn.getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    if ((await btn.getAttribute("aria-expanded")) !== "true" || !(await panel.isVisible())) fail("menú móvil: no abre");
    const links = await panel.locator("a").count();
    if (links < 5) fail(`menú móvil: ${links} enlaces`);
    await page.keyboard.press("Escape");
    if ((await btn.getAttribute("aria-expanded")) !== "false") fail("menú móvil: Escape no cierra");
    await page.close();
  }
} finally {
  await browser.close();
  if (server) {
    try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill(); }
  }
}

for (const w of warnings) console.log("AVISO ", w);
for (const f of failures) console.log("FALLO ", f);
console.log(`\nqa:landing → ${failures.length === 0 ? "OK" : failures.length + " fallos"} · ${warnings.size} avisos · capturas en ${OUT}`);
process.exit(failures.length ? 1 : 0);
