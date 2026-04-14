---
sidebar_position: 2
---

# Team Collaboration Platform

**Build a real-time collaborative workspace with Synap**

Use Synap to create a Notion-like team workspace with real-time editing, AI assistance, knowledge graph, and complete event history.

**Time to Setup**: 45 minutes  
**Result**: Real-time collaborative platform with AI

---

## Why Synap for Team Collaboration?

| Traditional Tools | Synap Advantage |
|-------------------|-----------------|
| **Lost history** | Infinite event log (who changed what, when, why) |
| **One AI assistant** | Multi-agent team (Research, Technical, Creative specialists) |
| **Linear discussions** | Branching conversations for parallel work |
| **Manual organization** | AI auto-organizes and suggests connections |
| **Vendor lock-in** | Self-hosted, you own it |

**Perfect for**:
- Product teams (roadmaps, specs, research)
- Engineering teams (docs, architecture, decisions)
- Research teams (papers, notes, collaboration)
- Agencies (client work, projects, assets)

---

## Setup Your Team Workspace (30 min)

### Step 1: Deploy Synap for Team (10 min)

```bash
# Clone and configure for team
git clone https://github.com/Synap-core/backend.git team-workspace
cd team-workspace

# Team configuration
cp env.local.example .env

# Edit .env:
# - Set TEAM_NAME="Your Team"
# - Configure authentication (Ory)
# - Set up team admin

# Start services
docker compose up -d
pnpm install && pnpm dev
```

✅ **Checkpoint**: http://localhost:3000/health

---

### Step 2: Create Team Structure (10 min)

```typescript
import { SynapClient } from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000'
});

// Team workspace
async function setupTeamWorkspace() {
  // Core Projects
  const projects = [
    {
      name: 'Product Roadmap',
      description: 'Product planning and roadmap',
      type: 'product',
      members: ['alice', 'bob', 'charlie']
    },
    {
      name: 'Engineering',
      description: 'Technical docs and architecture',
      type: 'engineering',
      members: ['alice', 'david']
    },
    {
      name: 'Research',
      description: 'User research and insights',
      type: 'research',
      members: ['eve', 'frank']
    },
    {
      name: 'Marketing',
      description: 'Marketing plans and content',
      type: 'marketing',
      members: ['grace']
    }
  ];
  
  for (const project of projects) {
    await synap.projects.create({
      ...project,
      settings: {
        realTimeCollab: true,  // Enable live editing
        aiAssistant: 'orchestrator',  // AI help
        permissions: {
          default: 'read',
          members: 'write',
          admins: 'admin'
        }
      }
    });
  }
  
  // Shared Resources
  await synap.projects.create({
    name: 'Team Wiki',
    description: 'Shared knowledge and onboarding',
    type: 'wiki',
    settings: {
      public: true,  // All team can read
      template: 'wiki'
    }
  });
}
```

---

### Step 3: Set Up Real-Time Collaboration (10 min)

```typescript
// Real-time document editing
class CollaborativeDocument {
  private documentId: string;
  private sessionId: string;
  private ws: WebSocket;
  
  constructor(documentId: string) {
    this.documentId = documentId;
  }
  
  async start() {
    // Start collaborative session
    const session = await synap.documents.startSession({
      documentId: this.documentId
    });
    
    this.sessionId = session.id;
    
    // Connect to real-time WebSocket
    this.ws = new WebSocket(
      `ws://localhost:3000/collab/${this.sessionId}`
    );
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
  }
  
  // Send changes to other users
  sendUpdate(changes: any) {
    this.ws.send(JSON.stringify({
      type: 'update',
      sessionId: this.sessionId,
      changes
    }));
  }
  
  // Receive changes from other users
  handleUpdate(update: any) {
    switch (update.type) {
      case 'cursor':
        // Show other user's cursor
        this.showCursor(update.userId, update.position);
        break;
      
      case 'content':
        // Apply content changes (CRDT-based, conflict-free)
        this.applyChanges(update.changes);
        break;
      
      case 'user_joined':
        // Show presence indicator
        this.showPresence(update.userId, 'joined');
        break;
      
      case 'user_left':
        this.showPresence(update.userId, 'left');
        break;
    }
  }
  
  // Get active collaborators
  async getCollaborators() {
    const session = await synap.documents.getSession(this.sessionId);
    return session.activeUsers;
    // [{ id: 'alice', cursor: { line: 5, col: 10 } }, ...]
  }
}
```

---

## Team Workflows

### 1. Daily Standup Notes

```typescript
// Daily standup template
const standupTemplate = `# Standup - {date}

## 🎯 Today's Focus
Team Goals:
- [ ] 

## 👥 Team Updates

### Alice
**Yesterday**: 
**Today**: 
**Blockers**: 

### Bob
**Yesterday**: 
**Today**: 
**Blockers**: 

## 📊 Metrics
- Velocity: 
- Open Issues: 
- PRs Pending: 

## 🔗 Links
- Sprint Board: [[Sprint 42]]
- Roadmap: [[Q1 Roadmap]]
`;

