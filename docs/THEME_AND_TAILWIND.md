# Theme, Tailwind and Fumadocs UI

The site uses Tailwind CSS v4 with its CSS-first configuration. There is no `tailwind.config.*` file.

## Wiring

- `postcss.config.mjs` runs `@tailwindcss/postcss`.
- `app/globals.css` imports, in order: `tailwindcss`, then the Fumadocs UI theme `fumadocs-ui/css/neutral.css` and its
  layout preset `fumadocs-ui/css/preset.css`. The presets declare the classes Fumadocs components use (`@source
  inline(...)`), so no `@source` for `node_modules` is needed.
- Tailwind v4 finds the class names in the app's own files automatically (everything not gitignored), including
  `lib/home-ui.ts`.

## Theme tokens

Fumadocs 15+ uses full colour values in `--color-fd-*` variables (not the older `--fd-*` HSL triplets). Synap overrides
the brand accent for light (`:root`) and dark (`.dark`) in `app/globals.css`:

```css
:root { --color-fd-primary: hsl(160, 84%, 39%); }
.dark { --color-fd-primary: hsl(160, 72%, 45%); }
```

Keep both: without the `.dark` value the accent reads wrong in dark mode. Utilities such as `bg-fd-primary`,
`text-fd-muted-foreground` and `border-fd-border` come from these tokens.

## Components

Use the Fumadocs components (`Card`, `Cards`, `Callout`, `Steps`, `Tabs`) rather than custom markup, so pages keep the
product look. The search dialog is the Fumadocs default, backed by `/api/search`.

## Build warnings

`next build` prints CSS warnings about `::highlight(fd-search)` from the Fumadocs search styles. They come from the
CSS minifier not knowing the CSS Custom Highlight API and are harmless.
