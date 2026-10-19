# AI Designer Prompt — Synap Next-Gen Views

## Your Role

You are a senior product designer at the intersection of Linear, Notion, and Raycast. You think in interaction states, not just static screens. Your work is pixel-precise, principle-driven, and ready to hand off to engineers.

Your task: design the **next generation of Synap's data views** — beautiful, cohesive, opinionated UI that makes working with personal data feel as fluid as a native app. These designs will inform a real implementation sprint.

---

## What Synap Is

Synap is a sovereign personal data infrastructure — a second brain that captures anything and surfaces it intelligently. Think Notion's flexibility × Linear's precision × Apple's craft.

**Core mental model:** Everything is an **Entity** (note, contact, deal, task, bookmark, file…). Views are *lenses* over entities — the same data, different shapes. A contact can appear as a card in grid, a row in table, a node in graph, a column in kanban, a dot in calendar.

**The user never organizes manually.** AI does it. Views reveal structure that already exists.

---

## Design System Constraints (hard rules)

These are non-negotiable for the engineer handoff to work:

- **Color:** only CSS variables — `hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--border))`, `hsl(var(--card))`, `hsl(var(--muted))`, `hsl(var(--muted-foreground))`, `hsl(var(--accent))`, `hsl(var(--primary))`, `hsl(var(--primary-foreground))`, `hsl(var(--destructive))`, `hsl(var(--warning))`. No hex, no hardcoded rgba except for image outlines which use `hsl(var(--border))`.
- **Radius:** concentric — outer container is always `inner radius + gap`. Never the same radius on nested surfaces.
- **Motion:** `transition-property: specific-property` (never `all`). Press = `scale(0.96)`. Enter = staggered `translateY(6px) → 0` with `--index` CSS variable driving delay. Exit = softer than enter.
- **Typography:** headings use `text-wrap: balance`. Numbers use `font-variant-numeric: tabular-nums`. Font smoothing: `-webkit-font-smoothing: antialiased` on root containers.
- **Hit areas:** every interactive element minimum 40×40px (extend with `::before` pseudo if visually smaller).
- **No shadows** — depth through layered borders (`hsl(var(--border))`), background tints, and subtle radius contrast.
- **Dark/light:** designs must show both. All colors adapt via CSS variables — no hardcoded light-only values.

---

## Views to Design

Design each view at **three fidelity levels**:

1. **Default state** — populated with realistic demo data (10–20 entities of mixed types: contacts, tasks, bookmarks, deals)
2. **Hover / interaction state** — one card/row actively hovered, showing all interactive affordances
3. **Empty state** — zero entities, with a clear, minimal, encouraging empty state

### 1. List View

**Current:** rows with icon + title + field chips + metadata columns.

**Next grade vision:**
- Density variants: compact (32px rows) / normal (44px) / comfortable (56px) — switchable without reload
- Left-edge accent: a 2px colored dot per entity *type* (not status), giving scannable rhythm
- Inline quick-actions: on hover, a floating pill appears on the right with 3 contextual actions (open, share, AI-summarize) — pill uses `background: hsl(var(--background))` with border, never overlaps content
- Multi-select: checkbox appears on hover at left edge, selecting reveals a sticky bottom bar with bulk actions
- Column headers: sortable, resizable, with a subtle `↑↓` icon on hover
- Group-by headers: when grouped (by type, date, tag), group rows are collapsible with a count chip

**Key tensions to resolve:** density vs. readability vs. field visibility

---

### 2. Grid View

**Current:** auto-fill cards, 240px min, with icon + title + properties + footer.

**Next grade vision:**
- Column count slider: 2 / 3 / 4 / auto — remembered per view
- Cards feel like physical objects: slight inner shadow on the icon wrap, concentric radius throughout (card 12px → icon wrap 8px → icon 6px)
- Cover image mode: if entity has an image property, show it as a 120px top band — the card expands gracefully
- Card size variants: micro (icon + title only) / standard / rich (cover + description + all fields)
- Selection: clicking a card's icon area toggles selection without opening the entity
- Drag-to-reorder in manual sort mode: cards lift with `scale(1.02)` + soft shadow approximated by a double border trick

**Key tensions to resolve:** information density vs. visual breathing room

---

### 3. Table View

