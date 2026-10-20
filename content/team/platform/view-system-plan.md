# View System Plan — Browser Migration & Spatial Foundation

**Status:** Planning  
**Scope:** browser/ (primary), synap-app/packages/views/ (done), spatial-ui (gap fill)  
**Goal:** Zero Tamagui in the browser. One design system (`@synap-core/spatial-ui`) powering every surface. Views generated from a spatial component foundation.

---

## 1. Current State Audit

### What is done
- `@synap-core/spatial-ui` — 17 components: `SpatialButton`, `SpatialIconButton`, `SpatialInput`, `SpatialChip`, `SpatialToolbar`, `SpatialPopover`, `SpatialSegmentedControl`, `SpatialPanel`, `SpatialModal`, `SpatialAvatar`, `SpatialListRow`, `SpatialEmptyState`, `SpatialSkeleton`, `SpatialLensChip`, `SpatialFilterPill`, `SpatialTabStrip`, `SpatialLensHeader`
- CSS token foundation: `--synap-spatial-ink`, `--synap-spatial-surface-*`, `--synap-spatial-hairline`, ochre primary — matches V2 design palette
- `scale(0.96)` press feedback already in spatial-ui CSS
- View packages (plain CSS, zero Tamagui): **list, grid, kanban, masonry** — all migrated, type-checked clean
- Browser shell partially on spatial-ui: ViewPage, DashboardView, SettingsView, agents views, onboarding flows

### What is NOT done — browser Tamagui apps (10)
| App | Size | Priority |
|---|---|---|
| `LibraryApp.tsx` | Large — mixed Tamagui + spatial-ui | P0 |
| `ChannelsApp.tsx` | Medium | P0 |
| `GlobalChatApp.tsx` | Medium — AI surfaces | P1 |
| `CalendarApp.tsx` | Large — view package | P1 |
| `DataStructureApp.tsx` | Medium | P1 |
| `FilesApp.tsx` | Medium | P2 |
| `ImportApp.tsx` | Small | P2 |
| `MarketplaceApp.tsx` | Medium | P2 |
| `WorkflowsApp.tsx` | Medium | P2 |
| `WhiteboardApp.tsx` | Large — canvas | P3 |

### What is NOT done — view packages (still Tamagui)
| Package | Status | Notes |
|---|---|---|
| `@synap-core/table-view` | Tamagui-heavy | Hardest — inline edit, column resize, sort |
| `@synap-core/calendar-view` | Tamagui | Needs full redesign per V2 |
| `@synap-core/timeline-view` | Tamagui | Lower traffic |
| `@synap-core/graph-view` | Tamagui shell | D3 core is fine, Tamagui is wrapper |
| `@synap-core/gantt-view` | Not built | Blank canvas |

### What is NOT done — spatial-ui missing components
These are blocking view and app migration (see Phase 1):

`SpatialCard`, `SpatialBadge`, `SpatialSelect`, `SpatialCheckbox`, `SpatialSwitch`,  
`SpatialDivider`, `SpatialDrawer`, `SpatialContextMenu`, `SpatialKbd`,  
`SpatialTag` (removable chip), `SpatialTextarea`, `SpatialNumberInput`, `SpatialColorSwatch`

---

## 2. Architecture — Two Worlds, One Foundation

```
browser/ (Electron — PRIMARY)
  ↓ uses
@synap-core/spatial-ui          ← THE component layer for browser
  ↓ uses CSS variables from
@synap-core/spatial-shell       ← defines --synap-spatial-* tokens (light + dark)
  ↓ view packages consume
@synap-core/view-renderer       ← adapter registry, ViewContainer
  ↓ dispatches to
@synap-core/{list,grid,kanban,masonry,table,...}-view  ← plain CSS views

synap-app/ (standalone web apps — CRM, Studio, Devplane)
  ↓ uses SAME view packages (plain CSS, --border/--primary HSL vars)
  ↓ does NOT use spatial-ui (uses its own HeroUI + plain CSS)
  ↓ can diverge freely — separate apps
```

**Rule:** synap-app packages are independent. They have their own theming, their own CSS variables, their own component decisions. The browser is the spatial-ui consumer. The view packages are the shared rendering layer — they use neutral HSL CSS variables (`--border`, `--background`, etc.) that both systems provide.

