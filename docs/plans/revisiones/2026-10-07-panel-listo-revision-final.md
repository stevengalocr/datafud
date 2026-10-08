# Final review: panel-listo (7aa4503..4d0f612), DataFud 1.6.0

Reviewer: final whole-branch gate before merge to `main` (which deploys to datafud.com).
Inputs: the packaged diff, plan `docs/plans/2026-10-07-panel-listo.md`, `CLAUDE.md` (rules and known traps), ledger `progress.md`, and task-N reviews. Read-only: no SQL, no build run (the ledger records typecheck, lint and build as green for each task; no concrete doubt needed a re-run).

## Verdict: **Fix first** (three small changes, about 20 minutes, none structural)

The branch is sound. The deploy-critical paths are safe:
- No module imported by metadata does I/O at import time.
- `uploadImage` is Zod plus `ActionResult` and never throws.
- The tenant folder comes from the session.
- The upload body stays under the 1 MB Server Action limit.
- `/m/` renders images with a plain `<img>`, so `remotePatterns` is not involved.
- The preview uses `unoptimized`, and `*.supabase.co` already covers the public URL anyway.
- The S15 FKs keep the same delete behavior the app relies on.

Two client-side defects in the upload component would be the first thing a real restaurant sees in the oleada. The release notes also say something that is no longer true. Fix those three, then merge.

---

## Critical
None.

## Important: fix before merge

**I1. A transparent PNG logo turns into a black square on Safari/iPhone.** `src/app/dashboard/image-upload.tsx:29`
- When `toBlob("image/webp")` does not return WebP, the code falls back to JPEG. JPEG has no alpha channel, so transparent pixels come out black.
- The Task 2 review called this rare ("every current browser encodes WebP"). I disagree. Safari's canvas does not encode WebP: it hands back PNG, so the `blob.type !== "image/webp"` branch runs. Every iPhone/Mac owner therefore takes the JPEG path.
- `/m/` draws the logo on a white tile (`menu-client.tsx:194-202`, intended for transparent PNGs). It would show as a black block, which is the restaurant's brand on its own menu.
- Fix: just before the JPEG `toBlob`, paint white behind what is already drawn:
  ```ts
  if (!blob || blob.type !== "image/webp") {
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = "#fff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }
  ```
  An alternative is to fall back to `image/png` for `kind === "logo"` with a smaller `MAX_SIDE` (for example 512) so it stays under 1 MB.
- Verify on an iPhone in the oleada: upload a transparent PNG logo and open `/m/`.

**I2. A failed upload tells the owner the image is unreadable.** `src/app/dashboard/image-upload.tsx:83` and `:96` (ledger "image-upload.tsx:222")
- The single `catch` maps every throw to «No pudimos leer esa imagen. Probá con otra». The `uploadImage(fd)` call throws in these cases:
  - the network drops;
  - the 1 MB body limit is exceeded;
  - right after a deploy, a dashboard tab opened before the deploy calls an old action id ("Failed to find Server Action").
- The last case happens by construction on the first deploy of this branch.
- The owner is sent to try other photos, which never helps.
- Fix: put `shrink` and `uploadImage` in separate `try` blocks. The upload failure should say «No se pudo subir la imagen. Revisá la conexión o recargá la página y probá de nuevo; también podés pegar la dirección de la foto.»

**I3. The CHANGELOG 1.6.0 says production still has to be updated, but the owner already did it.** `docs/CHANGELOG.md:17`, `:53`, `:66`
- Lines 17 and 53 say «requiere aplicar `schema.sql` en producción». Sections 12 and 13 were applied and `verify.sql` returned 27/27 true on 2026-10-07.
- Line 66 (S4, now inside 1.6.0) says «Hay que volver a correr `schema.sql` en producción», which is also done.
- Fix: replace with «aplicado en producción el 2026-10-07 (`verify.sql` en true)». For line 66, write «aplicado en producción».
- This is docs truthfulness only, a one-line edit each, and it closes Task 4's minor 5.

## Important: fix before oleada step 4 (does not affect the deploy)

