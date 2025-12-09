---
sidebar_position: 2
---

# Hub Protocol Authentication

**Two-step authentication for Intelligence Hub**

---

## Overview

The Hub Protocol uses a **two-step authentication model**:

1. **API Key** (long-lived) - Proves Intelligence Hub identity
2. **JWT Token** (short-lived) - Scoped, time-limited access to data

```mermaid
sequenceDiagram
    participant Hub as Intelligence Hub
    participant Pod as Data Pod API
    participant Auth as API Key Service
    
    Note over Hub: Hub has long-lived API key<br/>(synap_hub_live_...)
    
    Hub->>Pod: 1. generateAccessToken()<br/>API Key: synap_hub_live_...
    Pod->>Auth: Validate API key
    Auth-->>Pod: ✓ Valid (userId, scopes)
    Pod->>Pod: Generate JWT (5min)
    Pod-->>Hub: 2. JWT token
    
    Hub->>Pod: 3. requestData()<br/>Token: JWT
    Pod->>Pod: Validate JWT
    Pod-->>Hub: 4. User data
```

---

## Step 1: Generate Access Token

The Hub requests a temporary JWT token using its long-lived API key:

### Request

```typescript
POST /trpc/hub.generateAccessToken
Authorization: Bearer synap_hub_live_abc123xyz...  // Long-lived API key
Content-Type: application/json

{
  "requestId": "req-550e8400-e29b-41d4-a716-446655440000",
  "scope": ["preferences", "notes", "tasks"],
  "expiresIn": 300  // 1-5 minutes (default: 300)
}
```

### Response

```typescript
{
  "result": {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsInJlcXVlc3RJZCI6InJlcS01NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJzY29wZSI6WyJwcmVmZXJlbmNlcyIsIm5vdGVzIiwidGFza3MiXSwiaWF0IjoxNzA3MzE3MjAwLCJleHAiOjE3MDczMTc1MDB9...",
      "expiresAt": 1707317500000,  // Unix time (ms)
      "requestId": "req-550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

:::info Token Lifetime
JWT tokens are valid for 1-5 minutes. After expiration, request a new token using the same API key.
:::

---

## Step 2: Use JWT Token for Data Access

Use the JWT token in subsequent Hub Protocol requests:

### Request Data

```typescript
POST /trpc/hub.requestData
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": ["notes", "tasks"],
  "filters": {
    "dateRange": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    },
    "limit": 100
  }
}
```

### Submit Insight

```typescript
POST /trpc/hub.submitInsight
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "insight": {
    "type": "action_plan",
    "title": "Weekly task summary",
    "correlationId": "req-550e8400-e29b-41d4-a716-446655440000",
    "actions": [...]
  }
}
```

### Semantic Search

```typescript
POST /trpc/hub.semanticSearch
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "query": "project ideas related to AI",
  "limit": 10
}
```

---

## Creating API Keys for Intelligence Hub

API keys must be created by authenticated users via the Data Pod UI:

```typescript
// User authenticated via Kratos session
POST /trpc/apiKeys.create
{
  "keyName": "Intelligence Hub Production",
  "scope": ["preferences", "notes", "tasks", "entities"],
  "hubId": "synap-hub-prod",  // Marks as Hub key
  "expiresInDays": 365
}

// Response
{
  "key": "synap_hub_live_abc123xyz...",  // Use this for generateAccessToken
  "keyId": "uuid-...",
  "message": "⚠️ Save this key securely. It will not be displayed again."
}
```

:::warning Hub vs User Keys
Setting `hubId` changes the key prefix:
- With `hubId`: `synap_hub_live_` or `synap_hub_test_`
- Without `hubId`: `synap_user_`

This is for organizational purposes only - all keys work the same way.
:::

---

## Security Features

### Time-Limited Tokens

- **JWT lifetime**: Maximum 5 minutes
- **Purpose**: Minimize blast radius if token leaked
- **Refresh**: Request new token when needed (no expiry on API key)

### Scope Enforcement

Tokens are limited to requested scopes:

```typescript
// generateAccessToken with scope ["notes"]
{
  "scope": ["notes"]  // Can only access notes
}

// Trying to access tasks will fail
POST /trpc/hub.requestData
{
  "scope": ["tasks"]  // ❌ 403 Forbidden
}
```

### Correlation IDs

Each Hub request cycle has a unique `requestId`:

```typescript
// generateAccessToken
{
  "requestId": "req-abc-123"
}

// submitInsight must use same correlationId
{
  "insight": {
    "correlationId": "req-abc-123"  // Must match!
  }
}

// Mismatch = rejected
{
  "correlationId": "req-xyz-789"  // ❌ 400 Bad Request
}
```

### Audit Trail

All Hub Protocol operations are logged:

```sql
-- events table
SELECT * FROM events 
WHERE type IN (
  'hub.token.generated',
  'hub.data.requested',
  'hub.insight.submitted'
)
AND user_id = 'user-123';
```

---

## Error Handling

### Token Expired

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Solution**: Request new token via `generateAccessToken`

### Invalid Scope

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Token does not have access to scopes: tasks"
  }
}
```

**Solution**: Request token with correct scopes

### Correlation ID Mismatch

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Correlation ID mismatch. Expected: req-abc-123, Got: req-xyz-789"
  }
}
```

**Solution**: Use same `requestId` from token generation

---

## Best Practices

### 1. Token Caching

Cache JWT tokens until near expiration:

```typescript
class HubClient {
  private tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  async getToken() {
    const now = Date.now();
    const buffer = 30000; // 30s buffer
    
    if (this.tokenCache && this.tokenCache.expiresAt > now + buffer) {
      return this.tokenCache.token;  // Reuse valid token
    }
    
    // Request new token
    const { token, expiresAt } = await this.pod.hub.generateAccessToken({
      requestId: generateUUID(),
      scope: ['notes', 'tasks'],
    });
    
    this.tokenCache = { token, expiresAt };
    return token;
  }
}
```

### 2. Minimal Scopes

Request only needed scopes:

```typescript
// Good: Specific scopes
{
  "scope": ["notes", "tasks"]
}

// Bad: Too broad
{
  "scope": ["preferences", "calendar", "notes", "tasks", "projects", "conversations"]
}
```

### 3. Unique Request IDs

Use UUIDs for correlation:

```typescript
import { randomUUID } from 'crypto';

const requestId = randomUUID();  // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

---

## TypeScript SDK Example

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@synap/api';

const API_KEY = process.env.SYNAP_HUB_API_KEY;

class IntelligenceHubClient {
  private pod = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'https://datapod.synap.ai/trpc',
        headers: {
          authorization: `Bearer ${API_KEY}`,
        },
      }),
    ],
  });
  
  async analyzeUserData(userId: string) {
    // Generate access token
    const { token, requestId } = await this.pod.hub.generateAccessToken.mutate({
      requestId: randomUUID(),
      scope: ['notes', 'tasks'],
      expiresIn: 300,
    });
    
    // Request user data
    const { data } = await this.pod.hub.requestData.query({
      token,
      scope: ['notes', 'tasks'],
    });
    
    // Analyze data...
    const insight = analyzeData(data);
    
    // Submit insight back to Data Pod
    await this.pod.hub.submitInsight.mutate({
      token,
      insight: {
        type: 'action_plan',
        title: 'Weekly Summary',
        correlationId: requestId,  // Match!
        actions: insight.actions,
      },
    });
  }
}
```

---

**Next**: 
- [Data Request](./data-request.md) - Requesting user data
- [Submit Insight](./submit-insight.md) - Submitting analysis results
- [API Keys](../data-pod/api-keys.md) - Managing API keys
