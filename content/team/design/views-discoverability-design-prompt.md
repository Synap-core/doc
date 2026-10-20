# Design Prompt: View Discoverability & Interaction UX

**For**: Designer AI / v0 / Lovable / Figma AI  
**Goal**: Design the interaction layer around views — how users create, find, refine, and update views without ever entering a dedicated "manage views" flow. This is a behavioral UX problem, not a visual one. Prioritize clarity of interaction over visual richness.  
**Output expected**: 8 annotated screens focused on interaction states, transitions, and the mental model. No decorative screens — every screen should show a specific user action and its result.

---

## The Mental Model to Communicate

**Views are saved lens states, not managed objects.**

Users don't create views — they explore their data through different lenses, and optionally save the lens they're using. The view is the answer to an intent, not an object they manage.

The UX must make three things feel effortless:
1. **Changing how you see data** (type switch, grouping, filters) — should feel as fast as changing a sort in a spreadsheet
2. **Finding a view you or AI created** — should require zero navigation, it's always in context
3. **Updating a view** — should happen inline, on the view itself, not in a settings panel

Everything below serves these three goals.

---

## Design System (same as views-ux-design-prompt.md)

```
Background:       #15110D
Surface elevated: #1E1810
Surface border:   rgba(255,255,255,0.07)
Accent:           #C28A4A  (amber — interactive elements)
AI accent:        #FFDB23  (the logo yellow, --synap-ai — ONLY AI-origin content; deep gold #756201 in light)
Text primary:     rgba(255,255,255,0.92)
Text secondary:   rgba(255,255,255,0.55)
Text tertiary:    rgba(255,255,255,0.28)
```

- No shadows. Depth via border opacity + surface offset.
- DM Sans body, Fraunces headings.
- Concentric radius: outer = inner + gap (12px card inside 16px panel with 4px gap).
- Interactive: hover = bg shift, press = scale(0.98). No border changes.

---

## Screen 1 — The Lens Chip + Active Filter Pills

The persistent identity of any view. This sits at the top of every view, always visible.

**What to show: three states of the same view**

**State A — Clean saved view:**
```
[⊞ kanban]  Tasks — Sprint 4                              [⋯] [↗]
```
- `[⊞ kanban]`: amber chip, view type icon + label. Clickable → opens type switcher inline.
- `Tasks`: profile name, subtle underline on hover → navigates to profile definition.
- `— Sprint 4`: view name, click to rename inline.
- `[⋯]`: overflow menu (duplicate, delete, share).
- `[↗]`: open full page.

**State B — View with active filters (modified from saved state):**
```
[⊞ kanban]  Tasks — Sprint 4  ×status:open  ×assignee:me  ×sort:dueDate↑  [Save as…]
```
- Each pill: field name + value, amber border, × to remove.
- Clicking a pill opens an inline popover to edit that filter's value (not a full filter builder).
- `[Save as…]` appears only when the current state differs from the saved config.
- The pill strip scrolls horizontally if many filters.

**State C — Multi-profile view:**
```
[⊞ table]  [●task] + [●deal]  — All Work                 [⋯] [↗]
```
- Two profile dots side by side, each with its color.
- Clicking either profile dot → navigates to that profile's definition.
- Clicking `+` between them → opens profile picker to add/remove from scope.

**Annotation callouts:**
- "The lens chip IS the view's config summary. No separate settings icon needed."
- "Filter pills are the entire filter UX. No filter panel. Click to edit, × to remove."
- "State B appears instantly when the user deviates from saved config — ephemeral exploration starts here."

---

## Screen 2 — Inline Type Switcher (clicking the lens chip)

When the user clicks `[⊞ kanban]`, a compact inline panel appears directly below the chip — not a modal, not a full-page overlay.

**What to show:**
- Popover panel: 320px wide, 2-column grid of view types
- Each type: small icon (20px) + label + one-word description
- Current type (kanban) has amber background tint + checkmark
- Types incompatible with current scope (e.g. calendar needs a date field, but this profile has none) are dimmed with a tooltip: "Needs a date field"
- Footer: "Describe a view instead…" → clicking opens the Refine Bar (Screen 3) pre-focused

