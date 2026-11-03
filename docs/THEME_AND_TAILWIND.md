# Theme, Tailwind and Fumadocs UI

The site uses Tailwind CSS v4 with its CSS-first configuration. There is no `tailwind.config.*` file. Its look is
the Synap brand of synap.live: warm paper in the dark, one ochre lamp, Geist type, the amber S mark.

## Wiring

- `postcss.config.mjs` runs `@tailwindcss/postcss`.
- `app/globals.css` imports, in order: `tailwindcss`, then the Fumadocs UI theme `fumadocs-ui/css/neutral.css`, its
  layout preset `fumadocs-ui/css/preset.css` and the OpenAPI preset. The presets declare the classes Fumadocs
  components use (`@source inline(...)`), so no `@source` for `node_modules` is needed. The Synap tokens come after
  them and replace every colour `neutral.css` sets.
- Tailwind v4 finds the class names in the app's own files automatically (everything not gitignored), including
  `lib/home-ui.ts`.

## Brand sources

Copy values from these; do not invent new ones.

| What | Source |
|---|---|
| The mark (S, 6-stop radial gradient `#c35100` to `#ffdb23`, aspect ratio 724/1584) | `synap-landing/public/brand/synap-mark.svg`, copied unchanged to `public/brand/synap-mark.svg`. Never recolour or redraw it. |
| Favicon, app icon, Apple icon | `synap-landing/app/{favicon.ico,icon.png,apple-icon.png}`, copied to `app/` (Next.js serves them by file name) |
| Colours | The monorepo `DESIGN.md` (from the design-tokens JSON) and `synap-landing/src/tokens.css` |
| Type | Geist for headings and body, Geist Mono for code (founder decision 2026-10-05: one family, hierarchy from size, weight and tracking) |

## Theme tokens

Fumadocs 15+ reads full colour values from `--color-fd-*`. `app/globals.css` sets every one of them in both themes
(`:root` for light, `.dark` for dark, and `.dark #nd-sidebar`, which `neutral.css` overrides with greys).

| Token | Light | Dark | From |
|---|---|---|---|
| background | `#f0e8d6` | `#26211c` | bg, the page ground |
| foreground, card/popover/secondary/accent foreground | `#1f1b17` | `#f4ecdc` | ink |
| card | `#f7f2e5` | `#2d2721` | surface film over the ground, composited |
| popover | `#fbf7ee` | `#3a3128` | paper, the island material |
| muted | `#e5dcca` | `#38322b` | hover film (light), surface-raised (dark), composited |
| secondary | `#fbf7ee` | `#38322b` | paper (light), surface-raised (dark) |
| muted-foreground | `#685f54` | `#b6aa96` | muted |
| accent | `rgba(168,110,46,.14)` | `rgba(194,138,74,.16)` | ochre-light, the selection wash |
| border | `rgba(50,38,22,.16)` | `rgba(255,238,205,.15)` | hairline-2 |
| primary | `#784f21` | `#c9975f` | ochre, moved in lightness for AA text (below) |
| primary-foreground | `#fbf7ee` | `#1f1b17` | paper / ink |
| ring | `#a86e2e` | `#c28a4a` | ochre |
| info, success, error, warning, idea (callouts) | teal, sage, clay, warning, ochre | same, dark values | semantic hues |

Fumadocs uses `primary` both as a fill and as text (the active sidebar item, "On this page", tabs, link underlines).
The brand ochre (`#a86e2e` light, `#c28a4a` dark) is under WCAG AA 4.5:1 as text on these grounds, so `primary`
keeps its hue and saturation and only its lightness moves: 30% in light, 58% in dark. Every text pair is at least
4.5:1 in both themes (the lowest: muted-foreground on muted, 4.60:1 light; primary on the hover wash, 4.77:1 dark).
Re-measure when you change a value.

Fonts: `app/layout.tsx` loads Geist and Geist Mono with `next/font/google` (`--font-geist`, `--font-geist-mono` on
`<html>`); `globals.css` maps them onto Tailwind's `--font-sans` and `--font-mono`, which Fumadocs uses.

## Code blocks

`lib/shiki-themes.ts` defines two Shiki themes in the same palette (keyword ochre, string sage, function and type
teal, constant clay, comment muted). `source.config.ts` uses them for the MDX pages and `components/api-page.tsx` for
the Hub REST API pages. Each token colour is at least 4.5:1 on both code backgrounds (`card`, and `secondary` inside
tabs).

On the Hub REST API pages, fumadocs-openapi colours the HTTP method badges with Tailwind's green, blue, yellow,
orange and red. Inside `#nd-page`, `globals.css` maps those palette variables onto sage, teal, ochre, ochre-ink and
clay, each at least 4.5:1 (Tailwind's green-600 was 3:1 on the paper).

## Components

Use the Fumadocs components (`Card`, `Cards`, `Callout`, `Steps`, `Tabs`) rather than custom markup, so pages keep the
product look. The search dialog is the Fumadocs default, backed by `/api/search`. The nav title (mark, "Synap",
"Docs") and the synap.live link are set once in `lib/layout.shared.tsx`.

## Build warnings

`next build` prints CSS warnings about `::highlight(fd-search)` from the Fumadocs search styles. They come from the
CSS minifier not knowing the CSS Custom Highlight API and are harmless.