---

## 3. Phase 0 — Token Alignment (½ day)

The spatial-ui CSS uses `--synap-spatial-*` tokens. These must be defined somewhere the browser loads before any app renders. They are currently defined in `@synap-core/spatial-shell/styles.css`.

**Verify:**
- [ ] `spatial-shell/styles.css` defines ALL tokens referenced in `spatial-ui/src/styles.css`
- [ ] Dark mode: `[data-theme="dark"]` or `.dark` selector redefines all tokens
- [ ] Browser root (`electron/renderer/src/index.tsx` or root layout) imports spatial-shell CSS before any app
- [ ] View package tokens (`--border`, `--background`, `--primary`, `--muted`, `--accent`, `--destructive`, `--warning`) are also defined in spatial-shell so views work in browser

**Deliverable:** A single CSS import chain that gives every browser surface its full token set in both light and dark.

---

## 4. Phase 1 — spatial-ui Component Gap Fill

These are the primitives missing before apps can be migrated. Build them in `@synap-core/spatial-ui/src/`.

### 4a. Simple additions to `components.tsx` + `styles.css`

| Component | What it is | Needed by |
|---|---|---|
| `SpatialCard` | `border-radius: 12px`, `--synap-spatial-surface-raised` bg, `border: 1px solid hairline`, hover + press states | entity cards, settings sections |
| `SpatialBadge` | inline pill — `variant: solid\|outline\|soft`, `tone: neutral\|ochre\|teal\|sage\|danger` | status, type labels, counts |
| `SpatialDivider` | `1px` horizontal or vertical, `--synap-spatial-hairline` color | sections, toolbars |
| `SpatialKbd` | monospace, `border-radius: 5px`, subtle border, `font-size: 10px` | keyboard shortcut hints |
| `SpatialTag` | chip with `×` dismiss button — same as FilterPill but simpler, for tagging UI | CardFieldSelector, entity tags |
| `SpatialTextarea` | same wrapper as SpatialInput but `<textarea>`, `resize: vertical` | notes, description fields |
| `SpatialNumberInput` | SpatialInput with `type="number"`, +/- stepper buttons | WIP limits, column widths |
| `SpatialColorSwatch` | 16px circle, `border: 2px solid hairline`, checked state | column/entity color pickers |

### 4b. Medium components

| Component | What it is | Needed by |
|---|---|---|
| `SpatialCheckbox` | 16px, `border-radius: 4px`, primary fill checked, indeterminate dash | list view multi-select, table row select |
| `SpatialSwitch` | 32×18px toggle, ochre thumb when on | settings panels |
| `SpatialSelect` | native `<select>` wrapper matching spatial-ui style, or custom popover-based | sort direction, filter ops, column type |
| `SpatialContextMenu` | `position: fixed` popover for right-click, `SpatialListRow` items inside | entity right-click in all views |

### 4c. Drawer (replaces the kb-panel-* CSS we just wrote)

`SpatialDrawer` — a right-anchored slide-in panel:
```tsx
<SpatialDrawer open={open} onDismiss={onClose} title="Manage Columns" width={440}>
  {children}
</SpatialDrawer>
```
- `position: fixed`, `right: 0`, `top: 0`, `bottom: 0`
- Enter: `translateX(100%)` → `translateX(0)`, 220ms `cubic-bezier(0.2,0,0,1)`
- Exit: reverse, 180ms
- Backdrop: `rgba(0,0,0,0.15)`, click to dismiss
- Once built, `CardFieldSelector` and `ColumnManager` in kanban can use it instead of `kb-panel-*` raw CSS

**Output:** All added to `components.tsx` + `styles.css`, exported from `src/index.ts`.

---

## 5. Phase 2 — Browser App Migration (P0 first)

Each app: remove `@synap-core/ui-system` import, replace Tamagui primitives with spatial-ui + plain HTML.

### Migration rules
- `YStack` / `XStack` → `<div style={{ display: 'flex', flexDirection: 'column/row' }}>` or add `.sp-col` / `.sp-row` utility classes to spatial-shell
- `SizableText` / `Text` → `<p>`, `<span>`, `<h2>` — semantic HTML
- `styled(XStack, {...})` → CSS class in a co-located `.css` file
- `useTheme()` → CSS variables directly, no JS needed
- `Button`, `Card`, `IconButton`, `Badge` → spatial-ui equivalents
- `ModernInput` → `SpatialInput`
- `ScrollView` → `<div style={{ overflow: 'auto' }}>` or `overflow-y: auto` CSS class

