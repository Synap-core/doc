---
sidebar_position: 8
---

# Permission Model

**Production-ready permission architecture with worker-based validation**

---

## Overview

Synap uses **worker-based permissions** - all authorization checks happen in the `permissionValidator` worker, not at the API layer. This provides:

- ✅ Centralized permission logic (one place to audit)
- ✅ Complete audit trail (every decision is an event)
- ✅ AI approval workflow (AI proposals require user confirmation)
- ✅ Extensible (easy to add roles, sharing, time-based permissions)

---

## Permission Matrix

| Resource Type | Owner | Admin | Editor | Viewer |
|---------------|:-----:|:-----:|:------:|:------:|
| **Personal Entity** | CRUD | ❌ | ❌ | ❌ |
| **Workspace Entity** | CRUD | CRUD | CRU | R |
| **Workspace Settings** | CRUD | CRU | ❌ | ❌ |
| **Member Management** | CRUD | CRU | ❌ | ❌ |

**Legend:** C=Create, R=Read, U=Update, D=Delete

---

## How It Works

### 1. User Creates Entity

```typescript
// Frontend
await client.entities.create({ type: 'note', title: 'My Note' });

// Publishing .requested event
await publishEvent({
  type: 'entities.create.requested',
  data: { type: 'note', title: 'My Note' },
  userId: 'alice'
});
```

### 2. Permission Validator Checks

```typescript
// permissionValidator worker (automatic)
if (action === 'create' && user === owner) {
  // ✅ Auto-approve owner creating their own resource
  await publishEvent({
    type: 'entities.create.approved',
    data: {...},
    userId: 'alice'
  });
}
```

### 3. Worker Executes

```typescript
// entitiesWorker on .approved event (automatic)
await db.insert(entities).values({...});

await publishEvent({
  type: 'entities.create.validated',
  data: { entityId: 'note_123' }
});
```

---

## AI Approval Workflow

AI-generated proposals require **explicit user approval**:

```typescript
// AI proposes creating a task
await publishEvent({
  type: 'entities.create.requested',
  data: { type: 'task', title: 'Call Marie' },
  metadata: { source: 'ai-proposal' }
});

// permissionValidator detects AI source
if (metadata.source === 'ai-proposal') {
  return {
    approved: false,
    reason: 'AI proposal requires user approval',
    pendingUserApproval: true
  };
}

// Frontend shows "Approve/Reject" dialog
// User clicks "Approve" → triggers new .requested without AI flag
```

---

## Workspace Roles

### Owner
- Created the workspace
- Full control (CRUD on everything)
- Can manage members
- Cannot be removed

### Admin
- Can create/update/delete resources
- Can invite members
- Can update settings
- Cannot delete workspace

### Editor
- Can create/update resources
- Cannot delete
- Cannot manage members

### Viewer
- Read-only access
- Cannot modify anything

---

## Audit Trail

Every permission decision is logged:

```sql
SELECT type, user_id, data, timestamp
FROM events_timescale
WHERE subject_id = 'entity_123'
  AND (type LIKE '%.approved' OR type LIKE '%.rejected')
ORDER BY timestamp;

-- Results show complete permission history
```

---

## Best Practices

### ✅ DO
- Let `permissionValidator` handle all authorization
- Use workspace roles for team collaboration
- Trust the audit trail for debugging

### ❌ DON'T
- Add permission checks in API routes (centralize in worker)
- Auto-approve AI proposals (require user confirmation)
- Skip permission checks for "internal" operations

---

## Next Steps

- [Event Flow](./event-flow) - Visual end-to-end diagram
- [Core Patterns](./core-patterns) - Architecture deep dive
- [Event Catalog](../reference/event-catalog) - All event types
