---
sidebar_position: 5
---

# Multi-Agent System

**A peer network of specialized AIs, not a hierarchy**

Traditional AI assistants try to do everything with one model. Synap runs a **network of peer agents** — each a specialist with its own tools and context — that route to each other based on intent. No single agent controls the others. The Data Pod's governance layer is the control surface, not an agent.

---

## The Problem with Single AI

```
Traditional (ChatGPT, Claude):

User: "Plan and execute a marketing campaign"

Single AI tries to:
├─ Research competitors (not deep enough)
├─ Create strategy (superficial)
├─ Write copy (generic)
├─ Design mockups (can't actually design)
└─ Plan execution (lacks expertise)

Result: Jack of all trades, master of none
```

**Issues**:
- One model does everything (mediocre at most)
- Can't work in parallel
- No specialization
- Limited context per domain
- Can't delegate effectively

---

## Synap's Solution: Peer Agent Network

```
Multi-Agent System:

User: "Plan marketing campaign"
  ↓
Intent Analyzer
  │  Understands request
  │  Routes to relevant agents
  │
  ├──► Researcher ──────────────────┐
  │      Deep competitive analysis  │
  │                                 │
  ├──► Writing Agent ───────────────┤
  │      Campaign copy              │  Results merged
  │                                 │  back to channel
  ├──► Knowledge Search ────────────┤
  │      Past campaign entities     │
  │                                 │
  └──► Action Agent ────────────────┘
         Proposes entity creation
         (subject to approval)
```

**Key properties**:
- ✅ Specialized expertise per domain
- ✅ Parallel execution — agents run concurrently
- ✅ Any agent can invoke any other agent as a tool
- ✅ No central coordinator — routing is intent-based
- ✅ Agent-to-agent async via A2AI channels (persistent, replayable)
- ✅ Governance at the Data Pod level, not the agent level

---

## Core Concepts

### 1. Agent Types

```typescript
type AgentType = {
  id: string;
  name: string;
  capabilities: string[];
  systemPrompt: string;
  model: string;  // Claude, GPT-4, Mistral, etc.
};
```

**Built-in Agents**:

```
🔍 Intent Analyzer
├─ Understands goals from free-form text
├─ Routes to relevant agents
└─ Model: Claude Sonnet

🔬 Researcher
├─ Deep topic investigation
├─ Competitor and market analysis
├─ Data gathering and synthesis
└─ Model: Claude Sonnet

💻 Code Agent
├─ Code architecture and review
├─ API and schema design
├─ Performance analysis
└─ Model: Claude Sonnet

✍️ Writing Agent
├─ Content writing and copywriting
├─ Summarization and rewriting
├─ Brand voice consistency
└─ Model: Claude Sonnet

🎯 Action Agent
├─ Executes approved Hub Protocol calls
├─ Creates entities, opens channels
├─ Subject to proposal governance
└─ Model: Claude Sonnet

🔎 Knowledge Search
├─ Semantic + full-text entity search
├─ Context retrieval for other agents
└─ (Tool, not a full agent)

🪞 Meta Agent
├─ Self-reflection and error recovery
├─ Replanning when agents stall
└─ Model: Claude Sonnet

🛠️ Custom Agents
└─ Domain-specific expertise, user-defined
```

---

### 2. Agent Capabilities

Each agent declares what it's good at:

```typescript
const researchAgent: Agent = {
  id: 'research',
  name: 'Research Specialist',
  capabilities: [
    'competitor_analysis',
    'market_research',
    'data_gathering',
    'trend_analysis',
    'user_research'
  ],
  systemPrompt: `You are a research specialist...
    Focus on deep, thorough analysis.
    Provide sources and evidence.
    Be objective and data-driven.`,
  model: 'claude-3-7-sonnet'
};
```

---

### 3. Peer Routing Pattern

**How it works**:

```
1. User sends message to ai_thread channel
   ↓
2. Intent Analyzer runs:
   - What is the goal?
   - Which agents are relevant?
   - Can this be done in parallel?
   ↓
3. Relevant agents invoked (possibly concurrently):
   a) Single agent for focused requests
   b) Multiple agents in parallel for compound requests
   c) Agent chains: Agent A invokes Agent B as a tool
   ↓
4. Action Agent submits proposals to Data Pod
   ↓
5. Results stream back to channel
   ↓
6. Proposals appear in user inbox for approval
```

