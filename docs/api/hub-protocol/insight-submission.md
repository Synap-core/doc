---
sidebar_position: 4
---

# Insight Submission

**Submitting structured insights via Hub Protocol**

---

## Submit Insight

The Hub submits a structured insight that will be transformed into events:

```typescript
POST /trpc/hub.submitInsight
{
  "token": "jwt-token",
  "insight": {
    "version": "1.0",
    "type": "action_plan",
    "correlationId": "req-123",
    "actions": [
      {
        "eventType": "project.creation.requested",
        "data": {
          "title": "Trip to Lisbon"
        },
        "requiresConfirmation": false
      }
    ],
    "confidence": 0.95,
    "reasoning": "Based on user preferences"
  }
}
```

**Response**:
```typescript
{
  "success": true,
  "requestId": "req-123",
  "eventIds": ["event-1", "event-2"],
  "eventsCreated": 2
}
```

---

## Insight Types

- `action_plan` - Plan of actions to execute
- `analysis` - Analysis of user data
- `suggestion` - Suggestions for the user

---

**Next**: See [Hub Protocol Overview](./overview.md) for complete protocol documentation.

