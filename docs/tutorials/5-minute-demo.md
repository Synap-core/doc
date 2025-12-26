---
sidebar_position: 1
---

# 5-Minute Demo

**Experience Synap's superpowers in 5 minutes**

This tutorial gets you from zero to a working application showcasing time-travel, branching AI, and knowledge graphs.

**Time**: 5 minutes  
**Result**: Working note-taking app with AI  
**Requirements**: Docker, Node.js 20+

---

## What You'll Build

By the end of this demo, you'll have:

✅ A note-taking interface with rich text editing  
✅ Real-time collaboration (try opening 2 tabs!)  
✅ AI chat that remembers full context  
✅ Knowledge graph auto-linking  
✅ Branching conversations to explore ideas  
✅ Time-travel to view past states  

**All running locally in \<5 minutes.**

---

## Step 1: Start the Backend (2 min)

### Quick Start with Docker:

```bash
# Clone the repository
git clone https://github.com/Synap-core/backend.git synap-demo
cd synap-demo

# Copy environment file
cp env.local.example .env

# Start everything
docker compose up -d
pnpm install
pnpm dev
```

✅ **Checkpoint**: Visit http://localhost:3000/health  
Should see: `{"status":"ok"}`

**What just happened?**
- PostgreSQL with TimescaleDB (event store)
- MinIO (file storage)
- Ory (authentication)
- Data Pod API (your backend)
- Job workers (event processing)

---

## Step 2: Create Your First Note (1 min)

### Using the SDK:

```typescript
import { SynapClient } from '@synap/client';

const client = new SynapClient({
  url: 'http://localhost:3000'
});

// Create a note
const note = await client.notes.create({
  content: '# My First Note\n\nCall Marie tomorrow about Project X budget',
  title: 'Marketing Meeting'
});

console.log('Created:', note.id);
// Created: note_abc123
```

✅ **Checkpoint**: Note ID logged

**What just happened?**
- Event created: `note.creation.requested`
- Worker processed it
- AI extracted:
  - Person: "Marie"
  - Project: "Project X"
  - Task: "Call Marie tomorrow"
- Knowledge graph auto-linked everything

---

## Step 3: Experience Time-Travel (30 sec)

### Edit the note:

```typescript
// Update the note
await client.notes.update({
  id: note.id,
  content: '# Updated Note\n\nCall Marie NEXT WEEK about Project X'
});

// View complete history
const history = await client.events.getHistory({
  subjectId: note.id
});

console.log('Changes:', history.length);
// Changes: 2 (creation + update)

// Time-travel: View original version
const originalState = await client.timeline.getState({
  entityId: note.id,
  timestamp: history[0].timestamp
});

console.log('Original:', originalState.content);
// "Call Marie tomorrow..." (before update!)
```

✅ **Checkpoint**: Can see original content

**What's unique here?**
- **Notion/Obsidian**: Old version is GONE
- **Synap**: Full history forever, can restore any version

---

## Step 4: Try Branching AI (1 min)

### Start a conversation:

```typescript
// Create a chat thread
const thread = await client.chat.createThread({
  title: 'Plan marketing campaign'
});

// Send message
await client.chat.sendMessage({
  threadId: thread.id,
  content: 'Help me plan a marketing campaign for our new pricing tier'
});

// Orchestrator analyzes and creates a research branch
// Check for branches
const branches = await client.threads.getBranches(thread.id);

console.log('Active branches:', branches.length);
// Active branches: 1 (research specialist working)

// Main thread stays clean while research happens in parallel
```

✅ **Checkpoint**: Branch created automatically

**What's unique here?**
- **ChatGPT/Claude**: Everything mixes in one thread
- **Synap**: Parallel research in branch, main thread stays focused

---

## Step 5: Explore Knowledge Graph (30 sec)

### See the connections:

```typescript
// Find all entities related to "Project X"
const connected = await client.graph.findRelated({
  entityId: 'project_x',
  depth: 2  // Two degrees of separation
});

console.log('Connected entities:');
connected.forEach(entity => {
  console.log(`- ${entity.type}: ${entity.title}`);
});

// Output:
// - note: Marketing Meeting
// - person: Marie
// - task: Call Marie tomorrow
// - project: Project X
// - note: Budget Discussion (auto-discovered!)
```

✅ **Checkpoint**: See automatic connections

**What's unique here?**
- **Obsidian**: Manual `[[links]]`
- **Synap**: AI auto-discovers connections

---

## 🎉 What You Just Experienced

In 5 minutes, you saw:

| Feature | What You Did | vs Traditional Apps |
|---------|--------------|---------------------|
| **Time-Travel** | Viewed original note version | ❌ History lost in Notion |
| **Event History** | Saw every change | ❌ No audit trail |
| **Branching AI** | Research in parallel branch | ❌ Everything in one chat |
| **Knowledge Graph** | Auto-linked entities | ❌ Manual links only |
| **Infinite Undo** | Can restore any version | ❌ Limited undo |

---

## Try It Yourself: Interactive Demo

### 1. Real-Time Collaboration

```bash
# Open two browser tabs to http://localhost:3000
# Edit the same note in both
# See live updates!
```

