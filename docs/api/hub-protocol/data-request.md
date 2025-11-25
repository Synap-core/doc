---
sidebar_position: 3
---

# Data Request

**Requesting user data via Hub Protocol**

---

## Request Data

The Hub requests specific data using the access token:

```typescript
GET /trpc/hub.requestData
{
  "token": "jwt-token",
  "scope": ["preferences", "calendar"],
  "filters": {
    "dateRange": {
      "start": "2025-05-01T00:00:00Z",
      "end": "2025-05-31T23:59:59Z"
    },
    "limit": 100
  }
}
```

**Response**:
```typescript
{
  "userId": "user-123",
  "requestId": "req-123",
  "data": {
    "preferences": { ... },
    "calendar": [ ... ]
  },
  "metadata": {
    "retrievedAt": "2025-01-20T10:00:00Z",
    "scope": ["preferences", "calendar"],
    "recordCount": 42
  }
}
```

---

## Available Scopes

- `preferences` - User preferences
- `calendar` - Calendar events
- `notes` - Notes and documents
- `tasks` - Tasks and todos
- `projects` - Project data
- `conversations` - Chat history
- `entities` - General entities
- `relations` - Entity relationships
- `knowledge_facts` - Knowledge graph facts

---

**Next**: See [Insight Submission](./insight-submission.md) for submitting insights.

