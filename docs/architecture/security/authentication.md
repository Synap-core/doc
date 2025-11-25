---
sidebar_position: 1
---

# Authentication Architecture

**Complete authentication system using Ory Stack**

---

## Overview

Synap uses the **Ory Stack** for authentication:
- **Ory Kratos**: Identity management (users, sessions)
- **Ory Hydra**: OAuth2 server (API access, token exchange)

---

## Architecture

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Authentication Architecture"
  value={`graph TD
    A[Client App] -->|Login| B[Ory Kratos]
    B -->|Session Cookie| A
    A -->|API Request| C[Data Pod API]
    C -->|Validate Session| B
    C -->|Authorized| D[API Handler]
    
    E[External Service] -->|OAuth2| F[Ory Hydra]
    F -->|Access Token| E
    E -->|API Request| C
    C -->|Validate Token| F`} 
/>

---

## User Authentication (Kratos)

### Flow

1. User logs in via Kratos UI
2. Kratos creates session
3. Client stores session cookie
4. API validates session with Kratos

### Implementation

```typescript
// packages/auth/src/ory-kratos.ts
import { kratosPublic } from './ory-kratos.js';

export async function getSession(headers: Headers): Promise<Session | null> {
  const cookie = headers.get('cookie');
  if (!cookie) return null;
  
  const { data } = await kratosPublic.toSession({
    cookie,
  });
  
  return data;
}
```

---

## API Key Authentication

### For Programmatic Access

```typescript
// Create API key
POST /trpc/apiKeys.create
{
  "name": "My API Key",
  "scopes": ["read:notes", "write:notes"]
}

// Use API key
GET /trpc/notes.list
Authorization: Bearer synap_xxx...
```

---

## OAuth2 (Hydra)

### Client Credentials Flow

For service-to-service authentication:

```typescript
// External service requests token
POST /oauth2/token
{
  "grant_type": "client_credentials",
  "client_id": "service-id",
  "client_secret": "service-secret"
}

// Use token
GET /trpc/notes.list
Authorization: Bearer oauth2-token
```

---

## Token Exchange (RFC 8693)

For interoperability with other auth systems:

```typescript
POST /auth/token-exchange
{
  "subject_token": "external-token",
  "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "audience": "synap-api"
}
```

---

## Best Practices

1. **Use HTTPS** - Always in production
2. **Secure cookies** - HttpOnly, Secure, SameSite
3. **Token expiration** - Short-lived tokens
4. **Rate limiting** - Prevent brute force
5. **Audit logging** - Log all auth events

---

**Next**: See [Data Confidentiality](./data-confidentiality.md) for privacy details.