// Auto-create daily
await synap.notes.create({
  title: `Standup - ${today}`,
  content: standupTemplate.replace('{date}', today),
  projectId: 'engineering',
  metadata: {
    type: 'standup',
    date: today,
    attendees: ['alice', 'bob', 'charlie']
  }
});

// AI summarizes at end of day
const summary = await synap.chat.send({
  message: 'Summarize today\'s standup and extract action items',
  context: { documentId: standupNoteId }
});
```

---

### 2. Product Spec with AI Assistance

```typescript
// Create spec with AI help
const specDoc = await synap.documents.create({
  title: 'Feature: Real-Time Notifications',
  projectId: 'product_roadmap',
  collaborators: ['alice', 'bob', 'eve']
});

// Start collaborative session
const session = await synap.documents.startSession({
  documentId: specDoc.id,
  aiAssistant: true  // Enable AI chat
});

// AI helps in sidebar chat
await synap.chat.send({
  threadId: session.chatThreadId,
  message: 'Help me write a PRD for real-time notifications'
});

// AI creates research branch
// [BRANCH: Research] - Research Agent analyzes competitors
// [BRANCH: Technical] - Technical Agent drafts architecture
// Main chat: Synthesized recommendations

// All while team edits the doc in real-time!
```

---

### 3. Architecture Decision Records (ADRs)

```typescript
// ADR template
const adrTemplate = `# ADR-{number}: {title}

**Status**: {status}  
**Date**: {date}  
**Deciders**: {deciders}

## Context
What is the issue we're seeing that is motivating this decision?

## Decision
What is the change we're proposing?

## Consequences
What becomes easier or more difficult?

### Positive
- 

### Negative
- 

### Neutral
- 

## Alternatives Considered
1. 
2. 

## Links
- Related: 
- Discussion: 
`;

// Create ADR with branching AI
const adr = await synap.documents.create({
  template: adrTemplate,
  projectId: 'engineering'
});

// AI helps evaluate alternatives
await synap.chat.send({
  threadId: adr.chatThreadId,
  message: 'Should we use PostgreSQL or MongoDB for this feature?'
});

// AI creates parallel research branches:
// [BRANCH: PostgreSQL Analysis] - Technical Agent
// [BRANCH: MongoDB Analysis] - Technical Agent
// Merges results with pros/cons

// Team discusses in main chat
// Decision recorded in ADR
// Full reasoning preserved in event log!
```

---

### 4. Meeting Notes with Auto-Linking

```typescript
// Meeting notes
const meeting = await synap.notes.create({
  content: `# Product Review - Q1 Planning

**Attendees**: Alice, Bob, Charlie, Marie
**Date**: 2024-12-19

## Discussion
- Reviewed Project X progress with Marie
- Budget constraints for Q1
- Need to prioritize user research

## Action Items
- [ ] Alice: Review Q1 budget
- [ ] Bob: Schedule user interviews
- [ ] Marie: Draft hiring plan for Q1

## Next Meeting
- Date: 2025-01-05
- Topic: Q1 Kickoff
`,
  projectId: 'product_roadmap',
  metadata: {
    type: 'meeting',
    attendees: ['alice', 'bob', 'charlie', 'marie']
  }
});

// AI automatically:
// - Creates entities: Alice, Bob, Charlie, Marie (if not exist)
// - Links to: Project X
// - Extracts tasks and assigns
// - Links "Q1 budget" to Budget document
// - Suggests related meetings

// Knowledge graph shows:
// [Meeting: Product Review]
//     ├─ mentions → Alice, Bob, Charlie, Marie
//     ├─ mentions → Project X
//     ├─ has_task → Review Q1 budget (assigned to Alice)
//     ├─ has_task → Schedule interviews (assigned to Bob)
//     └─ related_to → Budget Q1 document
```

---

## Advanced Team Features

### 1. Team Knowledge Graph

```typescript
// Team-wide knowledge graph
const teamGraph = await synap.graph.getVisualization({
  filters: {
    projectIds: ['product', 'engineering', 'research'],
    types: ['note', 'person', 'project', 'meeting', 'document']
  }
});

// Visualize:
// - People connected to projects
// - Documents connected to discussions
// - Cross-project dependencies
// - Knowledge clusters

