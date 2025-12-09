---
sidebar_position: 2
---

# Data Pod API Authentication

**Authentication methods for programmatic access**

---

## Overview

The Data Pod API supports **two authentication methods**:

| Method | Use Case | Who | Status |
|--------|----------|-----|--------|
| **Kratos Session** | Web applications | Frontend apps, admin UI | ✅ Default |
| **API Keys** | Machine clients | n8n, scripts, Intelligence Hub | ✅ Recommended for automation |

:::tip Choosing Auth Method
- **Web apps**: Use Kratos sessions (cookies)
- **Automation**: Use API keys (Bearer tokens)
:::

---

## Method 1: Kratos Session (Web Apps)

**For browser-based applications**

### Login Flow

```typescript
// 1. Start login flow
GET /self-service/login/browser

// 2. Submit credentials
POST /self-service/login
{
  "identifier": "user@example.com",
  "password": "secure-password"
}

// 3. Kratos issues session cookie
Set-Cookie: ory_kratos_session=...; HttpOnly; Secure
```

### Use Session in API Calls

```typescript
// Session cookie automatically included
GET /trpc/notes.list
Cookie: ory_kratos_session=...

// Response (if authenticated)
{
  "result": {
    "data": [...]
  }
}
```

### tRPC Client Example

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@synap/api';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      credentials: 'include',  // Include cookies
    }),
  ],
});

// Automatically authenticated via session cookie
const notes = await client.notes.list.query();
```

---

## Method 2: API Keys (Automation)

**For scripts, n8n, external services**

### Create API Key

```typescript
// Must be authenticated first (Kratos session or existing API key)
POST /trpc/apiKeys.create
{
  "keyName": "n8n Production",
  "scope": ["notes", "tasks", "entities"],
  "expiresInDays": 90
}

// Response (key shown ONCE!)
{
  "key": "synap_user_abc123xyz...",
  "keyId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "⚠️ Save this key securely. It will not be displayed again."
}
```

:::warning Security
API keys are like passwords. Store securely and never commit to version control.
:::

### Use API Key in Requests

```typescript
// HTTP Request
GET /trpc/notes.list
Authorization: Bearer synap_user_abc123xyz...

// cURL example
curl -H "Authorization: Bearer synap_user_abc123xyz..." \
  http://localhost:3000/trpc/notes.list
```

### Node.js Client Example

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@synap/api';

const API_KEY = process.env.SYNAP_API_KEY;

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        authorization: `Bearer ${API_KEY}`,
      },
    }),
  ],
});

// Authenticated via API key
const notes = await client.notes.list.query();
```

### n8n Example

```json
{
  "name": "Get Synap Notes",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "GET",
    "url": "https://api.synap.ai/trpc/notes.list",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "httpHeaderAuth": {
      "name": "Authorization",
      "value": "=Bearer {{$credentials.synapApiKey}}"
    }
  }
}
```

---

## API Key Management

### List Your Keys

```typescript
GET /trpc/apiKeys.list

// Response
{
  "result": {
    "data": [
      {
        "id": "uuid-...",
        "keyName": "n8n Production",
        "keyPrefix": "synap_user_",
        "scope": ["notes", "tasks"],
        "isActive": true,
        "expiresAt": "2025-03-01T00:00:00Z",
        "lastUsedAt": "2025-12-07T18:00:00Z",
        "usageCount": 1523,
        "createdAt": "2024-12-01T00:00:00Z"
      }
    ]
  }
}
```

### Revoke a Key

```typescript
POST /trpc/apiKeys.revoke
{
  "keyId": "uuid-...",
  "reason": "Compromised credentials"
}
```

### Rotate a Key

```typescript
POST /trpc/apiKeys.rotate
{
  "keyId": "uuid-..."
}

// Returns new key, old key automatically revoked
{
  "newKey": "synap_user_xyz789...",
  "newKeyId": "uuid-...",
  "message": "⚠️ Save this key securely. The old key has been revoked."
}
```

---

## Scopes & Permissions

API keys support granular permissions:

```typescript
const AVAILABLE_SCOPES = [
  'preferences',       // User preferences
  'calendar',          // Calendar events
  'notes',             // Notes read/write
  'tasks',             // Tasks read/write
  'projects',          // Projects read/write
  'conversations',     // Chat/conversations
  'entities',          // All entities
  'relations',         // Entity relations
  'knowledge_facts',   // Knowledge graph
  'webhook:manage',    // Manage webhooks (for n8n)
];
```

**Example**: Read-only access
```typescript
{
  "scope": ["notes", "tasks"],  // No write permissions
}
```

**Example**: Full automation access
```typescript
{
  "scope": ["notes", "tasks", "webhook:manage"],
}
```

---

## Rate Limiting

API keys are rate-limited to prevent abuse:

| Operation | Limit | Window |
|-----------|-------|--------|
| Token generation | 10 requests | /minute |
| Data requests | 100 requests | /minute |
| Insight submission | 50 requests | /minute |

:::info Upgrading Limits
Contact support for higher rate limits on enterprise plans.
:::

---

## Security Best Practices

### API Keys

1. ✅ **Rotate regularly** - Every 90 days (auto-scheduled)
2. ✅ **Use environment variables** - Never hardcode keys
3. ✅ **Minimum scopes** - Only grant necessary permissions
4. ✅ **Monitor usage** - Check `usageCount` and `lastUsedAt`
5. ✅ **Revoke compromised keys** - Immediately if leaked

### Sessions

1. ✅ **HTTPS only** - Always use TLS in production
2. ✅ **HttpOnly cookies** - Prevent XSS attacks
3. ✅ **SameSite attribute** - Prevent CSRF attacks
4. ✅ **Short lifetime** - Sessions expire after 7 days inactivity

---

## Troubleshooting

### 401 Unauthorized

**Causes**:
- Invalid or expired API key
- Missing `Authorization` header
- Kratos session expired

**Solutions**:
```bash
# Check API key status
GET /trpc/apiKeys.list

# Verify header format
Authorization: Bearer synap_user_...  # Correct
Authorization: synap_user_...         # Wrong (missing "Bearer ")
```

### 403 Forbidden

**Cause**: API key lacks required scope

**Solution**: Create new key with additional scopes
```typescript
POST /trpc/apiKeys.create
{
  "scope": ["notes", "tasks", "webhook:manage"]  // Add missing scopes
}
```

### 429 Rate Limit Exceeded

**Cause**: Too many requests in time window

**Solution**: 
- Implement exponential backoff
- Cache responses
- Batch requests
- Contact support for higher limits

---

## Development Mode

For local development, bypass authentication with header:

```bash
curl -H "x-test-user-id: test-user-123" \
  http://localhost:3000/trpc/notes.list
```

:::caution Dev Only
This bypass only works when `NODE_ENV=development`. Never use in production!
:::

---

**Next**: 
- [API Keys Management](./api-keys.md) - Deep dive on key lifecycle
- [Hub Protocol Authentication](../hub-protocol/authentication.md) - Intelligence Hub specifics
