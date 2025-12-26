---
sidebar_position: 1
---

# What is Synap?

**Synap is a Personal Data Operating System that gives you superpowers**

Unlike traditional apps that update your data and forget the past, Synap is built on a fundamentally different architecture that enables capabilities impossible in conventional systems.

---

## 🎯 At a Glance

Synap is **not just a note-taking app**. It's a complete platform for building intelligent, data-sovereign applications with:

- 🕐 **Time-Travel** - Never lose data, undo anything, see your workspace from any point in time
- 🌳 **Branching** - Git-like conversations, parallel AI exploration, context switching
- 🧠 **Knowledge Graph** - Automatic connections, bi-directional links, relationship discovery
- 🤖 **Multi-Agent AI** - Specialized AI team, not just one assistant
- 🔒 **Data Sovereignty** - You own it, you host it, you control it

---

## 🕐 Time-Travel Your Data

**The Problem**: In traditional apps, when you edit something, the old version is gone forever.

**Synap's Solution**: Every single change is recorded as an immutable event. Nothing is ever truly deleted.

### What This Enables:

```typescript
// Show me my workspace from last Tuesday
const workspace = await synap.timeline.getState('2024-12-17');

// Why did the AI suggest this?
const reasoning = await synap.events.getAIReasoning('suggestion_123');

// Undo my last 3 changes
await synap.history.undo({ count: 3 });
```

**UI You Can Build**:
- Activity timeline view
- Infinite undo/redo
- "Show workspace from [date]" feature
- AI reasoning explanations
- Audit trails for compliance

**vs Traditional Apps**:
| Feature | Notion/Obsidian | Synap |
|---------|-----------------|-------|
| Undo | Limited history | Infinite |
| View past state | ❌ Not possible | ✅ Any point in time |
| AI transparency | Hidden | Full reasoning trace |
| Audit trail | Manual logs | Automatic |

[Learn more about Event Sourcing →](./event-sourcing-explained)

---

## 🌳 Branching Conversations

**The Problem**: When you're in a conversation and want to explore a tangent, you either:
- Lose the main thread context
- Pollute the main conversation
- Open a new chat and lose continuity

**Synap's Solution**: Branch conversations like Git branches.

### How It Works:

```typescript
// Mid-conversation, branch off to research
const researchBranch = await synap.threads.createBranch({
  parentThreadId: 'main_thread',
  fromMessageId: 'msg_789',
  purpose: 'Research competitors in detail',
  agentId: 'research_specialist'  // Assign specialist AI
});

// Work happens in parallel
// Main thread continues
// Research branch deep-dives

// Merge insights back
await synap.threads.merge(researchBranch.id, 'main_thread');
```

**UI You Can Build**:
- Git-style branch visualization
- Parallel AI exploration
- Branch history explorer
- Merge conflict resolution UI

**Real Example**:
```
Main Conversation:
├─ User: "Plan marketing for new feature"
├─ Agent: "Let me research competitors"
│   └─ [BRANCH: Research] ← Research Agent works here
│       ├─ Analyzed Notion's pricing
│       ├─ Reviewed Obsidian's community
│       └─ [MERGED: 5 insights]
├─ Agent: "Based on research, here's a plan..."
└─ User: "Great! Create project"
    └─ [BRANCH: Setup] ← Action Agent works here
```

**vs Traditional Chat**:
| Feature | ChatGPT/Claude | Synap |
|---------|----------------|-------|
| Branching | ❌ No | ✅ Full Git-like |
| Parallel exploration | ❌ No | ✅ Multiple agents |
| Merge context | ❌ Manual copy-paste | ✅ Automatic |
| Branch history | ❌ Lost | ✅ Full tree |

[Learn more about Branching →](./branching-conversations)

---

## 🧠 Knowledge Graph

**The Problem**: In traditional apps, you manually create links between notes. It's tedious and incomplete.

**Synap's Solution**: Everything is automatically connected through a knowledge graph.

### How It Works:

Every piece of content becomes an **entity** (note, task, person, project, event), and relationships are automatically discovered by AI or explicitly created.

```typescript
// Find all notes mentioning "Marie" and "Project X"
const connected = await synap.graph.findRelated({
  entity: 'contact_marie',
  relationTypes: ['mentions', 'assigned_to'],
  filters: { projectId: 'project_x' }
});

// Discover hidden connections
const suggestions = await synap.graph.suggestConnections();
// "These 3 notes should be a project"
```

**UI You Can Build**:
- Interactive network graph (like Obsidian)
- Entity pages ("Show all mentions of Marie")
- Smart relationship suggestions
- Topic clusters
- Cross-project analytics

**Graph Structure**:
```
[Note: "Call Marie"] ──mentions──> [Contact: Marie]
         │                              │
    belongs_to                     assigned_to
         │                              │
         v                              v
[Project: App Redesign] <────related_to───┘
```

**vs Obsidian/Roam**:
| Feature | Obsidian | Synap |
|---------|----------|-------|
| Links | Manual `[[]]` | Automatic + Manual |
| Graph view | ✅ Yes | ✅ Yes + AI insights |
| AI suggestions | ❌ No | ✅ "Connect these notes" |
| Typed relations | ❌ Generic links | ✅ mentions, assigned_to, etc. |

[Learn more about Knowledge Graph →](./knowledge-graph)

