# Entity Dashboard System — Technical Reference

**Version:** 2.0 — March 2026
**Status:** Implemented (property-driven widgets + smart auto-layout)

This document is the canonical technical reference for Synap's entity-profile-properties-dashboard stack. It covers the full pipeline from data model to render, describes every layer of the dashboard system, and defines the post-launch roadmap.

---

## Table of Contents

1. [The Three-Layer Data Model](#1-the-three-layer-data-model)
2. [Entity Profiles — The Schema Layer](#2-entity-profiles--the-schema-layer)
3. [Property Definitions — The Field Layer](#3-property-definitions--the-field-layer)
4. [Property Rendering System](#4-property-rendering-system)
5. [The Two Dashboard Levels](#5-the-two-dashboard-levels)
6. [Widget System Architecture](#6-widget-system-architecture)
7. [New Property-Driven Widgets](#7-new-property-driven-widgets)
8. [Smart Auto-Layout Generator](#8-smart-auto-layout-generator)
9. [Persistence & Save Flow](#9-persistence--save-flow)
10. [Template vs. Per-Entity Layouts](#10-template-vs-per-entity-layouts)
11. [Post-Launch Roadmap](#11-post-launch-roadmap)

---

## 1. The Three-Layer Data Model

Every object in Synap is an **Entity**. The type it plays is determined by its **Profile**. How its fields are defined is determined by **PropertyDefs**. These three layers are strictly separated.

```
┌─────────────────────────────────────────────┐
│  ENTITY (row in `entities` table)            │
│  id, workspaceId, type (profile slug)        │
│  title, properties (JSONB)                   │
│  viewMode ("document" | "bento")             │
│  bentoViewId (FK → views.id, nullable)       │
└─────────────────┬───────────────────────────┘
                  │ type = profile.slug
┌─────────────────▼───────────────────────────┐
│  PROFILE (e.g. "project", "contact")         │
│  slug, displayName, icon, scope              │
│  effectiveProperties: PropertyDef[]          │  ← merged from base + overrides
│  defaultValues: Record<slug, value>          │
│  defaultBentoConfig?: BentoViewConfig        │  ← future: template layout
└─────────────────┬───────────────────────────┘
                  │ profile.effectiveProperties
┌─────────────────▼───────────────────────────┐
│  PROPERTY DEF (e.g. "status", "dueDate")     │
│  slug, label, valueType, constraints         │
│  uiHints: { inputType, displayAs, panelGroup │
│             displayName, showInCard, ... }   │
└─────────────────────────────────────────────┘
```

### Entity properties JSONB

Entity properties are stored flat in a JSONB column:

```json
{
  "status": "active",
  "priority": "high",
  "dueDate": "2026-04-01",
  "assignee": "user-uuid-here",
  "__viewMode": "bento",
  "__bentoViewId": "view-uuid-here"
}
```

`__viewMode` and `__bentoViewId` are internal keys stored alongside user-defined properties. No extra columns needed — no migration risk.

### Profile scopes

| Scope | Who defines it | Example |
|-------|---------------|---------|
| `system` | Synap core | `note`, `task`, `event` |
| `shared` | Template engine | `project` (CRM template) |
| `workspace` | Workspace admins | `deal`, `contact` |
| `user` | Individual users | Personal custom types |

Profiles from higher scopes are inherited; workspace profiles can extend shared ones (e.g. `webinar` extends `event`).

---

## 2. Entity Profiles — The Schema Layer

A profile is not a rigid table schema — it is a **runtime contract** fetched via tRPC:

```typescript
// Fetch profile
const { data } = trpc.profiles.get.useQuery({ identifier: "project" });
const properties: PropertyDef[] = data.effectiveProperties;
// effectiveProperties = base profile merged with all overrides, in display order
```

The profile's `effectiveProperties` array is the single source of truth for:
- Which columns appear in Table/List/Kanban views (the "schema")
- Which widgets appear in the smart auto-generated entity dashboard
- Which fields are editable in `EntityPropertiesDisplay`

### Profile → View relationship

```
Profile "project"
  ├── View: "All Projects" (type: table, scoped to profile "project")
  ├── View: "Project Board" (type: kanban)
  ├── View: "Project Calendar" (type: calendar)
  └── View: "Project Dashboard" (type: bento, profile-level aggregate)

Entity "Project Alpha" (type: "project")
  ├── document (Rich text, default)
  └── bento view (entity-level, smart layout, per-entity save)
```

There is no hard link from a profile to views — views declare their `profileSlug` in `config`. Any view can scope to any profile.

---

## 3. Property Definitions — The Field Layer

Each `PropertyDef` drives everything: display, editing, filtering, and smart layout placement.

```typescript
interface PropertyDef {
  slug: string;                // machine key, e.g. "dueDate"
  label: string;               // display label, e.g. "Due Date"
  valueType: string;           // "text" | "number" | "date" | "boolean" | "select" | "multiselect"
                               // | "relation" | "url" | "email" | "phone" | "richtext" | "file"
  constraints?: {
    enum?: string[];           // for select/multiselect — the option values
    min?: number;
    max?: number;
    required?: boolean;
  };
  uiHints?: {
    inputType?: string;        // override default input widget (e.g. "date-range", "slider")
    displayAs?: string;        // "status" | "priority" | "progress" | "avatar" | "badge"
    panelGroup?: string;       // groups props into property-group widgets (e.g. "Contact Info")
    displayName?: string;      // override label in the UI
    showInCard?: boolean;      // whether to show in entity-card compact mode
    accentColor?: string;      // hex color for status/priority badges
  };
}
```

### The `panelGroup` hint

`uiHints.panelGroup` is the key organizational hint for dashboards. Properties in the same group become one `property-group` widget:

```json
{ "slug": "email",    "uiHints": { "panelGroup": "Contact Info" } }
{ "slug": "phone",    "uiHints": { "panelGroup": "Contact Info" } }
{ "slug": "linkedin", "uiHints": { "panelGroup": "Contact Info" } }
{ "slug": "revenue",  "uiHints": { "panelGroup": "Financials"   } }
{ "slug": "arr",      "uiHints": { "panelGroup": "Financials"   } }
```

This produces two `property-group` blocks: "Contact Info" and "Financials" — automatically.

---

## 4. Property Rendering System

All property rendering lives in `@synap/property-renderer`. There is one function that drives all displays:

```typescript
// Packages: packages/core/property-renderer/src/renderPropertyValue.tsx
renderPropertyValue(
  propertyDef: PropertyDef,
  value: unknown,
  size: "sm" | "md" | "lg",
  variant: "minimal" | "full"
): React.ReactNode
```

This function dispatches by `valueType` and `uiHints.displayAs` to the right renderer:

| valueType | displayAs | Renders as |
|-----------|-----------|-----------|
| `select` | `status` | Colored status pill |
| `select` | `priority` | Priority badge with icon |
| `number` | `progress` | Progress bar |
| `date` | — | Relative date ("in 3 days", "2d ago") |
| `relation` | — | Entity chip (name + type icon) |
| `boolean` | — | Toggle pill |
| `text` | — | Truncated text |
| `url` | — | Clickable link |
| `richtext` | — | Rendered markdown preview |

### Inline editing

When a user clicks a property value anywhere (widget, property row, card), editing opens:

```typescript
// packages/core/property-renderer/src/InlinePropertyEditor.tsx
<InlinePropertyEditor
  property={propertyDef}
  value={currentValue}
  onSave={(newValue: unknown) => { /* trpc.entities.update */ }}
  onCancel={() => setIsEditing(false)}
  size="sm" | "md"
/>
```

`InlinePropertyEditor` dispatches to the right editor by `valueType`:

| valueType | Editor |
|-----------|--------|
| `text` | Text input |
| `select` | Option list (keyboard-navigable) |
| `multiselect` | Multi-select chips |
| `date` | Date picker popover |
| `number` | Number input with validation |
| `boolean` | Toggle |
| `relation` | Entity search popover |
| `url` / `email` / `phone` | Text input + validation |

### EntityPropertiesDisplay

For structured property panels (property group cards, entity panels, full-page entity detail):

```typescript
<EntityPropertiesDisplay
  entity={entity}
  layout="form"          // "form" | "compact" | "grid"
  columns={1 | 2}
  editable={true}
  visibleFields={["email", "phone", "linkedin"]}   // ordered subset
  hideEmptyByDefault={false}
  bordered={false}
  onUpdate={(slug, newValue) => updateEntity.mutate({ id: entity.id, properties: { ...entity.properties, [slug]: newValue } })}
/>
```

This is the foundation for both `property-group` widgets and the full-page entity properties tab.

---

## 5. The Two Dashboard Levels

There are two distinct dashboard surfaces. They serve different purposes and are accessed differently.

```
┌─────────────────────────────────────────────────────┐
│  LEVEL 1: Profile Dashboard ("All Projects")         │
│                                                       │
│  Scope: the entity type as a whole                   │
│  Access: ViewStylePicker → Dashboard (in view header)│
│  Layout: empty by default → user adds widgets        │
│  Use cases: KPIs, aggregate stats, cross-entity lists│
│  Save: trpc.views.update via ViewRenderer            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  LEVEL 2: Entity Dashboard ("Project Alpha")         │
│                                                       │
│  Scope: a single entity instance                     │
│  Access: entity panel → Dashboard tab                │
│  Layout: auto-generated from profile schema on       │
│          first open, then saved and reused           │
│  Use cases: property chips, related items, editing   │
│  Save: BentoAdapter internal auto-save (1.5s debounce│
└─────────────────────────────────────────────────────┘
```

### Level 1 — Discovery flow

```
User is looking at a table of Projects
→ Clicks the "Display as" dropdown in the view header (ViewStylePicker)
→ Selects "Dashboard"
→ View type changes to bento
→ Empty bento grid appears — user is in edit mode
→ Widget picker opens → user adds "entity-count", "view-table", "metric", etc.
→ Layout saves to the view record (standard ViewRenderer path)
```

### Level 2 — Discovery flow

```
User clicks a Project entity → floating panel opens (Content tab)
→ User sees 4 tabs: Content | Inbox | Links | Dashboard
→ Clicks Dashboard tab
  ↳ If first time: "Enable Dashboard" CTA
      → clicks → trpc.entities.setEntityViewMode({ entityId, mode: "bento" })
      → backend creates bento view record, sets entity.__viewMode = "bento"
      → BentoAdapter fetches profile schema
      → BentoAdapter generates smart layout from profile properties
      → layout appears: property chips row + group cards + content area
      → layout auto-saves to backend (0ms delay, not debounced)
  ↳ If returning: bento view config loaded from backend → renders instantly
→ User clicks a status chip → InlinePropertyEditor opens
→ User changes status → entity saves, widget flashes green briefly
→ User drags a widget to a new position → BentoGrid.onSave fires → 1.5s debounce → saved
```

---

## 6. Widget System Architecture

The widget system follows a cell-registry pattern. Every bento block is identified by a string key and resolved to a React component at render time.

### Registry

```typescript
// packages/views/bento/src/cells/registerBentoCells.ts
cellRegistry.register({
  key: "property-value",
  component: asCell(PropertyValueWidget, "property-value"),
  meta: {
    name: "Property Value",
    description: "Display and edit a single entity property",
    icon: "SlidersHorizontal",
    category: "data",
    displayModes: ["compact", "medium", "full"],
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  settingsComponent: PropertyValueSettings,
});
```

### Widget type key (capability types.ts)

```typescript
// packages/core/capabilities/src/types.ts — WidgetTypeKey union
type WidgetTypeKey =
  // Home / workspace
  | "welcome-header" | "workspace-info" | "feed" | "quick-access"
  // Entity aggregate
  | "entity-list" | "entity-count" | "recent"
  // View runners (embed live views)
  | "view-list" | "view-table" | "view-kanban" | "view-calendar" | "view-timeline"
  // Entity instance
  | "entity-header" | "entity-properties" | "entity-content"
  // Property-driven (new)
  | "property-value"    // single property, inline editable
  | "property-group"    // titled card with subset of properties
  // Browser / embed
  | "iframe-embed" | "link-grid"
  // Metrics
  | "metric" | "chart" | "stat-card"
  // Calendar / time
  | "calendar" | "proposal-timeline"
  // Extensions
  | "quick-capture" | string;  // open: unknown types render graceful placeholder
```

### Render pipeline

```
BentoBlock receives { block: BentoBlock }
→ cellRegistry.resolve(block.widgetType)
  ↳ found: renders component(block.config) in CellContextProvider
  ↳ not found: renders UnknownWidgetPlaceholder (debug info + marketplace CTA)
→ WidgetErrorBoundary wraps every cell
  ↳ crash: renders WidgetErrorCard with Retry — does NOT propagate to parent
```

### Display modes

Every widget receives `displayMode` from `CellContextProvider`:

| Widget size (grid units) | displayMode |
|--------------------------|-------------|
| w < 3 or h < 2 | `compact` |
| w < 5 or h < 4 | `medium` |
| w ≥ 5 and h ≥ 4 | `full` |

Widgets use `displayMode` to adapt their layout — e.g. `property-value` in compact shows value only (no label), in full shows icon + label header + large value.

---

## 7. New Property-Driven Widgets

### `property-value`

Renders a single entity property as a focused bento block. Click to edit inline.

**Config:**
```typescript
interface PropertyValueConfig {
  propertySlug: string;      // e.g. "status", "priority", "dueDate"
  entityId?: string;         // pin to specific entity (overrides BentoEditContext)
  label?: string;            // override display label
  showLabel?: boolean;       // default: true for medium/full, false for compact
  accentColor?: string;      // optional hex accent
}
```

**Behavior by display mode:**

| mode | layout |
|------|--------|
| compact (3×2) | centered large value, no label — stat-card style |
| medium (4×3) | muted uppercase label above, large value below |
| full (6×4) | property icon + label header, very large value |

**Edit flow:** click anywhere on the block → `InlinePropertyEditor` overlay opens in-place → save → `trpc.entities.update` → invalidate entity query → 1.2s green flash on block.

**Data sources:**
- `trpc.entities.get` — for current value
- `trpc.profiles.get` — for `PropertyDef` (needed by renderPropertyValue and InlinePropertyEditor)
- `trpc.entities.update` — for saving

### `property-group`

A titled card displaying a curated subset of entity properties. Fully editable via `EntityPropertiesDisplay`.

**Config:**
```typescript
interface PropertyGroupConfig {
  title?: string;            // card header label, e.g. "Contact Info"
  properties: string[];      // ordered list of property slugs
  entityId?: string;         // pin to specific entity
  columns?: 1 | 2;          // column layout inside card (default: 1)
  showEmpty?: boolean;       // show properties with no value (default: false)
}
```

**Behavior:** Renders `EntityPropertiesDisplay` with `editable=true` and `visibleFields=properties`. Each property row is click-to-edit via `PropertyRow` — no custom edit logic needed.

**Typical auto-generated usage:**
```json
{
  "widgetType": "property-group",
  "config": {
    "title": "Contact Info",
    "properties": ["email", "phone", "linkedin"],
    "columns": 1
  }
}
```

### Settings panels

Both widgets have settings panels following the `SettingsField` pattern (same as `StatCardSettings`):

- **PropertyValueSettings**: Property Slug (text), Label Override (text), Show Label (toggle), Accent Color (hex input)
- **PropertyGroupSettings**: Title (text), Properties (comma-separated slugs), Columns (select 1|2), Show Empty (toggle)

---

## 8. Smart Auto-Layout Generator

`createDefaultEntityBentoBlocks(properties?: SchemaProperty[])` lives in:
`packages/views/bento/src/utils/default-entity-bento.ts`

Called by `BentoAdapter` when an entity's bento view has no existing blocks.

### Layout algorithm

```
y=0  entity-header       (x:0, w:12, h:2)   — always present
y=2  featured chip row   up to 4 chips, each (w:3, h:2) as "property-value"
     → detected by slug pattern OR uiHints.displayAs
y=4  panelGroup cards    2-column, each (w:6, h:4) as "property-group"
     → grouped by uiHints.panelGroup string
y=N  entity-properties   (x:0, w:4, h:6)    — remaining ungrouped props
     entity-content      (x:4, w:8, h:6)    — related entities / rich text
```

### Featured property detection

Properties land in the chip row if they match:
- `uiHints.displayAs === "status" | "priority" | "progress"`
- Slug matches `/status|stage|phase|priority|urgency|progress|completion|percent/`
  and has `constraints.enum` (it's a select-type status/priority field)
- `valueType === "date"` and slug matches `/date|due|deadline|start|end/`

Up to 4 featured properties appear as chips. If more exist, the rest fall through to `entity-properties`.

### Example output for a "Project" profile

```
[entity-header         ] [12×2              ]
[status  ] [priority ] [dueDate ] [stage  ] ← 4 chips, 3×2 each
[Team Info            ] [Financials         ] ← 2 property-group cards, 6×4 each
[entity-properties    ] [entity-content     ] ← 4×6 and 8×6
```

### Backward compatibility

Calling `createDefaultEntityBentoBlocks()` with no arguments returns the static 3-block fallback (entity-header + entity-properties + entity-content). All existing dashboards are unaffected.

---

## 9. Persistence & Save Flow

### BentoAdapter save paths

`BentoAdapter` (in `@synap/view-renderer`) handles two usage contexts:

**Path A — ViewRenderer (profile-level dashboard)**
- `onConfigChange` prop is provided by `ViewRenderer`
- `BentoGrid.onSave → onConfigChange(config) → ViewRenderer debounce → trpc.views.update`

**Path B — EntityDetailCell (entity-level dashboard)**
- `onConfigChange` prop is NOT provided (BentoAdapter used as `BentoRenderer` prop)
- `BentoAdapter` owns an internal `trpc.views.update.useMutation` with 1.5s debounce
- UUID validation: if `viewId` is not a valid UUID, save is skipped (dev safety)

```typescript
// Unified handler — internal to BentoAdapter
const handleConfigChange = useCallback((nextConfig: BentoViewConfig) => {
  if (onConfigChange) {
    onConfigChange(nextConfig);    // Path A: delegate to ViewRenderer
    return;
  }
  // Path B: internal auto-save
  if (!UUID_RE.test(viewId)) return;
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    saveView.mutate({ id: viewId, config: nextConfig as unknown as Record<string, unknown> });
  }, 1500);
}, [onConfigChange, viewId, saveView]);
```

### Initial smart layout persistence

The smart auto-generated layout is persisted immediately (no debounce) when first created:

```typescript
useEffect(() => {
  if (needsDefaultLayout && profileProperties) {
    const smartConfig: BentoViewConfig = {
      layout: "bento",
      blocks: createDefaultEntityBentoBlocks(profileProperties),
    };
    handleConfigChange(smartConfig);   // fires immediately, not debounced
  }
}, [needsDefaultLayout, profileProperties]);
// ↑ intentionally omits handleConfigChange from deps — fires once on profile load
```

### Save sequence (first open)

```
1. Entity panel opens → Dashboard tab
2. User clicks "Enable Dashboard"
3. trpc.entities.setEntityViewMode({ entityId, mode: "bento" })
   → backend creates view record (empty config)
   → sets entity.properties.__viewMode = "bento", __bentoViewId = newViewId
4. entity query invalidates → re-renders → BentoAdapter receives viewId + empty config
5. BentoAdapter: needsDefaultLayout = true → fetches entity type → fetches profile
6. BentoLoadingSkeleton shown (~300ms)
7. profileProperties arrives → effectiveConfig generated → BentoGrid renders
8. useEffect fires → handleConfigChange(smartConfig) → trpc.views.update (immediate)
9. Smart layout is now persisted. Subsequent opens skip steps 5–8.
```

---

## 10. Template vs. Per-Entity Layouts

### Current state (per-entity)

Each entity has its own bento view record. Layouts diverge as users customize individual entities. Profile schema changes don't propagate to existing entity dashboards.

**Tradeoffs:**
- ✅ Per-entity customization
- ✅ Works today, simple data model
- ❌ 1,000 projects = 1,000 view records
- ❌ No way to "reset all" or "apply new layout to all"
- ❌ New profile properties don't appear in old entity dashboards

### Target state (profile template + per-entity override)

The recommended long-term model is **profile template with lazy fork**:

```
Profile "project" {
  defaultBentoConfig: BentoViewConfig    ← the template
}

Entity "Project Alpha" {
  bentoViewId: null                       ← inherits from profile template
}

Entity "Project Beta" {
  bentoViewId: "view-uuid-here"           ← forked, has custom layout
}
```

**How it works:**
1. Profile admin edits the profile's default dashboard (new UI: "Edit default dashboard for this type")
2. This saves to `profile.defaultBentoConfig`
3. When an entity opens its dashboard:
   - If `entity.bentoViewId === null` → renders `profile.defaultBentoConfig` (read-only template)
   - If user starts customizing → fork: create `view` record, set `entity.bentoViewId`
   - If user clicks "Reset to default" → delete entity's view record, set `bentoViewId = null`
4. Profile template changes propagate to all entities that haven't forked

This is the CSS inheritance model applied to dashboards. **Not yet implemented.**

---

## 11. Post-Launch Roadmap

Ordered by priority. These are guidelines, not commitments.

### P0 — Profile Template Dashboard *(2–3 days)*

**Why first:** Without this, every entity starts from the auto-generated layout. Workspace admins can't curate a consistent experience for their team. Large workspaces (500+ contacts) need one layout to manage, not 500.

**What to build:**
- Add `defaultBentoConfig: BentoViewConfig` field to profile schema (JSONB, no migration)
- New tRPC: `profiles.updateDefaultBentoConfig({ identifier, config })`
- In `BentoAdapter`: check `profile.defaultBentoConfig` before falling back to `createDefaultEntityBentoBlocks`
- "Edit default dashboard" button in profile settings panel
- "Reset to default" button in entity dashboard edit mode

### P1 — Profile Property Picker in Widget Settings *(1–2 days)*

**Why:** Currently `PropertyValueSettings` and `PropertyGroupSettings` use plain text inputs for property slugs. Users have to know slugs by heart. This creates friction and errors.

**What to build:**
- In both settings panels: replace text input for slug(s) with a dropdown/multi-select
- Powered by `trpc.profiles.get` → `effectiveProperties` for the entity's profile
- Auto-complete: type to filter properties by label or slug
- Show property type icon next to each option

### P2 — Layout Change Propagation *(2–3 days)*

**Why:** When a profile admin adds a new property (e.g. "Contract Value"), it should appear in existing entity dashboards that haven't been customized yet.

**What to build:**
- When `profile.effectiveProperties` changes, recalculate `createDefaultEntityBentoBlocks` for entities without a forked layout
- Background job: `profiles.onPropertyAdded → enqueue layout refresh for un-forked entities`
- Or: simpler lazy approach — re-generate smart layout on next open if entity has no forked view

### P3 — Widget Marketplace CTA *(stub, <1 day)*

**Why:** `UnknownWidgetPlaceholder` already has a "Search widget marketplace" CTA wired in. It just opens nothing.

**What to build:**
- Point the CTA to a search page (can be a URL in docs or a community repo)
- Define the manifest format for a community widget:
  ```json
  {
    "key": "github-prs",
    "package": "@community/synap-widget-github-prs",
    "configSchema": { "repoOwner": "string", "repoName": "string" },
    "preview": "https://..."
  }
  ```

### P4 — MCP Widgets *(1 week)*

**Why:** The MCP ecosystem has 10,000+ servers. Any MCP server with a data-fetching tool can become a bento widget without Synap building a native integration.

**What to build:**
- Reserve `mcp:` prefix in widget type key
- `mcp:github-prs` → route to the GitHub MCP server tool `list_pull_requests`
- Data returned → rendered by a default table/list renderer
- Optionally: MCP server can provide a custom component via a manifest

**Architecture:** MCP servers → Intelligence Hub → Hub Protocol → tRPC → widget data fetch

### P5 — AI-Generated Widgets *(1–2 weeks, depends on MCP)*

**Why:** The "Generate this widget" CTA in `UnknownWidgetPlaceholder` is a power-user escape hatch. Users describe what they want; the AI builds the widget spec.

**What to build:**
- In `UnknownWidgetPlaceholder`: "Generate this widget" opens an AI chat prompt
- Prompt includes: widget key, available config schema, entity context
- AI returns: a widget spec (config JSON + rendering instructions)
- Widget spec saved to block config → re-renders using a generic AI-generated renderer

### P6 — View Subscriptions per Dashboard *(2 weeks)*

**Why:** View-runner widgets in dashboards are live but passive. Users want to be notified when something changes — e.g. "alert me when a new deal appears in this pipeline view widget."

**What to build:**
- Subscribe button on view-runner widgets in edit mode
- `view_subscription` record (viewId, userId, notificationPreference)
- Backend: when view query returns new results vs previous snapshot → notify
- Powered by pg-boss job queue (already in place)

---

## Key Package Map

| Package | Role |
|---------|------|
| `@synap-core/capabilities` | `WidgetTypeKey` union, `PropertyValueConfig`, `PropertyGroupConfig` |
| `@synap/property-renderer` | `renderPropertyValue`, `InlinePropertyEditor`, `PropertyRow`, `EntityPropertiesDisplay` |
| `@synap/bento-view` | Widget registry, `BentoGrid`, all widget components, `createDefaultEntityBentoBlocks` |
| `@synap/view-renderer` | `BentoAdapter`, `ViewRenderer`, `EmbeddedViewRenderer`, `ViewStylePicker` |
| `@synap/entity-views` | `EntityDetailCell` — entity floating panel with Dashboard tab |
| `@synap/client` | All tRPC calls: `entities.*`, `profiles.*`, `views.*` |
| `@synap/cell-runtime` | `useCellContext()` (displayMode), `useBentoEdit()` (entityId, isEditMode) |

## Key tRPC Calls

| Call | Used by | Purpose |
|------|---------|---------|
| `trpc.entities.get` | PropertyValueWidget, PropertyGroupWidget | Current property values |
| `trpc.profiles.get` | PropertyValueWidget, PropertyGroupWidget, BentoAdapter | PropertyDef for rendering |
| `trpc.entities.update` | PropertyValueWidget, PropertyGroupWidget | Save property changes |
| `trpc.entities.setEntityViewMode` | EntityDashboardTab | Enable dashboard on first open |
| `trpc.views.update` | BentoAdapter (internal save), ViewRenderer | Persist layout changes |
| `trpc.views.get` | BentoAdapter (via invalidate) | Reload after save |
