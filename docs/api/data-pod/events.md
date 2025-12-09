---
sidebar_position: 5
---

# Events API

**Event logging and retrieval**

---

## Event Structure

All events follow the SynapEvent schema:

```typescript
interface SynapEvent {
  id: string;                // UUID
  version: 'v1';             // Schema version
  type: string;              // Event type (e.g., 'entity.created')
  aggregateId?: string;      // Entity ID (optional)
  data: Record<string, unknown>;  // Event payload
  metadata?: Record<string, unknown>;  // Context (AI, import, sync)
  userId: string;            // Owner
  source: 'api' | 'automation' | 'sync' | 'migration' | 'system' | 'intelligence';
  timestamp: Date;
  correlationId?: string;    // Related events
  causationId?: string;      // Event that caused this
}
```

---

## Log Event

### User-Created Event

```typescript
POST /trpc/events.log
{
  "type": "note.creation.requested",
  "data": {
    "content": "My note",
    "title": "Meeting Notes"
  }
}
```

### AI-Created Event (with metadata)

```typescript
POST /trpc/events.log
{
  "type": "entity.created",
  "aggregateId": "entity-456",
  "source": "intelligence",
  "data": {
    "type": "task",
    "title": "Call John"
  },
  "metadata": {
    "ai": {
      "agent": "orchestrator",
      "confidence": { "score": 0.92 },
      "extraction": {
        "extractedFrom": {
          "messageId": "msg-123",
          "threadId": "thread-456"
        },
        "method": "explicit"
      }
    }
  }
}
```

---

## List Events

```typescript
GET /trpc/events.list
{
  "limit": 100,
  "offset": 0,
  "type": "entity.created"  // Optional filter
}
```

### Filter by AI-Created

```typescript
GET /trpc/events.list
{
  "limit": 100,
  "hasMetadata": true,  // Only events with metadata
  "source": "intelligence"  // Only AI-created
}
```

---

## Get Event

```typescript
GET /trpc/events.get
{
  "eventId": "event-123"
}
```

Returns:

```typescript
{
  "id": "event-123",
  "type": "entity.created",
  "data": { "type": "task", "title": "Call John" },
  "metadata": {
    "ai": {
      "agent": "orchestrator",
      "confidence": { "score": 0.92 }
    }
  },
  "source": "intelligence",
  "timestamp": "2024-12-09T01:00:00Z"
}
```

---

## Metadata Types

Events can carry optional metadata for context:

| Type | Purpose | Example |
|------|---------|---------|
| `ai` | AI enrichment | Agent, confidence, extraction source |
| `import` | Import context | Source system, external ID |
| `sync` | Device sync | Device ID, platform, offline |
| `automation` | Rule triggers | Rule ID, execution context |
| `custom` | Extensions | Your own metadata |

See [Event Metadata](../../architecture/event-metadata.md) for full details.

---

**Next**: See [Hub API](./hub.md) for Hub Protocol endpoints.