---

## 🤖 Multi-Agent AI

**The Problem**: One AI assistant tries to do everything (planning, research, coding, writing). Jack of all trades, master of none.

**Synap's Solution**: Multiple specialized agents, coordinated by an orchestrator.

### The Team:

```
┌─────────────────┐
│  Orchestrator   │ ← Coordinates everything
└─────────────────┘
         │
    ┌────┴────┬────────────┬─────────────┐
    │         │            │             │
    v         v            v             v
[Research] [Technical] [Creative] [Your Custom Agent]
```

**How It Works**:

```typescript
// Orchestrator analyzes your request
await synap.chat.send("Plan a marketing campaign");

// Orchestrator delegates:
// 1. Research Agent → Analyze competitors
// 2. Creative Agent → Generate campaign ideas
// 3. Technical Agent → Suggest implementation
// All work in parallel branches

// Results merge back to you with insights from each specialist
```

**Real Flow**:
```
You: "Plan marketing for new feature"

Orchestrator: "I'll coordinate research and creative"
  ├─ [Delegates to Research Agent]
  │   → Finds 5 competitor strategies
  ├─ [Delegates to Creative Agent]
  │   → Generates 10 campaign concepts
  └─ [Synthesizes results]
      → "Here's a plan combining insights from both"
```

**vs Single AI**:
| Feature | ChatGPT/Claude | Synap |
|---------|----------------|-------|
| Specialization | ❌ One model | ✅ Multiple specialists |
| Parallel work | ❌ Sequential | ✅ Concurrent |
| Agent switching | ❌ Manual | ✅ Automatic delegation |
| Custom agents | ❌ Limited | ✅ Build your own |

[Learn more about Multi-Agent System →](./multi-agent-system)

---

## 🔒 Data Sovereignty

**The Problem**: Your data lives on someone else's servers (Notion, Google, Apple). They can:
- Change pricing anytime
- Change features
- Shut down
- Mine your data
- Lock you in

**Synap's Solution**: You own the infrastructure.

### What This Means:

✅ **Self-Hosted**: Run on your server, your laptop, or your Raspberry Pi  
✅ **Open Source**: Core OS is MIT licensed, inspect every line  
✅ **Portable**: Export everything, migrate anytime  
✅ **Private**: Your data never leaves your control  
✅ **Extensible**: Build plugins without asking permission  

```bash
# Your data, your rules
docker compose up -d  # That's it, you're running Synap
```

**Deployment Options**:
- 🏠 **Self-hosted**: Docker Compose on your server
- ☁️ **Cloud**: Deploy to AWS/GCP/Azure (you control it)
- 🔒 **Air-gapped**: Works completely offline
- 🌐 **Managed** (future): We host, you still own the data

[Learn more about Data Sovereignty →](./data-sovereignty)

---

## 🎨 What Can You Build?

Because Synap is a **platform**, not just an app, you can build:

### **Personal Apps**:
- Second Brain (like Obsidian)
- Daily journal with AI insights
- Personal CRM
- Research assistant
- Habit tracker with analytics

### **Team Apps**:
- Collaborative workspace (like Notion)
- Project management
- Knowledge base
- Meeting notes + AI summaries
- Team wiki with graph view

### **Specialized Apps**:
- Legal case management
- Medical research database
- Investment analysis tool
- Academic paper organizer
- Sales pipeline + AI insights

**All with**:
- ✅ Full event history
- ✅ Knowledge graph connections
- ✅ Branching conversations
- ✅ Multi-agent AI
- ✅ Your ownership

---

## 🆚 How Synap Compares

### vs Notion
```
✅ Synap Advantages:
- You own the infrastructure
- Infinite undo (event sourcing)
- Branching conversations
- Multi-agent AI
- Full API access

⚠️ Notion Better For:
- Simpler onboarding
- No hosting needed
- Team already on Notion
```

### vs Obsidian
```
✅ Synap Advantages:
- Automatic connections (AI-powered)
- Real-time collaboration
- Multi-agent AI
- Event history
- Branching conversations

⚠️ Obsidian Better For:
- Offline-first simplicity
- No server needed
- Markdown purists
```

### vs Standard Notes
```
✅ Synap Advantages:
- Knowledge graph
- AI capabilities
- Branching
- Extensibility
- Event sourcing

⚠️ Standard Notes Better For:
- Ultra-simple encryption
- Mobile-first
```

[See full comparisons →](../resources/comparisons/overview)

---

## 🚀 Getting Started

Ready to experience the difference?

1. **[5-Minute Demo](../quick-start/demo)** - Deploy a working app
2. **[Core Concepts](./event-sourcing-explained)** - Understand the architecture
3. **[Build Tutorial](../tutorials/build-first-app)** - Create your first app
4. **[Migrate](../resources/migration/from-notion)** - Bring your data

---

## 💡 Key Takeaway

**Synap isn't "another note app."**

It's a **Personal Data Operating System** that fundamentally changes what's possible:

| Traditional Apps | Synap |
|------------------|-------|
| Update → forget | Record → remember |
| Single AI | AI team |
| Flat notes | Knowledge graph |
| Linear chat | Branching exploration |
| They own it | You own it |

**Next**: Learn about the [Event Sourcing](./event-sourcing-explained) that powers time-travel →
