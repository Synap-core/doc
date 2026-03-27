# Property Rendering System — Technical Reference

**Version:** 1.0 — March 2026
**Package:** `@synap/property-renderer`

This document covers the canonical architecture for property display and editing across all Synap views: table cells, kanban cards, bento widgets, entity panels, embedded entity cards, and forms.

---

## Core Principle

**One property, one classification, one rendering.** A status field renders as a `StatusPill` whether it appears in a table row, a bento chip widget, an entity panel row, or a kanban card — because all three paths call the same `classifyProperty()` function and the same `renderPropertyValue()` dispatcher.

---

## Architecture Layers

```
PropertyDef (schema)
      │
      ▼
classifyProperty(property) → PropertyKind
      │
      ├──▶ renderPropertyValue()     — read-only display in any context
      ├──▶ InlinePropertyEditor      — edit popover / overlay
      └──▶ resolvePropertyIcon()     — lucide icon for the property type
```

### `PropertyDef` — The schema object

```typescript
interface PropertyDef {
  id: string;
  slug: string;
  valueType: "string" | "number" | "boolean" | "date" | "entity_id" | "array" | "object" | "secret";
  constraints?: PropertyConstraints;   // typed (enum, min, max, etc.)
  uiHints?: PropertyUIHints;           // persisted: displayAs, inputType, format, linkedProfileSlug
                                       // runtime:   resolvePerson, onEntityPress, resolvedEntity
  required?: boolean;
  defaultValue?: unknown;
  displayOrder?: number;
}

interface PropertyConstraints {
  enum?: string[];       // allowed values for select/multiselect
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  [key: string]: unknown;  // extensible
}
```

### `PropertyKind` — The classification result

`classifyProperty(property: PropertyDef): PropertyKind`

| Kind | Classified when | Display | Edit |
|------|----------------|---------|------|
| `status` | string + enum + status-slug or displayAs=status | StatusPill | StatusEditor dropdown |
| `priority` | string + priority-slug or displayAs=priority | PriorityIndicator | PriorityEditor dropdown |
| `progress` | number + progress-slug or displayAs=progress or format=percent | ProgressBar | TextEditor (numeric) |
| `date` | valueType=date | RelativeDate | DateEditor calendar |
| `boolean` | valueType=boolean | Checkbox / Toggle | Instant toggle in PropertyRow |
| `person` | string + person-slug or inputType=person | PersonDisplay | TextEditor (lookup) |
| `person-array` | array + person-array-slug or displayAs=person | PersonDisplay (group) | TextEditor (comma-split, TODO) |
| `entity-link` | valueType=entity_id | EntityLinkDisplay chip | EntityPickerEditor |
| `multiselect` | array + hasEnum | ArrayDisplay | EnumEditor (multi) |
| `enum` | string + hasEnum (not status/priority) | EnumBadge | EnumEditor (single) |
| `tags` | array, no enum | ArrayDisplay | TagsEditor |
| `email` | inputType=email | EmailDisplay | TextEditor (email mode) |
| `phone` | inputType=phone | PhoneDisplay | TextEditor |
| `url` | inputType=url | UrlDisplay | TextEditor (url mode) |
| `number` | valueType=number (not progress) | NumberDisplay | TextEditor (numeric) |
| `richtext` | string + inputType=richtext or slug matches notes/description/body/etc. | RichTextDisplay (markdown preview) | RichTextEditor (auto-resize textarea) |
| `text` | string (default) | TextDisplay | TextEditor |
| `secret` | valueType=secret | SecretDisplay (masked) | SecretEditor |
| `object` | valueType=object | JSON string | TextEditor |

### Classification priority order

1. `uiHints.inputType` — explicit override (email / phone / url / person)
2. `uiHints.displayAs` — semantic intent (status / priority / progress / person)
3. Slug pattern match — inferred from field name (see slug patterns below)
4. `constraints.enum` — any enum string → status / priority / enum / multiselect
5. `valueType` fallback — plain number / text / boolean / date / etc.

---

## Slug Patterns

Defined once in `utils/propertyClassifier.ts`, re-exported everywhere:

