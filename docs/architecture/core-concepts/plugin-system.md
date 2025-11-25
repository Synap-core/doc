---
sidebar_position: 3
---

# Plugin System

**Understanding extensibility and intelligence plugins in the Synap ecosystem**

---

## Overview

Synap offers **two complementary extensibility mechanisms**:

1. **Internal Plugins (The Architech)** - Extensions that modify the Core OS directly
2. **External Services (Marketplace)** - Services hosted separately and connected via API

Both mechanisms can add **intelligence** to the system through:
- **Single Agents**: Simple LangGraph workflows for specific tasks
- **Agent Graphs**: Complex multi-agent orchestration with supervisor patterns
- **External Intelligence Services**: Specialized AI services via Hub Protocol

---

## Adding Intelligence via Plugins

### Intelligence Plugin Types

#### 1. Single Agent Plugin

A simple LangGraph workflow for a specific task:

```typescript
// Plugin: @synap/agent-rss-summarizer
import { StateGraph, START, END } from '@langchain/langgraph';

export function createRSSSummarizerAgent() {
  const graph = new StateGraph(RSSState);
  
  graph.addNode('fetch', fetchRSSNode);
  graph.addNode('summarize', summarizeNode);
  graph.addNode('create', createNoteNode);
  
  graph.addEdge(START, 'fetch');
  graph.addEdge('fetch', 'summarize');
  graph.addEdge('summarize', 'create');
  graph.addEdge('create', END);
  
  return graph.compile();
}
```

**Use Case**: Simple, linear workflows (e.g., RSS summarization, text translation)

**Manifest**:
```json
{
  "name": "@synap/agent-rss-summarizer",
  "synap": {
    "type": "agent-plugin",
    "pattern": "simple",
    "capabilities": {
      "agents": ["rss-summarizer"],
      "tools": ["fetchRSS", "summarize", "createEntity"]
    }
  }
}
```

---

#### 2. Agent Graph Plugin

Complex multi-agent orchestration with supervisor pattern:

```typescript
// Plugin: @synap/agent-project-planner
export function createProjectPlannerAgent() {
  const graph = new StateGraph(ProjectPlannerState);
  
  // Supervisor agent
  graph.addNode('supervisor', supervisorNode);
  
  // Worker agents
  graph.addNode('researcher', researchAgent);
  graph.addNode('writer', writingAgent);
  graph.addNode('organizer', organizationAgent);
  
  // Dynamic routing based on task type
  graph.addConditionalEdges('supervisor', routeToWorker);
  graph.addEdge('researcher', 'supervisor');
  graph.addEdge('writer', 'supervisor');
  graph.addEdge('organizer', 'supervisor');
  
  return graph.compile();
}
```

**Use Case**: Complex workflows requiring multiple specialized agents (e.g., project planning, content creation)

**Manifest**:
```json
{
  "name": "@synap/agent-project-planner",
  "synap": {
    "type": "agent-plugin",
    "pattern": "supervisor",
    "capabilities": {
      "agents": ["supervisor", "researcher", "writer", "organizer"],
      "tools": ["webSearch", "createEntity", "semanticSearch"]
    }
  }
}
```

---

#### 3. External Intelligence Service

Specialized AI service connected via Hub Protocol:

```typescript
// External service implementing Hub Protocol
import { HubOrchestratorBase } from '@synap/hub-orchestrator-base';

export class TravelPlannerService extends HubOrchestratorBase {
  async processRequest(request: ExpertiseRequest): Promise<ExpertiseResponse> {
    // Access user data via Hub Protocol
    const data = await this.hubClient.requestData({
      token: request.token,
      scope: ['preferences', 'calendar'],
    });
    
    // Process with specialized intelligence
    const insight = await this.planTrip(data);
    
    // Return structured insight
    return { insight };
  }
}
```

**Use Case**: Services requiring cloud resources, shared across users, or independent updates

---

## How Intelligence Integrates

### Agent Execution Flow

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Agent Execution Flow"
  value={`graph TD
    A[User Request] --> B[Chat Router]
    B --> C{Agent Needed?}
    C -->|Yes| D[Load Agent Plugin]
    D --> E[Execute LangGraph]
    E --> F[Agent Uses Tools]
    F --> G[Tools Create Events]
    G --> H[Workers Process]
    H --> I[Data Layer Updated]
    C -->|No| J[Direct API Call]
    J --> G`} 
/>

### Key Points

1. **Agents use the same API** - Agents call tRPC endpoints, creating events
2. **Events trigger workers** - Agent actions flow through the same event system
3. **Plugins register agents** - Agents are discovered and loaded dynamically
4. **Tools are extensible** - Plugins can add new tools to the registry

### Complete Flow Example

```
User: "Plan my trip to Lisbon"
  ↓
Chat Router → Local Agent (analyzes intent)
  ↓
Agent decides: "Need external service for travel planning"
  ↓
Hub Protocol Flow:
  1. Data Pod → External Service: requestExpertise()
  2. Service → Data Pod: generateAccessToken()
  3. Service → Data Pod: requestData() (preferences, calendar)
  4. Service → Travel Agent: processes with data
  5. Service → Data Pod: submitInsight() (structured plan)
  ↓
Data Pod transforms insight → Events
  ↓
Events → Workers → Database & Storage
  ↓
Real-time update → User sees trip plan
```

---

## Decision Matrix

### When to Use Each Type

| Need | Solution | Example |
|------|----------|---------|
| Simple task automation | Single Agent Plugin | RSS summarizer, text translation |
| Complex multi-step reasoning | Agent Graph Plugin | Project planning, content creation |
| Cloud resources needed | External Service | Image generation, advanced analytics |
| Shared across users | External Service | Calendar sync, email integration |
| Direct DB access needed | Internal Plugin | Custom entities, business logic |

---

## Installation

### Internal Plugin (Agent)

```bash
# Install agent plugin
npx @thearchitech/cli install @synap/agent-rss-summarizer

# Plugin registers agent in the system
# Agent becomes available via chat or scheduled tasks
```

### External Service

```typescript
// Register service on marketplace
POST /api/marketplace/register
{
  "name": "travel-planner",
  "endpoint": "https://travel-planner.example.com",
  "capabilities": ["planning"]
}

// Service becomes available via Hub Protocol
```

---

## Best Practices

1. **Follow LangGraph patterns** - Use standard state machine patterns
2. **Register tools properly** - Use the dynamic tool registry
3. **Create events, not direct DB access** - Agents should use API, not direct DB
4. **Document agent capabilities** - Clear manifest and README
5. **Test thoroughly** - Unit tests for agents and integration tests for flows
6. **Respect event-driven flow** - All state changes go through events

---

**Next**: See [Extensibility Guide](../../development/extensibility/extensibility-guide.md) for implementation details.
