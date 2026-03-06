# Entity Bento Dashboards — Vision & Strategy

**Version:** 1.0 — March 2026
**Status:** In implementation

---

## 1. The Shift: From Document-Centric to Dashboard-Centric

Synap started as a workspace where entities live alongside documents. You open a contact, you see a document. You open a project, you see a document. The document was the universal canvas — flexible but flat.

The shift: **entities are not documents. They are objects.** A CRM account isn't a page to write on — it's a hub that connects to deals, contacts, emails, revenue metrics, and activity feeds. Forcing it into a document creates friction. The user ends up scroll-hunting, manually linking things that should be visible at a glance.

**The "OS for AI" vision** means Synap becomes the operating layer through which you navigate your data. Like macOS has apps with windows, Synap has entities with dashboards. You navigate entities like you navigate windows — with spatial awareness, context-rich layouts, and intelligent defaults.

This is what Entity Bento Dashboards enable.

---

## 2. Entity as Dashboard

Any entity in Synap can now have two primary views:

- **Document mode** (default): Rich text editor + properties panel. Ideal for notes, specs, ideas — content-heavy entities.
- **Dashboard mode**: A bento grid of widgets — entirely customizable, persistent per entity.

A user toggles between modes with a small pill in the entity header: `Document | Dashboard`.

The first time they switch to Dashboard, Synap automatically creates a bento view for that entity with default blocks: an entity header (name + type + status) and a properties panel. The user then adds whatever widgets make sense — a kanban of related tasks, a calendar of associated events, a metric counting linked deals, an embedded web page, or a list of notes.

### Example: CRM Account Dashboard

| Block | Widget | Position |
|-------|--------|----------|
| Account name + logo | entity-header | Top full-width |
| Properties (ARR, stage, owner) | entity-properties | Top-left |
| Open deals | view-kanban (profileSlug: deal) | Top-right |
| Activity timeline | feed | Mid-left |
| Related contacts | entity-content (relationshipType: contact) | Mid-right |
| MRR chart | chart | Bottom-left |
| Last 3 meetings | entity-list (profileSlug: meeting, limit: 3) | Bottom-right |

This is something a spreadsheet can never give you. And it's entirely user-configurable without code.

---

## 3. Everything as a Widget

The bento widget system is designed as a universal container. Any data visualization, any app component, any external service can be a widget.

**Core categories:**

| Category | Examples |
|----------|---------|
| **Entity data** | entity-header, entity-properties, entity-list, entity-count, entity-content |
| **View runners** | view-list, view-table, view-kanban, view-calendar, view-grid |
| **Home** | welcome-header, workspace-info, feed, quick-access |
| **Browser** | iframe-embed, link-grid |
| **Productivity** | calendar, metric, chart |

**View runner widgets** are particularly powerful: they embed the full StructuredViewRenderer (the same engine used in standalone list/table/kanban/calendar views) directly in a bento cell. A single entity dashboard can show a kanban of tasks, a calendar of events, and a table of contacts — all live, all queryable.

**The widget type is an opaque string**. The backend stores any non-empty string in the `config.blocks[].widgetType` JSONB field. The frontend registry decides what renders it. Unknown types show a graceful placeholder — the grid never crashes.

---

## 4. Widget Registry Model

The registry follows a dual-layer pattern:

```
CORE_REGISTRATIONS     ← bundled with @synap/bento-view
    +
extendedRegistrations  ← runtime-registered by apps at startup
    =
WIDGET_REGISTRY        ← what BentoBlock renders from
```

**Core widgets** ship with the package and are always available.

**App-specific widgets** are registered at startup by the host app. The browser app registers `clock`, `pod-status`, `recent-tabs`. The desktop app registers `terminal`, `file-browser`. A future marketplace widget registers itself via `registerWidget('marketplace-id', MyWidget, meta)`.

**View runner widgets** are registered via `registerViewRunnerWidgets()` from `@synap/view-renderer` — called once at app startup. This keeps the dependency direction clean (view-renderer → bento-view, not the reverse).

---

## 5. Content = Entities

A critical architectural principle: **content widgets don't embed data — they query it**.

When you add a "Notes" widget to an entity dashboard, those notes are not stored in the widget's `config` JSON. They are entities in the database with a relationship to the parent entity (`relationshipType: "note"`). The widget is just `trpc.entities.list({ relatedToEntityId, relationshipType })` + a renderer.