**Why no master orchestrator?** A central coordinator is a bottleneck and a single point of failure. In a peer model, agents compose: the Researcher can ask Knowledge Search to find relevant entities, the Writing Agent can request the Researcher's output as input. No coordinator needed — governance lives at the Data Pod layer.

**Code Example**:
```typescript
// Intent Analyzer routing logic
async function routeRequest(message: string) {
  const analysis = await analyzeLLM({
    message,
    prompt: `Analyze this request. What agents are needed?
      Options: researcher, codeAgent, writingAgent, knowledgeSearch, actionAgent`
  });
  
  if (analysis.capabilities.includes('research')) {
    // Create research branch
    await createBranch({
      agentId: 'research',
      purpose: analysis.researchGoal
    });
  }
  
  if (analysis.capabilities.includes('technical')) {
    // Create technical branch
    await createBranch({
      agentId: 'technical',
      purpose: analysis.technicalGoal
    });
  }
  
  // Wait for results, then synthesize
}
```

---

## Agent Workflows

### 1. Simple Delegation

```
User: "Research Notion's pricing model"
  ↓
Orchestrator: "This needs research expertise"
  ↓
[BRANCH: Research]
  Agent: Research Specialist
  ├─ "Analyzing Notion pricing..."
  ├─ "Free tier: Personal use"
  ├─ "Plus tier: $10/month"
  ├─ "Business tier: $15/user/month"
  └─ [Summary of findings]
  ↓
[MERGE to main]
  ↓
Orchestrator: "Here's what I found..."
```

**Code**:
```typescript
// User request
await synap.chat.send({
  threadId: mainThread.id,
  message: "Research Notion's pricing"
});

// Orchestrator internally:
const needsResearch = await shouldDelegate({
  message: "Research Notion's pricing",
  capability: 'research'
});

if (needsResearch) {
  const branch = await synap.threads.createBranch({
    parentThreadId: mainThread.id,
    agentId: 'research',
    purpose: 'Analyze Notion pricing model'
  });
  
  // Research agent works in branch
  // Results merge back to main
}
```

---

### 2. Parallel Specialists

```
User: "Design a new pricing page"
  ↓
Orchestrator: "This needs research, creative, and technical"
  ↓
Creates 3 parallel branches:
  │
  ├─> [Research: Competitor pricing]
  │    Research Agent analyzing...
  │
  ├─> [Creative: Copywriting]
  │    Creative Agent writing...
  │
  └─> [Technical: Implementation]
       Technical Agent architecting...
  ↓
All branches work simultaneously
  ↓
[MERGE all results]
  ↓
Orchestrator: "Here's a complete plan:
  - Research findings (from Research)
  - Copy suggestions (from Creative)
  - Technical approach (from Technical)"
```

**Code**:
```typescript
// Orchestrator analyzes request
const plan = await orchestrator.plan({
  message: "Design a new pricing page"
});

// Result:
{
  tasks: [
    { capability: 'research', goal: 'Analyze competitor pricing' },
    { capability: 'creative', goal: 'Write compelling copy' },
    { capability: 'technical', goal: 'Design implementation' }
  ]
}

// Create branches in parallel
const branches = await Promise.all(
  plan.tasks.map(task => 
    synap.threads.createBranch({
      parentThreadId: main.id,
      agentId: task.capability,
      purpose: task.goal
    })
  )
);

// All agents work simultaneously
// Merge when all complete
```

---

### 3. Sequential Handoff

```
User: "Build a feature for tracking habits"
  ↓
Orchestrator: "I'll coordinate this"
  ↓
Step 1: Research Branch
  ├─ Research Agent: "Analyzed 5 habit apps"
  └─ [MERGE findings]
  ↓
Step 2: Technical Branch
  ├─ Technical Agent: "Here's the schema..."
  │   (uses research findings as context)
  └─ [MERGE architecture]
  ↓
Step 3: Creative Branch
  ├─ Creative Agent: "Here's the UX copy..."
  │   (uses research + technical as context)
  └─ [MERGE copy]
  ↓
Orchestrator: "Complete plan with:
  - Research insights
  - Technical design
  - UX copy"
```

