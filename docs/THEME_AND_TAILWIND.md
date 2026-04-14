# Theme, Tailwind, and fumadocs-ui — configuration

## 1. Root cause: no `@tailwind` in `globals.css` (most important)

`@import 'fumadocs-ui/style.css'` pulls a **pre-built** CSS file from the package. It only contains utilities that **fumadocs-ui’s own** build included (a **subset** of Tailwind — e.g. `gap` only up to `gap-6`, limited padding scale).

There was **no** `@tailwind base|components|utilities` in this app. Without that, **PostCSS does not run Tailwind JIT** against `tailwind.config.ts` and your `content` globs. So **most classes used in `app/` and `components/` were never emitted**: `gap-12`, `py-10`, `md:py-14`, `p-6`, `rounded-2xl`, arbitrary values, `homeUi.*`, dialog layout, etc. The HTML still had `class="..."`, but the rules were missing — everything looked “wrong” except what happened to overlap the fumadocs subset (e.g. `Card` using `p-4`, `gap-4`).

**Fix:** in `app/globals.css`, after the fumadocs import, add:

```css
@tailwind utilities;
```

Use `@tailwind base` / `components` only if you intentionally drop the fumadocs import and rely solely on the `docsUi` plugin (advanced). Usually **`@tailwind utilities`** is enough to add the full utility layer without duplicating fumadocs’ preflight bundle.

**Also:** `postcss.config.mjs` with the `tailwindcss` plugin should exist so Next applies this pipeline reliably.

## 2. Tailwind `content` paths

JIT only scans listed files. Include **`./lib/**/*.{ts,tsx}`** (and any other folder with class strings), or utilities referenced only from those files won’t generate.

## 3. Don’t replace fumadocs `Card` to “fix spacing”

Once (1) and (2) are fixed, **`Card` / `Cards`** look as designed. Replacing them with custom markup changes the product look; fix the pipeline first.

## 4. Theme tokens (`--fd-*`)

Synap overrides **`--fd-primary`** in `app/globals.css` for `:root` and `.dark`. Keep both if the brand must read correctly in dark mode.

## 5. Dialogs vs search

Don’t reuse fumadocs **search** dialog geometry for forms; use a centered panel with normal inset.

---

**Summary:** The main misconfiguration was **Tailwind never running for the app** because **`globals.css` had no `@tailwind` directive**. Listing `lib/` in `content` matters but is secondary to that.
