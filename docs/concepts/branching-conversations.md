---
sidebar_position: 4
---

# Branching Conversations

**Git for your thoughts: Explore ideas in parallel without losing context**

Traditional chat is linear. Synap lets you branch conversations like Git branches, enabling parallel AI exploration and deep dives without polluting your main thread.

---

## The Problem with Linear Chat

```
Traditional Chat (ChatGPT, Claude):

User: "Plan marketing for new feature"
AI: "I can help with that..."
User: "Actually, first research competitors"
AI: "Okay, let me research..."
  [20 messages of competitor analysis]
User: "Now back to the marketing plan"
AI: "Sorry, what feature were we discussing?"
  [Context lost, has to re-explain]
```

**Issues**:
- Can't explore tangents without losing main thread
- Context gets polluted with off-topic deep dives
- Can't work on multiple angles simultaneously
- No way to "shelve" an exploration and come back
- Parallel tasks require separate chats (context loss)

---

## Synap's Solution: Branch Like Git

```
Main Thread:
├─ User: "Plan marketing for new feature"
├─ Agent: "I'll research competitors [creates branch]"
│   │
│   └─ [BRANCH: Competitor Research] ← Happens in parallel
│       ├─ Research Agent takes over
│       ├─ 20 messages of deep analysis
│       ├─ Finds 5 key insights
│       └─ [MERGED back to main]
│
├─ Agent: "Based on research, here's the plan..."
│   [Main thread stayed clean]
└─ User: "Great! Now create the project"
    └─ [BRANCH: Project Setup] ← Another branch
```

**Benefits**:
- ✅ Main thread stays focused
- ✅ Deep dives don't pollute context
- ✅ Multiple agents work in parallel
- ✅ Full branch history preserved
- ✅ Merge insights back when ready

---

## Core Concepts

### 1. Thread Types

```typescript
type ThreadType = 'main' | 'branch';

// Main thread: Primary conversation
{
  id: 'thread_main',
  type: 'main',
  title: 'Marketing Planning',
  agentId: 'orchestrator',  // Coordinator
  status: 'active'
}

// Branch: Focused exploration
{
  id: 'thread_branch_123',
  type: 'branch',
  parentThreadId: 'thread_main',
  branchedFromMessageId: 'msg_456',
  branchPurpose: 'Deep competitor research',
  agentId: 'research_specialist',  // Specialist
  status: 'active'
}
```

---

### 2. Branch Creation

**When to Branch**:
- 🔬 Deep research needed
- 🤔 Exploring alternative approaches
- 🛠️ Technical implementation details
- ✍️ Content creation (writing, coding)
- 📊 Data analysis

**How Branches are Created**:

```typescript
// Manual: User creates branch
const branch = await synap.threads.createBranch({
  parentThreadId: 'thread_main',
  fromMessageId: 'msg_current',
  purpose: 'Research pricing models',
  agentId: 'research'  // Optional: assign specialist
});

// Automatic: Agent suggests branching
// "This requires deep research. I'll branch off."
// [User approves] → Branch created automatically
```

---

### 3. Agent Assignment

Different agents for different branches:

```
Main Thread:
└─ Orchestrator (generalist, coordinates)

Branches:
├─ Research Branch → Research Specialist
├─ Technical Branch → Technical Specialist
├─ Creative Branch → Creative Specialist
└─ Custom Branch → Your Custom Agent
```

**Example**:
```typescript
// Orchestrator in main thread
const mainResponse = await synap.chat.send({
  threadId: 'thread_main',
  message: 'Build a pricing page'
});

// Orchestrator: "I'll delegate research and design"

// Creates branches with specialists:
const researchBranch = await synap.threads.createBranch({
  parentThreadId: 'thread_main',
  purpose: 'Research competitor pricing',
  agentId: 'research'  // Research specialist
});

const designBranch = await synap.threads.createBranch({
  parentThreadId: 'thread_main',
  purpose: 'Design pricing UI',
  agentId: 'creative'  // Creative specialist
});

// Both work in parallel!
```

---

## Branching Workflows

### 1. Research Flow

```
Main: "Plan marketing campaign"
  │
  └─> [BRANCH: Competitor Analysis]
       Agent: Research Specialist
       ├─ "Analyzing Notion's pricing..."
       ├─ "Obsidian's community strategy..."
       ├─ "Findings: 5 key insights"
       └─ [MERGE] → Insights added to main thread

Main: "Based on research, here's the plan..."
  [Continues with enriched context]
```

**Code**:
```typescript
// Create research branch
const research = await synap.threads.createBranch({
  parentThreadId: mainThread.id,
  purpose: 'Analyze competitors',
  agentId: 'research'
});

// Research happens asynchronously
// Main thread can continue or wait

// Merge when ready
const insights = await synap.threads.merge(research.id, mainThread.id);
// Main thread now has insights without the 50-message deep dive
```

