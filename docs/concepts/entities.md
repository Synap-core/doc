---
sidebar_position: 2
title: Universal Entity Model
---

# Universal Entity Model

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
