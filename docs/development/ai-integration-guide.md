---
sidebar_position: 6
---

# AI Integration Guide

**Complete guide to adding AI intelligence to Data Pod**

---

## Overview

Data Pod supports multiple ways to add AI capabilities:

### 1. Visual Tools (No Code)
- **LangFlow** - Visual AI agent builder
- **N8N** - Automation workflows

### 2. Code-Based (Direct Integration)
- **LangGraph** - Agent orchestration framework
- **Vercel AI SDK** - Multi-model AI toolkit
- **Custom Code** - Full control

### 3. External Services
- **Intelligence Registry** - Remote AI services
- **HTTP Webhooks** - Any external AI

---

## Quick Decision Tree

```
Want to build AI without code?
├─ Yes → Use LangFlow (visual agent builder)
│
└─ No → Need code control?
    ├─ Simple AI calls → Vercel AI SDK
    ├─ Complex agents → LangGraph
    └─ External service → Intelligence Registry
```

---

## Option 1: LangFlow (Visual AI Builder)

### What is LangFlow?

**Visual interface** for building LangGraph agents without code.

**Perfect for**:
- Knowledge workers customizing AI
- Rapid prototyping
- Non-developers
- Visual learners

### How It Works

```
LangFlow UI (visual editor)
  ↓
Exports LangGraph agent code
  ↓
Deploy to Data Pod
  ↓
Available via tRPC API
```

### Example: Personal Research Assistant

**In LangFlow**:
```
1. Drag nodes:
   - Input: User query
   - RAG: Search notes
   - LLM: Generate summary
   - Output: Formatted response

2. Connect nodes visually

3. Test in LangFlow

4. Export agent
```

**Deploy to Data Pod**:
```bash
# Export from LangFlow
langflow export --agent research-assistant --output ./agent.py

# Convert to TypeScript (or use Python runtime)
# Place in packages/ai/src/agents/research-assistant.ts

# Register with Data Pod
# Automatically available via API
```

**Use from Frontend**:
```typescript
const response = await client.ai.research.query({
  question: "Summarize my Lisbon trip notes"
});
```

### LangFlow Features

✅ **Visual graph editor**  
✅ **Pre-built components** (RAG, chains, tools)  
✅ **Test directly** in UI  
✅ **Export to code**  
✅ **Version control** friendly (JSON exports)

### Integration with Data Pod

LangFlow agents can access Data Pod directly:

```python
# LangFlow agent has Data Pod tools
from datapod_tools import search_notes, create_entity

def research_agent(query):
    # Search user's notes
    notes = search_notes(query)
    
    # Generate summary with LLM
    summary = llm.generate(notes)
    
    # Save as entity
    create_entity(type="summary", content=summary)
    
    return summary
```

**Learn more**: [LangFlow Documentation](https://langflow.org)

---

## Option 2: LangGraph (Code-Based Agents)

### What is LangGraph?

**Agent orchestration framework** for complex AI workflows.

**Perfect for**:
- Multi-step reasoning
- Agent collaboration
- Conditional logic
- State management

### Example: Meeting Notes Processor

```typescript
// packages/ai/src/agents/meeting-processor.ts
import { StateGraph } from '@langchain/langgraph';
import { db, notes, entities } from '@synap/database';

interface MeetingState {
  noteId: string;
  content: string;
  topics: string[];
  tasks: Array<{ title: string; assignee?: string }>;
  summary: string;
}

export function createMeetingAgent() {
  const graph = new StateGraph<MeetingState>();
  
  // Step 1: Extract topics
  graph.addNode('extract_topics', async (state) => {
    const topics = await llm.extract({
      prompt: `Extract main topics from: ${state.content}`,
      schema: z.array(z.string())
    });
    return { ...state, topics };
  });
  
  // Step 2: Find action items
  graph.addNode('extract_tasks', async (state) => {
    const tasks = await llm.extract({
      prompt: `Extract tasks from: ${state.content}`,
      schema: TaskSchema
    });
    return { ...state, tasks };
  });
  
  // Step 3: Generate summary
  graph.addNode('summarize', async (state) => {
    const summary = await llm.generate({
      prompt: `Summarize meeting covering: ${state.topics.join(', ')}`
    });
    return { ...state, summary };
  });
  
  // Step 4: Save to Data Pod
  graph.addNode('save', async (state) => {
    // Create topic entities
    for (const topic of state.topics) {
      await db.insert(entities).values({
        type: 'topic',
        title: topic,
        sourceNoteId: state.noteId
      });
    }
    
    // Create task entities
    for (const task of state.tasks) {
      await db.insert(entities).values({
        type: 'task',
        title: task.title,
        assignee: task.assignee
      });
    }
    
    return state;
  });
  
  // Define flow
  graph.setEntryPoint('extract_topics');
  graph.addEdge('extract_topics', 'extract_tasks');
  graph.addEdge('extract_tasks', 'summarize');
  graph.addEdge('summarize', 'save');
  
  return graph.compile();
}
```

### Using with Vercel AI SDK

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Vercel AI SDK for LLM calls
const llm = {
  async generate(options) {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt: options.prompt
    });
    return text;
  },
  
  async extract(options) {
    const { object } = await generateObject({
      model: openai('gpt-4'),
      schema: options.schema,
      prompt: options.prompt
    });
    return object;
  }
};
```

### Register Agent

```typescript
// packages/api/src/routers/ai.ts
import { createMeetingAgent } from '@synap/ai';

