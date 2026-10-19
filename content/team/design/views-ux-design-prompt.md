# Design Prompt: Synap Views & Lenses UX

**For**: Designer AI / v0 / Lovable / Figma AI  
**Goal**: Generate a multi-page UI spec for the Synap Views & Lenses system — the core user flow from entity data to any visual representation.  
**Output expected**: 8–10 annotated screen designs covering the full flow, from choosing a data scope to switching lenses to building custom views.

---

## What You're Designing

Synap is a personal data OS. Every piece of data is an **Entity** (a typed record with custom properties). A **View** is a lens on that data — not a copy, just a named query + rendering config. The same entities can appear as a table, kanban board, graph, calendar, or bento dashboard without moving the data.

**The architectural north star:**
> Every application is a configuration. AI writes the config.

Two paths to a view:
1. **Config view** — JSON-described (type + groupBy + filters + render settings). Any AI can generate this. 16 built-in types.
2. **Custom view** — a full React/HTML component delivered as a JSX file, sandboxed in an iframe. Proposal-gated, user-approved.

Your designs need to communicate both paths and the complete UX between them.

---

## Design System Constraints

Apply these precisely — they define Synap's visual identity.

### Color palette (dark mode — primary surface)
```
Background base:   #15110D   (warm near-black, not blue-grey)
Surface elevated:  #1E1810   (cards, panels)
Surface border:    rgba(255,255,255,0.07)
Accent:            #C28A4A   (amber-gold — primary interactive)
Accent muted:      rgba(194,138,74,0.15)
AI accent:         #FFDB23   (the logo yellow, --synap-ai — ONLY for AI-generated content; deep gold #756201 in light)
AI muted:          rgba(255,219,35,0.14)
Text primary:      rgba(255,255,255,0.92)
Text secondary:    rgba(255,255,255,0.55)
Text tertiary:     rgba(255,255,255,0.28)
Danger:            #EF4444
```

### Typography
- **Headings**: Fraunces (serif, weight 600) — used for page titles, section headers
- **Body + UI**: DM Sans (sans-serif, weight 400/500) — everything else
- Size scale: 10, 11, 12, 13, 14, 15, 17, 20px

### Spacing & radius
- Base unit: 6px. Spacing tokens: 6, 12, 18, 24, 36, 48px
- **Concentric radius rule** (mandatory): outer container radius = inner card radius + gap between them
  - Example: sidebar = 16px, card inside = 12px (gap 4px → 12+4=16 ✓)
- No shadows anywhere. Depth through border opacity and background offset only.
- Interactive states: subtle background shift on hover, no border changes, scale(0.98) on press.

### Layout shell (Browser V2 — Electron)
```
┌─ ActivityBar (48px, icons only) ─┬─ Main content area ──────────────┬─ Side panel (320px, optional) ┐
│ Home                             │                                   │                               │
│ Chat                             │   [your designs live here]        │   Entity detail / AI companion│
│ Library ← active                 │                                   │                               │
│ ──────                           │                                   │                               │
│ Settings                         │                                   │                               │
└──────────────────────────────────┴───────────────────────────────────┴───────────────────────────────┘
```
The main area has a top tab bar (views as tabs) and the content fills the rest.

---

## Entity & Profile System (what feeds views)

An **Entity Profile** defines a data shape:
- Name, icon, color
- Properties: each has a slug, type (text / number / date / select / relation / boolean), constraints (enum values for select), and display label
- Scope: `pod` (visible everywhere) or `workspace` (scoped to one workspace)

Example profiles:
- `task` → title, status (todo/in_progress/done/blocked), priority (low/medium/high/critical), assignee, dueDate, project
- `deal` → title, dealStage (lead/qualified/proposal/negotiation/won/lost), amount, closeDate, company
- `person` → title (name), email, company, tags, lastContactedAt
- `devplane_capability` → title, type (north_star/story/workflow/service), maturity (planned/building/stable), description

A view can scope to **one profile** (single-schema, strict columns) or **multiple profiles** (union schema — all fields from all profiles, some cells empty for non-matching rows).

---

## The 16 View Types

