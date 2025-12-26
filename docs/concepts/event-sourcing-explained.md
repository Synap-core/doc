---
sidebar_position: 2
---

# Event Sourcing Explained

**Why Synap never forgets: Time-travel, audit trails, and infinite undo**

Instead of updating data and losing history, Synap records every change as an immutable event. This enables capabilities impossible in traditional systems.

---

## The Traditional Approach (and Its Problems)

### How Most Apps Work:

```sql
-- Traditional database update
UPDATE notes
SET content = 'New content', updated_at = NOW()
WHERE id = 'note_123';

-- After this UPDATE:
❌ Old content: GONE FOREVER
❌ Who changed it: Unknown
❌ Why changed: Unknown
❌ When exactly: Only latest timestamp
❌ Undo: IMPOSSIBLE
```

**What's Lost**:
- Complete history
- Change attribution
- Reasoning/context
- Ability to undo
- Audit trail
- Debugging capability

---

## Event Sourcing: A Better Way

### How Synap Works:

```typescript
// Instead of UPDATE, we APPEND events
events = [
  {
    id: 'evt_1',
    type: 'note.created',
    data: { id: 'note_123', content: 'Original' },
    userId: 'alice',
    timestamp: '2024-12-01T10:00:00Z'
  },
  {
    id: 'evt_2',
    type: 'note.updated',
    data: { id: 'note_123', content: 'First edit' },
    userId: 'alice',
    timestamp: '2024-12-05T14:30:00Z'
  },
  {
    id: 'evt_3',
    type: 'note.updated',
    data: { id: 'note_123', content: 'Second edit' },
    userId: 'bob',
    timestamp: '2024-12-10T09:15:00Z'
  }
];

// Current state = replay all events
let note = {};
for (const event of events) {
  note = apply(note, event);
}
// note.content === 'Second edit'
```

**What's Preserved**:
- ✅ Complete history
- ✅ Who made each change
- ✅ Exact timestamps
- ✅ Can undo to any point
- ✅ Full audit trail
- ✅ Can replay/debug

---

## 5 Superpowers Events Enable

### 1. Time-Travel

**Go back to any point in time**:

```typescript
// What did this note look like on December 5th?
const events = await synap.events.getHistory({
  subjectId: 'note_123',
  before: '2024-12-05T23:59:59Z'
});

let note = {};
for (const event of events) {
  note = apply(note, event);
}
// note.content === 'First edit' (before Bob's change)
```

**UI You Can Build**:
```
┌────────────────────────────────────┐
│ Note: Marketing Plan               │
├────────────────────────────────────┤
│ View as of: [Dec 5, 2024  ▼]     │
│                                    │
│ Content (as it was on Dec 5):      │
│ "First edit..."                    │
│                                    │
│ [View Current] [Restore This]      │
└────────────────────────────────────┘
```

---

### 2. Infinite Undo

**Undo anything, anytime**:

```typescript
// Undo last 3 changes
await synap.history.undo({
  subjectId: 'note_123',
  count: 3
});

// Or undo to specific event
await synap.history.undoTo({
  subjectId: 'note_123',
  eventId: 'evt_5'
});

// Or undo all changes by specific user
await synap.history.undoBy({
  userId: 'bob'
});
```

**UI You Can Build**:
```
┌────────────────────────────────────┐
│ History                            │
├────────────────────────────────────┤
│ ● Bob edited content (2 min ago)   │
│   "Second edit"                    │
│   [Undo] [View]                    │
│                                    │
│ ● Alice edited content (5 days ago)│
│   "First edit"                     │
│   [Undo to here]                   │
│                                    │
│ ● Alice created note (10 days ago) │
│   "Original"                       │
└────────────────────────────────────┘
```

---

### 3. Full Audit Trail

**Know exactly what happened**:

```typescript
// Who deleted this note?
const events = await synap.events.query({
  type: 'note.deleted',
  subjectId: 'note_123'
});

// Result:
{
  type: 'note.deleted',
  userId: 'bob',
  timestamp: '2024-12-15T16:45:00Z',
  source: 'web-app',
  metadata: {
    ipAddress: '192.168.1.1',
    userAgent: 'Chrome/120...',
    reason: 'user_action'
  }
}
```