export const aiRouter = router({
  processMeeting: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const agent = createMeetingAgent();
      
      // Get note
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, input.noteId)
      });
      
      // Run agent
      const result = await agent.invoke({
        noteId: input.noteId,
        content: note.content,
        topics: [],
        tasks: [],
        summary: ''
      });
      
      return { summary: result.summary, tasks: result.tasks };
    })
});
```

---

## Option 3: Vercel AI SDK (Simple AI Calls)

### What is Vercel AI SDK?

**Multi-model AI toolkit** for simple AI operations.

**Perfect for**:
- Text generation
- Structured extraction
- Streaming responses
- Multi-model support (OpenAI, Anthropic, Google, etc.)

### Example: Note Summarizer

```typescript
// packages/api/src/routers/ai-helpers.ts
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const aiHelpersRouter = router({
  summarize: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      const { text } = await generateText({
        model: openai('gpt-4'),
        prompt: `Summarize this concisely:\n\n${input.text}`
      });
      
      return { summary: text };
    }),
  
  // Streaming response
  chat: protectedProcedure
    .input(z.object({ messages: z.array(MessageSchema) }))
    .mutation(async function* ({ input }) {
      const stream = await streamText({
        model: openai('gpt-4'),
        messages: input.messages
      });
      
      for await (const chunk of stream.textStream) {
        yield { chunk };
      }
    })
});
```

---

## Option 4: Intelligence Registry (External Services)

### When to Use

- Heavy ML workloads (GPU needed)
- Proprietary AI models
- Third-party AI services
- Independent scaling

### Example: Life Feed Intelligence

**External Service**:
```typescript
// synap-intelligence-service/
import { Hono } from 'hono';

const app = new Hono();

app.post('/analyze', async (c) => {
  const { itemId, content, callbackUrl } = await c.req.json();
  
  // AI analysis (use any model)
  const analysis = await aiModel.analyze(content);
  
  // Call back to Data Pod
  await fetch(callbackUrl, {
    method: 'POST',
    body: JSON.stringify({
      itemId,
      analysis: {
        priority: analysis.priority,
        tags: analysis.tags,
        summary: analysis.summary
      }
    })
  });
  
  return c.json({ success: true });
});