**Current:** Tamagui-based, with inline editing, column config modal, sort/filter.

**Next grade vision — this is the hardest and most important:**
- Column headers: fixed height 36px, bold label, type icon left of label, sort indicator right, resize handle at edge (4px hit area, 1px visual)
- Cell types each have a distinct but minimal visual language:
  - Text: plain, cursor changes to text on hover
  - Date: shows relative ("3 days ago") by default, ISO on hover
  - Status/Enum: pill badge with semantic color, click opens an inline popover
  - Person: avatar + name, click opens entity
  - Number: right-aligned, tabular-nums, optional sparkline for trend
  - Boolean: custom checkbox — 16px, rounded-4, primary fill when checked
- Row hover: entire row gets `background: hsl(var(--accent))`, left edge gets a 2px primary line
- Inline editing: clicking a cell opens it in-place — no modal, no navigation. Text cells get a subtle focus ring. Enum/status cells get a floating popover.
- Frozen first column (title): always visible on horizontal scroll
- Sticky header: always visible on vertical scroll
- Row height variants: compact (32px) / standard (40px) / tall (56px — for multi-line text cells)
- Column reorder: drag handle appears on header hover, dragging shows a blue insertion indicator

**Key tensions to resolve:** edit affordances vs. read density, horizontal scroll vs. frozen columns

---

### 4. Kanban View

**Current:** DnD columns with cards, WIP limits, add column ghost.

**Next grade vision:**
- Column header redesign: colored left-bar accent (6×24px, rounded-full, entity type color) + title + count pill + `+` button — all in 44px header
- Card anatomy: icon (28px, rounded-8) + title (2-line clamp) + field chips + subtle bottom row with assignee avatar + due date. No wasted space.
- Swimlanes: optional second grouping axis (by assignee or priority) — horizontal dividers within columns
- Drag states: dragged card shows at `opacity: 0.4` in origin, `scale(1.02)` floating clone follows cursor. Drop target column highlights with a `2px primary border` and `hsl(var(--primary) / 0.04)` background.
- Column collapse: clicking the colored bar collapses the column to a vertical strip (just the bar + count) — useful for "Done" columns
- Quick-add card: clicking `+` in column header opens an inline card at top of column — just a text input, `Enter` creates, `Escape` cancels
- WIP warning: when over limit, the count pill turns `hsl(var(--destructive) / 0.9)` and the column header gets a 1px destructive border

**Key tensions to resolve:** card information density vs. drag ergonomics vs. column width

---

### 5. Calendar View

**Current:** Tamagui-based, needs full redesign.

**Next grade vision:**
- Three modes: month / week / day — mode switcher in toolbar (segmented control, not tabs)
- Month: compact event pills (12px font, 20px height, 8px radius) per day cell. Days with >3 events show a `+N more` link. Weekend columns are slightly tinted.
- Week: time-grid with 1hr slots (48px each). Events are positioned absolutely by time. Overlapping events stack with offset. Current time shown as a red line.
- Day: full-width time-grid, events as large blocks with title + description preview
- Event cards: use entity type color as a 3px left border — same color system as kanban dots
- Today: highlighted with `hsl(var(--primary) / 0.08)` background on the cell, bold date number
- Hover on day cell: shows a subtle `+` to quick-create an entity with that date pre-filled

**Key tensions to resolve:** time precision vs. density vs. month/week/day coherence

---

### 6. Gantt View

**Current:** not yet implemented — design from scratch.

**Next grade vision:**
- Left panel: entity list (same as table view, frozen). Right panel: timeline bars.
- Timeline header: two-row — month names top, date numbers bottom. Scrolls horizontally.
- Bars: `border-radius: 6px`, entity type color fill at `0.6 opacity` with full-opacity left cap. Height 24px, vertically centered in 40px row.
- Today line: 2px solid `hsl(var(--primary))`, with a small triangle cap at top.
- Dependencies: curved SVG arrows between bar endpoints — `hsl(var(--border))` stroke, 2px, arrowhead.
- Drag to reschedule: bar drag changes `startDate`/`endDate`. Right edge drag extends duration. Both show a floating tooltip with the new dates.
- Zoom levels: day / week / month / quarter — controls in toolbar. Bar labels always visible if bar is wide enough, otherwise on hover tooltip.
- Milestone: entities with the same start and end date render as a diamond (◆) not a bar.
- Row grouping: same as table — collapsible group rows.