### Structured (schema-driven, column/field-based)
| Type | Core use case |
|------|--------------|
| `table` | Spreadsheet — sortable columns = profile fields |
| `list` | Compact vertical list, one row per entity |
| `grid` | Fixed-column card grid, thumbnail-forward |
| `gallery` | Image-forward, large cards |
| `kanban` | Grouped by an enum field (status, stage) — draggable columns |
| `matrix` | 2D grid — rows × columns (e.g. priority × assignee) |
| `masonry` | Pinterest-style variable-height card feed |
| `calendar` | Entities plotted by a date field |
| `timeline` | Gantt-style, date ranges + dependencies |
| `gantt` | Full Gantt with dependency arrows |

### Canvas (position/relationship-centric)
| Type | Core use case |
|------|--------------|
| `graph` | Force-directed node-link diagram of entity relations |
| `flow` | Directed workflow / state machine diagram |
| `bento` | Composable dashboard — drag-and-drop widget blocks |
| `branch_tree` | Branching AI conversation / decision tree |
| `whiteboard` | Infinite canvas, freeform spatial layout |
| `mindmap` | Radial concept map |

---

## Screens to Design

### Screen 1 — Library: Entity Overview (entry point)
The Library is where users see all their data. Left sidebar shows profiles as sections. Main area shows a masonry feed of recent entities across all profiles. Top bar has a "+ New View" button and a view switcher.

**What to show:**
- Left: collapsible profile sections (task, deal, person, custom) with entity counts
- Center: masonry feed of entity cards (each card shows: title, profile color dot, 2–3 key properties, last updated)
- Top right: "+ New View" CTA + "Switch lens" chip showing current view type
- Empty state variant: fresh workspace with just 3 profiles, AI suggestion card offering to "Set up a CRM in 30 seconds"

**Annotation callouts:**
- "Profile = data shape. View = how you see it."
- "Same entity appears in every view scoped to its profile"

---

### Screen 2 — View Type Picker (the lens selection moment)
Triggered by: clicking "+ New View" or "Switch lens". A modal or popover showing all 16 view types as a visual grid with previews.

**What to show:**
- Two sections: "Structured views" (10) and "Canvas views" (6)
- Each type card: icon + name + one-line description + mini thumbnail preview
- Selected state: amber-gold border + subtle amber background tint
- "Scope" section below: checkboxes for which profiles to include (single or multi-profile toggle)
- Footer: "Create from description" input — "Describe what you want..." → AI generates the config

**Annotation callouts:**
- "16 built-in types. The data never moves — only the lens changes."
- "Scope one profile for strict columns, or combine multiple for a union schema"
- "AI can generate any of these from plain language"

---

### Screen 3 — Single-Profile Kanban View (the classic lens)
A tasks kanban, scoped to `task` profile, grouped by `status`.

**What to show:**
- 4 columns: To Do / In Progress / Done / Blocked (each with entity count badge)
- Cards: title (DM Sans semibold), priority chip (color-coded: red=critical, orange=high, grey=low), assignee avatar, due date (red if overdue)
- Column header: colored dot + label + count + "+" button inline
- Empty column: dashed border, "No items" with LayoutGrid icon
- Top bar: view name "Sprint Board", view type switcher chip (shows kanban icon), filter button, sort button
- Right of top bar: "Switch lens →" showing all 16 types as small icons

**Annotation callouts:**
- "groupBy: properties.status — change this to group by any enum property"
- "Click '→' to switch this same data to Table, Timeline, or Graph instantly"

---

### Screen 4 — Multi-Profile View (union schema)
A table showing both `task` and `deal` entities in one view. Demonstrate union columns.

**What to show:**
- Table with columns: Title, Profile (colored chip: task=blue, deal=purple), Status, Priority, Amount, Due Date, Assignee
- Some cells empty (deals have no Priority; tasks have no Amount) — show as subtle dash
- Column header: shared columns (Title, Status) have solid labels; profile-specific columns (Amount, Priority) have a subtle profile-color dot next to the label
- Multi-profile scope pill at top: "task + deal" with × to remove each
- "Add profile" button to scope additional profiles

**Annotation callouts:**
- "Union schema: common fields merge, profile-specific fields show empty for non-matching rows"
- "No column jitter — all columns persist even when the current page has no matching entities"
- "Scope is declared, not derived from current page contents"

---

### Screen 5 — AI-Generated View (the config generation moment)
User types in the "Describe a view" input and AI generates a complete view config inline.