// Register on startup
await registerWithDataPod({
  serviceId: 'lifefeed-ai',
  webhookUrl: process.env.SERVICE_URL + '/analyze',
  capabilities: ['lifefeed-analysis']
});
```

**See**: [Intelligence Registry Guide](./intelligence-registry)

---

## Comparison

| Approach | Code Required | Flexibility | Visual | Best For |
|----------|--------------|-------------|--------|----------|
| **LangFlow** | None | Medium | ✅ Yes | Knowledge workers, rapid prototyping |
| **LangGraph** | Advanced | High | ❌ No | Complex agents, multi-step workflows |
| **Vercel AI SDK** | Simple | Medium | ❌ No | Quick AI features, streaming |
| **Intelligence Registry** | External | High | ❌ No | Heavy ML, independent services |

---

## Complete Example: Research Assistant

### LangFlow Version (Visual)

1. **Create in LangFlow**:
   - Input node: User query
   - RAG node: Search user's notes
   - LLM node: GPT-4 summarization
   - Output node: Formatted response

2. **Export & Deploy**:
```bash
langflow export --output research-assistant.json
# Deploy to Data Pod
```

3. **Use**:
```typescript
await client.ai.research.ask({ question: "..." });
```

---

### LangGraph Version (Code)

```typescript
// Full control, custom logic
export function createResearchAgent() {
  const graph = new StateGraph<ResearchState>();
  
  graph.addNode('search', async (state) => {
    // Search notes with vector similarity
    const results = await vectorSearch(state.query);
    return { ...state, context: results };
  });
  
  graph.addNode('analyze', async (state) => {
    // Custom analysis logic
    const insights = await analyzeContext(state.context);
    return { ...state, insights };
  });
  
  graph.addNode('generate', async (state) => {
    // Generate response
    const response = await llm.generate({
      context: state.context,
      insights: state.insights,
      query: state.query
    });
    return { ...state, response };
  });
  
  // Define flow
  graph.setEntryPoint('search');
  graph.addEdge('search', 'analyze');
  graph.addEdge('analyze', 'generate');
  
  return graph.compile();
}
```

---

## Why Visual Tools Matter

### LangFlow Benefits

✅ **Accessibility**: Non-developers can build agents  
✅ **Visualization**: See agent flow clearly  
✅ **Iteration**: Test and modify quickly  
✅ **Exports code**: Can version control  
✅ **Personalization**: Users customize their AI

### N8N for Automation

**Similar concept** but for workflows, not AI agents:

```
N8N: Visual automation
- Trigger: New email
- Action: Extract tasks
- Action: Create entities
- Action: Notify user

LangFlow: Visual AI agents
- Input: User query
- RAG: Search knowledge
- LLM: Generate response
- Output: Formatted answer
```

**Both empower users** without requiring code

---

## Integration Architecture

```
┌─────────────────────────────────────┐
│ Visual Tools (No Code)              │
│ ┌──────────┐      ┌──────────┐    │
│ │ LangFlow │      │   N8N    │    │
│ │ (AI)     │      │ (Workflow)│    │
│ └────┬─────┘      └────┬─────┘    │
│      │Export           │Export      │
│      ▼                 ▼            │
└──────┼─────────────────┼────────────┘
       │                 │
       ▼                 ▼
┌─────────────────────────────────────┐
│ Data Pod                            │
│ ┌──────────────┐  ┌──────────────┐│
│ │  LangGraph   │  │  Workflows   ││
│ │   Agents     │  │  (Inngest)   ││
│ └──────────────┘  └──────────────┘│
│                                     │
│ Accessible via tRPC API             │
└─────────────────────────────────────┘
       ▲
       │ Use AI
       │
┌──────┴───────┐
│  Frontend    │
└──────────────┘
```

---

## Getting Started

### 1. Visual Approach (LangFlow)

```bash
# Install LangFlow
pip install langflow

# Start LangFlow UI
langflow run

# Open http://localhost:7860
# Build your agent visually
# Export to Data Pod
```

### 2. Code Approach (LangGraph)

```bash
# Install dependencies
pnpm add @langchain/langgraph @langchain/openai

# Create agent
# packages/ai/src/agents/my-agent.ts

# Register in router
# packages/api/src/routers/ai.ts

# Use from frontend
await client.ai.myAgent.run({ ... });
```

### 3. External Service

See: [Remote Plugins Guide](./remote-plugins)

---

## Best Practices

### 1. Start Simple

Begin with Vercel AI SDK for simple tasks, upgrade to LangGraph when needed.

### 2. Use Visual Tools for Users

Let knowledge workers build their own agents with LangFlow.

### 3. Version Control Everything

Export LangFlow agents to JSON, commit to git.

### 4. Test Thoroughly

AI is non-deterministic - test extensively.

### 5. Monitor Costs

Track LLM API usage, set budgets.

---

## Next Steps

- **Try LangFlow** → Build your first agent
- **Explore LangGraph** → [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- **Use Vercel AI SDK** → [Vercel AI SDK](https://sdk.vercel.ai/)
- **Deploy External** → [Intelligence Registry](./intelligence-registry)

---

## Resources

- [LangFlow](https://langflow.org) - Visual AI agent builder
- [LangGraph](https://langchain-ai.github.io/langgraph/) - Agent framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - Multi-model toolkit
- [Intelligence Registry](./intelligence-registry) - External services
