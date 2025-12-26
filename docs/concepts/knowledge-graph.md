---
sidebar_position: 3
---

# Knowledge Graph Model

**How Synap automatically connects your thoughts**

Traditional note apps store notes in folders. Synap stores them in a **knowledge graph** where everything is automatically connected.

---

## The Problem with Folders

```
Traditional Apps (Folders):
├── Work/
│   ├── Projects/
│   │   ├── Project X.md
│   │   └── Project Y.md
│   └── Meeting Notes/
│       └── Marie Meeting.md  ← Mentions Project X
└── Personal/
    └── Ideas.md  ← Also mentions Project X

Problem: Related notes are scattered
You have to manually remember connections
```

**Issues**:
- Manual organization is time-consuming
- Related content gets siloed
- Connections are implicit, not explicit
- Hard to discover patterns
- Folder structure is rigid

---

## Synap's Solution: Everything is Connected

```
Knowledge Graph (Automatic):

[Marie Meeting] ──mentions──> [Contact: Marie]
       │                           │
  mentions                    assigned_to
       │                           │
       v                           v
[Project X] <────────related_to────┘
       │
  has_task
       │
       v
[Task: Design mockups]
```

**Benefits**:
- ✅ Automatic connections by AI
- ✅ Bi-directional navigation
- ✅ Relationship types (not just generic links)
- ✅ Graph visualization
- ✅ Pattern discovery

---

## Core Concepts

### 1. Entities (Nodes)

Every piece of content is an **entity** with a type:

```typescript
type EntityType = 
  | 'note'       // Rich text notes
  | 'task'       // To-do items
  | 'project'    // Work containers
  | 'person'     // Contacts
  | 'meeting'    // Events/calls
  | 'document'   // Files
  | 'page'       // Wiki pages
  | 'custom';    // Your own types
```

**Example Entity**:
```json
{
  "id": "entity_abc123",
  "type": "note",
  "title": "Marketing Plan Q1",
  "preview": "Focus on social media...",
  "created": "2024-12-19T00:00:00Z",
  "metadata": {
    "projectId": "project_x",
    "tags": ["marketing", "strategy"]
  }
}
```

---

### 2. Relations (Edges)

Connections between entities, with **typed relationships**:

```typescript
type RelationType =
  | 'mentions'      // Note mentions person
  | 'assigned_to'   // Task assigned to person
  | 'belongs_to'    // Note belongs to project
  | 'depends_on'    // Task depends on another
  | 'related_to'    // Generic relation
  | 'references'    // Cites another entity
  | 'custom';       // Your own types
```

**Example Relation**:
```json
{
  "id": "rel_xyz789",
  "sourceEntityId": "note_123",
  "targetEntityId": "person_marie",
  "type": "mentions",
  "created": "2024-12-19T00:00:00Z"
}
```

---

## How Connections are Created

### 1. Automatic (AI-Powered)

When you create content, AI automatically extracts entities:

```typescript
// You create a note:
await synap.notes.create({
  content: "Call Marie tomorrow about Project X budget"
});

// AI automatically creates:
// 1. Entity: Note
// 2. Entity: Contact "Marie" (or links to existing)
// 3. Entity: Project "Project X" (or links to existing)
// 4. Relation: Note → mentions → Marie
// 5. Relation: Note → mentions → Project X
// 6. Suggested: Task "Call Marie tomorrow"
```

**AI Extraction**:
- People names → Contact entities
- Project names → Project entities
- Dates → Event entities
- Action items → Task entities
- Companies → Organization entities

---

### 2. Manual (Explicit)

You can explicitly create connections:

```typescript
// Link note to project
await synap.relations.create({
  sourceId: 'note_123',
  targetId: 'project_x',
  type: 'belongs_to'
});

// Or using shortcuts
await synap.notes.addToProject('note_123', 'project_x');
```

---

### 3. Implicit (Activity-Based)

System automatically infers connections from actions:

```
- View note about Marie → increases relation strength
- Work on Project X → links recent notes
- Chat about topic → connects messages
```