// Find experts:
const experts = await synap.graph.query({
  type: 'person',
  filters: {
    connectedTo: { entityId: 'topic_react', via: 'mentions' },
    minimumConnections: 10
  }
});
// Returns team members who've written most about React
```

---

### 2. Activity Feed

```typescript
// Team activity feed
const recentActivity = await synap.events.query({
  projectIds: ['product', 'engineering'],
  types: ['note.created', 'document.updated', 'task.completed'],
  since: last24Hours,
  limit: 50
});

// Display as feed:
// "Alice created 'Feature Spec: Notifications' in Product"
// "Bob completed task 'Write ADR-042' in Engineering"
// "Charlie commented on 'Q1 Roadmap'"
// "AI suggested connection between 'User Research' and 'Feature X'"

// Filter by person, project, type
// Real-time updates via WebSocket
```

---

### 3. AI Team Assistant

```typescript
// Team-wide AI assistant
class TeamAI {
  // Answer questions about team knowledge
  async askTeam(question: string) {
    const response = await synap.chat.send({
      message: question,
      context: {
        scope: 'team',  // Search all team content
        projects: ['product', 'engineering', 'research']
      }
    });
    
    return response;
  }
  
  // Examples:
  // "What did we decide about database choice?"
  // → Finds ADR-042, returns decision with reasoning
  
  // "What's Marie working on?"
  // → Finds notes/tasks mentioning Marie, summarizes
  
  // "Summarize our Q1 research findings"
  // → Finds all research notes from Q1, AI synthesizes
}

// AI uses full knowledge graph + event history
// Cites sources (links to actual notes/ADRs)
// Shows reasoning trail
```

---

### 4. Version History \u0026 Audit

```typescript
// Who changed what, when?
const documentHistory = await synap.events.getHistory({
  subjectId: 'doc_important_spec',
  types: ['document.updated', 'document.commented']
});

// Timeline view:
// Dec 19, 10:00 - Alice edited "Requirements"
// Dec 19, 10:15 - Bob added comment "What about mobile?"
// Dec 19, 11:00 - Alice edited "Mobile Requirements"
// Dec 19, 15:30 - AI suggested connection to "Mobile Strategy"

// Time-travel to any point:
const specOnDec15 = await synap.timeline.getState({
  entityId: 'doc_important_spec',
  timestamp: 'Dec 15, 2024'
});

// Compare versions:
const diff = await synap.documents.diff(
  documentId,
  { timestamp: 'Dec 15' },
  { timestamp: 'Dec 19' }
);
```

---

## Team Metrics

```typescript
async function getTeamMetrics() {
  const stats = {
    // Volume
    totalDocuments: await synap.documents.count(),
    totalNotes: await synap.notes.count(),
    totalTasks: await synap.tasks.count(),
    
    // Activity
    activeProjects: await synap.projects.count({ status: 'active' }),
    documentsThisWeek: await synap.documents.count({
      createdAfter: lastWeek
    }),
    tasksCompleted: await synap.tasks.count({
      status: 'completed',
      completedAfter: lastWeek
    }),
    
    // Collaboration
    collaborativeSessions: await synap.documents.getActiveSessions(),
    averageCollaborators: await getAverageCollaboratorsPerDoc(),
    mostActiveMembers: await getMostActiveMembers(),
    
    // Knowledge
    knowledgeGraphSize: await synap.graph.getStats(),
    aiSuggestionsAccepted: await getAISuggestionAcceptRate(),
    crossProjectConnections: await getCrossProjectLinks()
  };
  
  return stats;
}

// Healthy team workspace:
// - Regular activity (docs/week)
// - High collaboration (avg 2+ per doc)
// - Growing knowledge graph
// - Cross-project connections (not siloed)
```

---

## Team Best Practices

### 1. Project Templates

```typescript
// Create reusable templates
const featureTemplate = {
  name: 'Feature Template',
  sections: [
    {
      title: 'Overview',
      content: '## Problem\n\n## Solution\n\n## Success Metrics'
    },
    {
      title: 'Technical Design',
      content: '## Architecture\n\n## Database\n\n## APIs'
    },
    {
      title: 'Launch Plan',
      content: '## Rollout\n\n## Monitoring\n\n## Rollback'
    }
  ],
  metadata: {
    type: 'feature_spec',
    template: true
  }
};

