---
sidebar_position: 4
---

# Chat API

**Conversational interface for interacting with the AI agent**

---

## Send Message

```typescript
POST /trpc/chat.sendMessage
{
  "message": "Plan my trip to Lisbon",
  "threadId": "thread-123" // Optional
}
```

---

## Get Thread

```typescript
GET /trpc/chat.getThread
{
  "threadId": "thread-123"
}
```

---

## List Threads

```typescript
GET /trpc/chat.listThreads
{
  "limit": 20,
  "offset": 0
}
```

---

**Next**: See [Events API](./events.md) for event logging.