**I4. The storage section (4) of `scripts/prueba-aislamiento.mjs` cannot pass against production.** This is a cross-task bug: Task 3 was written in parallel with Task 2.
- `:535` uploads a `text/plain` Blob. The `media` bucket (section 12, applied) only accepts jpeg/png/webp, and Storage rejects the MIME type before any RLS check.
- As a result B's attempt, A's positive control and anon's attempt all end `inconcluso`. Section 4 is always incomplete, so the script always exits 3.
- Once the MIME issue is fixed, `:559` checks that A's file still exists with A's `storage.list(...)`. Listing (and `remove`) needs a SELECT policy on `storage.objects`, and there is none (by design, confirmed in prod). `sigue` would always be empty, which yields a **false FALLA** («el archivo desapareció»).
- For the same reason, the cleanup at `:248` (`A.cliente.remove`) silently leaves the test file behind.
- Fix:
  - Upload a valid 1x1 PNG (`Uint8Array` of a minimal PNG, `contentType: "image/png"`, `.png` names). The bucket and magic bytes will accept it.
  - Check existence by fetching the public URL (`getPublicUrl(rutaA)`, expect HTTP 200) instead of `list`.
  - For cleanup, either accept and report the leftover file (an `aviso` with its path), or add a tenant-scoped `media_tenant_select` policy for `authenticated`.
    - That policy also unlocks the planned old-photo cleanup.
    - It needs a schema re-apply, and `verify.sql` row 20 would expect 4 policies.
- Not merge-blocking: the script is not deployed. It is the D-018 gate, though, and without this fix it can never give the green light to relink «Ingresar».

## Minor (new, later)
- **N1.** `docs/plans/2026-10-04-oleada-de-pruebas.md:51` says «Sale 0 si todo pasa y 1 si algo falla». The script also exits 2 (environment missing or interrupted) and 3 (incomplete). Given I4, Steven will see 3 and the doc does not explain it. Add the two codes.
- **N2.** Each «Subir foto» stores a file even when the form is never saved, and replaced photos are never deleted. Nothing caps per-tenant storage, and the bucket is public, so a logged-in owner could use it as free hosting. This is negligible with hand-made users; add it to the old-photo cleanup item.
- **N3.** `uploadImage` detects a missing bucket with `/bucket not found|not found/i` (`actions.ts`, same as Task 2 minor 6). An "Object not found" from some other Storage failure would show the "todavía no está activa" text. Harmless now that the bucket exists.

## Cross-task integration checks (passed)
- **Upload component inside the edit form:**
  - `ImageUpload targetId="ep_image"` reads the uncontrolled input that the upload fills.
  - `useFormSubmit` builds `FormData` from the DOM, so the uploaded URL is submitted.
  - The edit form is keyed by `p.id`, so switching products remounts the uploader with the right `initialUrl`.
  - Create (`p_image`) and edit (`ep_image`) ids do not clash.
  - The reset listener only affects the create form.
- **S15 against app code paths:**
  - `deleteCategory`, `deleteTable` and `deleteProduct` keep their old behavior: set null on the reference column only, and order_items still cascade with their order.
  - `createTenant`'s rollback (deleting the tenant) cascades cleanly.
  - `place_order` already looks products up by `tenant_id` (`schema.sql:537-539`), so the new composite FK on `order_items.product_id` cannot be tripped by a legitimate order.
  - `updateProduct` with a foreign `category_id` now fails on the FK, and `dbFail` returns its generic message.
  - `order_items.product_id = null` was already possible before this branch.
- **Script after Task 5:** the constraint names in `FK_MISMO_NEGOCIO` match section 13 exactly. Section 2b requires 23503 plus the constraint name, so it has no false-ok path.
- **Vercel deploy:**
  - `uploadImage` is the only new export in a `"use server"` file. Helpers and consts are not exported.
  - `File` and `crypto.randomUUID` are available on the Node runtime.
  - The body is at most about 1,000,400 bytes, under the 1,048,576 limit.
  - No new environment variables, no new dependencies, nothing touches metadata or OG modules.
  - The landing is untouched. The diff only changes dashboard files, SQL, scripts and docs.
- **Rules:**
  - Rule 3: no `anon` storage policy; public read comes from the public bucket.
  - Rule 4: the tenant comes from the session.
  - Rule 7: `schema.sql` stays idempotent and has no users.
  - Rule 8: Zod plus `ActionResult`.
  - Rule 9: voseo, no emojis.
  - Rule 11: graceful degrade when Storage is off.
  - No secrets in the diff.

---

## Ledger triage

