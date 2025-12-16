---
sidebar_position: 7
---

# API Keys

**API key management for programmatic access**

---

## Create API Key

```typescript
POST /trpc/apiKeys.create
{
  "name": "My API Key",
  "scopes": ["read:notes", "write:notes"],
  "expiresAt": "2025-12-31T23:59:59Z" // Optional
}
```

---

## List API Keys

```typescript
GET /trpc/apiKeys.list
{
  "limit": 20,
  "offset": 0
}
```

---

## Revoke API Key

```typescript
POST /trpc/apiKeys.revoke
{
  "keyId": "key-123"
}
```

---

## Usage

```typescript
// Use API key in requests
GET /trpc/notes.list
Authorization: Bearer synap_xxx...
```

---

**Next**: See [Hub Protocol API](../hub-protocol/overview.md) for Hub endpoints.

