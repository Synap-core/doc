---
sidebar_position: 2
---

# Hub Protocol Authentication

**Token-based authentication for Hub Protocol**

---

## Generate Access Token

The Hub requests a temporary access token from the Data Pod:

```typescript
POST /trpc/hub.generateAccessToken
{
  "requestId": "req-123",
  "scope": ["preferences", "calendar", "tasks"],
  "expiresIn": 300 // 1-5 minutes
}
```

**Response**:
```typescript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1737360000000,
  "requestId": "req-123"
}
```

---

## Token Usage

Use the token in subsequent requests:

```typescript
GET /trpc/hub.requestData
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Token Security

- **Time-limited**: Maximum 5 minutes validity
- **Scope-based**: Only authorized data types
- **Non-reusable**: Tied to unique requestId
- **Audit trail**: All token generation logged

---

**Next**: See [Data Request](./data-request.md) for requesting data.