**UI You Can Build**:
```
┌────────────────────────────────────┐
│ Audit Log                          │
├────────────────────────────────────┤
│ Dec 15, 4:45 PM                    │
│ Bob deleted "Marketing Plan"       │
│ From: Chrome (192.168.1.1)         │
│ [Restore] [Details]                │
│                                    │
│ Dec 10, 9:15 AM                    │
│ Bob edited "Marketing Plan"        │
│ [View Changes]                     │
│                                    │
│ Dec 5, 2:30 PM                     │
│ Alice edited "Marketing Plan"      │
│ [View Changes]                     │
└────────────────────────────────────┘
```

---

### 4. AI Transparency

**Understand why AI did something**:

```typescript
// AI suggested a task - why?
const event = await synap.events.get('evt_ai_suggestion');

// event.metadata.ai:
{
  agent: 'orchestrator',
  reasoning: {
    steps: [
      {
        thought: "User mentioned calling Marie tomorrow",
        action: "Extract task entity",
        confidence: 0.95
      },
      {
        thought: "Task has temporal constraint (tomorrow)",
        action: "Set due date to 2024-12-20",
        confidence: 0.98
      }
    ],
    outcome: {
      action: 'create_task',
      entity: {
        title: 'Call Marie',
        dueDate: '2024-12-20'
      }
    }
  },
  durationMs: 1523
}
```

**UI You Can Build**:
```
┌────────────────────────────────────┐
│ AI Suggestion: Create Task         │
├────────────────────────────────────┤
│ ✅ Task: "Call Marie"              │
│ 📅 Due: Tomorrow                   │
│                                    │
│ Why did AI suggest this?           │
│ [Show Reasoning ▼]                 │
│                                    │
│ AI Reasoning Trail:                │
│ 1. Detected action phrase          │
│    "Call Marie tomorrow"           │
│    Confidence: 95%                 │
│                                    │
│ 2. Extracted temporal constraint   │
│    "tomorrow" → Dec 20             │
│    Confidence: 98%                 │
│                                    │
│ [Accept] [Modify] [Reject]         │
└────────────────────────────────────┘
```

---

### 5. Disaster Recovery

**Rebuild everything from events**:

```typescript
// Database corrupted? Rebuild from events!
async function rebuildDatabase() {
  // 1. Clear all projections (tables)
  await db.truncate(['notes', 'tasks', 'projects']);
  
  // 2. Replay all events in order
  const events = await synap.events.getAll({
    orderBy: 'timestamp'
  });
  
  for (const event of events) {
    await applyEvent(event);  // Rebuild state
  }
  
  // 3. Database fully restored!
}
```

**Why This Matters**:
- Events = source of truth
- Projections = disposable views
- Can always rebuild
- No data loss even if DB corrupted

---

## How It Works: Events → State

### 1. Event Structure

```typescript
type SynapEvent = {
  // Identity
  id: string;              // evt_abc123
  timestamp: Date;         // When it happened
  
  // What
  type: string;            // note.created, task.updated
  subjectId: string;       // What entity this affects
  subjectType: string;     // note, task, project
  data: Record<string, any>;  // The actual change
  
  // Who/Where
  userId: string;          // Who did it
  source: string;          // web-app, mobile, api, ai-agent
  
  // Why (optional but powerful)
  metadata?: {
    ai?: AIReasoningTrace;
    import?: ImportContext;
    sync?: SyncMetadata;
  };
  
  // Tracing
  correlationId?: string;  // Group related events
};
```

---

### 2. Event Types

```typescript
// Creation events
'note.created'
'task.created'
'project.created'

// Update events
'note.updated'
'task.completed'
'project.archived'

// Delete events (soft delete)
'note.deleted'

// Relation events
'relation.created'
'entity.tagged'

// AI events
'suggestion.created'
'agent.invoked'
```

---

### 3. Event Application

```typescript
// How events become state
function apply(state: Note, event: SynapEvent): Note {
  switch (event.type) {
    case 'note.created':
      return {
        id: event.data.id,
        content: event.data.content,
        createdAt: event.timestamp,
        createdBy: event.userId
      };
      
    case 'note.updated':
      return {
        ...state,
        content: event.data.content,
        updatedAt: event.timestamp,
        updatedBy: event.userId
      };
      
    case 'note.deleted':
      return {
        ...state,
        deletedAt: event.timestamp,
        deletedBy: event.userId
      };
  }
}
```

---

## Events + Projections

**Two-part system**:

```
Events (Source of Truth)
├─ Immutable
├─ Append-only
├─ Complete history
└─ Slow to query

      ↓ Build

Projections (Fast Views)
├─ Mutable
├─ Can be rebuilt
├─ current state
└─ Fast to query
```