**What to show:**
- Three-panel layout:
  - Left: chat message from user: *"Build a pipeline dashboard with deals grouped by stage, showing amount and close date, sorted by close date ascending"*
  - Center: AI response stream — first a proposal card appears: "Creating view: Deal Pipeline" with a spinner, then transitions to a live kanban preview
  - Right: the generated config as collapsible JSON — showing `type: "kanban"`, `groupBy: "dealStage"`, `scopeProfileIds: ["deal-profile-id"]`, `sorts: [{ field: "closeDate", dir: "asc" }]`
- The AI message has an AI-yellow (`--synap-ai`) left border and `[[view:ID|Deal Pipeline]]` rendered as an interactive chip
- Clicking the chip opens the view in the main panel

**Annotation callouts:**
- "AI wrote this config. No code touched. Every view is a JSON document."
- "[[view:ID|Name]] syntax embeds a live view reference in any AI message"
- "The config is the view — any AI can read, modify, or reproduce it"

---

### Screen 6 — View Config Inspector (power user panel)
Slide-out right panel showing the raw config + visual editors for an existing view.

**What to show:**
- Panel header: view name + type icon + "Edit config" / "View JSON" toggle
- Visual editor section:
  - **Scope**: profile chips with × + "Add profile" button
  - **Filters**: pill-based filter builder (field + operator + value), "Add filter" link
  - **Sort**: drag-handle rows (field + asc/desc toggle)
  - **Group by** (for kanban/matrix): field picker dropdown
  - **Display**: toggle row for hidden/visible columns
- "View JSON" tab: syntax-highlighted JSON showing the exact config object
- Footer: "Save changes" amber button + "Discard" ghost button + "Dirty" indicator dot when unsaved

**Annotation callouts:**
- "Config = JSON. Visual editor and raw JSON are equivalent — edit either."
- "Save → event chain stores the config. Reload → same view, reproduced from config."

---

### Screen 7 — Custom JSX View (iframe path)
The "Create custom view" flow — a developer or AI delivers a full React component.

**What to show:**
- Two sub-screens:

**7a — Creation flow:**
- Full-screen overlay modal titled "Create Custom View"
- Code editor panel (dark, monospace) with a starter template:
  ```jsx
  export default function CustomView({ entities, onEntityClick }) {
    return (
      <div className="p-4 grid gap-3" style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
      }}>
        {entities.map(e => (
          <button key={e.id} onClick={() => onEntityClick(e.id)}
            className="rounded-xl border p-3 text-left hover:bg-white/5">
            <p className="font-semibold text-sm">{e.title}</p>
          </button>
        ))}
      </div>
    );
  }
  ```
- Right panel: live preview (iframe, updated on save) — shows the actual entities rendering
- Bottom bar: "Submit for approval" amber button
- AI can pre-fill this editor via proposal

**7b — Proposal review:**
- Proposal card in the main thread with:
  - Title: "New custom view: Heatmap Intensity Grid"
  - Diff preview of the JSX file
  - "Preview" button → opens iframe
  - "Approve" (amber) + "Reject" (ghost) buttons
- After approval: view appears in the view type picker with a custom icon

**Annotation callouts:**
- "Custom views are sandboxed in an iframe — they receive `entities[]` as props, never direct DB access"
- "Every custom view goes through the proposal system — users always approve AI code before it runs"
- "The sandbox makes it safe for AI to write view code autonomously"

---

### Screen 8 — Bento Dashboard (composite view)
A `bento` view — the most powerful lens. A 12-column drag-and-drop grid of widget blocks.

**What to show:**
- Dashboard titled "Engineering Command Center" on a dark warm background
- Block grid with 6 blocks:
  - Block 1 (2×1): Stat card — "Open tasks: 23" + sparkline trend
  - Block 2 (2×1): Stat card — "Deals in pipeline: $148K" + up arrow
  - Block 3 (4×2): Embedded kanban view — tasks by status (mini, no header)
  - Block 4 (4×2): Embedded graph view — entity relation graph (capabilities → stories)
  - Block 5 (2×2): Calendar widget — upcoming due dates
  - Block 6 (2×1): AI insight card (AI-yellow border) — "3 tasks are overdue. Deal 'Acme Corp' closes in 2 days."
- Edit mode overlay: dashed resize handles on blocks, drag-indicator on hover, "+" button between rows
- Block picker drawer (slides up from bottom): 70+ cell types in a searchable grid