```typescript
STATUS_SLUG_RE    = /status|stage|phase|state|disposition|pipeline/
PRIORITY_SLUG_RE  = /priority|urgency|importance|severity/
PROGRESS_SLUG_RE  = /progress|completion|percent|done/
PERSON_SLUG_RE    = /^(person|assignee|owner|reporter|author|created_by|updated_by|lead|contact)$/
PERSON_ARRAY_SLUG_RE = /assignees?|owners?|members?|reporters?|participants?|followers?/
RICHTEXT_SLUG_RE  = /^(notes?|description|body|brief|summary|bio|content|readme|details?|overview|about|message|text|remarks?|comment|comments)$/
```

Import from `@synap/property-renderer`:
```typescript
import { STATUS_SLUG_RE, PERSON_ARRAY_SLUG_RE } from "@synap/property-renderer";
```

---

## Status & Priority Semantic Maps

Defined once in `utils/statusSemantics.ts`. Used by both display (StatusPill) and edit (StatusEditor dots).

Adding a new status value (e.g. `"on-hold"`)? Update `STATUS_PILL_MAP` and `STATUS_COLORS` in `statusSemantics.ts` — both display and edit automatically pick it up.

```typescript
import {
  STATUS_PILL_MAP,   // string → StatusPillStatus (for StatusPill component)
  STATUS_COLORS,     // string → hex color (for dot indicators in editors)
  PRIORITY_MAP,      // string → PriorityLevel (for PriorityIndicator)
  getStatusPillStatus,
  getStatusColor,
  getPriorityLevel,
} from "@synap/property-renderer";
```

---

## Usage Patterns

### Display only — anywhere in the UI

```typescript
import { renderPropertyValue } from "@synap/property-renderer";

// In a table cell, kanban card, bento widget, etc.
const node = renderPropertyValue(propertyDef, value, "sm", "compact");
```

### Display with label — property panel row

```typescript
import { PropertyDisplay } from "@synap/property-renderer";

<PropertyDisplay
  property={propertyDef}
  value={entity.properties[propertyDef.slug]}
  size="md"
  variant="full"
  showLabel
/>
```

### Notion-style click-to-edit row

```typescript
import { PropertyRow } from "@synap/property-renderer";

<PropertyRow
  property={propertyDef}
  value={entity.properties[propertyDef.slug]}
  onSave={(newValue) => updateEntity({ ...entity.properties, [slug]: newValue })}
  editable
/>
```

### Inline editor only (for overlays, bento widgets)

```typescript
import { InlinePropertyEditor } from "@synap/property-renderer";

{isEditing && (
  <InlinePropertyEditor
    property={propertyDef}
    value={currentValue}
    onSave={(newValue) => { setIsEditing(false); save(newValue); }}
    onCancel={() => setIsEditing(false)}
    size="md"
    // For entity_id fields only:
    searchEntities={async (q) => trpc.entities.list.query({ search: q })}
    resolveEntity={async (id) => trpc.entities.get.query({ id })}
  />
)}
```

### Full property panel — entity form, entity detail

```typescript
import { EntityPropertiesDisplay } from "@synap/entity-card";

<EntityPropertiesDisplay
  entity={entity}
  layout="form"           // "form" = Notion-style rows | "grid" = 2-col | "list" = wrap
  columns={1}
  editable
  visibleFields={["status", "priority", "dueDate", "assignee"]}
  hideEmptyByDefault={false}
  onUpdate={(slug, value) => updateEntity(slug, value)}
/>
```

### Check what kind a property is (for custom logic)

```typescript
import { classifyProperty } from "@synap/property-renderer";

const kind = classifyProperty(propertyDef);
if (kind === "status" || kind === "priority") {
  // Show in featured chip row
}
```

---

## Display Components Reference

All in `@synap/property-renderer`:

| Component | Props | When to use |
|-----------|-------|-------------|
| `TextDisplay` | value, size, numberOfLines | Plain text |
| `NumberDisplay` | value, size, format ("locale"\|"currency"\|"percent"\|"compact") | Numbers |
| `BooleanDisplay` | value, size, variant ("icon-only"\|"text"\|"both") | Booleans |
| `DateDisplay` | value, size | Dates (renders relative + absolute on hover) |
| `EmailDisplay` | value, size | Email (mailto: link) |
| `PhoneDisplay` | value, size | Phone (tel: link) |
| `UrlDisplay` | value, size, onOpenInCanvas | URLs (opens in canvas or new tab) |
| `PersonDisplay` | value, size, linkedTable, resolvePerson | Person refs |
| `ProgressDisplay` | value, size, showLabel, autoStatus | 0–100 numbers |
| `ArrayDisplay` | value, size | Arrays (tag list) |
| `EntityLinkDisplay` | value, entity, linkedProfileSlug, onPress | entity_id refs |
| `EnumBadge` | value, size | Enum values (neutral badge) |
| `SecretDisplay` | value, size | Vault-referenced secrets (masked) |
| `DateRangeTimeline` | startValue, endValue, size | Paired start+end dates |

