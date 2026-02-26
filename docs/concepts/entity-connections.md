---
sidebar_position: 4
---

# Entity Connections

**Two ways to link things — and why both exist**

Synap has two distinct mechanisms for expressing relationships between entities. Understanding when to use each one is key to building well-structured workspaces and making the most of the knowledge graph.

---

## The Two Systems at a Glance

| | **Structural links** (properties) | **Semantic relations** (relation objects) |
|---|---|---|
| **Where stored** | Entity's property values (`valueType: "entity_id"`) | `relations` table, typed by `relation_defs` |
| **Defined by** | Profile schema (designed at workspace setup) | Created on the fly, by user or AI |
| **Direction** | One-way (owned by the source entity) | Bi-directional, traversable both ways |
| **Discoverability** | Schema-first — you know what fields exist | Emergent — you discover them via graph queries |
| **Used in templates** | ✅ Yes — this is how templates wire things together | Optionally, for extra context |
| **Good for** | Core data model ("this task belongs to this project") | Knowledge graph ("this note references that decision") |
| **Created by** | User filling in forms, AI via structured output | User via whiteboard/connection UI, AI via graph tools |

---

## System 1: Structural Links (Property-Based)

A **structural link** is an `entity_id` property on a profile.

When a workspace profile defines a property with `valueType: "entity_id"`, that property *is* the relationship. The property value is the UUID of another entity. The schema tells you the relationship exists, and what it means.

### Example

A CRM workspace might define a **Deal** profile with these properties:

```json
{
  "slug": "deal",
  "properties": [
    { "slug": "contact",     "valueType": "entity_id", "label": "Primary Contact" },
    { "slug": "owner",       "valueType": "entity_id", "label": "Deal Owner" },
    { "slug": "company",     "valueType": "entity_id", "label": "Company" }
  ]
}
```

Each entity of type Deal then has `contact`, `owner`, and `company` as first-class fields pointing to other entities. This is exactly how Synap workspace templates work today.

### When to use structural links

- The relationship is **structural** — it's part of what an entity *is*, not something discovered later
- The relationship is **always present** for entities of that profile type (or at least expected)
- You want the link to show up as a **form field** users fill in
- The relationship has a **clear direction** (e.g., "a Deal has one Contact", not "entities are loosely related")
- You're defining a **workspace template** — use properties for all modelled relationships

### How they're rendered