---

### 2. Parallel Exploration

```
Main: "Design a new feature"
  │
  ├─> [BRANCH A: Technical Feasibility]
  │    Agent: Technical Specialist
  │    └─ "Postgres can handle it, here's the schema..."
  │
  ├─> [BRANCH B: UX Design]
  │    Agent: Creative Specialist
  │    └─ "Here are 3 mockup concepts..."
  │
  └─> [BRANCH C: Market Research]
       Agent: Research Specialist
       └─ "Competitor feature comparison..."

All 3 branches work simultaneously
Merge all back → Main thread gets:
- Technical plan
- Design mockups
- Market validation
```

**Code**:
```typescript
// Create multiple branches
const branches = await Promise.all([
  synap.threads.createBranch({
    parentThreadId: main.id,
    purpose: 'Technical feasibility',
    agentId: 'technical'
  }),
  synap.threads.createBranch({
    parentThreadId: main.id,
    purpose: 'UX design concepts',
    agentId: 'creative'
  }),
  synap.threads.createBranch({
    parentThreadId: main.id,
    purpose: 'Market validation',
    agentId: 'research'
  })
]);

// All work in parallel

// Merge results
const results = await synap.threads.mergeAll(
  branches.map(b => b.id),
  main.id
);
```

---

### 3. Context Switching

```
Main Thread: Working on Project A
  │
  ├─ [Active work...]
  │
  └─> [BRANCH: Quick Research]
       ├─ "Let me look up this API..."
       ├─ [10 messages of research]
       ├─ "Found the answer"
       └─ [MERGE or ARCHIVE]

Main Thread: Back to Project A
  [Context preserved, no pollution]
```

**Use Case**: "Hold on, I need to look something up"

```typescript
// Quick detour
const quickBranch = await synap.threads.createBranch({
  parentThreadId: main.id,
  purpose: 'Look up GraphQL best practices',
  agentId: 'research'
});

// Do research
// ...

// Options when done:
// 1. Merge insights back
await synap.threads.merge(quickBranch.id, main.id);

// 2. Or archive (keep for reference but don't merge)
await synap.threads.archive(quickBranch.id);

// Main thread unaffected either way
```

---

## Branch Lifecycle

```
┌─────────────┐
│   CREATE    │ ← From main thread
└──────┬──────┘
       │
       v
┌─────────────┐
│   ACTIVE    │ ← Agent works here
└──────┬──────┘
       │
       v
   ┌───┴───┐
   │       │
   v       v
[MERGE] [ARCHIVE]
   │       │
   v       v
 MERGED  ARCHIVED
   │       │
   └───┬───┘
       v
  (Available in history)
```

**Status Flow**:
```typescript
type ThreadStatus = 
  | 'active'    // Currently being worked on
  | 'merged'    // Merged back to parent
  | 'archived'; // Kept for reference

// Transitions:
// active → merged (insights added to parent)
// active → archived (shelved for later)
// merged/archived → viewable in history
```

---

## Merging Strategies

### 1. Summary Merge (Default)

```typescript
// Agent summarizes branch and adds to main
await synap.threads.merge(branchId, mainId, {
  strategy: 'summary'
});

// Result in main thread:
// "Research findings: [5-point summary]"
// (Full branch available in history)
```

---

### 2. Full Context Merge

```typescript
// All branch messages added to main
await synap.threads.merge(branchId, mainId, {
  strategy: 'full'
});

// Use when: Deep context needed in main thread
```

---

### 3. Selective Merge

```typescript
// Cherry-pick specific messages
await synap.threads.merge(branchId, mainId, {
  strategy: 'selective',
  messageIds: ['msg_123', 'msg_456']
});

// Use when: Only some insights relevant
```

---

## UI Patterns You Can Build

### 1. Git-Style Branch Viewer

```
📊 Thread Visualizer:

main ─┬─ msg1 ─ msg2 ─ msg3 ─┬─ msg7 ─ msg8
      │                      │
      └─ [research] ─────────┘
         msg4 ─ msg5 ─ msg6
         └─> merged

Click any branch to expand
```

**Implementation**:
```typescript
const tree = await synap.threads.getTree(mainThreadId);

// Returns:
{
  main: {
    id: 'thread_main',
    messages: [...],
    branches: [
      {
        id: 'branch_research',
        branchedFrom: 'msg_3',
        mergedAt: 'msg_7',
        messages: [...]
      }
    ]
  }
}
```

---

### 2. Branch List Sidebar

