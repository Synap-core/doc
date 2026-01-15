---
sidebar_position: 4
---

# Core Architecture Patterns

**Understanding Event Sourcing, CQRS, and the Synap Pattern**

---

## Overview

Data Pod uses three key patterns:

1. **Event Sourcing** - Store all changes as events
2. **CQRS** - Separate writes and reads
3. **Projections** - Materialized views from events

**Why This Matters**: Enables audit trails, AI approval workflows, and time travel debugging.

---

## Event Sourcing

### What Is It?

**Store every state change as an immutable event** instead of updating records.

### Traditional Approach

```typescript
// Update user's name
UPDATE users SET name = 'Alice' WHERE id = 1;

// ❌ Lost:
// - Who changed it?
// - When?
// - What was the old value?
// - Why did it change?
```

### Event Sourcing Approach

```typescript
// Append events (never update)
events = [
  { type: 'user.created', data: { id: 1, name: 'Bob' }, timestamp: '...' },
  { type: 'user.updated', data: { id: 1, name: 'Alice' }, timestamp: '...' }
]

// Current state = replay all events
let user = {};
for (const event of events) {
  user = apply(user, event);
}
// user = { id: 1, name: 'Alice' }
```

**✅ Benefits**:
- Complete audit trail
- Can rebuild any past state
- Never lose data
- Debug by replaying events

---

## CQRS (Command Query Responsibility Segregation)

### What Is It?

**Separate writes (commands) from reads (queries)**.

### Why Separate?

Different optimization needs:

**Writes**:
- Need validation
- Need audit trail
- Slower is OK
- Event sourcing friendly

**Reads**:
- Need speed
- Need complex queries
- Projection-based
- Cache-friendly

### The Pattern

```
Commands (Write)         Queries (Read)
     │                        │
     ▼                        ▼
┌─────────┐            ┌──────────┐
│ Events  │───────────▶│Projection│
│ (append)│            │ (table)  │
└─────────┘            └──────────┘
Slow, validated        Fast, optimized
```

---

## The Synap Pattern

### Command Side (Writes via Events)

```typescript
// User creates note
await client.rpc.notes.create.mutate({
  content: 'My note'
});

// Internally:
1. Validate input
2. Create event:
   {
     type: 'notes.create.requested',
     data: { content: 'My note' },
     userId: 'user-123',
     timestamp: new Date()
   }
3. Append to event store
4. Process event:
   - Validate
   - Publish 'notes.create.validated'
5. Update projection (notes table)
```

**Key**: Every write goes through events

---

### Query Side (Reads via API)

```typescript
// User lists notes
const notes = await client.rpc.notes.list.query();

// Internally:
1. Query projection (notes table)
2. Return data immediately

// NO events involved
// Fast, optimized SQL query
```

**Key**: Reads skip events, query projections directly

---

## Projections

### What Are They?

**Materialized views** built from events.

### Example

**Events (source of truth)**:
```typescript
[
  { type: 'note.created', id: '1', content: 'A', timestamp: '2024-01-01' },
  { type: 'note.updated', id: '1', content: 'B', timestamp: '2024-01-02' },
  { type: 'note.updated', id: '1', content: 'C', timestamp: '2024-01-03' }
]
```

**Projection (optimized for reads)**:
```sql
notes table:
id | content | created_at | updated_at | version
1  | C       | 2024-01-01 | 2024-01-03 | 3
```

### Rebuilding

```typescript
// Rebuild from events (if projection lost)
async function rebuildNotesProjection() {
  const events = await getEvents({ type: 'note.*' });
  
  for (const event of events) {
    switch (event.type) {
      case 'note.created':
        await db.insert(notes).values({
          id: event.data.id,
          content: event.data.content,
          created_at: event.timestamp,
          version: 1
        });
        break;
      
      case 'note.updated':
        await db.update(notes)
          .set({ 
            content: event.data.content,
            updated_at: event.timestamp,
            version: sql`version + 1`
          })
          .where(eq(notes.id, event.data.id));
        break;
    }
  }
}
```

**Power**: Can always rebuild state from events

---

## When to Use What

| Operation | Method | Pattern | Why |
|-----------|--------|---------|-----|
| **Create** | Events | Command | Audit trail, validation |
| **Update** | Events | Command | Track changes |
| **Delete** | Events | Command | Can undo |
| **Read one** | API | Query | Fast, direct |
| **Read many** | API | Query | Optimized joins |
| **Search** | API | Query | Indexed |
| **AI action** | Events | Command | Approval workflow |
| **Bulk import** | Events | Command | Preserve history |

---

## Complete Flow Example

### Creating a Note (Write)