**Annotation callouts:**
- "Bento blocks reference cells by kind — no hardcoded rendering. AI can arrange this layout from a sentence."
- "AI insight block uses the AI-yellow accent — the only place in the UI where AI-origin content gets a distinct color"
- "Every block is a cell running in its own host — the same cell renders in panel, page, or bento"

---

### Screen 9 — Lens Switcher Transition (the "same data, any lens" moment)
Show one entity set (12 tasks) transitioning through 4 lens types. Can be a 4-up comparison panel or a strip.

**What to show:**
- 4 panels side by side, same 12 tasks, 4 lenses:
  - **Table**: columns — title, status, priority, assignee, due
  - **Kanban**: 4 columns (todo/in_progress/done/blocked), cards with priority chips
  - **Calendar**: tasks plotted on May/June calendar grid by dueDate
  - **Graph**: task nodes connected to assignee nodes (relation graph)
- All 4 panels share the same top bar showing: "12 Tasks — Sprint 4" + a lens switcher tab strip
- Active tab highlighted with amber underline
- Transition arrow between panels: "← Same 12 entities. Different lens. Zero config changes."

**Annotation callouts:**
- "Switching lens = changing the view type in the config. The query, scope, and data are identical."
- "New view type = new adapter registered in viewAdapterRegistry. The data layer never changes."

---

### Screen 10 — Empty State + First View Creation (onboarding moment)
A fresh workspace with no views yet. The zero-state that teaches the mental model.

**What to show:**
- Center stage: large illustrated empty state
  - Icon: a geometric lens/prism shape (amber accent)
  - Heading (Fraunces): "Your data, any lens"
  - Body: "You have 3 entity profiles with 47 items. Create a view to see them."
- Three creation cards below:
  - "Start from a template" → gallery of preset views (CRM Pipeline, Task Board, Contact Directory)
  - "Describe what you want" → text input → AI generates config
  - "Build manually" → opens view type picker (Screen 2)
- Small print below: "Views are just configs. You can have unlimited views on the same data."

**Annotation callouts:**
- "The zero state teaches: entities already exist. Views are the way in."
- "Three creation paths = three user types: quick-start, AI-native, power user"

---

## UX Principles to Embed in Every Screen

1. **Data and lens are always visually distinct.** The profile (what the data is) and the view type (how it renders) should never look like the same concept. Use different visual treatments: profile = colored dot/chip, view type = icon + label.

2. **Config is always inspectable.** Every view has a "?" or settings icon that opens the raw config. Users who want to should always be able to see "what is this lens made of."

3. **AI content is always the AI yellow (`--synap-ai`).** Any text, card, block, or chip that was AI-generated or AI-suggested has an AI-yellow treatment (border, badge, or background tint). This is the only use of that color.

4. **The lens switcher is always present.** On any structured view, the current view type is shown as a chip in the header. Clicking it opens the type picker without navigating away.

5. **Proposals surface inline.** When AI creates or modifies a view config, the proposal appears as an inline card in the AI chat thread — not in a separate modal. The user approves without leaving context.

6. **No shadows.** Depth is created by border opacity (`rgba(255,255,255,0.07)` to `0.12`) and surface background offset (`#15110D` → `#1E1810`). Shadows break the visual language.

7. **Concentric radius.** If a card (12px radius) sits inside a panel (16px radius) with 4px gap between, the math must hold. This rule applies recursively to every nested container.

---

## Component Reference

When designing these screens, use the following component inventory:

| Component | Visual spec |
|-----------|-------------|
| View type chip | Icon (16px) + label, amber background 10% opacity, amber text, 6px radius, 5px 10px padding |
| Profile dot | 8px circle, profile color, inline with entity title |
| Entity card | Surface elevated bg (#1E1810), 12px radius, 1px border rgba(255,255,255,0.07), 16px padding |
| AI insight card | `--synap-ai` left border (3px), `--synap-ai-light` bg, `--synap-ai-ink` text for header |
| Proposal card | Amber left border (3px), amber bg 8% opacity, Approve/Reject buttons right-aligned |
| Status chip | 5px 10px, 4px radius, bg = status color at 15% opacity, text = status color |
| Filter pill | Amber border, amber text, × to remove, 9999 radius (pill) |
| Section header | Fraunces 15px 600, text-primary, 24px top margin |
| Config JSON panel | Dark surface, monospace 12px, syntax highlight: keys=amber, strings=emerald, numbers=cyan |