---

## Editor Components Reference

All in `@synap/property-renderer`:

| Component | Handles | UX pattern |
|-----------|---------|-----------|
| `StatusEditor` | status strings | Popover with colored dots + enum options |
| `PriorityEditor` | priority strings | Popover with flag icons + urgent/high/medium/low/none |
| `EnumEditor` | any enum (single or multi) | Popover with checkmarks |
| `TagsEditor` | free-form arrays | Chip input with add/remove |
| `DateEditor` | dates | Calendar popover |
| `TextEditor` | text / number / url / email | Inline text field, autosubmit on Enter |
| `EntityPickerEditor` | entity_id | Searchable entity list popover (requires `searchEntities` + `resolveEntity` callbacks) |
| `SecretEditor` | vault refs | Vault key picker |

---

## Runtime Callbacks in UIHints

Some `PropertyUIHints` fields are injected at render time by the host. They are never stored in the database:

| Hint | Type | Purpose |
|------|------|---------|
| `resolvePerson` | `(id: string) => {name, avatar?} \| undefined` | Look up workspace member for display |
| `onEntityPress` | `(entityId: string) => void` | Navigate when entity chip is clicked |
| `onOpenInCanvas` | `(url: string) => void` | Open URL as canvas cell (browser app) |
| `resolvedEntity` | `{id, name, type}` | Pre-resolved entity (skips lazy fetch) |

These callbacks are injected by `EntityPropertiesDisplay` via context, so individual `PropertyRow` and `PropertyDisplay` components don't need explicit prop threading.

---

## Extensibility — Custom Property Kinds

### Plugin Registry

Any app can register a custom property kind without touching core packages. A plugin declares a matcher, a renderer, and/or an editor. Once registered, `classifyProperty`, `renderPropertyValue`, `InlinePropertyEditor`, and `resolvePropertyIcon` all automatically delegate to the plugin when its matcher fires.

```typescript
import { registerPropertyPlugin } from "@synap/property-renderer";
import { Star } from "lucide-react";

registerPropertyPlugin({
  kind: "star-rating",

  // Match: fires when uiHints.pluginHints.renderer === "star-rating"
  match: (property) =>
    property.uiHints?.pluginHints?.["renderer"] === "star-rating",

  // Read-only display
  renderer: ({ value, size }) => (
    <StarRatingDisplay value={value as number} size={size} />
  ),

  // Inline editor (opens on click in PropertyRow)
  editor: ({ property, value, onSave, onCancel }) => (
    <StarRatingEditor
      max={(property.uiHints?.pluginHints?.["maxStars"] as number) ?? 5}
      value={value as number}
      onChange={onSave}
      onClose={onCancel}
    />
  ),

  // Icon shown in PropertyRow label column
  icon: Star,
});
```

**Registration:** call `registerPropertyPlugin()` once at app startup (before any component renders). Plugins are checked before built-in classification — first matching plugin wins.

**Matcher strategies:**
- `uiHints.pluginHints?.["renderer"] === "my-kind"` — explicit opt-in (recommended)
- `property.constraints?.enum?.includes("__custom")` — sentinel value
- `CUSTOM_SLUG_RE.test(property.slug)` — slug pattern (use carefully)

### Custom `uiHints` via `pluginHints`

Plugin-specific configuration lives in `uiHints.pluginHints` — a `Record<string, unknown>` namespace that avoids polluting the core `PropertyUIHints` type:

```json
{
  "slug": "satisfaction_score",
  "valueType": "number",
  "uiHints": {
    "pluginHints": {
      "renderer": "star-rating",
      "maxStars": 5,
      "allowHalf": true
    }
  }
}
```

Core properties (`displayAs`, `inputType`, `format`, etc.) remain typed and validated. Plugin config is untyped by design — the plugin itself validates its own hints.