**Layout:**
```
┌─────────────────────────────────────────┐
│  Switch lens                            │
│  ┌──────────┐  ┌──────────┐            │
│  │ ⊞ kanban │  │ ≡ table  │            │  ← 2-column grid
│  │ ✓ active │  │          │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ □ grid   │  │ ⊘ cal.   │  ← dimmed │
│  │          │  │ needs date│           │
│  └──────────┘  └──────────┘            │
│  ─────────────────────────────────────  │
│  Describe a view instead…              │
└─────────────────────────────────────────┘
```

Selecting a type: instant switch, no confirmation. The view rerenders with the new type. A "Unsaved" indicator appears on the tab (Screen 4).

**Annotation callouts:**
- "Switching type is a one-click action. No wizard, no confirm dialog."
- "Incompatible types surface the missing requirement — users learn what fields they need."
- "Escape hatch to natural language at the bottom — for types that need more config."

---

## Screen 3 — The Refine Bar

The most important interaction surface. A persistent input at the top of every view that accepts natural language to mutate the view config.

**What to show: four states**

**State A — Idle (collapsed):**
```
[⊞ kanban]  Tasks — Sprint 4  [Refine…]
```
- `[Refine…]` is a ghost button on the right side of the lens chip row. Subtle, not prominent.
- Clicking or pressing `/` expands it.

**State B — Expanded, empty:**
```
[⊞ kanban]  Tasks — Sprint 4
┌─ Refine this view ───────────────────────────────────────────┐
│  What do you want to change?                           [↵]   │
│                                                              │
│  Suggestions:                                                │
│  • "group by assignee"          • "only show overdue"        │
│  • "add a due date column"      • "turn this into a table"   │
└──────────────────────────────────────────────────────────────┘
```
- Suggestions are contextual to the current view type and profile's available fields.
- The input has no label — the placeholder text and suggestions teach what's possible.

**State C — User typed, AI processing:**
```
┌─ Refine this view ───────────────────────────────────────────┐
│  only show tasks assigned to me that are overdue       [↵]   │
│  ──────────────────────────────────────────────────────────  │
│  ● Applying: assignee = me, dueDate < today                  │  ← emerald dot + text
└──────────────────────────────────────────────────────────────┘
```
- The AI's interpretation surfaces as plain English before applying — "this is what I understood."
- The view behind the bar updates live as the interpretation appears.

**State D — Applied, showing diff:**
```
┌─ Refine this view ───────────────────────────────────────────┐
│  ✓ Applied: +assignee:me  +dueDate<today          [Undo] [Save as…]
└──────────────────────────────────────────────────────────────┘
```
- Two new filter pills appear in the lens chip row above.
- `[Undo]` reverts. `[Save as…]` names and saves this as a new view.
- Bar collapses after 2 seconds if the user doesn't interact with it.

**Annotation callouts:**
- "The refine bar is view config as conversation. The AI translates intent to config diff."
- "No filter builder panel, no sort dialog, no column manager. One input replaces all of them."
- "The diff (State D) teaches the user what changed — they learn the config vocabulary passively."

---

## Screen 4 — Ephemeral Tabs + The Save Flow

The tab strip as a two-zone system: saved views and live exploration.

**What to show: three states of the tab strip**

**State A — Clean, only saved views:**
```
[ Sprint Board ]  [ All Tasks ]  [ My Open Items ]  [ + ]
```
- `[ + ]`: adds a new view — picks type from current context (defaults to the most used type for this profile)

**State B — User has deviated from a saved view (ephemeral state):**
```
[ Sprint Board* ]  [ All Tasks ]  [ My Open Items ]  [ + ]
          ↑
     asterisk = unsaved changes
     hover shows: "Unsaved changes — [Save] [Discard]"
```
- The asterisk appears immediately when any change is made (filter, grouping, type).
- Hovering the modified tab shows an inline tooltip with Save and Discard.
- Navigating away without saving: a non-blocking toast appears: "Changes to Sprint Board not saved. [Save] [Discard]" — bottom of screen, 8 second timeout.

