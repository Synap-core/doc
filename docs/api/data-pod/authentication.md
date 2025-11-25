---
sidebar_position: 2
---

# Authentication

**Authentication methods for the Data Pod API**

---

## Ory Kratos (Recommended)

The Data Pod uses Ory Kratos for user authentication.

### Session-Based Auth

```typescript
// Login via Kratos
POST /self-service/login
{
  "identifier": "user@example.com",
  "password": "password"
}

// Use session cookie in API requests
GET /trpc/notes.list
Cookie: ory_kratos_session=...
```

### API Key Auth

For programmatic access:

```typescript
// Create API key
POST /trpc/apiKeys.create
{
  "name": "My API Key",
  "scopes": ["read:notes", "write:notes"]
}

// Use API key in requests
GET /trpc/notes.list
Authorization: Bearer synap_xxx...
```

---

## Token Exchange

For external services, use OAuth2 token exchange (RFC 8693):

```typescript
POST /auth/token-exchange
{
  "subject_token": "external-token",
  "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "audience": "synap-api"
}
```

---

**Next**: See [API Keys](./api-keys.md) for key management.