---

## Agent Communication

### Between Agents

Agents can reference each other's work:

```typescript
// Research agent completes
const researchBranch = await synap.threads.getBranch('branch_research');

// Technical agent can access research context
await synap.chat.send({
  threadId: 'branch_technical',
  message: 'Design the schema',
  context: {
    fromBranch: 'branch_research',  // Include research findings
    summary: true  // Or full context
  }
});
```

---

### Agent Escalation

Agents can escalate to orchestrator:

```typescript
// Technical agent encounters issue
if (needsUserInput) {
  await escalateToOrchestrator({
    branchId: currentBranch,
    reason: 'Need clarification on database choice',
    question: 'PostgreSQL or MongoDB?'
  });
  
  // Orchestrator asks user
  // Returns answer to technical agent
}
```

---

## Building Custom Agents

### 1. Define Agent Spec

```typescript
const competitorAnalystAgent = {
  id: 'competitor_analyst',
  name: 'Competitor Analysis Specialist',
  description: 'Deep-dive into competitor strategies',
  
  capabilities: [
    'competitor_research',
    'market_positioning',
    'feature_comparison',
    'pricing_analysis'
  ],
  
  systemPrompt: `You are an expert competitor analyst.
    
    Your role:
    - Deep research into competitor products
    - Feature-by-feature comparison
    - Pricing strategy analysis
    - Market positioning insights
    
    Always provide:
    - Concrete examples
    - Data and sources
    - Actionable insights
    - Comparison tables`,
    
  model: 'claude-3-7-sonnet',
  
  tools: [
    'web_search',
    'document_analysis',
    'data_extraction'
  ]
};
```

---

### 2. Register Agent

```typescript
// Register your custom agent
await synap.agents.register(competitorAnalystAgent);

// Now available for branching
const branch = await synap.threads.createBranch({
  parentThreadId: main.id,
  agent Id: 'competitor_analyst',
  purpose: 'Analyze top 3 competitors'
});
```

---

### 3. Agent Tools

Give agents access to tools:

```typescript
const agentWithTools = {
  id: 'data_analyst',
  name: 'Data Analysis Specialist',
  tools: [
    {
      name: 'execute_sql',
      description: 'Run SQL queries on database',
      inputSchema: z.object({
        query: z.string(),
        database: z.string()
      })
    },
    {
      name: 'create_chart',
      description: 'Generate charts from data',
      inputSchema: z.object({
        data: z.array(z.any()),
        chartType: z.enum(['line', 'bar', 'pie'])
      })
    }
  ]
};
```

---

## UI Patterns You Can Build

### 1. Agent Selector

```
┌────────────────────────────────┐
│ Choose Agent for This Branch   │
├────────────────────────────────┤
│ ○ Orchestrator (coordinator)   │
│   Best for: General tasks      │
│                                │
│ ● Research Specialist          │
│   Best for: Deep analysis      │
│                                │
│ ○ Technical Specialist         │
│   Best for: Code, architecture │
│                                │
│ ○ Creative Specialist          │
│   Best for: Writing, design    │
│                                │
│ ○ Competitor Analyst (custom)  │
│   Best for: Market research    │
│                                │
│      [Cancel]  [Create Branch] │
└────────────────────────────────┘
```

---

### 2. Agent Activity Dashboard

```
┌────────────────────────────────────────┐
│ Agent Activity                         │
├────────────────────────────────────────┤
│ 🎯 Orchestrator                  ACTIVE│
│    Main conversation                   │
│    Last: 1 min ago                     │
├────────────────────────────────────────┤
│ 🔬 Research Specialist           ACTIVE│
│    Analyzing competitors               │
│    Progress: 60% (3/5 analyzed)        │
│    Last: Just now                      │
├────────────────────────────────────────┤
│ 💻 Technical Specialist          IDLE  │
│    Awaiting research results           │
│    Will start when research completes  │
└────────────────────────────────────────┘
```

---

### 3. Agent Chat Bubbles

Different visual styles per agent:

