---
sidebar_position: 1
---

# Building a Second Brain

**How to use Synap as your AI-powered personal knowledge management system**

A "Second Brain" is an external system for capturing, organizing, and retrieving knowledge - think Obsidian or Notion, but with AI and time-travel superpowers.

**Time to Setup**: 30 minutes  
**Result**: Personal knowledge system with AI assistance

---

## What is a Second Brain?

### The Concept (Tiago Forte):

```
Your Biological Brain:
├─ Limited working memory
├─ Forgets over time
├─ Hard to search
└─ Can't time-travel

Your Second Brain (Synap):
├─ Unlimited storage
├─ Never forgets (event sourcing)
├─ AI-powered search
└─ Can time-travel to any point
```

**Core Principle**: Offload knowledge capture and organization to an external system so your brain can focus on thinking and creating.

---

## Why Synap for Second Brain?

| Traditional Tools | Synap Advantage |
|-------------------|-----------------|
| **Manual organization** | AI auto-organizes |
| **Manual linking** | Automatic knowledge graph |
| **Lost history** | Infinite event history |
| **One note at a time** | Branching AI for exploration |
| **Static** | Dynamic, AI-assisted |

**Key Features**:
- 📝 Quick capture (inbox)
- 🧠 Automatic knowledge graph
- 🔍 Semantic search
- 🤖 AI research assistant
- 🕐 Time-travel through your thoughts
- 🌳 Branch conversations for deep dives

---

## Setup Your Second Brain (30 min)

### Step 1: Start Synap (5 min)

```bash
# Clone and start
git clone https://github.com/Synap-core/backend.git my-second-brain
cd my-second-brain
cp env.local.example .env
docker compose up -d
pnpm install && pnpm dev
```

✅ Check: http://localhost:3000/health

---

### Step 2: Configure Projects (5 min)

Create your knowledge areas:

```typescript
import { SynapClient } from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000'
});

// Core knowledge areas (P.A.R.A. method)
const areas = [
  { name: 'Projects', description: 'Active initiatives' },
  { name: 'Areas', description: 'Ongoing responsibilities' },
  { name: 'Resources', description: 'Reference material' },
  { name: 'Archives', description: 'Inactive items' }
];

for (const area of areas) {
  await synap.projects.create(area);
}

// Or create by topic
const topics = [
  'Programming',
  'Business',
  'Health',
  'Personal Development',
  'Ideas'
];

for (const topic of topics) {
  await synap.projects.create({ name: topic });
}
```

---

### Step 3: Set Up Capture Workflow (10 min)

#### Quick Capture Script:

```typescript
// quick-capture.ts
import { SynapClient } from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000'
});

async function capture(text: string) {
  // Create inbox item
  const item = await synap.inbox.create({
    title: text.slice(0, 100),  // First 100 chars
    content: text,
    sourceType: 'quick_capture'
  });
  
  // AI processes in background:
  // - Extracts entities
  // - Suggests project
  // - Creates relations
  // - Suggests actions
  
  console.log(`Captured: ${item.id}`);
  return item;
}

// Usage:
await capture(`
Idea: Build a knowledge graph visualizer
using D3.js. Could be useful for exploring
connections in my notes.
`);
```

#### Keyboard Shortcut (macOS):

```bash
# Create Alfred/Raycast workflow
# or global hotkey that runs:
node quick-capture.ts "$(pbpaste)"
```

---

### Step 4: Daily Note Template (10 min)

```typescript
// daily-note.ts
async function createDailyNote() {
  const today = new Date().toISOString().split('T')[0];
  
  const template = `# ${today}

## 🎯 Today's Focus
- [ ] 

## 📝 Notes


## 💡 Ideas


## 🔗 Interesting


## 📊 Progress

`;

  const note = await synap.notes.create({
    title: `Daily Note - ${today}`,
    content: template,
    metadata: {
      type: 'daily_note',
      date: today
    }
  });
  
  return note;
}

// Run daily (cron job)
// 0 6 * * * node daily-note.ts
```

---

## The Capture Workflow

### 1. Quick Capture (Immediate)

```typescript
// Capture anything, anywhere
await synap.inbox.create({
  content: 'Random thought about X'
});

// AI automatically:
// - Extracts entities ("X")
// - Suggests categories
// - Creates initial connections
```

---

### 2. AI Processing (Background)

```typescript
// Check inbox
const items = await synap.inbox.list({
  status: 'pending'
});

// AI has already:
items.forEach(item => {
  console.log('Suggested project:', item.aiSuggestions.project);
  console.log('Extracted entities:', item.aiEntities);
  console.log('Suggested actions:', item.aiSuggestions.tasks);
});
```

---

### 3. Review \u0026 Organize (Weekly)