**What's happening:**
- WebSocket real-time sync
- CRDT-based conflict resolution
- Presence indicators (who's editing)

---

### 2. AI Agent Specialists

```typescript
// Create a research branch manually
const researchBranch = await client.threads.createBranch({
  parentThreadId: thread.id,
  purpose: 'Deep dive into competitor pricing',
  agentId: 'research'  // Research specialist
});

// Technical question? Use technical specialist
const techBranch = await client.threads.createBranch({
  parentThreadId: thread.id,
  purpose: 'Design database schema',
  agentId: 'technical'  // Technical specialist
});

// Both work in parallel!
```

---

### 3. Query the Knowledge Graph

```typescript
// Find all tasks mentioning "Marie"
const marieTasks = await client.graph.query({
  type: 'task',
  relatedTo: {
    entityId: 'person_marie',
    via: 'mentions'
  }
});

// Get graph data for visualization
const graphData = await client.graph.getVisualization({
  filters: { projectId: 'project_x' }
});
// Returns D3.js/Vis.js compatible format
```

---

## What Makes This Different?

### The Synap Advantage:

```
Traditional Note App              Synap
───────────────────              ─────────────────────
Edit note → lose history         Edit note → event recorded
Update database                  Append to event log
No undo (or limited)            Infinite undo, time-travel
One AI assistant                AI team (orchestrator + specialists)
Manual organization             Auto knowledge graph
Linear chat                     Git-like branching
Vendor lock-in                  You own the infrastructure
```

---

## Next Steps

### Level 1: Explore More

1. **[View Event Log](http://localhost:3000/events)** - See every change
2. **[Query Knowledge Graph](#)** - Discover connections
3. **[Create More Branches](#)** - Parallel AI exploration

### Level 2: Build Something

4. **[Build a Knowledge Graph UI](./knowledge-graph-view)** - Obsidian-style visualization
5. **[Build Activity Timeline](./activity-timeline)** - Event-based UI
6. **[Build Branch Visualizer](./branch-visualizer)** - Git-style tree

### Level 3: Deep Dive

7. **[Understand Event Sourcing](../concepts/event-sourcing-explained)** - Why it's powerful
8. **[Knowledge Graph Model](../concepts/knowledge-graph)** - How it works
9. **[Multi-Agent System](../concepts/multi-agent-system)** - AI coordination

---

## Troubleshooting

### Services Not Starting?

```bash
# Check Docker is running
docker ps

# View logs
docker compose logs postgres
docker compose logs minio

# Restart
docker compose restart
```

### Can't Connect to API?

```bash
# Check API is running
curl http://localhost:3000/health

# Check port not in use
lsof -i :3000

# Try different port
PORT=3001 pnpm dev
```

### Events Not Processing?

```bash
# Check job worker is running
pnpm --filter jobs dev

# View Inngest dashboard
open http://localhost:3001/dev  # Inngest UI
```

---

## Under the Hood

### What's Running:

```
Your Machine:
├─ PostgreSQL (localhost:5432)
│   ├─ Events table (source of truth)
│   ├─ Entities table (knowledge graph)
│   ├─ Relations table (connections)
│   └─ TimescaleDB extension (time-series)
│
├─ MinIO (localhost:9000)
│   └─ File storage (S3-compatible)
│
├─ Data Pod API (localhost:3000)
│   ├─ tRPC routes (type-safe)
│   ├─ WebSocket server (real-time)
│   └─ Authentication (Ory)
│
└─ Job Workers (background)
    ├─ Event processing
    ├─ AI extraction
    └─ Graph updates
```

### Data Flow:

```
1. You create note
   ↓
2. API creates event: "note.creation.requested"
   ↓
3. Event stored in events_v2 table (immutable)
   ↓
4. Inngest triggers worker
   ↓
5. Worker processes event:
   - Uploads content to MinIO
   - Extracts entities with AI
   - Creates relations
   - Updates projections
   ↓
6. Event "note.creation.completed" published
   ↓
7. Real-time update sent to your client
```

---

## Compare with Alternatives

| Task | Notion | Obsidian | Synap |
|------|--------|----------|-------|
| **Setup time** | 30 sec (cloud) | 1 min (local) | 5 min (self-hosted) |
| **Undo old changes** | ❌ Limited | ❌ Lost | ✅ Infinite |
| **AI branching** | ❌ No | ❌ No | ✅ Git-like |
| **Auto knowledge graph** | ⚠️ Manual relations | ⚠️ Manual links | ✅ AI-powered |
| **Data ownership** | ❌ Notion hosts | ✅ Local files | ✅ You host |
| **Real-time collab** | ✅ Yes | ❌ No | ✅ Yes |
| **Extensibility** | ⚠️ Limited API | ✅ Plugins | ✅ Full API + Plugins |

---

## 🎯 You Just Experienced:

✅ **Time-Travel** - Viewed past note states  
✅ **Infinite Undo** - Complete event history  
✅ **Branching AI** - Parallel specialist agents  
✅ **Knowledge Graph** - Auto-discovered connections  
✅ **Real-Time Sync** - Collaborative editing  
✅ **Data Sovereignty** - Running on your machine  

**All in 5 minutes.**

---

## What to Build Next?

### For Personal Use:
- Second brain (like Obsidian)
- Daily journal with AI insights
- Personal CRM with knowledge graph
- Research repository

### For Teams:
- Collaborative workspace (like Notion)
- Project management with AI
- Knowledge base with graph view
- Meeting notes with auto-summaries

### For Products:
- Legal case management
- Medical research database
- Investment analysis tool
- Sales pipeline with AI

**All with:**
- ✅ Full event history
- ✅ Time-travel debugging
- ✅ Knowledge graph
- ✅ Multi-agent AI
- ✅ Your infrastructure

---

**Ready to build?** Pick a [tutorial](./build-first-app) or dive into [concepts](../concepts/what-is-synap)! 🚀
