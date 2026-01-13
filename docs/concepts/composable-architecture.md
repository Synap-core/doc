---
sidebar_position: 4
---

# Composable Architecture

**Synap as Lego Bricks for your Digital Life**

---

## The Philosophy

Traditional apps give you a pre-built house. **Synap gives you Lego bricks.**

Every piece of your digital life - notes, tasks, files, conversations - becomes a **composable primitive** that you can assemble in infinite ways.

---

## The Building Blocks

### 1. Entities (The Bricks)

**Entities** are the atomic units of your knowledge graph:

- **Notes**: Ideas, thoughts, meeting minutes
- **Tasks**: Action items with status
- **Projects**: Containers for organization
- **Files**: PDFs, images, audio, video
- **People**: Contacts and relationships
- **Events**: Calendar items

Each entity has:
- Metadata (title, type, timestamps)
- Relations (links to other entities)
- Content (via document reference)

```typescript
// An entity is just metadata
{
  id: "uuid",
  type: "task",
  title: "Build Lego castle",
  metadata: { status: "in-progress", priority: "high" },
  documentId: "uuid" // Points to actual content
}
```

### 2. Documents (The Content)

**Documents** store the actual content:

- Markdown text
- Rich text (via Yjs)
- Code files
- Binary files

Documents support:
- **Versioning**: Every change is a snapshot
- **Collaboration**: Real-time multi-cursor editing
- **AI Co-editing**: Agents can propose changes

```typescript
// A document stores content
{
  id: "uuid",
  title: "Architecture Notes",
  type: "markdown",
  storageUrl: "r2://...",
  workingState: "<yjs-binary>", // Live editing state
  versions: [ /* history */ ]
}
```

---

## The Assembly Mechanisms

### 1. Views (How Humans Assemble Bricks)

**Views** are different ways to see and manipulate the same entities:

| View Type | Purpose | Example |
|-----------|---------|---------|
| **Table** | Spreadsheet-like | All tasks with filters |
| **Kanban** | Board columns | Tasks by status |
| **Timeline** | Chronological | Events over time |
| **Whiteboard** | Freeform canvas | Visual brainstorming |
| **Mindmap** | Hierarchical tree | Nested ideas |
| **Graph** | Network visualization | Knowledge connections |

**The Key**: Same entities, different perspectives.

```typescript
// A view is a lens on your entities
{
  id: "uuid",
  type: "kanban",
  category: "structured", // or "canvas"
  name: "Sprint Board",
  metadata: {
    columns: ["todo", "in-progress", "done"],
    filters: { type: "task", project: "X" }
  }
}
```

#### Canvas Views vs Structured Views

- **Canvas** (`whiteboard`, `mindmap`): Freeform positioning, visual relationships
- **Structured** (`table`, `kanban`, `timeline`): Query-based, computed from entity properties

### 2. AI (How AI Assembles Bricks)

**AI is another assembler** - it reads entities and proposes new combinations:

```
User: "Create a project plan for the Lego castle"

AI:
1. Reads existing entities (notes, tasks, files)
2. Proposes new entities:
   - Project: "Lego Castle"
   - Task: "Buy bricks"
   - Task: "Design blueprint"
   - Task: "Assemble base"
3. Proposes relations:
   - Tasks → belong to Project
   - Notes → linked to relevant tasks
```

**Unlike humans using views**, AI uses the **Hub Protocol** to:
- Read entity graph
- Create proposals (pending entities)
- Wait for human validation

---

## Human-in-the-Loop (The Unique Advantage)

Most AI systems either:
- **Full automation** (AI does it, you can't stop it)
- **Full manual** (AI suggests, you copy-paste)

**Synap uses Proposals** - AI creates "draft entities" that pause in a validation queue:

```
Event Flow:
1. AI → submitInsight() → entity.creation.requested
2. Worker → Creates PROPOSAL (status: pending)
3. User → Reviews in UI
4. User → Approves/Rejects
5. If approved → Worker converts to real entity
```

**Proposal States**:
- `pending` - Waiting for human review
- `validated` - Approved, entity created
- `rejected` - Dismissed with reason

This is **only possible** because of event sourcing:
- Events have states (`requested` → `validated`)
- Proposals are a separate table
- State transitions are events themselves

---

## The Lego Philosophy in Practice

### Example 1: Building a Second Brain

**Bricks**:
- 500 note entities
- 50 person entities
- 1000 relation entities (links)

**Assemblies**:
- **Table view**: All notes, sortable by date
- **Graph view**: Visual network of connected ideas
- **Timeline view**: Notes chronologically
- **Whiteboard view**: Sticky notes on a canvas

**AI Assembly**:
- Agent reads all notes
- Proposes new "summary" notes
- Proposes relations between similar topics

### Example 2: AI-Assisted Writing

**Bricks**:
- Document entity (your article)
- Task entities (outline items)
- Note entities (research)

**Human Assembly**:
- **Whiteboard view**: Outline as cards
- **Document view**: Real-time editor

**AI Assembly**:
- Agent reads document
- Proposes edits (via document versions)
- Proposes task entities ("Add conclusion section")
- User reviews proposals in sidebar

---

## Why This Matters

### Traditional Apps

```
Notion: Notes locked to pages
Trello: Cards locked to boards
Obsidian: Files locked to folders
```

You build one castle, you're stuck with it.

### Synap (Lego Architecture)

```
Entities: Universal bricks
Views: Different castles from same bricks
AI: Automated builder
Proposals: Review blueprints before building
```

You can rebuild anytime, with zero data loss (event sourcing).

---

## Technical Implementation

### Entities ↔ Documents

```typescript
// Entity references document
const entity = {
  id: "task-1",
  type: "task",
  title: "Write documentation",
  documentId: "doc-1" // Full task description
};

// Document stores content
const document = {
  id: "doc-1",
  type: "markdown",
  content: "## Task Details\n\nWrite composability docs..."
};
```

### Views ↔ Entities

```typescript
// Structured view (query-based)
const kanbanView = {
  type: "kanban",
  metadata: {
    source: {
      entityType: "task",
      filters: { project: "synap" }
    },
    columns: [
      { id: "todo", filter: { status: "todo" } },
      { id: "done", filter: { status: "done" } }
    ]
  }
};

// Canvas view (position-based)
const whiteboardView = {
  type: "whiteboard",
  yjsRoomId: "whiteboard-123", // Real-time collab
  metadata: {
    entities: [
      { entityId: "task-1", position: { x: 100, y: 200 } },
      { entityId: "note-5", position: { x: 300, y: 400 } }
    ]
  }
};
```

### AI ↔ Proposals

```typescript
// Intelligence Service creates proposal
await hubProtocol.createEntity({
  type: "task",
  title: "AI-suggested task",
  metadata: {
    aiGenerated: true,
    confidence: 0.85,
    reasoning: "User mentioned this in chat"
  }
});

// Backend creates proposal (not entity)
const proposal = await db.insert(proposals).values({
  targetType: "entity",
  status: "pending",
  request: { /* entity data */ }
});

// User approves → Worker converts to entity
// User rejects → Proposal stays for audit
```

---

## Next Steps

- [Event Architecture](../architecture/events/event-architecture.md) - How events enable composability
- [Views System](../development/extending/views.md) - Building custom views
- [Hub Protocol](../architecture/hub-protocol-flow.md) - How AI assembles bricks
- [Proposals](../architecture/core-patterns.md#proposals) - Human-in-the-loop pattern