```typescript
// Weekly review
const inbox = await synap.inbox.list({
  status: 'pending',
  createdAfter: lastWeek
});

for (const item of inbox) {
  // Accept AI suggestion or manually assign
  if (item.aiSuggestions.confidence > 0.8) {
    // High confidence - auto-convert
    await synap.inbox.convertToNote(item.id, {
      projectId: item.aiSuggestions.projectId
    });
  } else {
    // Review manually
    showToUser(item);
  }
}
```

---

## Knowledge Graph in Action

### Auto-Linking Example:

```typescript
// You create a note:
await synap.notes.create({
  content: `
# Meeting with Marie

Discussed Project X budget.  
Need to:
- Review Q1 numbers
- Call supplier about pricing
- Schedule follow-up
`
});

// AI automatically creates:
const entities = [
  { type: 'person', name: 'Marie' },
  { type: 'project', name: 'Project X' },
  { type: 'meeting', date: 'today' }
];

const relations = [
  { from: 'note', to: 'Marie', type: 'mentions' },
  { from: 'note', to: 'Project X', type: 'mentions' },
  { from: 'note', to: 'meeting', type: 'captured_in' }
];

const tasks = [
  { title: 'Review Q1 numbers', project: 'Project X' },
  { title: 'Call supplier' },
  { title: 'Schedule follow-up', assignedTo: 'Marie' }
];
```

---

### Finding Connections:

```typescript
// "What else is related to Marie?"
const marieNetwork = await synap.graph.findRelated({
  entityId: 'person_marie',
  depth: 2  // Two degrees of separation
});

// Result:
// Marie
// ├─ mentioned in 15 notes
// ├─ assigned to 7 tasks
// ├─ involved in 3 projects
// │   └─ Project X
// │       ├─ Budget Review note
// │       └─ Q1 Planning note
// └─ attended 5 meetings
```

---

## AI Research Assistant

### Branching for Deep Research:

```typescript
// Main thought
await synap.chat.send({
  threadId: mainThread,
  message: 'I want to learn about knowledge graphs'
});

// AI suggests branching for research
// [BRANCH: Research] created automatically

// In branch: Research agent does deep dive
// - Finds 10 key papers
// - Summarizes concepts
// - Suggests learning path

// Merge back to main
// Main thread: "Here's a structured learning plan..."
```

---

### Ask Questions About Your Knowledge:

```typescript
// Semantic search
const results = await synap.search.semantic({
  query: 'productivity techniques I've learned',
  limit: 10
});

// AI synthesizes
await synap.chat.send({
  message: 'Summarize my productivity learnings',
  context: { searchResults: results }
});

// Response: "You've explored 3 main approaches:
// 1. GTD (Getting Things Done) - notes from 2024-03
// 2. Time blocking - tried in 2024-06
// 3. Pomodoro - most recent (2024-12)"
```

---

## Advanced Patterns

### 1. Zettelkasten Method

```typescript
// Atomic notes with unique IDs
async function createZettel(content: string, tags: string[]) {
  const id = Date.now().toString();  // Zettelkasten ID
  
  return await synap.notes.create({
    title: `${id} - ${content.slice(0, 50)}`,
    content,
    metadata: {
      zettelId: id,
      type: 'permanent_note',
      tags
    }
  });
}

// Link zettels
await synap.relations.create({
  source: 'zettel_1',
  target: 'zettel_2',
  type: 'builds_on'  // or: contradicts, supports, extends
});
```

---

### 2. P.A.R.A. Method (Tiago Forte)

```typescript
// Projects: Active, time-bound
const projects = await synap.projects.list({
  status: 'active'
});

// Areas: Ongoing responsibilities
const areas = await synap.projects.list({
  type: 'area',  // Custom metadata
  status: 'ongoing'
});

// Resources: Reference library
const resources = await synap.notes.list({
  tags: ['resource']
});

// Archives: Completed projects
const archives = await synap.projects.list({
  status: 'archived'
});
```

---

### 3. Spaced Repetition

```typescript
// Track learning \u0026 review
await synap.notes.create({
  content: 'Concept: Event Sourcing...',
  metadata: {
    type: 'learning_note',
    reviewSchedule: {
      next: addDays(new Date(), 1),   // Day 1
      intervals: [1, 3, 7, 14, 30]   // Spaced repetition
    }
  }
});

// Get items to review today
const dueForReview = await synap.notes.list({
  'metadata.reviewSchedule.next': { lte: new Date() }
});
```

---

## Weekly Review Workflow

```typescript
async function weeklyReview() {
  // 1. Process inbox
  const inbox = await synap.inbox.list({ status: 'pending' });
  console.log(`Inbox: ${inbox.length} items`);
  
  // 2. Review active projects
  const projects = await synap.projects.list({ status: 'active' });
  for (const project of projects) {
    const updates = await synap.notes.list({
      projectId: project.id,
      createdAfter: lastWeek
    });
    console.log(`${project.name}: ${updates.length} updates`);
  }
  
  // 3. Discover connections
  const suggestions = await synap.graph.suggestConnections();
  console.log(`${suggestions.length} suggested connections`);
  
  // 4. Archive completed
  const completed = await synap.projects.list({
    status: 'completed',
    completedAfter: lastWeek
  });
  for (const project of completed) {
    await synap.projects.archive(project.id);
  }
  
  // 5. AI summary
  const summary = await synap.chat.send({
    message: 'Summarize my week based on notes and updates'
  });
}

// Schedule: Every Sunday 6 PM
// 0 18 * * 0 node weekly-review.ts
```

