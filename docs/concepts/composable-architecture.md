---
sidebar_position: 4
---

# Composable Architecture

**How Entities, Views, and AI assemble into anything**

> This doc covers the *assembly mechanics*. For what the building blocks are, see [Building Blocks](./building-blocks).

---

## The Assembly Mechanisms

### 1. Views (How Humans Assemble Bricks)

**Views** are different ways to see and manipulate the same entities:

| View Type | Purpose | Example |
|-----------|---------|---------|
| **Table** | Spreadsheet-like | All tasks with filters |
| **Kanban** | Board columns | Tasks by status |
| **Calendar** | Time-based | Events over time |
| **Timeline** | Date ranges | Project milestones |
| **Whiteboard** | Freeform canvas | Visual brainstorming |
| **Mindmap** | Hierarchical tree | Nested ideas |
| **Graph** | Network visualization | Knowledge connections |
| **Bento** | Composable dashboard | Multiple views in one |

**The key insight**: Same entities, different perspectives. A task in the Kanban is the same row as that task in the Calendar. Update it in either — it updates everywhere.

#### Canvas vs Structured views

- **Canvas** (`whiteboard`, `mindmap`): Freeform positioning, visual relationships — backed by a Yjs document
- **Structured** (`table`, `kanban`, `calendar`, `list`, `timeline`): Query-based, computed from entity properties — no document overhead

### 2. AI (How AI Assembles Bricks)

**AI is another assembler** — it reads entities and proposes new combinations:

```
User: "Create a project plan for the launch"

Action Agent:
1. Reads existing entities (notes, contacts, tasks)
2. Proposes new entities via Hub Protocol:
   - Project: "Launch"
   - Task: "Write landing page copy"
   - Task: "Set up analytics"
3. Proposes relations:
   - Tasks → belong to Project
   - Notes → linked to relevant tasks
4. All proposals wait for human approval
```

Unlike humans using views, AI uses the **Hub Protocol** — it never writes directly. It proposes. The Data Pod decides whether to execute.

---

## Human-in-the-Loop (The Unique Advantage)

Most AI systems either:
- **Full automation**: AI does it, you can't stop it
- **Full manual**: AI suggests, you copy-paste

Synap uses **Proposals** — AI creates draft changes that pause in a validation queue:

```
1. AI → hubProtocol.createEntity()
2. Data Pod → checkPermissionOrPropose()
       → if auto-approve whitelist: execute immediately
       → else: write proposal row, return { status: "proposed" }
3. User → Reviews in inbox
4. User → Approves → entity created
   User → Rejects → proposal closed, reason logged
```

This is **only possible** because of event sourcing:
- Every action is an event with a lifecycle state
- Proposals are a separate table — no "draft" entities polluting the graph
- The audit trail is immutable — every approval decision is logged

---

## Composition Examples

### Example: Second Brain

**Bricks**: 500 note entities, 50 person entities, 1000 relation edges

**Human assemblies**:
- Table view: all notes, sorted by date
- Graph view: visual network of connected ideas
- Timeline view: notes chronologically
- Bento dashboard: stats + recent notes + quick capture

**AI assemblies** (proposals):
- Suggests "summary" note entities from related clusters
- Proposes connections between notes mentioning the same topic

### Example: AI-Assisted Writing

**Bricks**: document entity (article), task entities (outline items), note entities (research)

**Human assembly**: Whiteboard view for outline, Document view for editing

**AI assembly**: Agent reads document, proposes edit tasks, links research notes — user approves each

---

## Technical: How the Layers Connect

```typescript
// Entity references a document (canvas/rich-text only)
const entity = {
  id: "task-1",
  type: "task",
  title: "Write documentation",
  documentId: "doc-1"  // null for most entities
};

// Structured view — query-based, no document
const kanbanView = {
  type: "kanban",
  config: {
    profileSlug: "task",
    filters: { project: "synap" },
    groupBy: "status"
  }
};

// Canvas view — backed by Yjs document
const whiteboardView = {
  type: "whiteboard",
  documentId: "whiteboard-doc-123"  // Yjs real-time collab
};
```

---

## Next Steps

- [Event Architecture](../architecture/events/event-architecture.md) — How events enable composability
- [Hub Protocol](../architecture/hub-protocol-flow.md) — How AI assembles bricks
- [Building Blocks](./building-blocks) — The entity and view primitives

---

:::info Learn more on the website
- [Bento Dashboards guide](https://www.synap.live/guides/bento-dashboards) — practical overview of composable dashboard layouts
- [The Synap Manifesto](https://www.synap.live/manifesto) — the philosophy behind emergent complexity
:::