```typescript
// Frontend
await client.rpc.notes.create.mutate({ 
  content: 'My note' 
});

// 1. tRPC router
export const notesRouter = router({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 2. Create event
      const event = {
        type: 'notes.create.requested',
        subjectId: generateId(),
        subjectType: 'note',
        data: { content: input.content },
        userId: ctx.userId,
        timestamp: new Date()
      };
      
      // 3. Publish event
      await publishEvent(event);
      
      return { noteId: event.subjectId };
    })
});

// 4. Event handler
async function handleNoteCreated(event) {
  // 5. Validate
  if (event.data.content.length > 10000) {
    throw new Error('Note too long');
  }
  
  // 6. Write to projection
  await db.insert(notes).values({
    id: event.subjectId,
    userId: event.userId,
    content: event.data.content,
    created_at: event.timestamp
  });
  
  // 7. Publish validated event
  await publishEvent({
    type: 'notes.create.validated',
    ...event
  });
}
```

---

### Reading Notes (Query)

```typescript
// Frontend
const notes = await client.rpc.notes.list.query();

// tRPC router
export const notesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Read directly from projection
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, ctx.userId))
      .orderBy(desc(notes.created_at));
  })
});

// No events involved!
// Fast SQL query
```

---

## Benefits

### 1. Complete Audit Trail

```sql
-- Who deleted this note?
SELECT * FROM events 
WHERE type = 'notes.delete.validated'
AND subject_id = 'note-123';

-- Result:
-- userId: 'alice'
-- timestamp: '2024-01-15 10:30:00'
-- source: 'web-app'
```

### 2. Time Travel

```typescript
// What did this note look like on Jan 1?
const events = await getEvents({
  subjectId: 'note-123',
  before: '2024-01-01'
});

let state = {};
for (const event of events) {
  state = apply(state, event);
}
// state = note content on Jan 1
```

### 3. AI Approval

```typescript
// AI proposes note creation
await publishEvent({
  type: 'notes.create.requested',
  source: 'ai-agent',
  data: { ... }
});

// Handler checks permissions
if (source === 'ai-agent') {
  // Queue for user review
  await queueForReview(event);
} else {
  // User actions auto-approve
  await validate(event);
}
```

### 4. Event Replay

```typescript
// Rebuild entire database from events
const events = await getAllEvents();

let state = {};
for (const event of events) {
  state = applyProjector(state, event);
}
// Full database rebuilt!
```

---

## Production Event Pattern: 3-Phase Flow

**Synap's production event system uses a 3-phase pattern for security and auditability.**

### The Pattern

```
User Action
    ↓
events.{action}.requested  (Intent submitted)
    ↓
Permission Validator Worker
    ├─ Check ownership
    ├─ Check workspace roles
    └─ Check AI approval
    ↓
events.{action}.approved  (Permission granted)
    ↓
CRUD Worker
    ├─ DB operation
    └─ Emit completion
    ↓
events.{action}.validated  (Operation complete)
    ↓
Real-time update to frontend
```

### Why 3 Phases?

**1. Security by Design**
- All permissions checked in one place (`permissionValidator` worker)
- Centralized logic, easy to audit
- Can't bypass permissions

**2. AI Approval Workflow**
- AI proposals emit `.requested` events
- User must explicitly approve
- Full transparency in event log

**3. Complete Audit Trail**
- Who requested (user or AI)
- Was it approved (and why)
- When was it validated (completed)

### Example Flow

```typescript
// User creates entity
await client.entities.create({
  type: 'note',
  title: 'Meeting Notes'
});

// Phase 1: Intent
await publishEvent({
  type: 'entities.create.requested',
  data: { type: 'note', title: 'Meeting Notes' },
  userId: 'alice'
});

// Phase 2: Permission Check (automatic)
// permissionValidator worker:
if (user === owner && action === 'create') {
  await publishEvent({
    type: 'entities.create.approved',
    data: {...},
    userId: 'alice'
  });
}

// Phase 3: Execution (automatic)
// entitiesWorker on .approved:
await db.insert(entities).values({...});
await publishEvent({
  type: 'entities.create.validated',
  data: { entityId: '...' }
});
```

---

## Dual-Write Pattern

**Every event is written to BOTH TimescaleDB and Inngest simultaneously.**

### The Pattern

```typescript
async function publishEvent(event, options) {
  // STEP 1: Write to TimescaleDB (audit trail)
  const [result] = await db.insert(events).values({
    type: event.type,
    data: event.data,
    userId: options.userId,
    timestamp: new Date()
  });
  
  // STEP 2: Send to Inngest (trigger workers)
  await inngest.send({
    name: event.type,
    data: { eventId: result.id, ...event.data },
    user: { id: options.userId }
  });
  
  return { eventId: result.id };
}
```

### Why Dual-Write?

**1. TimescaleDB (Persistent Audit Trail)**
- ✅ Immutable event log
- ✅ Time-series optimized
- ✅ Can query historical events
- ✅ Compressed automatically (~90% savings)

**2. Inngest (Instant Processing)**
- ✅ Triggers workers immediately
- ✅ Automatic retries
- ✅ Distributed execution
- ✅ Built-in observability