### Example:

```
Events Table:
┌─────┬──────────────┬────────┬──────────────┐
│ id  │ type         │ data   │ timestamp    │
├─────┼──────────────┼────────┼──────────────┤
│ e1  │note.created  │{...}   │ 2024-12-01   │
│ e2  │note.updated  │{...}   │ 2024-12-05   │
│ e3  │note.updated  │{...}   │ 2024-12-10   │
└─────┴──────────────┴────────┴──────────────┘
      ↓ Build projection

Notes Table (Projection):
┌─────┬─────────────┬────────────┬────────────┐
│ id  │ content     │ created_at │ updated_at │
├─────┼─────────────┼────────────┼────────────┤
│ n1  │Second edit  │ 2024-12-01 │ 2024-12-10 │
└─────┴─────────────┴────────────┴────────────┘
      ↑ Current state (fast queries)
```

**Query Flow**:

```typescript
// Write: Goes through events
await synap.notes.create({...});
// → Creates event
// → Worker processes event
// → Updates projection

// Read: Queries projection (fast!)
const notes = await synap.notes.list();
// → SELECT * FROM notes (no event replay needed)
```

---

## Comparison with Traditional

| Aspect | Traditional DB | Event Sourcing |
|--------|---------------|----------------|
| **Write** | UPDATE table | APPEND event |
| **History** | ❌ Lost | ✅ Complete |
| **Undo** | ❌ Impossible | ✅ Easy |
| **Audit** | ⚠️ Manual logs | ✅ Automatic |
| **Recovery** | ⚠️ Backups only | ✅ Replay events |
| **Debugging** | ❌ Hard | ✅ Full trace |
| **AI transparency** | ❌ Hidden | ✅ Full reasoning |
| **Complexity** | Low | Medium |

---

## Real-World Examples

### Example 1: Collaborative Note

```
Events:
1. Alice creates note "Meeting Notes"
2. Bob adds "Action items: ..."
3. Alice edits title to "Team Meeting Dec 15"
4. Charlie comments "Great summary!"
5. Bob marks action item complete

UI Shows:
- Current state: Latest version
- History timeline: All 5 changes
- Contributors: Alice, Bob, Charlie
- Undo: Any change
- Time-travel: View after step 3
```

---

### Example 2: AI Suggestion Audit

```
Events:
1. User types "call marie tomorrow"
2. AI detects task intent (evt with reasoning)
3. AI suggests task creation
4. User approves
5. Task created

User asks: "Why did you create this task?"

Synap shows:
- Event #2 reasoning trace
- Confidence scores
- Entity extraction steps
- Temporal parsing logic

Full transparency!
```

---

## Best Practices

### 1. Events are Immutable

```typescript
// ✅ Good: Append new event
await synap.events.append({
  type: 'note.updated',
  data: { content: 'New content' }
});

// ❌ NEVER: Modify existing event
await synap.events.update(eventId, {...});  // Don't do this!
```

---

### 2. Projections are Disposable

```typescript
// ✅ Good: Rebuild projection if needed
await synap.projections.rebuild('notes');

// Events are source of truth
// Projections can always be regenerated
```

---

### 3. Rich Event Metadata

```typescript
// ✅ Good: Context-rich events
await synap.events.append({
  type: 'note.updated',
  data: { content: 'New' },
  metadata: {
    ai: { reasoning: {...} },
    userContext: { device: 'mobile' },
    editSession: { duration: 180, keystrokes: 45 }
  }
});

// ⚠️ Missing context
await synap.events.append({
  type: 'note.updated',
  data: { content: 'New' }
  // No metadata = less debuggability
});
```

---

### 4. Meaningful Event Types

```typescript
// ✅ Good: Specific event types
'note.content_updated'
'note.title_changed'
'note.archived'

// ⚠️ Less useful: Generic
'note.changed'  // What changed?
```

---

## Synap's Production Implementation

**How Synap implements event sourcing in production**

### 3-Phase Event Pattern

Synap uses a **3-phase event flow** for security and transparency:

```
Phase 1: REQUESTED
  └─ User or AI expresses intent
  └─ Event: entities.create.requested
  
Phase 2: APPROVED
  └─ Permission validator checks authorization
  └─ Event: entities.create.approved
  
Phase 3: VALIDATED
  └─ Worker executes DB operation
  └─ Event: entities.create.validated
```

**Why 3 Phases?**

1. **Security**: Centralized permission checks
2. **AI Transparency**: AI proposals require user approval
3. **Audit Trail**: Complete record of who requested, who approved, when executed