### App migration order

**P0 — immediately blocking quality**

1. **`LibraryApp.tsx`** — highest traffic, already partially on spatial-ui. Finish the migration: remove YStack/XStack/Text/useTheme, keep all spatial-ui imports.
2. **`ChannelsApp.tsx`** — core communication surface.

**P1 — important, schedule next sprint**

3. **`CalendarApp.tsx`** — pairs with the calendar view package rewrite (Phase 3)
4. **`GlobalChatApp.tsx`** — AI surface, pairs with companion architecture
5. **`DataStructureApp.tsx`** — profile/schema editor

**P2 — clean up**

6. `FilesApp.tsx`
7. `ImportApp.tsx`
8. `MarketplaceApp.tsx`
9. `WorkflowsApp.tsx`

**P3 — complex, separate effort**

10. `WhiteboardApp.tsx` — canvas-based, assess separately

---

## 6. Phase 3 — View Package Rewrites

These are the view packages still on Tamagui. Each gets the same treatment as list/grid/kanban/masonry.

### 6a. Table view — most complex, highest value

**What exists:** `EnhancedEntityTableView`, `StandardTableView`, `PivotTableView`, `TableRow`, `TableCell`, `TableHeader`, `ColumnSettings` — all Tamagui.

**New architecture:**
```
table-view.css          ← all styling
TableView.tsx           ← main component (plain divs)
TableHeader.tsx         ← sortable/resizable headers (plain th/div)
TableRow.tsx            ← row with hover, selection, inline edit trigger
TableCell.tsx           ← cell type dispatch: text | date | enum | number | boolean | person
InlineCellEditor.tsx    ← floating edit popover (SpatialPopover)
ColumnConfig.tsx        ← SpatialDrawer-based column settings
```

**Key CSS classes:**
- `.tv-root` — antialiased, fill container
- `.tv-header-row` — sticky, 36px, border-bottom
- `.tv-header-cell` — flex, gap, resize handle `::after`
- `.tv-row` — 40px default, hover accent bg, left accent line on hover
- `.tv-cell` — padding 10px 12px, truncate, cursor per type
- `.tv-cell--editing` — focused ring, no truncate
- `.tv-resize-handle` — 4px wide, absolute right, cursor col-resize

**V2 design requirements:**
- Frozen first column (title) — `position: sticky; left: 0`
- Sticky header — `position: sticky; top: 0`
- Row density: compact (32px) / standard (40px) / tall (56px)
- Column reorder via drag (blue insertion indicator)
- Inline cell editing (no modal)

### 6b. Calendar view — redesign

**What exists:** Tamagui-based, needs full replacement per V2 artboards.

**New architecture:**
```
calendar-view.css
CalendarView.tsx        ← mode switcher (month/week/day) + toolbar
MonthGrid.tsx           ← 7-col grid, event pills, +N more
WeekGrid.tsx            ← time-grid, 48px per hour, absolute event blocks
DayGrid.tsx             ← full-width time blocks
EventPill.tsx           ← 20px height, 8px radius, entity type color left-border
```

### 6c. Graph view — wrapper only

The D3 core is not Tamagui. Only the shell components (toolbar, legend, node detail panel) need migrating. Smaller effort.

### 6d. Gantt view — build from scratch

Per the design prompt. Blocked on table view being stable first (shares row/header patterns).

### 6e. Timeline view

Low traffic, deprioritize after table/calendar.

---

## 7. Phase 4 — V2 Design Affordances

These are the interaction-layer components shown in the design artboards (I1–I8 series) that make views feel native. Most map to spatial-ui components already, but need wiring.