```
┌─────────────────────────────┐
│ Active Branches (3)         │
├─────────────────────────────┤
│ 🔬 Competitor Research      │
│    Last: 2 min ago          │
│    [Continue] [Merge]       │
├─────────────────────────────┤
│ 🎨 Design Mockups           │
│    Last: 10 min ago         │
│    [Continue] [Merge]       │
├─────────────────────────────┤
│ 🛠️ Technical Spec           │
│    Last: 1 hour ago         │
│    [Continue] [Archive]     │
└─────────────────────────────┘
```

---

### 3. Branch Creation Dialog

```
┌─────────────────────────────────────┐
│ Create Branch                       │
├─────────────────────────────────────┤
│ Purpose:                            │
│ [Research competitor pricing    ]   │
│                                     │
│ Assign Agent:                       │
│ ( ) Orchestrator (general)          │
│ (•) Research (specialist) ← Selected│
│ ( ) Technical (specialist)          │
│ ( ) Custom agent                    │
│                                     │
│ Branch from:                        │
│ [•] Current message                 │
│ [ ] Start of conversation           │
│                                     │
│      [Cancel]  [Create Branch]      │
└─────────────────────────────────────┘
```

---

## Comparison with Traditional Chat

| Feature | ChatGPT/Claude | Synap |
|---------|----------------|-------|
| **Branching** | ❌ No | ✅ Full Git-like |
| **Parallel exploration** | ❌ One at a time | ✅ Multiple simultaneous |
| **Context preservation** | ⚠️ Gets polluted | ✅ Main stays clean |
| **Agent specialization** | ❌ Same model | ✅ Different per branch |
| **Branch history** | ❌ Lost | ✅ Full tree |
| **Merge control** | ❌ N/A | ✅ Summary/Full/Selective |

---

## Real-World Examples

### Example 1: Content Creation

```
Main: "Write a blog post about AI trends"
  │
  ├─> [BRANCH: Research 2024 Trends]
  │    ├─ "Analyzing current AI landscape..."
  │    └─ [MERGE: 10 key trends]
  │
  ├─> [BRANCH: Draft Outline]
  │    ├─ "Based on research, here's structure..."
  │    └─ [MERGE: Outline]
  │
  └─> [BRANCH: Write Introduction]
       ├─ "Here are 3 intro options..."
       └─ [User picks one, continues in main]

Main: "Now write the body..."
  [All context from branches available]
```

---

### Example 2: Technical Decision

```
Main: "Should we use PostgreSQL or MongoDB?"
  │
  ├─> [BRANCH: PostgreSQL Analysis]
  │    Agent: Technical Specialist
  │    ├─ Performance benchmarks
  │    ├─ Schema design
  │    └─ [MERGE: Pros/Cons list]
  │
  └─> [BRANCH: MongoDB Analysis]
       Agent: Technical Specialist
       ├─ Scalability analysis
       ├─ Query patterns
       └─ [MERGE: Pros/Cons list]

Main: "Recommendation: PostgreSQL because..."
  [Both analyses merged, clear decision]
```

---

## Best Practices

### 1. Branch Early, Merge Often

```typescript
// ✅ Good: Create branch for deep dives
if (needsResearch) {
  const branch = await synap.threads.createBranch({
    purpose: 'Research X',
    agentId: 'research'
  });
}

// ❌ Avoid: Everything in main thread
// (Context gets messy)
```

---

### 2. Use Descriptive Branch Names

```typescript
// ✅ Good: Clear purpose
purpose: 'Research competitor pricing models'
purpose: 'Design mockups for landing page'
purpose: 'Technical feasibility of real-time sync'

// ❌ Avoid: Vague names
purpose: 'Research'
purpose: 'Design stuff'
purpose: 'Check something'
```

---

### 3. Assign Appropriate Agents

```typescript
// ✅ Good: Match agent to task
{
  purpose: 'Research market size',
  agentId: 'research'  // Specialist
}

{
  purpose: 'Write API documentation',
  agentId: 'technical'  // Specialist
}

// ⚠️ Less optimal: Generic agent for specialized work
{
  purpose: 'Deep technical analysis',
  agentId: 'orchestrator'  // Generalist
}
```

---

## Next Steps

- **[Tutorial: Build a Branch Visualizer](../tutorials/branch-visualizer)** - Git-style UI
- **[Guide: Multi-Agent Workflows](../guides/by-feature/multi-agent-workflows)** - Advanced patterns
- **[Multi-Agent System](./multi-agent-system)** - How agents coordinate
- **[API Reference: Threads API](../reference/threads-api)** - Complete API docs

---

## Inspiration

- **Git**: Branch/merge model
- **Linear**: Issue branching
- **Radicle**: Decentralized git
- **Theory**: Conversational branching in collaborative AI