// Use template
await synap.documents.createFromTemplate(featureTemplate.name, {
  title: 'Feature: Real-Time Notifications',
  projectId: 'product'
});
```

---

### 2. Onboarding Automation

```typescript
// New team member onboarding
async function onboardNewMember(userId: string, role: string) {
  // Create personal workspace
  await synap.projects.create({
    name: `${userId}'s Workspace`,
    ownerId: userId,
    type: 'personal'
  });
  
  // Share team wiki
  await synap.projects.addMember('team_wiki', userId);
  
  // Assign projects based on role
  const projectsByRole = {
    engineer: ['engineering', 'product'],
    designer: ['product', 'research'],
    researcher: ['research', 'product']
  };
  
  for (const projectId of projectsByRole[role] || []) {
    await synap.projects.addMember(projectId, userId);
  }
  
  // Create onboarding checklist
  await synap.tasks.createMany([
    { title: 'Read Team Wiki', assignedTo: userId },
    { title: 'Set up development environment', assignedTo: userId },
    { title: 'Schedule 1:1s with team', assignedTo: userId }
  ]);
  
  // AI creates personalized onboarding guide
  await synap.chat.send({
    message: `Create onboarding guide for new ${role}`,
    context: { userId, role }
  });
}
```

---

### 3. Weekly Team Review

```typescript
// Automated weekly summary
async function weeklyTeamReview() {
  // Gather week's activity
  const thisWeek = {
    documentsCreated: await synap.documents.count({ createdAfter: lastWeek }),
    tasksCompleted: await synap.tasks.count({
      status: 'completed',
      completedAfter: lastWeek
    }),
    meetings: await synap.notes.list({
      'metadata.type': 'meeting',
      createdAfter: lastWeek
    }),
    keyDecisions: await synap.notes.list({
      'metadata.type': 'adr',
      createdAfter: lastWeek
    })
  };
  
  // AI generates summary
  const summary = await synap.chat.send({
    message: `Summarize this week's team activity and highlight key decisions`,
    context: thisWeek
  });
  
  // Post to team channel
  await synap.notes.create({
    title: `Weekly Summary - ${weekOf}`,
    content: summary,
    projectId: 'team_wiki',
    metadata: { type: 'weekly_summary', week: weekOf }
  });
  
  // Send to team (email/Slack integration)
  await notifyTeam(summary);
}

// Schedule: Every Friday 5 PM
// 0 17 * * 5 node weekly-review.ts
```

---

## Integration Examples

### Slack Integration

```typescript
// Slack bot that syncs with Synap
slackApp.event('message', async ({ event }) => {
  // Capture important Slack messages
  if (event.text.includes('!capture')) {
    await synap.inbox.create({
      content: event.text,
      sourceType: 'slack',
      metadata: {
        channel: event.channel,
        user: event.user,
        timestamp: event.ts
      }
    });
  }
  
  // AI processes and suggests where to save
  // Posts back to Slack with suggestion
});

// Notify Slack when documents updated
synap.events.subscribe({
  types: ['document.updated'],
  callback: async (event) => {
    await slackApp.client.chat.postMessage({
      channel: '#general',
      text: `${event.userId} updated "${event.data.title}"`
    });
  }
});
```

---

### Calendar Integration

```typescript
// Sync meetings to Synap
calendarApp.onEvent('event.created', async (event) => {
  if (event.type === 'meeting') {
    // Create meeting note
    const note = await synap.notes.create({
      title: `Meeting: ${event.summary}`,
      content: meetingTemplate,
      metadata: {
        type: 'meeting',
        attendees: event.attendees.map(a => a.email),
        date: event.start
      }
    });
    
    // AI pre-populates agenda from calendar description
    // Links to related projects/notes
  }
});
```

---

## Security & Permissions

```typescript
// Row-Level Security (RLS)
await synap.projects.setPermissions('engineering', {
  public: false,  // Not visible to non-members
  members: {
    read: true,
    write: true,
    delete: false
  },
  admins: {
    read: true,
    write: true,
    delete: true,
    manage: true
  }
});

// Document-level permissions
await synap.documents.setPermissions('sensitive_doc', {
  inheritFromProject: false,  // Override project permissions
  allowedUsers: ['alice', 'bob'],  // Only these users
  allowedGroups: ['leadership']
});

// Audit who accessed what
const accessLog = await synap.events.query({
  types: ['document.viewed', 'document.updated'],
  subjectId: 'sensitive_doc',
  since: last30Days
});
```

---

## Next Steps

### Build Your Team Features:
1. **Custom UI** - Team dashboard, activity feed
2. **Mobile App** - Capture on the go
3. **Integrations** - Slack, Calendar, GitHub
4. **Analytics** - Team metrics dashboard
5. **AI Agents** - Custom team assistants

### Resources:
- **[Real-Time Collaboration Guide](../../guides/by-feature/real-time-collab)**
- **[Multi-Agent System](../../concepts/multi-agent-system)** - AI team coordination
- **[Knowledge Graph](../../concepts/knowledge-graph)** - Team knowledge
- **[Event Sourcing](../../concepts/event-sourcing-explained)** - Audit trails

---

**Your team workspace is ready!** Real-time collaboration + AI assistance + complete history. 🚀👥