| Artboard | Affordance | Implementation | Status |
|---|---|---|---|
| I1 | Lens chip + filter pills | `SpatialLensHeader` already exists | Wire to ViewPage |
| I2 | Inline type switcher popover | `SpatialPopover` + view type icons | Build in ViewConfigInspector |
| I3 | Refine bar (sort + group + filter) | `SpatialToolbar` + `SpatialSelect` + `SpatialFilterPill` | Build as `ViewRefineBar` component |
| I4 | Ephemeral tabs (save/AI authored) | `SpatialTabStrip` already exists | Wire to ViewPage tab state |
| I5 | Filter pill inline edit | `SpatialFilterPill` + edit popover | Extend SpatialFilterPill with `onEdit` |
| I6 | Entity → view traceability | Side panel showing which views reference this entity | New `EntityViewTrace` component |
| I7 | Profile views section | Settings section in profile editor | New section in DataStructureApp |
| I8 | AI view creation in chat | Chat produces view JSON → proposal | IS tool → Hub Protocol |

**Highest value to ship first:** I1 (lens chip wired) + I3 (refine bar) — together these give views a consistent toolbar across all types.

---

## 8. Phase 5 — New Views (V2 Hero Screens)

These are net-new views inspired by the design artboards, not migrations.

| Artboard | What | Package |
|---|---|---|
| V1 | Empty state — three doors (create / import / AI generate) | `ViewContainer` in view-renderer |
| V3 | Lens picker (choose a view type) | New `LensPicker` component in view-renderer |
| V4 | Lens switcher — 12 tasks, 4 lenses (HERO) | `ViewPage` + `SpatialSegmentedControl` |
| V6 | Kanban + config inspector side panel | `SpatialDrawer` + existing kanban-view |
| V8 | Bento dashboard | Already exists in bento-view — needs spatial-ui polish |
| V9 | Workspace builder — chat IS the workspace | AI interaction pattern, IS territory |

---

## 9. Removal List

When all phases are done, these can be fully removed from `browser/`:

- All `@synap-core/ui-system` imports
- All `@tamagui/*` imports
- `electron.vite.config.ts` Tamagui alias entries
- Potentially: `@synap-core/ui-system` as a peer dep from browser's `package.json`

The `@synap-core/ui-system` package stays in `synap-app/` — the standalone web apps (CRM, Studio, Devplane) still use HeroUI + Tamagui and are separate worlds. Do not touch them as part of this effort.

---

## 10. Phased Sprint Plan

| Phase | Work | Effort | Owner area |
|---|---|---|---|
| **0** | Token alignment — verify spatial-shell covers all view + spatial-ui vars | ½ day | spatial-shell CSS |
| **1a** | spatial-ui simple additions (Card, Badge, Divider, Kbd, Tag, Textarea) | 1 day | spatial-ui |
| **1b** | spatial-ui medium additions (Checkbox, Switch, Select, ContextMenu) | 1.5 days | spatial-ui |
| **1c** | SpatialDrawer | 1 day | spatial-ui |
| **2-P0** | LibraryApp + ChannelsApp Tamagui removal | 2 days | browser/apps |
| **2-P1** | CalendarApp + GlobalChatApp + DataStructureApp | 3 days | browser/apps |
| **2-P2** | Files, Import, Marketplace, Workflows | 2 days | browser/apps |
| **3a** | Table view rewrite (plain CSS, no Tamagui) | 4 days | views/table |
| **3b** | Calendar view rewrite | 3 days | views/calendar |
| **3c** | Graph view wrapper migration | 1 day | views/graph |
| **4** | ViewRefineBar + LensChip wiring + type switcher | 2 days | browser/components/views |
| **5** | LensPicker + V1 empty state + Kanban inspector | 2 days | view-renderer + browser |
| **6** | Gantt view (new build) | 5 days | views/gantt |

**Total:** ~28 days of focused work. Parallelizable: Phase 1 and Phase 2 can run simultaneously.

---

## 11. What This Unlocks

Once done:
- **AI view generation** — Companion produces `{ type: 'list' | 'grid' | 'kanban' | 'table', config: {...} }` JSON. The view-renderer adapter registry renders it. No code changes needed per view type.
- **User-configurable views** — Every view has a `SpatialLensHeader` at top (chip + filter pills + toolbar). Users filter, sort, group without leaving the view.
- **Dark mode** — spatial-shell redefines all `--synap-spatial-*` tokens under `[data-theme="dark"]`. All views and apps inherit it with zero extra work.
- **Consistent shell** — browser apps all look like siblings. Same buttons, same inputs, same panels. No more mismatched Tamagui islands inside a spatial-ui shell.
