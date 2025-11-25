---
sidebar_position: 6
---

# Hub API

**Hub Protocol endpoints for external intelligence services communication**

---

## Generate Access Token

```typescript
POST /trpc/hub.generateAccessToken
{
  "requestId": "req-123",
  "scope": ["preferences", "calendar"],
  "expiresIn": 300
}
```

---

## Request Data

```typescript
GET /trpc/hub.requestData
{
  "token": "jwt-token",
  "scope": ["preferences", "calendar"],
  "filters": {
    "dateRange": {
      "start": "2025-05-01T00:00:00Z",
      "end": "2025-05-31T23:59:59Z"
    }
  }
}
```

---

## Submit Insight

```typescript
POST /trpc/hub.submitInsight
{
  "token": "jwt-token",
  "insight": {
    "version": "1.0",
    "type": "action_plan",
    "actions": []
  }
}
```

---

**Next**: See [Hub Protocol Documentation](../../architecture/hub-protocol-flow.md) for complete flow.