**State C — AI created a view:**
```
[ Sprint Board ]  [ All Tasks ]  [ ✦ Deal Pipeline ]  [ My Open Items ]  [ + ]
                                        ↑
                               emerald dot + italic label
                               hover: "Created by AI — [Keep] [Dismiss]"
```
- AI-created views land as a new tab, emerald dot, italic label.
- Hovering shows Keep (saves with the AI's name) or Dismiss (closes tab, discards config).
- If the user just uses it without explicit action, it stays until the session ends.

**Annotation callouts:**
- "Creation is retroactive. You explore first — the tab is already there. Name it when it matters."
- "AI views appear as peers in the tab strip, not in a separate 'AI suggestions' panel."
- "The asterisk is the only affordance needed for unsaved state — no modal, no confirm dialog."

---

## Screen 5 — Filter Pill Inline Edit

When the user clicks an active filter pill (not the × — the label itself).

**What to show:**
- Clicking `×status:open` opens a tiny inline popover directly below the pill:

```
[●task] + [●deal]  — All Work  ×status:open  ×assignee:me
                                     ↓ click
                               ┌──────────────────┐
                               │ status            │
                               │ ──────────────    │
                               │ ○ open     ✓      │
                               │ ○ in progress     │
                               │ ○ done            │
                               │ ○ blocked         │
                               │ ──────────────    │
                               │ + Add value       │
                               └──────────────────┘
```
- Single-select or multi-select depending on field type.
- No "apply" button — closing the popover applies.
- Changing the value updates the pill label in place: `×status:in_progress`
- For text fields: the popover shows a text input.
- For date fields: a compact calendar.
- For relation fields: an entity search input.

**Second scenario — "sort by" pill edit:**
```
×sort:dueDate↑
    ↓ click
┌──────────────────┐
│ Sort by          │
│ dueDate   [↑ ↓] │  ← click arrow to toggle direction
└──────────────────┘
```

**Annotation callouts:**
- "Every filter is editable in place. The pill IS the filter editor."
- "No separate 'Filters' panel. The full filter UX is these pills + this popover."

---

## Screen 6 — Entity → View Traceability

From any entity card (in search results, AI chat, bento widget, list), discoverability of which views contain that entity.

**What to show: two surfaces**

**Surface A — Entity card hover state:**
```
┌─────────────────────────────────────┐
│ ● Fix auth token expiry bug          │  ← task entity
│   status: in_progress  due: Jun 2   │
│   ─────────────────────────────     │
│   Appears in: [Sprint Board] [+2]   │  ← appears on hover
└─────────────────────────────────────┘
```
- "Appears in" shows up to 2 view names as chips, `[+N]` for more.
- Clicking a view chip navigates to that view, scrolled to this entity.
- This row only appears on hover — not visible in compact list mode.

**Surface B — Entity detail panel, "Views" tab:**
```
┌─ Fix auth token expiry bug ─────────────────────────────────┐
│  Properties │ Relations │ History │ Views                    │
│─────────────────────────────────────────────────────────────│
│  Views containing this entity                               │
│                                                             │
│  [⊞ kanban]  Sprint Board         Tasks workspace  →        │
│  [≡ table ]  All Tasks            Tasks workspace  →        │
│  [⊞ bento ]  Engineering Dash     Builder workspace →       │
│                                                             │
│  + Add to another view…                                     │
└─────────────────────────────────────────────────────────────┘
```
- Each row: view type icon + view name + workspace context + navigate arrow.
- `+ Add to another view…`: shows a search input scoped to views that include this entity's profile.

**Annotation callouts:**
- "Views and entities are bidirectionally linked. You can navigate from data to lens or lens to data."
- "This answers 'where does this entity live?' without needing to browse all views."

---

## Screen 7 — Profile Definition: "Views on this Profile"

The profile screen (field/property editor) gains a "Views" section that makes the data-to-lens relationship explicit and enables view creation from the data model.

**What to show:**

```
┌─ task profile ──────────────────────────────────────────────┐
│  ● task  Properties  Relations  Views                        │
│──────────────────────────────────────────────────────────────│
│  Properties                                                  │
│  title · text · required                                     │
│  status · select · todo/in_progress/done/blocked             │
│  priority · select · low/medium/high/critical                │
│  assignee · relation → person                                │
│  dueDate · date                                              │
│                                                              │
│  Views using this profile                    [+ New view →]  │
│  ────────────────────────────────────────────────────────    │
│  [⊞ kanban]  Sprint Board          Tasks workspace  →        │
│  [≡ table ]  All Tasks             Tasks workspace  →        │
│  [⊞ table ]  Backlog               Studio            →       │
│                                                              │
│  Suggested views  (AI, based on field types)                 │
│  ✦ "A timeline view makes sense — you have a dueDate field"  │  ← emerald
│  ✦ "status has 4 values — a kanban would work well"          │
└─────────────────────────────────────────────────────────────┘
```

- `[+ New view →]`: creates a new view pre-scoped to this profile, drops into type picker.
- AI suggestions are based on field analysis: date fields → calendar/timeline; enum fields → kanban/matrix; relation fields → graph.
- Clicking a suggestion creates the view immediately (config inferred from field types).

**Annotation callouts:**
- "Profile definition is a view creation entry point — you see your fields, AI suggests the right lens."
- "The data model teaches the user what views are possible, not the other way around."

---

## Screen 8 — AI View Creation in Chat (the canonical create path)

A user asks the AI to create or modify a view from the chat companion.

**What to show: full chat turn with view creation**

```
┌─ Chat ─────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [User]                                                                 │
│  create a view that shows all deals closing this month, grouped         │
│  by stage, sorted by amount descending                                  │
│                                                                         │
│  [AI]                                              ✦ ai                 │
│  Creating Deal Pipeline — June…                                         │
│                                                                         │
│  ┌─ Proposal: New view ──────────────────────────────────────────────┐  │
│  │  ⊞ kanban  Deal Pipeline — June                                   │  │
│  │  scope: deal · groupBy: dealStage · sort: amount desc             │  │
│  │  filter: closeDate within current month                           │  │
│  │                                                                   │  │
│  │  [Preview]            [Save to Tasks workspace ▾]   [Dismiss]    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  I set this up as a kanban grouped by deal stage. You have 8 deals      │
│  closing this month totalling $312K. The largest is [[entity:...|Acme   │
│  Corp]] at $90K — currently in Negotiation.                             │
│                                                                         │
│  [[view:...|Deal Pipeline — June]]  ← click to open                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Key details:
- The proposal card appears inline in the chat thread — no navigation away.
- `[Preview]` opens the view in the side panel without leaving chat.
- `[Save to Tasks workspace ▾]` is a dropdown — user picks which workspace or "New workspace".
- `[[view:...|Deal Pipeline — June]]` is a chip: amber background, view type icon, click opens full-screen.
- `[[entity:...|Acme Corp]]` is an entity chip: profile color dot + name.
- After saving, the view tab appears in the relevant workspace tab strip immediately.

**Annotation callouts:**
- "View creation happens inside chat, not in a separate flow. The proposal is the creation UI."
- "Preview before saving — the user sees the view before committing to it."
- "`[[view:ID|Name]]` embeds a live navigable reference directly in conversation prose."
- "The AI's insight (8 deals, $312K, largest deal) is in the same message as the view — not a separate 'analysis' card."

---

## Interaction Principles (apply to every screen)

### 1. Inline over modal
Every config action (change filter, edit field, rename view) happens in a popover anchored to the element being edited. No modals. No navigation. The view stays behind every edit.

### 2. Instant, revertible
Every change applies immediately. The Undo path is always one action away — either `[Undo]` in the refine bar, pressing `Cmd+Z`, or clicking the asterisk on a modified tab.

### 3. Exploratory by default
Nothing is saved until the user says so. Exploring a different grouping, switching a lens type, applying a filter — all of this is ephemeral until explicitly saved. The asterisk on the tab is the only signal needed.

### 4. AI content is traceable
Every view or modification created by AI has an emerald chip/border. The user always knows the origin. The inline proposal (Screen 8) is the contract: AI proposes, user approves before anything persists.

### 5. The config is always visible, never foregrounded
The raw JSON config is always one click away (via `[⋯]` → "View config"). But it's never shown by default. The pills, the lens chip, and the refine bar are the config — they're just presented as interaction, not data.

### 6. Creation paths are contextual, not centralised
There is no "Views" page in settings. Views are created from:
- The `[+]` in the tab strip (scope inherited from context)
- The profile definition screen (scope inherited from profile)
- The AI chat (scope from the user's request)
- The refine bar's `[Save as…]` (scope inherited from current view)

The common thread: **scope is always already known**. The user never has to say "for which entities?" — the context answers that.

---

## What NOT to design

Explicitly avoid these patterns — they represent the old mental model:

- ❌ A "Manage Views" page or settings screen listing all views
- ❌ A "Create View" wizard with multiple steps (name → type → scope → config)
- ❌ A separate "Filters" panel that slides in from the side
- ❌ A "Sort" dialog box
- ❌ "Edit view" button that opens a full config form
- ❌ Confirmation dialogs for switching view types
- ❌ A separate "AI Suggestions" section — AI views appear in the same tab strip as user views
