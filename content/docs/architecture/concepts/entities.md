---
sidebar_position: 2
title: 'Universal Entity Model'
description: Documentation covering Universal Entity Model
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

> **Vision**: One Data Model, Infinite Views.

In Synap, everything is an **Entity**. Whether it's a task in a list, a node in a graph, or a card on a whiteboard, it is the same underlying data object rendered differently based on context.

## 1. The Data Model

### Everything is an Entity
Entities are stored in a universal format in the backend. This allows any object to be manipulated by any view.

```typescript
interface Entity {
  id: string;
  type: EntityType; // 'task', 'note', 'person', 'event', etc.
  title: string;
  
  // Core Content
  content?: string;             // Markdown/ProseMirror content
  metadata?: Record<string, any>; // Type-specific fields (status, priority)
  
  // Spatial Data (for Whiteboard/Canvas)
  spatial?: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    color?: string;
    shape?: 'rectangle' | 'ellipse' | 'diamond';
  };
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### First-Class Relationships
Relationships are not just links inside a document; they are independent objects. This allows a "link" to be visualized as:
- An edge in a Graph view.
- An arrow in a Whiteboard view.
- A "Related Items" list in a Document view.

```typescript
interface Relation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: RelationType; // 'assigned_to', 'blocked_by', 'parent_of', etc.
  metadata?: Record<string, any>;
}
```

## 2. The Viewer System

We use a **Universal Entity Viewer** component that decouples data from presentation.

**"One component renders all entity types, in all views."**

### Architecture
1.  **EntitySchema**: Defines what fields exist for a type (e.g., `Task` has `status`, `Person` has `email`).
2.  **LayoutTemplate**: Defines how to arrange those fields for a specific context (size, orientation).
3.  **EntityViewer**: The React component that combines Data + Schema + Layout to render the UI.

### Context-Aware Rendering
The same entity adapts to its container:

| Context | Visual Result |
| :--- | :--- |
| **List View** | Compact row. Icon + Title + Status Badge. |
| **Graph Node** | Medium card. Icon + Title + 1-2 key tags. Handles for connections. |
| **Whiteboard** | Resizable card. Full content available on zoom. |
| **Detail Modal** | Full layout. All fields, full description editor, activity history. |

### Layout Templates
Layouts are defined per entity type and size (`compact`, `medium`, `large`, `full`).
- **Compact**: Header only (icon, title).
- **Medium**: Header + Primary Metadata (priority, assignee).
- **Full**: Multi-column grid, rich text editor, full metadata.

## 3. Interoperability Example

1.  **Whiteboard**: User draws a rectangle ("Project X") and an arrow to another rectangle ("Task A").
    *   *Backend*: Creates 2 Entities (`Note`, `Task`) and 1 Relation (`links_to`).
    *   *Tldraw Adapter*: Renders them as shapes.
2.  **Graph View**: User switches to Graph.
    *   *Backend*: Returns the same Entities and Relation.
    *   *ReactFlow Adapter*: Renders them as Nodes and Edges.
3.  **List View**: User switches to List.
    *   *Backend*: Returns Entities.
    *   *List Adapter*: Renders "Project X" and "Task A" as rows. "Task A" shows "Project X" in a "Related" column.

## 4. Design Principles
- **Visual Hierarchy**: Visuals (Icon/Color) denote Type. Text denotes Content.
- **Consistent Tokens**: A "Task" always looks like a "Task" (green icon, specific badging) regardless of view.
- **Direct Manipulation**: Interactive everywhere. Update status in the List, it updates in the Graph instantly.

## 5. One Entity, Many Lenses (Layered Schemas)

An entity lives **once** on your pod. What changes between spaces is the **lens** you look at it through.

Each workspace renders an entity using a layered schema:

```
┌──────────────────────────────────────────────────────────────┐
│  Base fields            (defined on the profile, always on)  │  ← shared
│  e.g. Person.name, Person.email                              │
├──────────────────────────────────────────────────────────────┤
│  Workspace overlay      (defined by this workspace only)     │  ← private
│  e.g. Relay adds Person.investmentThesis                     │
└──────────────────────────────────────────────────────────────┘
```

**The key rule:** when you open a Person in your Relay space, you see base fields + Relay's overlay. When you open the same Person in your Knowledge space, you see base fields + Knowledge's overlay. Relay's overlay fields are **invisible** to Knowledge — not hidden, genuinely not rendered. Your schemas don't leak across spaces.

This is why Synap can host three completely different workflows on the same underlying entity graph without one workflow's custom fields polluting another.

### What this enables
- **Same people, different systems** — track fundraising context in Relay, personal notes in Knowledge, content-audience tags in Studio. One Antoine, three lenses.
- **Safe extension** — adding a field in your space can never affect another space. No schema migrations. No "will this break my other app?".
- **Template composability** — install a new space template and its overlay fields slot in alongside your existing data. Your Person entities grow capabilities without losing identity.

For the full technical model (how base vs. overlay defs are stored, how queries filter, how the write path tags new fields), see [Profile Schemas →](./profile-schemas).

---

:::info Learn more on the website
- [User-friendly guide to Entities](https://www.synap.live/guides/entities) — practical overview of the universal entity model
:::
