---
sidebar_position: 2
---

# Data Confidentiality

**How Synap ensures data privacy and sovereignty**

---

## Core Principle

**The Data Pod is the sovereign guardian of all user data.** External services never store user data persistently and only receive temporary, read-only access when explicitly authorized.

---

## Mechanisms

### 1. Temporary Access Tokens

All external service access uses time-limited JWT tokens:

- **Maximum validity**: 5 minutes
- **Scope-based**: Only authorized data types
- **Non-reusable**: Tied to unique requestId
- **Audit trail**: All token generation logged

### 2. Read-Only Access

External services can only:
- ✅ Request specific data types (scope-based)
- ✅ Read data (never write)
- ✅ Submit insights (transformed to events by Data Pod)

External services cannot:
- ❌ Store data persistently
- ❌ Access data without explicit authorization
- ❌ Write directly to database

### 3. Audit Trail

Every interaction is logged:

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

## Data Processing Policy

### In External Services

- ✅ Data received in memory only
- ✅ No persistent storage
- ✅ Automatic garbage collection
- ✅ Anonymized error logs (IDs only)

### Exceptions

- **Temporary cache**: Maximum 60-second TTL (encrypted)
- **Debug logs**: Only IDs, never user content

---

## GDPR Compliance

### Right to be Forgotten

Users can revoke external service access at any time:

```typescript
POST /trpc/hub.revokeAccess
{
  "serviceId": "service-123"
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

## Best Practices

1. **Request minimal scope** - Only ask for what you need
2. **Respect token expiration** - Never use expired tokens
3. **Log all access** - Complete audit trail
4. **Handle errors gracefully** - Don't expose user data in errors
5. **Implement data contracts** - Cryptographic commitments for compliance

---

**Next**: See [Data Sovereignty](../core-concepts/data-sovereignty.md) for more details.