**Key tensions to resolve:** left panel width vs. timeline width, label placement on short bars

---

### 7. Masonry View

**Current:** virtualized with masonic, plain CSS cards.

**Next grade vision:**
- Column count: 2 / 3 / 4 based on viewport, not fixed
- Card anatomy by entity type:
  - Note/document: title (bold 14px) + body preview (3-line clamp, muted) + tag chips at bottom
  - Bookmark: top image band (if available) OR favicon + domain + title + description
  - Contact: avatar (48px circle) + name + role/company + social chips
  - Media: image fills card, title overlaid at bottom with gradient scrim
- Cards have no fixed height — they breathe with their content
- Visual rhythm: cards of the same type get the same max-width on the image band, preventing jarring height differences
- Hover: subtle `border-color` shift to `hsl(var(--primary) / 0.4)` + `scale(1.005)` (barely perceptible lift)
- Load more: infinite scroll with a skeleton row of 3–4 ghost cards

**Key tensions to resolve:** visual rhythm with variable-height cards, type-specific layouts

---

### 8. Graph View

**Current:** D3/React-based node graph, needs visual polish.

**Next grade vision:**
- Nodes: entity icon (28px) centered in a circle (52px diameter). Stroke = entity type color. Background = `hsl(var(--card))`.
- Selected node: stroke becomes `hsl(var(--primary))`, circle gets a 4px glow approximated with a second larger circle at 0.15 opacity.
- Edges: bezier curves, `hsl(var(--border))` stroke, 1.5px, arrowhead for directional relationships.
- Node label: entity title below the circle, 11px, centered, max 2 lines, `hsl(var(--foreground))`.
- Hover: node scales to 1.08, tooltip appears with entity type + title + 2 key properties.
- Cluster: when 5+ nodes share a relationship hub, they visually cluster — the hub node gets a larger circle (68px).
- Mini-map: bottom-right corner, 160×100px, `border-radius: 10px`, shows graph overview with viewport rectangle indicator.

**Key tensions to resolve:** label readability at different zoom levels, edge routing around nodes

---

## Output Format

For each view, produce:

### A. ASCII wireframe (annotated)
Show layout, proportions, label key areas. Be precise — this is for engineers, not stakeholders.

```
┌─────────────────────────────────────────┐
│ [toolbar]  [density]  [group-by]  [+]  │  ← 44px, border-bottom
├─────────────────────────────────────────┤
│ ● Title           Status    Due    Who  │  ← row hover state
│ · Entity name     ·         ·      ·   │
└─────────────────────────────────────────┘
```

### B. Interaction spec table

| State | Trigger | Visual change | Duration |
|---|---|---|---|
| Row hover | `mouseenter` | `background: hsl(var(--accent))`, left 2px primary line | 120ms |
| Card press | `mousedown` | `scale(0.96)` | 130ms cubic-bezier(0.2,0,0,1) |

### C. CSS variable mapping

Which CSS variables does this view use, and how? List every `hsl(var(--*))` reference and what it covers in this view.

### D. Open questions

2–3 unresolved design decisions that need product input before implementation. Frame each as a question with 2–3 option directions.

---

## Tone and Constraints

- **No decorative elements.** Every visual element must earn its place.
- **Default to less.** If unsure whether to show a thing, hide it until hover or interaction.
- **Consistency over originality.** Views should feel like siblings, not different products. The same entity should look recognizable across views.
- **Real data.** Use realistic demo content: actual names, plausible dates, coherent relationships. No "Lorem ipsum", no "Entity 1".
- **Design for 1440px width, scale down to 768px.** Show the breakpoint behavior.
- **Accessibility.** Every interactive state must have a focus-visible ring: `outline: 2px solid hsl(var(--primary)); outline-offset: 2px`.

---

## Prioritization for Planning

After generating all views, produce a **1-page implementation roadmap**:

| View | Effort | Impact | Dependency | Recommended order |
|---|---|---|---|---|
| List | … | … | entity-card | 1 |
| … | | | | |

Effort = S/M/L/XL. Impact = how much it improves the daily-use experience. Dependency = what must exist first.

This roadmap becomes the sprint plan.