```
┌─────────────────────────────────────┐
│ You: "Plan marketing campaign"      │
├─────────────────────────────────────┤
│ 🎯 Orchestrator:                    │
│ "I'll coordinate research and       │
│  creative specialists for this."    │
│  └─> Created 2 branches             │
├─────────────────────────────────────┤
│ 🔬 Research (in branch):            │
│ "Analyzed 5 competitors.            │
│  Key findings: ..."                 │
│  [View full research →]             │
├─────────────────────────────────────┤
│ 🎯 Orchestrator:                    │
│ "Based on research, here's a plan:" │
│ [Synthesized results]               │
└─────────────────────────────────────┘
```

---

## Comparison with Single AI

| Feature | ChatGPT/Claude | Synap Multi-Agent |
|---------|----------------|-------------------|
| **Specialization** | ❌ One model | ✅ Specialists per domain |
| **Parallel work** | ❌ Sequential | ✅ Simultaneous |
| **Delegation** | ❌ Manual | ✅ Automatic |
| **Context depth** | ⚠️ Shallow per topic | ✅ Deep per specialist |
| **Custom agents** | ❌ No | ✅ Build your own |
| **Coordination** | ❌ User does it | ✅ Orchestrator handles |

---

## Real-World Examples

### Example 1: Product Launch

```
User: "Launch new pricing tier"
  ↓
Orchestrator creates plan:
  │
  ├─> [Research: Market Analysis]
  │    ├─ Competitor pricing
  │    ├─ Customer feedback
  │    └─ Price sensitivity data
  │
  ├─> [Technical: Implementation]
  │    ├─ Billing system changes
  │    ├─ Feature gating
  │    └─ Migration plan
  │
  ├─> [Creative: Marketing Copy]
  │    ├─ Landing page copy
  │    ├─ Email announcement
  │    └─ Social media posts
  │
  └─> [Custom: Financial Model]
       ├─ Revenue projections
       ├─ Cost analysis
       └─ ROI forecast

All work in parallel
Merge results → Complete launch plan
```

---

### Example 2: Technical Design

```
User: "Design a real-time collaboration feature"
  ↓
Orchestrator delegates:
  │
  ├─> [Research: Existing Solutions]
  │    Analyzes Google Docs, Figma, Notion
  │
  ├─> [Technical: Architecture]
  │    ├─ WebSocket vs WebRTC
  │    ├─ CRDT vs OT
  │    └─ State sync strategy
  │
  └─> [Technical: Database Schema]
       Uses architecture decisions

Sequential handoff for dependencies
```

---

## Best Practices

### 1. Let Orchestrator Decide

```typescript
// ✅ Good: Let orchestrator analyze
await synap.chat.send({
  threadId: main.id,
  message: "Build a pricing page"
});
// Orchestrator automatically delegates

// ⚠️ Manual: You decide agent assignment
// (Only when you need specific behavior)
```

---

### 2. Clear Agent Boundaries

```typescript
// ✅ Good: Specialized agents
const agents = {
  research: ['competitor_analysis', 'market_research'],
  technical: ['architecture', 'implementation'],
  creative: ['copywriting', 'design']
};

// ❌ Avoid: Overlapping responsibilities
// Makes orchestrator decision unclear
```

---

### 3. Provide Context Between Agents

```typescript
// ✅ Good: Link branch contexts
await synap.threads.createBranch({
  parentThreadId: main.id,
  agentId: 'technical',
  purpose: 'Design schema',
  context: {
    fromBranches: ['branch_research']  // Use research findings
  }
});
```

---

## Next Steps

- **[Tutorial: Build a Custom Agent](../tutorials/build-custom-agent)** - Step-by-step guide
- **[Guide: Multi-Agent Workflows](../guides/by-feature/multi-agent-workflows)** - Advanced patterns
- **[Branching Conversations](./branching-conversations)** - How agents work in branches
- **[API Reference: Agents API](../../integrate/reference/agents-api)** - Complete API docs

---

## Inspiration

- **MCP (Model Context Protocol)**: Open tool-use standard — Synap implements both client and server
- **AutoGPT / BabyAGI**: Agent autonomy and task decomposition patterns
- **CrewAI**: Role-based agent specialization
- **OpenClaw**: Community skill ecosystem and multi-channel relay

---

:::info Learn more on the website
- [User-friendly guide to AI Features](https://www.synap.live/guides/ai) — practical overview of Synap's multi-agent AI system
:::