| # | Item | Decision |
|---|---|---|
| T1-m1 | Edit form renders below the list, far from the row on long menus | Later (scroll into view or render inline; worth doing after the oleada feedback) |
| T1-m2 | Product field parsing duplicated in create and update | Later |
| T1-m3 | IIFE with `!` in JSX | Later |
| T1-m4 | Edit form pending does not disable the row's Editar/Eliminar | Later |
| T1-m5 | Old `http` image URL blocks saving on edit (clear message) | Later (only "test" exists) |
| T2-m1 | Wrong message when the upload call fails | **Fix now** (I2) |
| T2-m2 | JPEG fallback blackens transparent PNG | **Fix now** (I1; not rare, since Safari takes this path) |
| T2-m3 | Preview goes stale when the URL is edited by hand | Later |
| T2-m4 | verify.sql row 21 only matches policies whose text contains "media" | Later (prod checked by hand: only the 3 `media_tenant_*` policies) |
| T2-m5 | verify.sql row 20 misses other permissive `authenticated` policies | Later (same manual check; add a "no other policies on storage.objects" row next time `verify.sql` is touched) |
| T2-m6 | "not found" regex is fragile | Later (N3) |
| T2-m7 | Button not tied to the URL field for screen readers | Later |
| T2 ⚠️ | Leftover storage policies in prod | Resolved (ledger 2026-10-07) |
| T2 ⚠️ | Old-photo cleanup needs a SELECT policy | Later; ties into I4's cleanup option and N2 |
| T3-M3 | Update on tenants/settings rewrites the same value | Later |
| T3-M5 | `limit(1000)` sample | Later |
| T3-rr1 | `esRls` too broad (403 / "unauthorized") | Later (the positive controls mitigate it) |
| T3-rr2 | Summary says "ok" even when the bucket section is omitted | Later (moot: the bucket exists now) |
| T3-rr3 | An exception in `limpiar()` exits 1 with no summary | Later; cheap to fold into the I4 fix |
| T3-rr4 | No error and no rows is labelled "inconcluso" | Later |
| T3-rr5 | 0 rows cannot be told from "row missing" | Informational |
| T3-rr6 | Never run against a real database | Open: I4 shows the first run will exit 3; fix I4 before the oleada |
| T5-m1 | Duplicate `### Security` heading | Resolved (one heading in 1.6.0, CHANGELOG:52) |
| T5-m2 | verify row 24 uses `confdelsetcols` (PG15+) | Later (prod is PG15+) |
| T5-m3 | Row 26 depends on the `prosrc` text | Later |
| T5-m4 | No index on `order_items(tenant_id, product_id)` | Later (pre-existing, current size is tiny) |
| T4-m1 | vault-sync heading format drift | Later (fix in the post-deploy vault-sync) |
| T4-m2 | vault-sync intro says «sin desplegar» while the schema is applied | Later; update in the post-deploy vault-sync, which will need to say "código desplegado" anyway |
| T4-m3 | Seguridad.md:12 header still says 1.4.1 | Later (vault) |
| T4-m4 | Producto:12 and 4 index rows say 1.4.1 | Later (vault) |
| T4-m5 | CHANGELOG «requiere aplicar schema.sql» | **Fix now** (I3) |
| Ruling | T1 and T3 in parallel worktrees | Fine; the parallel work is what caused I4 (T3 did not see T2's MIME limit) |
| Ruling | Task 5 added | Endorsed: closes S15 before any real local |
| Ruling | Storage queue line reworded to «probar la subida» | Endorsed: true, since section 12 is applied |

**Fix now: 3 (I1, I2, I3). Before the oleada: 1 (I4). Later: 26** (25 ledger minors plus N1–N3, minus duplicates/resolved; see the table).

## Declined to judge
- Whether Safari's current release has started encoding WebP from canvas. My finding I1 assumes it has not (it historically returns PNG). The white-fill fix is harmless either way.
- EXIF orientation of phone photos through `createImageBitmap` (browser default `imageOrientation`). Test in the oleada with a portrait photo from an iPhone and from an Android.
- Exact Storage server ordering (MIME check vs RLS) for the anon upload in I4. A's positive control fails on MIME regardless, which is enough for the finding.
- Vault page contents beyond what the Task 4 review covered (not re-read).
- Whether prod's Supabase Storage applies RLS to `upload` without `upsert` using INSERT only, as Supabase documents. The app path depends on it, and the oleada's first real upload is the test.
