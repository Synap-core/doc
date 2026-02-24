---
sidebar_position: 3
title: Views System
---

# Views System

> **Principle**: Separate **Declared Scope** (what the view *intends* to show) from **Query Results** (what typically matches).

The Views System is the engine that queries, filters, and displays Entities. It is designed to be **stable** (no column jitter), **performant** (no heavy storage), and **flexible** (user overrides).

## 1. Core Architecture

### Minimal Storage
Views do **not** store entities. They store:
1.  **Scope**: Which "Profiles" (Schema Definitions) are included.
2.  **Query**: Filters, sorts, search terms.
3.  **Config**: User overrides for display (hidden columns, widths).

This ensures views are always "fresh" and reflect the current state of the database.

### The "Scope Profile" Concept
To prevent "column jitter" (columns appearing/disappearing based on pagination), every view has a declared **Scope**.
- **Input**: "I want a view of `Tasks` and `Bugs`."
- **Result**: The view calculates the *union* of fields available in `Task` and `Bug` schemas.
- **Stability**: Even if the current page has no Bugs, the "Bug Priority" column remains visible (but empty).

## 2. Data Model

```typescript
interface View {
  id: string;
  type: ViewType;           // 'table', 'board', 'calendar', 'graph'
  category: 'structured' | 'canvas';
  
  // 1. Declared Scope (The Anchor)
  scopeProfileIds: string[]; // e.g., ['task-profile-id', 'bug-profile-id']
  
  // 2. Query (Use to fetch data)
  query: {
    filters: EntityFilter[];
    sorts: SortRule[];
    search?: string;
    groupBy?: string;        // For Kanban/Board
  };
  
  // 3. Config (Visual Overrides)
  config: {
    hiddenColumns?: string[];
    columnOrder?: string[];
    columnWidths?: Record<string, number>;
    // View-specific config
    cardFields?: string[];   // Attributes to show on board cards
    calendarField?: string;  // Which date field to use
  };
}
```

## 3. View Types

### Structured Views
Grid-like views where columns/fields are strictly defined by schema.
*   **Table**: Classic spreadsheet view. Columns = Schema Fields.
*   **List**: Compact vertical list.
*   **Board (Kanban)**: Grouped by a field (Status, Priority). Columns = Group Values.
*   **Calendar**: Entities plotted by date.

### Canvas Views
Free-form views where position and relationships matter more than schema.
*   **Graph**: Node-link diagram showing relationships.
*   **Whiteboard**: Infinite canvas with spatial positioning.
*   **Timeline**: Gantt-style view of dependencies.

## 4. Execution Flow

1.  **Resolve Scope**: Client requests View X. Backend loads View X and identifies `scopeProfileIds`.
2.  **Compute Schema**: Backend merges schemas from all Scope Profiles to determine the "Default Columns".
3.  **Apply Overrides**: Backend applies user's `config` (hidden columns, custom order) to the Default Columns.
4.  **Execute Query**: Backend compiles `query` (filters/sorts) into SQL. It validates that filters match the Scope Profiles.
5.  **Return Result**: Client receives:
    *   `entities`: The data.
    *   `columns`: The stable column definitions.
    *   `renderConfig`: Visual settings.

## 5. Key Behaviors

*   **Multi-Profile Support**: A view can show `Tasks` and `Notes` together. Common fields (`title`, `tags`) are merged. Unique fields (`dueDate` vs `content`) are available but may be null for some rows.
*   **Strict Sorting**: You can only sort by fields that exist and are indexed in *all* Scope Profiles.
*   **Safe Defaults**: By default, views show the Title and key "Core" fields (Status, Assignee). Users must explicitly unhide other fields.

## 6. Migration Note (Feb 2025)
We are moving from "Entity Types" (string slugs) to "Scope Profiles" (UUIDs) to ensure strict schema validation.