### What plugins can override

| Hook | Override mechanism |
|------|-------------------|
| Display rendering | `plugin.renderer` in `renderPropertyValue` |
| Inline editing | `plugin.editor` in `InlinePropertyEditor` |
| Row icon | `plugin.icon` in `resolvePropertyIcon` |
| Classification | `plugin.match` takes priority in `classifyProperty` |

Plugins **cannot** currently override: property row layout (label column), empty state display, or PropertyEditor form fields. These would require additional hooks if needed post-launch.

---

## Post-Launch Roadmap

### P1 — PersonArrayEditor *(~1 day)*

Currently `person-array` fields fall back to a comma-split TextEditor. The fix requires a `PersonArrayEditor` component that:
- Searches workspace members via a host-provided `searchMembers(query)` callback
- Shows selected people as avatar chips with remove buttons
- Returns `string[]` of member IDs or display names

The `InlinePropertyEditor` has a `// TODO(P1)` comment at the exact injection point.

### P2 — ObjectEditor *(~2 days)*

`valueType=object` currently shows raw JSON string in both display and edit. A proper JSON editor (collapsible tree view, inline key-value pairs) would handle structured metadata fields.

### P3 — RichTextDisplay *(DONE — lightweight markdown)*

`richtext` kind is implemented. Detected by `inputType="richtext"` OR slug pattern (`RICHTEXT_SLUG_RE`). `RichTextDisplay` renders markdown inline (bold, italic, code, bullets) with line-clamping in compact mode. `RichTextEditor` is a styled auto-resize textarea (⌘↵ save, Esc cancel). `PropertyRow` switches to vertical layout for richtext (label above, content below).

Full ProseMirror inline editing (for rich tables, embeds) remains a future upgrade — current textarea covers 95% of real use cases (notes, description, bio, etc.).

### P4 — Template-Engine FieldRenderer deprecation *(~1 day)*

`packages/features/template-engine/src/renderers/FieldRenderer.tsx` is a separate implementation that doesn't use `renderPropertyValue`. It should be replaced with `FieldRenderer` from `@synap/entity-card` + `renderPropertyValue` for value display.

### P5 — Typed constraints per valueType *(~half day)*

`PropertyConstraints` currently uses an index signature (`[key: string]: unknown`) for extensibility. A future improvement: discriminated union per valueType so TypeScript catches invalid constraint combinations:
```typescript
type PropertyConstraints =
  | { type: "string"; enum?: string[]; minLength?: number; maxLength?: number }
  | { type: "number"; min?: number; max?: number }
  | { type: "date"; min?: string; max?: string }
  | ...
```

---

## Key Files

```
packages/core/property-renderer/src/
├── utils/
│   ├── propertyClassifier.ts    ← classifyProperty() + PropertyKind + slug patterns
│   ├── statusSemantics.ts       ← STATUS_PILL_MAP, STATUS_COLORS, PRIORITY_MAP
│   ├── resolvePropertyIcon.ts   ← icon selection (uses classifyProperty)
│   ├── fieldFormatters.ts       ← label formatting
│   ├── fieldTypeDetector.ts     ← legacy value-based type detection
│   └── fieldIcons.ts            ← icon helpers
├── renderPropertyValue.tsx      ← display dispatcher (uses classifyProperty)
├── InlinePropertyEditor.tsx     ← edit dispatcher (uses classifyProperty)
├── PropertyDisplay.tsx          ← PropertyDef + PropertyConstraints + PropertyUIHints interfaces
├── PropertyRow.tsx              ← Notion-style read+edit row
├── PropertyChip.tsx             ← compact pill (icon + value, no label)
├── PropertyEditor.tsx           ← label + input stacked (form mode)
├── editors/
│   ├── StatusEditor.tsx         ← colored dot dropdown
│   ├── PriorityEditor.tsx       ← flag icon dropdown
│   ├── EnumEditor.tsx           ← single/multi enum select
│   ├── TagsEditor.tsx           ← free-form tag input
│   ├── DateEditor.tsx           ← calendar popover
│   ├── TextEditor.tsx           ← text/number/url/email input
│   └── EntityPickerEditor.tsx   ← searchable entity picker
└── [Display components]         ← TextDisplay, DateDisplay, PersonDisplay, etc.
```
