---
sidebar_position: 4
---

# Why Events Matter: AI Control & Data Sovereignty

**The business case for Synap's event architecture**

---

## The Problem

Traditional personal knowledge systems have a binary choice when it comes to AI and external integrations:

| Model | User Control | Flexibility | Risk |
|-------|--------------|-------------|------|
| **All-or-Nothing** | ❌ Low | High | High |
| **Manual Only** | ✅ Full | ❌ Low | Low |

### The All-or-Nothing Dilemma

```
AI Agent: "Can I access your data?"

Option A: Yes → AI can do ANYTHING
Option B: No  → AI blocked from EVERYTHING
```

**Result**: Users either:
- Give up control for convenience
- Limit AI capabilities for safety

**We need a middle ground.**

---

## The Solution: Requested → Validated Flow

Synap introduces a **two-stage approval model**:

```
┌─────────────────┐
│ AI/External     │
│ Proposes Action │
└────────┬────────┘
         │ .requested event
         ▼
    ┌──────────┐
    │   User   │
    │ Reviews  │
    └────┬─────┘
         │ Approve/Reject
         ▼
┌─────────────────┐
│ Change Applied  │
│ .validated      │
└─────────────────┘
```

### Key Innovation

**Every action has intent and execution separated**:
- **Intent**: `.requested` - Anyone can propose
- **Execution**: `.validated` - Only after approval

---

## Business Benefits

### 1. Granular AI Control

**Problem**: Traditional AI tools are all-or-nothing

**Solution**: Configure per-AI, per-action permissions

**Example**:
```typescript
// Data pod configuration
{
  "ai_permissions": {
    "gpt-4": {
      "auto_approve": [
        "entities.create.requested",  // Can create notes
        "tags.create.requested"       // Can create tags
      ],
      "require_review": [
        "entities.delete.requested",  // Must ask before deleting
        "documents.update.requested"  // Must ask before editing docs
      ]
    },
    "claude-3": {
      "auto_approve": [],  // No auto-approvals
      "require_review": ["*"]  // User reviews everything
    }
  }
}
```

**Result**: Fine-grained control over what each AI can do

---

### 2. Audit Trail for Compliance

**Problem**: No visibility into what AI agents did

**Solution**: Every action is logged as an immutable event

**Use Case**: Regulatory Compliance
```
Auditor: "Show me all AI actions in Q4"

Query: 
SELECT * FROM events 
WHERE source = 'ai-agent'
  AND timestamp >= '2024-10-01'
```

**Result**: Complete, tamper-proof audit trail

---

### 3. Revocable AI Access

**Problem**: Once AI has access, can't revoke retroactively

**Solution**: Change permissions anytime, AI respects instantly

**Scenario**:
```
Day 1: GPT-4 can auto-approve entity creation
  → User sees too many AI-created notes
  
Day 2: Change to "require_review"
  → GPT-4 immediately starts asking for approval
  
Day 3: Review queue
  → User approves/rejects each proposal
```

**Result**: Dynamic, user-controlled AI behavior

---

### 4. Data Sovereignty

**Problem**: Data synced to external systems without control

**Solution**: Approve every external sync

**Use Case**: Cross-Pod Sharing
```
Friend's Pod: "Can I read your notes tagged #research?"

Flow:
1. Friend sends request → entities.read.requested
2. You review in your data pod
3. You configure: "Yes, read-only, expires in 7 days"
4. Share approved → entities.read.validated
```

**Result**: You control who sees your data, when, and for how long

---

## Real-World Scenarios

### Scenario 1: AI Task Extraction

**Context**: AI reads your emails and suggests tasks

**Traditional Approach**:
- AI creates tasks automatically
- User finds inbox full of unwanted tasks
- Disables AI entirely

**Synap Approach**:
```
1. AI reads email
   → entities.create.requested (type: 'task')
   
2. User sees notification: "AI suggests task: Call John"
   
3. User decides:
   Option A: Approve → entities.create.validated → Task created
   Option B: Reject → Discarded, no task created
   Option C: Edit → Modify title/details → Approve
```

**Result**: AI proposes, user approves, everyone happy

---

### Scenario 2: External Calendar Sync

**Context**: Sync Google Calendar with Synap data pod

**Configuration**:
```typescript
{
  "external_integrations": {
    "google_calendar": {
      "sync_policy": {
        "read": "auto_approve",    // Can read events freely
        "create": "require_review", // Must ask before creating
        "update": "require_review",
        "delete": "block"           // Never allow
      }
    }
  }
}
```