---

## Time-Travel for Reflection

```typescript
// "What was I working on 6 months ago?"
const sixMonthsAgo = subMonths(new Date(), 6);

const pastState = await synap.timeline.getState({
  timestamp: sixMonthsAgo
});

console.log('Active projects:', pastState.projects);
console.log('Top notes:', pastState.recentNotes.slice(0, 10));

// Compare to now
const now = await synap.projects.list({ status: 'active' });
console.log('Then:', pastState.projects.length);
console.log('Now:', now.length);
console.log('Growth:', now.length - pastState.projects.length);
```

---

## Mobile Capture

### Quick Capture API Endpoint:

```typescript
// Create simple capture endpoint
app.post('/quick-capture', async (req, res) => {
  const { content } = req.body;
  
  const item = await synap.inbox.create({
    content,
    sourceType: 'mobile',
    metadata: { capturedAt: new Date() }
  });
  
  res.json({ id: item.id, message: 'Captured!' });
});

// Mobile: Send to endpoint
// iOS Shortcut / Android Tasker
```

---

## Success Metrics

Track your Second Brain's health:

```typescript
async function getMetrics() {
  const stats = {
    // Volume
    totalNotes: await synap.notes.count(),
    totalEntities: await synap.entities.count(),
    connections: await synap.relations.count(),
    
    // Activity
    notesThisWeek: await synap.notes.count({
      createdAfter: lastWeek
    }),
    inboxProcessRate: await getInboxClearRate(),
    
    // Quality
    orphanNotes: await synap.notes.list({
      hasRelations: false
    }),
    aiSuggestionAcceptRate: await getAcceptanceRate(),
    
    // Growth
    weeklyGrowth: await getGrowthRate('week'),
    monthlyGrowth: await getGrowthRate('month')
  };
  
  return stats;
}

// Healthy Second Brain:
// - Steady input (notes/week)
// - High connection density (relations/note)
// - Low inbox count (processed regularly)
// - Growing knowledge graph
```

---

## Common Patterns

### Pattern 1: Meeting Notes

```typescript
const meetingTemplate = `# Meeting: {title}
**Date**: {date}
**Attendees**: {people}

## Agenda


## Discussion


## Action Items
- [ ] 

## Next Steps

`;

// Create from calendar
await synap.integrations.calendar.onEvent('meeting_started', async (event) => {
  await synap.notes.create({
    template: meetingTemplate,
    vars: {
      title: event.title,
      date: event.start,
      people: event.attendees
    }
  });
});
```

---

### Pattern 2: Learning Log

```typescript
// After reading/course
await synap.notes.create({
  title: 'Learning: Event Sourcing',
  content: `
## Source
Book: "Event Sourcing Made Simple"

## Key Concepts
1. Events are facts
2. Immutable log
3. Can rebuild state

## My Take
Fascinating approach! Applies to more than databases.

## To Explore
- CQRS pattern
- Event Store tech
- Use cases beyond data
`,
  metadata: {
    type: 'learning_note',
    source: 'book',
    tags: ['architecture', 'databases']
  }
});

// AI auto-links to:
// - Other architecture notes
// - Database concepts
// - Related learnings
```

---

### Pattern 3: Idea Incubator

```typescript
// Capture ideas
await synap.notes.create({
  content: 'Idea: AI assistant that understands project context',
  metadata: {
    type: 'idea',
    status: 'raw',
    created: new Date()
  }
});

// Review monthly
const ideas = await synap.notes.list({
  'metadata.type': 'idea',
  'metadata.status': 'raw'
});

// Develop promising ones
await synap.threads.createBranch({
  purpose: 'Develop idea: AI context assistant',
  agentId: 'research'
});

// Track evolution
// raw → developed → prototype → shipped
```

---

## Next Steps

### Level Up Your Second Brain:

1. **Add Templates** - Common note types
2. **Build UI** - Custom knowledge browser
3. **Mobile App** - Capture on the go
4. **Automation** - Zapier/n8n integration
5. **Visualization** - Graph view UI

### Resources:

- [Building Strong](https://www.buildingasecondbrain.com/) - Tiago Forte's methodology
- [Zettelkasten Method](https://zettelkasten.de/) - Atomic notes
- [P.A.R.A.](https://fortelabs.co/blog/para/) - Organization system
- [Synap Knowledge Graph Guide](../../concepts/knowledge-graph)

---

**Your Second Brain is ready!** Start capturing, let AI organize, explore connections. 🧠✨
