---
sidebar_position: 1
---

# Authentication Architecture

**Three-layer authentication system for humans, machines, and enterprises**

---

## Overview

Synap uses a **layered authentication strategy** matching different use cases:

| Layer | Technology | Use Cases | Status |
|-------|------------|-----------|--------|
| **Layer 1: Human Users** | Ory Kratos | Web UI login, sessions | ✅ Operational |
| **Layer 2: Machine Clients** | API Keys + JWT | Intelligence Hub, n8n, integrations | ✅ Operational |
| **Layer 3: Enterprise OAuth2** | Ory Hydra | SSO, federation | 🔄 Planned |

:::info Current State
Layers 1 & 2 are production-ready. Layer 3 (Hydra) is configured but not yet deployed.
:::

---

## Architecture

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Authentication Architecture"
  value={`graph TD
    subgraph "Layer 1: Human Users"
        A[Web App] -->|Login| B[Ory Kratos]
        B -->|Session Cookie| A
        A -->|API Request + Cookie| C[tRPC API]
    end
    
    subgraph "Layer 2: Machine Clients"
        D[Intelligence Hub] -->|API Key| E[API Keys Service]
        E -->|Generate JWT| F[Short-lived Token]
        F -->|5min Token| C
        
        G[n8n Workflow] -->|API Key| E
    end
    
    subgraph "Layer 3: Enterprise (Future)"
        H[External OAuth2 Client] -.->|Client Credentials| I[Ory Hydra]
        I -.->|Access Token| C
    end
    
    C -->|Validate Auth| J[Protected Procedures]
    J -->|Execute| K[Business Logic]`} 
/>

---

## Layer 1: Human Users (Kratos)

**WHO**: End users logging into the Synap web interface  
**STATUS**: ✅ Fully operational

### Purpose

Manage user identities with:
- Email/password authentication
- OAuth social login (Google, GitHub)
- Session management
- Self-service flows (registration, login, password reset)

### Implementation

```typescript
// packages/api/src/context.ts
export async function createContext(req: Request): Promise<Context> {
  // DEV MODE: Bypass auth for testing
  const testUserId = req.headers.get('x-test-user-id');
  if (process.env.NODE_ENV === 'development' && testUserId) {
    return { db, authenticated: true, userId: testUserId, ... };
  }

  // PRODUCTION: Validate Kratos session
  const authModule = await import('@synap/auth');
  const session = await authModule.getSession(req.headers);
  
  if (session?.identity) {
    return {
      db,
      authenticated: true,
      userId: session.identity.id,
      user: {
        id: session.identity.id,
        email: session.identity.traits.email,
        name: session.identity.traits.name
      },
      session
    };
  }
  
  return { db, authenticated: false };
}
```

### Usage

**Login Flow**:
1. User visits `/self-service/login` (proxied from Kratos)
2. Kratos creates session and issues cookie
3. Browser sends cookie with each API request
4. `protectedProcedure` validates session via Kratos

**Docker Configuration**:
```yaml
# docker-compose.yml
kratos:
  image: oryd/kratos:v1.3.0
  profiles: ["auth"]  # Enable with: docker compose --profile auth up
  ports:
    - "4433:4433"  # Public API
    - "4434:4434"  # Admin API
```

---

## Layer 2: Machine Clients (API Keys)

**WHO**: Intelligence Hub, n8n, Zapier, external services  
**STATUS**: ✅ Production-ready (351 tests passing)

### Purpose

Long-lived credentials for automated systems with:
- bcrypt-hashed API keys
- Granular scope permissions
- Automatic rotation scheduling (90 days)
- Usage tracking and audit logs
- Rate limiting

### Database Schema

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_name TEXT NOT NULL,           -- "n8n Production"
  key_prefix TEXT NOT NULL,          -- 'synap_user_' | 'synap_hub_live_' | 'synap_hub_test_'
  key_hash TEXT NOT NULL,            -- Bcrypt cost factor 12
  scope TEXT[] NOT NULL,             -- ['notes', 'tasks', 'webhook:manage']
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count BIGINT DEFAULT 0,
  rotated_from_id UUID,
  rotation_scheduled_at TIMESTAMPTZ,  -- Auto-suggests after 90 days
  -- Audit trail
  created_at TIMESTAMPTZ, created_by TEXT,
  revoked_at TIMESTAMPTZ, revoked_by TEXT, revoked_reason TEXT
);
```

### Usage

**Create API Key**:
```typescript
// User authenticated via Kratos session
POST /trpc/apiKeys.create
{
  "keyName": "n8n Production",
  "scope": ["notes", "tasks", "entities"],
  "expiresInDays": 90
}

// Response (key shown ONCE!)
{
  "key": "synap_user_abc123xyz...",
  "keyId": "uuid-...",
  "message": "⚠️ Save this key securely. It will not be displayed again."
}
```

**Use API Key Directly** (e.g., n8n):
```typescript
POST /api/n8n/entities
Authorization: Bearer synap_user_abc123xyz...
{
  "type": "note",
  "content": "Meeting notes..."
}