**Flow**:
```
Google Calendar creates event
  → entities.create.requested
  → User reviews notification
  → User approves
  → Event appears in Synap
```

**Result**: One-way sync (read freely), two-way sync (with approval)

---

### Scenario 3: Multi-Pod Collaboration

**Context**: Two users want to share a project

**Flow**:
```
User A: Shares project with User B

1. User A: webhooks.deliver.requested
   → Sends to User B's pod: "User A wants to share project X"

2. User B reviews in their pod:
   - What data? (project + related notes)
   - What access? (read-only vs read-write)
   - How long? (permanent vs 30 days)

3. User B configures:
   {
     "access": "read-only",
     "expires": "2025-01-15",
     "allowed_events": ["entities.read.validated"]
   }

4. User B approves
   → webhooks.deliver.validated
   → User A can read project data from User B's pod

5. If User B changes mind:
   → Revoke access immediately
   → User A loses access
```

**Result**: Privacy-preserving collaboration with dynamic consent

---

## Future: Federated Data Pods

### Vision

**Users control data across pods**:

```
Personal Pod (You)
  ↓ Share with approval
Work Pod (Company)
  ↓ Share with approval
Research Pod (University)
  ↓ Share with approval
Public Knowledge Graph
```

### Requested → Validated Enables

1. **Cross-Pod Queries**
   - Pod A requests data from Pod B
   - Pod B owner reviews + approves
   - Data shared with time limit

2. **AI Training with Consent**
   - AI company: "Can we use your data for training?"
   - You: "Yes, but anonymize and delete after 90 days"
   - Enforced via smart contracts

3. **Decentralized Knowledge Graphs**
   - Link entities across pods
   - Users approve each link
   - Revoke links anytime

---

## Competitive Advantage

| Feature | Traditional Tools | Synap |
|---------|-------------------|-------|
| **AI Control** | All or nothing | Per-AI, per-action |
| **Audit Trail** | Limited or none | Complete, immutable |
| **Data Ownership** | Vendor controls | User controls |
| **External Sync** | Automatic | Approval required |
| **Revoke Access** | Hard/impossible | Instant |
| **Cross-System** | Vendor lock-in | Open federation |

---

## Technical Foundation

This business model is **only possible** because of the event architecture:

### 1. Intent vs Execution Separation

```typescript
// Traditional (unsafe)
function createTask(data) {
  await db.insert(tasks).values(data);  // No approval step
}

// Synap (safe)
function createTask(data) {
  await publishEvent({
    type: 'entities.create.requested',  // Intent logged
    data,
  });
  // Approval step happens in worker
  // Only validated events modify DB
}
```

### 2. Immutable Audit Log

```typescript
// Every action is an event
events = [
  { type: 'entities.create.requested', source: 'ai', timestamp: ... },
  { type: 'entities.create.validated', source: 'system', timestamp: ... },
]

/

/ Cannot modify past events
// Full audit trail
// Replay capability
```

### 3. Granular Permissions

```typescript
// Check permissions before validation
if (event.source === 'ai-agent') {
  const permissions = await getAIPermissions(userId, aiAgent);
  
  if (!permissions.autoApprove.includes(event.type)) {
    await queueForUserReview(event);
  } else {
    await autoValidate(event);
  }
}
```

---

## Getting Started

### For Users

1. **Set Up Data Pod**: Self-host or use Synap Cloud
2. **Configure AI Permissions**: Choose which AI can auto-approve
3. **Review Queue**: Check AI proposals in real-time
4. **Approve/Reject**: Full control over every change

### For Developers

1. **Integrate via Events**: Use `.requested` → `.validated` pattern
2. **Respect Permissions**: Check user config before acting
3. **Subscribe to Webhooks**: Get notified on validated events
4. **Build Approval UIs**: Help users review AI proposals

### For Enterprises

1. **Deploy On-Premise**: Full data control
2. **Configure Policies**: Enterprise-wide AI permissions
3. **Audit Compliance**: Query event store for reports
4. **Federate Securely**: Connect multiple pods with approval

---

## Next Steps

- [Event Architecture](../architecture/events/event-architecture.md) - Technical foundation
- [Event Types Catalog](../reference/event-catalog.md) - All events reference
- [Webhooks Guide](../integrations/webhooks-guide.md) - External integrations
- [Development Guide](../development/setup.md) - Build integrations
