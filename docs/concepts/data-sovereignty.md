---
sidebar_position: 1
---

# Data Sovereignty

**Understanding data ownership and control in the Synap ecosystem**

---

## Core Principle

**The Data Pod is the sovereign guardian of all user data.** External intelligence services never store user data persistently and only receive temporary, read-only access when explicitly authorized.

---

## Data Ownership Model

### Data Pod (Synap Core OS)
- ✅ **Owns all user data**
- ✅ **Controls all access**
- ✅ **Stores data permanently**
- ✅ **Open source** - user can self-host

### External Intelligence Services
- ❌ **Never store user data**
- ✅ **Receive temporary access only**
- ✅ **Process data in memory**
- ✅ **Return insights only**

---

## Access Control

### Token-Based Access

All external service access is controlled through time-limited JWT tokens:

```typescript
{
  token: string; // JWT with 5-minute TTL
  scope: string[]; // ['preferences', 'calendar', 'tasks']
  requestId: string; // Unique request identifier
}
```

### Scope-Based Permissions

External services can only request data types explicitly authorized:

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

## Audit Trail

Every interaction with external services is logged in the Data Pod's event store:

- `hub.token.generated` - Token generation
- `hub.data.requested` - Data request with scope
- `hub.insight.submitted` - Insight submission

**Example**:
```typescript
{
  type: 'hub.data.requested',
  userId: 'user-123',
  data: {
    requestId: 'req-456',
    scope: ['preferences', 'calendar'],
    timestamp: '2025-01-20T10:00:00Z',
  },
}
```

---

## GDPR Compliance

### Right to be Forgotten
Users can revoke external service access at any time:

```typescript
POST /trpc/hub.revokeAccess
{
  "hubId": "hub-123"
}
```

All active tokens are immediately invalidated.

### Data Portability
All data remains in the user's Data Pod. Users can export their data at any time.

### Transparency
Users can view the complete audit log of all external service access through the Data Pod API.

### Minimization
External services only request data that is strictly necessary for the requested operation.

---

## Data Processing Policy

### In External Services
- ✅ Data received in memory only
- ✅ No persistent storage
- ✅ Automatic garbage collection
- ✅ Anonymized error logs (IDs only, no content)

### Exceptions
- **Temporary cache**: Maximum 60-second TTL for performance (encrypted)
- **Debug logs**: Only IDs, never user content

---

## Best Practices

1. **Always request minimal scope** - Only ask for what you need
2. **Respect token expiration** - Never use expired tokens
3. **Log all access** - Complete audit trail
4. **Handle errors gracefully** - Don't expose user data in errors
5. **Implement data contracts** - Cryptographic commitments for compliance

---

**Next**: See [Hub Protocol Flow](../hub-protocol-flow.md) for complete flow documentation, or [Plugin System](./plugin-system.md) to learn how to add intelligence.