**3. Fault Tolerance**
- If Inngest fails: Event still in DB, retry later
- If DB fails: Operation fails safely (no partial state)
- Event log is always complete

---

## Worker-Based Permissions

**Permissions are checked in workers, not at API layer.**

### Why Workers?

**Traditional Approach Problems:**
```typescript
// ❌ API layer permission checks
router.delete.mutation(async ({ input, ctx }) => {
  // Check if user owns entity
  const entity = await db.query.entities.findFirst({
    where: eq(entities.id, input.id)
  });
  
  if (entity.userId !== ctx.userId) {
    throw new Error('Unauthorized');
  }
  
  await db.delete(entities).where(eq(entities.id, input.id));
});

// Problems:
// - Permission logic scattered across routers
// - No audit trail of permission decisions
// - Hard to add complex rules (roles, AI approval)
// - Can't replay decisions from events
```

**Worker Approach Benefits:**
```typescript
// ✅ Worker-based permissions
export const permissionValidator = inngest.createFunction(
  { id: 'permission-validator' },
  [{ event: 'entities.delete.requested' }],
  async ({ event, step }) => {
    const hasPermission = await step.run('check-permission', async () => {
      // Centralized permission logic
      const entity = await db.query.entities.findFirst({
        where: eq(entities.id, event.data.entityId)
      });
      
      return entity.userId === event.user.id;
    });
    
    if (hasPermission) {
      // Permission granted - emit approved event
      await publishEvent({
        type: 'entities.delete.approved',
        data: event.data,
        userId: event.user.id
      });
      
      return { approved: true, reason: 'Owner' };
    }
    
    return { approved: false, reason: 'Not owner' };
  }
);

// Benefits:
// ✅ All permission logic in one place
// ✅ Every decision is an event (audit trail)
// ✅ Easy to add roles, AI approval, etc.
// ✅ Testable independently
// ✅ Can replay permission decisions
```

---

## Advanced Patterns

### Snapshots

**Problem**: Replaying millions of events is slow

**Solution**: Periodic snapshots

```typescript
// Every 1000 events, save snapshot
if (eventCount % 1000 === 0) {
  await saveSnapshot({
    subjectId: 'user-123',
    state: currentState,
    version: eventCount
  });
}

// Rebuild from snapshot + recent events
const snapshot = await getLatestSnapshot('user-123');
let state = snapshot.state;

const recentEvents = await getEvents({
  after: snapshot.version
});

for (const event of recentEvents) {
  state = apply(state, event);
}
```

### Multiple Projections

**One event stream, many projections**:

```typescript
// Events (single source of truth)
notes.created, notes.updated, notes.deleted

// Projection 1: Notes table (for queries)
projection_notes: { id, content, created_at, ... }

// Projection 2: Full-text search index
projection_search: { note_id, searchable_text }

// Projection 3: Analytics
projection_stats: { user_id, note_count, last_activity }

// All built from same events!
```

---

## Comparison with Traditional

| Aspect | Traditional | Event Sourcing + CQRS |
|--------|-------------|----------------------|
| **Write** | UPDATE table | Append event |
| **Read** | SELECT FROM table | SELECT FROM projection |
| **History** | Lost | Complete |
| **Audit** | Manual logs | Automatic |
| **Rebuild** | Impossible | Replay events |
| **Performance** | Write-optimized | Read-optimized |
| **Complexity** | Low | Medium |

---

## Best Practices

### 1. Events Are Immutable

```typescript
// ✅ Good
await events.append(newEvent);

// ❌ Bad
await events.update(existingEvent); // Never!
```

### 2. Projections Are Disposable

```typescript
// ✅ Good - can rebuild
await dropTable('notes');
await rebuildFromEvents();

// Events are the source of truth
```

### 3. Validate Before Write

```typescript
// ✅ Good
if (validate(event.data)) {
  await publishValidatedEvent(event);
}

// ❌ Bad - write invalid data
await db.insert(notes).values(invalidData);
```

### 4. Keep Events Small

```typescript
// ✅ Good
{ type: 'note.updated', data: { content: 'new' } }

// ❌ Bad - huge payload
{ type: 'note.updated', data: { entire10MBDocument } }
```

---

## Troubleshooting

### "Projection out of sync"

**Solution**: Rebuild from events

```bash
pnpm rebuild-projections
```

### "Too slow"

**Solutions**:
1. Add indexes to projections
2. Use snapshots
3. Optimize event queries

### "Events growing too large"

**Solutions**:
1. Archive old events
2. Use snapshots
3. Compress events

---

## Next Steps

- [Event Architecture](../events/event-architecture) - Event types
- [API Reference](../../api/data-pod/events) - Event API
- [Why Events](../../getting-started/why-events) - Business value
- [Webhooks](../../integrations/webhooks-guide) - External systems

---

## Resources

- [Martin Fowler: Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Store Documentation](https://www.eventstore.com/event-sourcing)