**Why this matters:**
- Notes appear in search (they're entities, not blobs)
- Notes can be linked to other entities too (reuse, not copy)
- The AI can read, write, and reason about them
- Notes have their own properties, status, lifecycle

This means "notes widget" = "notes entity view". The widget and the standalone notes list view show the same data from the same source. There's no sync problem, no duplicate state.

---

## 6. Graceful Degradation

When the frontend encounters a widget type it doesn't recognize, it shows `UnknownWidgetPlaceholder`. This is intentional and important:

1. **Never crash**: A missing widget type shows an informational placeholder, not an error page
2. **App-specific detection**: Prefixes like `browser:`, `desktop:`, `mcp:` are recognized as app-specific — the placeholder message adapts
3. **Debug info**: Collapsible block showing `widgetType`, `blockId`, and `config` for developers
4. **Marketplace CTA** (future): "Search widget marketplace" link — find and install the missing widget
5. **AI generation CTA** (future): "Generate this widget" — the intelligence hub receives the widget key + its config schema and generates a component

Additionally, each registered widget is wrapped in a `WidgetErrorBoundary`. If a widget throws during render, only that cell shows an error card with a Retry button. The rest of the grid is unaffected.

---

## 7. MCP Widgets (Future)

The `mcp:` prefix is reserved for Model Context Protocol widgets. When Synap's intelligence hub is configured with MCP servers, a widget with `widgetType: "mcp:github-prs"` would:

1. Route to the `github-prs` tool on the connected GitHub MCP server
2. Receive structured data back
3. Render it using a default table/list renderer or a custom component

This is the bridge between Synap's dashboard layer and the MCP ecosystem (10,000+ servers as of 2026). Users won't build widgets — they'll connect MCP servers and choose which tools to surface as dashboard blocks.

The vision: **a Synap entity dashboard can show live data from any connected tool**, without Synap building a single integration. The MCP server handles the data contract; Synap handles the layout and persistence.

---

## 8. Limitations

**Complexity for simple use cases**: A bento dashboard is overkill for a simple note or a quick task. We don't push users toward bento — document mode is the default. The toggle is only shown when `canEdit === true`.

**Performance with many widgets**: A dashboard with 20 widgets makes 20+ tRPC queries. Each widget is independent. We mitigate this with:
- TanStack Query deduplication (same query params → single request)
- Lazy loading (Suspense boundaries on adapters)
- Future: virtual rendering for off-screen blocks

**Widget config UX**: Configuring a widget (profileSlug, groupByField, dateField) currently requires manual input. Future: inline config editor in edit mode — a popover per widget.

**No server-side rendering of bento config**: Bento layouts are fetched client-side. Pages with entity bento dashboards won't have SSR for the widget content (though the entity itself is SSR'd). This is acceptable for a dashboard-style product.

**Widget marketplace is future**: The CTAs in UnknownWidgetPlaceholder are disabled. The marketplace infrastructure (publishing, versioning, sandboxing) is not built.

---

## 9. User Impact

**Power users** (analysts, project managers, CRM users): Compound dashboards replace spreadsheet + document + chat patterns. A CRM account shows deals, contacts, and metrics in one place. A project shows its kanban, timeline, and team in one view. **Massive UX improvement**.

**Simple users** (writers, note-takers): No change. Document mode is the default. They never see the toggle unless they choose to edit.

**No forced migration**: Existing entities stay in document mode. No data loss. No re-learning. The dashboard layer is additive.

**Discoverability**: The toggle appears in the entity header once a user has write access. First-time experience: toggle → system auto-creates the bento view → 2 default blocks appear → user starts adding widgets.

---

## 10. Marketing Angle

**From:** "Synap is a connected knowledge base"
**To:** "Synap is the OS for your data and AI"

The entity bento dashboard is the physical manifestation of this shift. It's what makes the "OS" metaphor tangible:
- Entities are applications (each with their own window/dashboard)
- Widgets are components (reusable, installable, AI-generatable)
- The workspace is the desktop (navigate between entity dashboards like windows)

**Key messages:**
- "Any entity. Any layout. Your data, your way."
- "See a CRM account as a dashboard, not a document."
- "Build compound views without code — drag, drop, configure."
- "The AI sees the same data you see. Ask questions about your dashboard."

**Competitive differentiation:**
- Notion: flat documents, no dashboard-level entity view
- Linear: structured views but no custom dashboards per entity
- Airtable: powerful tables, no contextual entity dashboards
- Synap: **OS-level entity dashboards with AI built in**

---

## Implementation Summary

| Component | Status | Notes |
|-----------|--------|-------|
| `entity.properties.__viewMode` | ✅ Done | Stored in JSONB `properties`, no migration |
| `entities.setEntityViewMode` tRPC | ✅ Done | Auto-creates bento view on first switch |
| `entity-header` widget | ✅ Done | Shows entity name, type, status |
| `entity-properties` widget | ✅ Done | EntityPropertiesDisplay in a bento cell |
| `entity-content` widget | ✅ Done | Related entity query + renderer |
| `BentoEditContext.entityId` | ✅ Done | Context injection for entity widgets |
| `ViewRunnerWidget` + 5 types | ✅ Done | In `@synap/view-renderer`, registered at startup |
| `WidgetErrorBoundary` | ✅ Done | Wraps every widget in BentoBlock |
| `UnknownWidgetPlaceholder` enhanced | ✅ Done | Debug, marketplace CTA, AI CTA |
| `EntityViewModeToggle` | ✅ Done | Document | Dashboard pill |
| `EntityFullView` routing | ✅ Done | Render prop pattern avoids circular dep |

**Wiring needed at call sites:**
- Call `registerViewRunnerWidgets()` in workspace layout
- Pass `bentoContent` render prop to `EntityFullView` in workspace entity panels
- Pass `entityId` to `BentoEditProvider` when rendering entity bento views
