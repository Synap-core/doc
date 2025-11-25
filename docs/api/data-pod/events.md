---
sidebar_position: 5
---

# Events API

**Event logging and retrieval**

---

## Log Event

```typescript
POST /trpc/events.log
{
  "type": "note.creation.requested",
  "data": {
    "content": "My note"
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
  "type": "note.creation.requested" // Optional filter
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

---

**Next**: See [Hub API](./hub.md) for Hub Protocol endpoints.