// Synap validates key and executes action
```

**Hub Protocol Flow** (two-step):
```typescript
// Step 1: Hub requests short-lived token
POST /trpc/hub.generateAccessToken
Authorization: Bearer synap_hub_live_xyz...  // Long-lived API key
{
  "requestId": "req-123",
  "scope": ["notes", "tasks"],
  "expiresIn": 300  // 5 minutes
}

// Response: Short-lived JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1737360000000
}

// Step 2: Hub uses JWT for data access
POST /trpc/hub.requestData
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": ["notes"]
}
```

:::tip Why Two Steps?
API keys prove identity (long-lived), JWT tokens are scoped and time-limited (security best practice).
:::

### Implementation Files

- **Service**: `packages/api/src/services/api-keys.ts` (352 lines)
- **Router**: `packages/api/src/routers/api-keys.ts` (176 lines)
- **Schema**: `packages/database/src/schema/api-keys.ts` (102 lines)
- **Tests**: `packages/api/src/services/api-keys.test.ts` (351 lines, ✅ all passing)

---

## Layer 3: Enterprise OAuth2 (Hydra)

**WHO**: Enterprise OAuth2 clients, SSO federation  
**STATUS**: 🔄 Planned (code exists but not deployed)

### Purpose

Industry-standard OAuth2 for enterprise integrations:
- OAuth2 Client Credentials flow
- Authorization Code flow (PKCE)
- Token introspection
- Multi-tenant support

### Current State

:::warning Not Yet Deployed
The code infrastructure exists but Ory Hydra is not running in production. Deploy when enterprise demand requires OAuth2 standard instead of API keys.
:::

**Code Location**: `packages/auth/src/ory-hydra.ts`

```typescript
// OAuth2 client management (ready but unused)
export async function createOAuth2Client(client: {
  client_id: string;
  client_secret: string;
  grant_types: string[];
  scope: string;
}) {
  const { data } = await hydraAdmin.createOAuth2Client({
    oAuth2Client: client
  });
  return data;
}

// Token introspection (ready but unused)
export async function introspectToken(token: string) {
  const { data } = await hydraPublic.introspectOAuth2Token({ token });
  return data.active ? data : null;
}
```

### When to Deploy

Deploy Ory Hydra when you need:
- ✅ Enterprise SSO (SAML, OAuth2 federation)
- ✅ Multi-tenant OAuth2 clients
- ✅ Standards compliance (some enterprises require OAuth2 over API keys)
- ✅ Token introspection for distributed systems

**Estimated timeline**: When >5 enterprise customers request it.

---

## Comparison: When to Use What

| Use Case | Layer | Auth Method | Why |
|----------|-------|-------------|-----|
| Web UI login | Layer 1 | Kratos session | Human-friendly, multi-device |
| Intelligence Hub | Layer 2 | API Key → JWT | Proven in Hub Protocol V1.0 |
| n8n integration | Layer 2 | API Key | Simple, n8n-native |
| Personal scripts | Layer 2 | API Key | Easy setup, long-lived |
| Enterprise SSO | Layer 3 | OAuth2 (Hydra) | Industry standard |
| Zapier (public app) | Layer 3 | OAuth2 (Hydra) | Zapier requires OAuth2 |

---

## Security Best Practices

### For All Layers

1. **HTTPS Only** - All auth in production must use TLS
2. **Rate Limiting** - Prevent brute force attacks
3. **Audit Logging** - Log all authentication events
4. **Secret Rotation** - Regular key/token rotation

### Layer-Specific

**Kratos (Humans)**:
- ✅ Session cookies: HttpOnly, Secure, SameSite
- ✅ Password requirements: min 8 chars, complexity rules
- ✅ Multi-factor authentication (roadmap)

**API Keys (Machines)**:
- ✅ bcrypt hashing (cost factor 12)
- ✅ Automatic rotation scheduling (90 days)
- ✅ Scope enforcement (read vs write)
- ✅ Usage tracking and anomaly detection

**Hydra (Enterprise)**:
- 🔄 Short-lived access tokens (15min)
- 🔄 Refresh token rotation
- 🔄 Client secret hashing

---

## Migration Guide

### From No Auth → Kratos

See [Ory Setup Guide](../../deployment/data-pod/ory-setup.md)

### From API Keys → OAuth2 (Future)

When migrating to Hydra:
1. Keep API keys working (backward compatibility)
2. Add OAuth2 endpoint
3. Dual middleware (accept both)
4. Deprecate API keys over 6-12 months

---

## Troubleshooting

### "Session invalid" errors

**Cause**: Kratos not running or session expired  
**Solution**: 
```bash
# Start Kratos
docker compose --profile auth up -d

# Check Kratos health
curl http://localhost:4433/health/ready
```

### "API key validation failed"

**Cause**: bcrypt comparison error or key revoked  
**Solution**: 
- Check `api_keys` table: `is_active = true`
- Verify key prefix matches pattern
- Check expiration: `expires_at > NOW()`

### "OAuth2 client not found" (Future)

**Cause**: Hydra not deployed  
**Status**: Expected - Hydra is planned, not operational

---

**Next**: 
- [Data Confidentiality](./data-confidentiality.md) - Privacy details
- [Hub Protocol Flow](../hub-protocol-flow.md) - Plugin authentication flow