### Real Example

```typescript
// User clicks "Create Note" in UI
await client.entities.create({ 
  type: 'note', 
  content: 'My note' 
});

// Behind the scenes:

// 1. API publishes .requested event
await publishEvent({
  type: 'entities.create.requested',
  data: { type: 'note', content: 'My note' },
  userId: 'alice'
});

// 2. permissionValidator worker checks permissions
if (user is owner && action === 'create') {
  await publishEvent({
    type: 'entities.create.approved',
    data: {...},
    userId: 'alice'
  });  // ✅ Auto-approved
}

// 3. entitiesWorker creates entity
await db.insert(entities).values({...});
await publishEvent({
  type: 'entities.create.validated',
  data: { entityId: 'note_123' }
});

// 4. Real-time update to frontend via Socket.IO
```

**Query the history:**
```sql
SELECT type, timestamp, data
FROM events_timescale
WHERE subject_id = 'note_123'
ORDER BY timestamp;

-- Results:
-- entities.create.requested  | 2024-12-26 14:30:00
-- entities.create.approved   | 2024-12-26 14:30:01
-- entities.create.validated  | 2024-12-26 14:30:02
```

---

### Dual-Write Pattern

**Every event written to BOTH TimescaleDB and Inngest:**

```typescript
async function publishEvent(event, options) {
  // 1. Persist to TimescaleDB (permanent audit trail)
  const [result] = await db.insert(events).values({
    type: event.type,
    data: event.data,
    userId: options.userId,
    timestamp: new Date()
  });
  
  // 2. Trigger Inngest workers (immediate processing)
  try {
    await inngest.send({
      name: event.type,
      data: { eventId: result.id, ...event.data }
    });
  } catch (error) {
    // Mark for retry if Inngest fails
    await db.update(events)
      .set({ metadata: { inngest_pending: true } })
      .where(eq(events.id, result.id));
  }
  
  return { eventId: result.id };
}
```

**Benefits:**
- ✅ TimescaleDB: Permanent, queryable, compressed
- ✅ Inngest: Instant workers, retries, observability
- ✅ Fault tolerant: Event always saved even if worker fails

---

### Worker-Based Permissions

**Permissions validated in workers, not API layer:**

```typescript
// Permission validator worker
export const permissionValidator = inngest.createFunction(
  { id: 'permission-validator' },
  [
    { event: 'entities.create.requested' },
    { event: 'entities.update.requested' },
    { event: 'entities.delete.requested' },
  ],
  async ({ event }) => {
    // Check if AI proposal
    if (event.data.metadata?.source === 'ai-proposal') {
      return { approved: false, reason: 'Requires user approval' };
    }
    
    // Check ownership
    if (event.data.userId === event.user.id) {
      await publishEvent({
        type: event.name.replace('.requested', '.approved'),
        data: event.data,
        userId: event.user.id
      });
      return { approved: true, reason: 'Owner' };
    }
    
    return { approved: false, reason: 'Not authorized' };
  }
);
```

**Why workers?**
- ✅ Centralized permission logic
- ✅ Every decision is an audited event
- ✅ Easy to extend (roles, sharing, etc.)
- ✅ AI approval workflow built-in

---

## Performance Considerations

### Snapshots for Speed

**Problem**: Replaying 1 million events is slow.

**Solution**: Periodic snapshots.

```typescript
// Every 1000 events, save snapshot
if (eventCount % 1000 === 0) {
  await saveSnapshot({
    aggregateId: 'note_123',
    state: currentState,
    version: eventCount
  });
}

// Rebuild from snapshot + recent events
const snapshot = await getLatestSnapshot('note_123');
let state = snapshot.state;  // Start here

const recentEvents = await getEventsSince(snapshot.version);
for (const event of recentEvents) {
  state = apply(state, event);
}
// Much faster!
```

---

## Next Steps

- **[Tutorial: Build Activity Timeline](../tutorials/activity-timeline)** - Event-based UI
- **[Guide: Event-Driven Workflows](../guides/by-feature/event-workflows)** - Advanced patterns
- **[API Reference: Events API](../reference/events-api)** - Complete event API
- **[What is Synap?](./what-is-synap)** - How events enable superpowers

---

## Resources

- **Theory**: [Martin Fowler - Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- **Implementation**: [Event Store Documentation](https://www.eventstore.com/event-sourcing)
- **CQRS**: Command Query Responsibility Segregation pattern