`entity_id` properties are displayed as entity reference chips (a small card showing the linked entity's name and type). Clicking navigates to that entity. In table views, they appear as inline entity badges.

---

## System 2: Semantic Relations (Graph-Based)

A **semantic relation** is a record in the `relations` table, typed by a slug from `relation_defs`.

These relations are **workspace-scoped**, **bi-directional**, and **not tied to a profile schema**. They can be created between any two entities at any time — by users, by AI, or by automations.

### Example

```json
{
  "sourceEntityId": "note_planning_q1",
  "targetEntityId": "decision_hire_engineer",
  "type": "references",
  "metadata": { "confidence": 0.91 }
}
```

This relation was not defined in any profile schema. It was created because AI (or a user) noticed that the planning note referenced a decision entity.

### When to use semantic relations

- The relationship is **emergent** — discovered after the fact, not modelled upfront
- The relationship exists **between arbitrary entity types** with no schema dependency
- You want **rich graph traversal**: find all entities two hops away from X
- The relationship is **many-to-many** and not easily expressed as a property
- AI is building or annotating the knowledge graph
- Users are drawing connections on the whiteboard canvas

### Default relation types

Every workspace ships with 12 default semantic relation types, defined in `relation_defs`:

| Slug | Label | Category |
|---|---|---|
| `assigned_to` | Assigned To | workflow |
| `blocks` | Blocks | workflow |
| `depends_on` | Depends On | workflow |
| `relates_to` | Relates To | reference |
| `mentions` | Mentions | reference |
| `links_to` | Links To | reference |
| `references` | References | reference |
| `parent_of` | Parent Of | hierarchy |
| `created_by` | Created By | social |
| `attended_by` | Attended By | social |
| `belongs_to_project` | Belongs To Project | hierarchy |
| `tagged_with` | Tagged With | hierarchy |

You can create additional workspace-specific types via `trpc.relationDefs.create`.

---

## The Overlap — and Why That's Fine

You may notice that structural links and semantic relations can express similar things:

- A Deal entity could have a `contact` property (structural) pointing to a Contact entity
- *Or* you could create a `relates_to` semantic relation between a Deal and a Contact

The rule of thumb:

> **Use properties for things the profile schema owns. Use semantic relations for things the graph discovers.**

An `assignee` field on a Task is a structural link — it's part of the Task's data model.
A `references` relation between two documents is a semantic link — it emerged from content analysis.

In practice, both appear side-by-side in the entity's **Connections** panel, so users see one unified view regardless of the underlying system.

---

## The Unified Connections View

The `EntityRelationshipsDisplay` component and the `relations.getConnections` API unify both systems:

1. It fetches semantic relations from the `relations` table
2. It scans the entity's properties for `entity_id` values (structural links)
3. It also includes `thread_entities` — AI chat threads that created, updated, or referenced the entity

The result is a single list of connections with a `source` field indicating origin:

```typescript
type Connection = {
  entityId: string;         // The connected entity's ID
  entity?: Entity;          // Resolved entity object
  label: string;            // Human-readable relation name
  direction: "outgoing" | "incoming" | "structural";
  source: "graph" | "property" | "thread";
  // For graph relations:
  relationType?: string;
  // For property relations:
  propertySlug?: string;
  propertyLabel?: string;
  // For thread relations:
  threadId?: string;
  threadRelationshipType?: string;
};
```

### API usage

```typescript
// Get everything connected to an entity (all three sources)
const { connections } = await trpc.relations.getConnections.query({
  entityId: "entity_abc123",
});

// Filtered to only property-based structural links
const structural = connections.filter(c => c.source === "property");

// Filtered to semantic graph relations only
const graph = connections.filter(c => c.source === "graph");

// All threads that touched this entity
const threads = connections.filter(c => c.source === "thread");
```

---

## For Template Authors

When writing workspace templates (`.json` proposal files), use **properties** for all modelled relationships:

```json
{
  "profiles": [
    {
      "slug": "task",
      "properties": [
        { "slug": "assignee", "valueType": "entity_id", "label": "Assignee" },
        { "slug": "project",  "valueType": "entity_id", "label": "Project" }
      ]
    }
  ],
  "suggestedRelations": [
    {
      "sourceRef": "task:task-1",
      "targetRef": "task:task-2",
      "type": "blocks"
    }
  ]
}
```

- `properties` with `valueType: "entity_id"` → structural links (filled in per entity)
- `suggestedRelations` → semantic relations (graph edges seeded at workspace creation)

Both are valid. Use them together for the richest workspace setup.

---

## For AI / Agent Authors

When writing agent tools that touch relationships:

- **Write to properties** when updating well-defined entity fields (e.g., setting an assignee, linking a contact to a deal)
- **Write to `relations`** when discovering emergent connections (e.g., AI notices a note references a decision and creates a `references` graph edge)
- **Read `getConnections`** to traverse the full graph around any entity without needing to know which system the connections came from

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    Entity: "Q1 Planning Note"                   │
├──────────────────────────┬──────────────────────────────────────┤
│   STRUCTURAL LINKS       │   SEMANTIC RELATIONS                 │
│   (entity_id properties) │   (relations table)                  │
│                          │                                      │
│  project → "App Redesign"│  references → "Decision: Hire"       │
│  owner   → "Marie"       │  mentions   → "Contact: Paul"        │
│                          │  blocks     → "Note: Old Strategy"   │
├──────────────────────────┴──────────────────────────────────────┤
│                    THREAD CONNECTIONS                           │
│   AI Chat created this entity · 2 threads referenced it        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  Unified Connections Panel
              (users see one clean list of links)
```

---

## Related

- [Knowledge Graph Model](./knowledge-graph) — How Synap connects your data
- [Building Blocks](./building-blocks) — Entities, Profiles, and Views explained
- [API: `relations.getConnections`](../reference/events-api) — Fetch all connections for an entity