---

## Querying the Graph

### Basic Queries

```typescript
// Find all notes mentioning "Marie"
const notes = await synap.graph.query({
  type: 'note',
  relatedTo: {
    entityId: 'contact_marie',
    via: 'mentions'
  }
});

// Find all tasks assigned to me in Project X
const tasks = await synap.graph.query({
  type: 'task',
  filters: {
    projectId: 'project_x',
    assignedTo: 'me'
  }
});
```

---

### Advanced Queries

```typescript
// Find notes connected to Marie through any relationship
const connected = await synap.graph.findConnected({
  entityId: 'contact_marie',
  relationTypes: ['mentions', 'assigned_to', 'related_to'],
  maxDepth: 2  // Two degrees of separation
});

// Result:
// [Note A] --mentions--> [Marie] --assigned_to--> [Project X]
//                                                      |
//                                                 belongs_to
//                                                      |
//                                                 [Note B]
```

---

### Graph Traversal

```typescript
// Find shortest path between two entities
const path = await synap.graph.findPath({
  from: 'note_planning',
  to: 'person_marie',
  maxDepth: 5
});

// Result: ["note_planning", "project_x", "person_marie"]
// Meaning: Note → belongs to → Project X → assigned to → Marie
```

---

## UI Patterns You Can Build

### 1. Entity Pages

Click on any entity (person, project, note) to see everything related:

```
👤 Marie (Contact)

Connected Entities:
├─ 📝 15 notes mentioning her
├─ ✅ 7 tasks assigned to her
├─ 📁 3 projects she's involved in
├─ 📅 5 upcoming meetings
└─ 🔗 12 documents she's referenced in

Recent Activity:
├─ Yesterday: Created "Marketing Plan"
├─ Today: Assigned task "Review mockups"
└─ 2 hours ago: Mentioned in meeting notes

Related People:
├─ Paul (3 shared projects)
└─ Sara (5 co-assigned tasks)
```

---

### 2. Graph Visualization

**Obsidian-style network graph**:

```
Interactive Graph:
- Nodes = Entities (sized by connections)
- Edges = Relations (colored by type)
- Clusters = Topics/projects
- Click = Open entity
- Hover = Show preview
- Filter = By type, date, project
```

**Implementation**:
```typescript
const graphData = await synap.graph.getVisualization({
  filters: {
    types: ['note', 'project', 'person'],
    projectId: 'project_x'  // Focus on one project
  }
});

// Returns D3.js/Vis.js compatible format:
{
  nodes: [
    { id: 'note_1', label: 'Planning', type: 'note', size: 10 },
    { id: 'person_marie', label: 'Marie', type: 'person', size: 15 }
  ],
  edges: [
    { from: 'note_1', to: 'person_marie', type: 'mentions', color: '#10B981' }
  ]
}
```

---

### 3. Smart Suggestions

**AI-powered relationship suggestions**:

```typescript
const suggestions = await synap.graph.suggestConnections();

// Result:
[
  {
    type: 'merge_entities',
    message: 'These 2 contacts seem to be the same person',
    entities: ['contact_marie_1', 'contact_marie_2'],
    confidence: 0.95
  },
  {
    type: 'create_project',
    message: 'These 5 notes could be a project',
    entities: ['note_1', 'note_2', 'note_3', 'note_4', 'note_5'],
    suggestedName: 'App Redesign',
    confidence: 0.85
  },
  {
    type: 'create_relation',
    message: 'This note seems related to Project X',
    source: 'note_123',
    target: 'project_x',
    relationType: 'belongs_to',
    confidence: 0.78
  }
]
```

---

### 4. Backlinks

Like Obsidian/Roam, but automatic:

```
Note: "Marketing Strategy"

Mentioned in:
├─ Meeting with Marie (2 days ago)
├─ Project X Planning (last week)  
└─ Q1 Objectives (1 month ago)

Links to:
├─ Project: App Redesign
├─ Person: Marie
└─ Document: Budget Q1.xlsx
```

---

## Comparison with Other Tools

### vs Obsidian

| Feature | Obsidian | Synap |
|---------|----------|-------|
| **Links** | Manual `[[links]]` | Automatic + Manual |
| **Graph** | ✅ Visualization | ✅ Visualization + AI |
| **Relations** | Generic | Typed (mentions, assigned_to, etc.) |
| **Discovery** | Manual tags | AI suggestions |
| **Backlinks** | ✅ Yes | ✅ Yes |
| **API** | Plugin-based | Full API |

**When Obsidian is Better**:
- Markdown purists
- Offline-first simplicity
- Local files only

**When Synap is Better**:
- Want automatic connections
- Need typed relationships
- Building a platform/app
- Team collaboration

---

### vs Roam Research

| Feature | Roam | Synap |
|---------|------|-------|
| **Daily notes** | ✅ Core feature | ✅ Supported |
| **Block references** | ✅ Yes | ✅ via entities |
| **Graph** | ✅ Yes | ✅ + AI insights |
| **Auto-linking** | Page titles only | Everything (AI) |
| **Relation types** | ❌ No | ✅ Yes |
| **Self-hosted** | ❌ No | ✅ Yes |

---

## Real-World Example

Let's say you're working on an "App Redesign" project:

```
Initial State (Scattered):
- Note: "Competitor analysis"
- Note: "Meeting with Marie"
- Note: "Design ideas"
- Note: "Budget constraints"
- Task: "Create mockups"
- Task: "Review with team"

After Synap Processing:

[Project: App Redesign] (auto-created)
    ├─ contains ─> [Note: Competitor analysis]
    ├─ contains ─> [Note: Design ideas]
    ├─ contains ─> [Note: Budget constraints]
    ├─ has_task ─> [Task: Create mockups]
    │                   └─ assigned_to ─> [Marie]
    ├─ has_task ─> [Task: Review with team]
    └─ related_meeting ─> [Meeting: Marie Discussion]
                               └─ attendee ─> [Marie]

Now you can:
1. View "App Redesign" → See all related content
2. View "Marie" → See her involvement
3. Graph view → Visual connections
4. Search "budget" → Finds note via project link
```

---

## Best Practices

### 1. Let AI Do the Work

```typescript
// ✅ Good: Let AI extract entities
await synap.notes.create({
  content: "Call Marie about Project X budget before Friday"
});
// AI automatically creates:
// - Task entity
// - Marie contact link
// - Project X link
// - Due date

// ❌ Avoid: Manual entity creation for everything
// (Unless you need precise control)
```

---

### 2. Use Typed Relations

```typescript
// ✅ Good: Specific relation types
await synap.relations.create({
  source: 'task_123',
  target: 'person_marie',
  type: 'assigned_to'  // Clear semantics
});

// ⚠️ Less useful: Generic relations everywhere
await synap.relations.create({
  source: 'task_123',
  target: 'person_marie',
  type: 'related_to'  // Vague
});
```

---

### 3. Review AI Suggestions

```typescript
// Periodically check suggestions
const suggestions = await synap.graph.suggestConnections();

for (const suggestion of suggestions) {
  if (suggestion.confidence > 0.8) {
    // Apply high-confidence suggestions automatically
    await synap.graph.applySuggestion(suggestion.id);
  } else {
    // Review lower confidence manually
    showToUser(suggestion);
  }
}
```

---

## Next Steps

- **[Tutorial: Build a Graph View](../tutorials/knowledge-graph-view)** - Visualize your data
- **[Guide: Querying the Graph](../guides/by-feature/querying-graph)** - Advanced queries
- **[API Reference: Graph API](../reference/graph-api)** - Complete API docs
- **[Event Sourcing](./event-sourcing-explained)** - How it all works underneath

---

## Resources

- **Inspiration**: Obsidian, Roam Research, Notion relations
- **Technology**: PostgreSQL foreign keys + pgvector for semantic similarity
- **Visualization**: D3.js, Vis.js, Cytoscape.js compatible output
