---
sidebar_position: 4
---

# AI Architecture

**LangGraph + Vercel AI SDK integration**

---

## Overview

Synap uses a **hybrid approach** combining the best of both worlds:
- **LangGraph**: State machine orchestration for multi-step reasoning workflows
- **Vercel AI SDK**: Simple, type-safe LLM calls with built-in schema validation

This architecture provides:
- ✅ Complex multi-step reasoning (LangGraph)
- ✅ Simple, maintainable LLM calls (Vercel AI SDK)
- ✅ Type-safe outputs (Zod schemas)
- ✅ Provider-agnostic design
- ✅ Better developer experience

---

## Architecture

### Current Implementation

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="AI Architecture: LangGraph State Machine"
  value={`graph TD
    A[User Message] --> B[LangGraph State Machine]
    B --> C[parse_intent]
    C --> D[gather_context]
    D --> E[plan_actions]
    E --> F[execute_actions]
    F --> G[generate_final_response]
    G --> H[Response to User]
    
    C --> I[Vercel AI SDK]
    E --> I
    G --> I
    I --> J[Anthropic Claude]`} 
/>

### State Machine Workflow

1. **parse_intent** - Classifies user intent (capture/command/query/unknown)
   - Uses: `generateObject()` with Zod schema
   - Model: Claude 3 Haiku (via Vercel AI SDK)

2. **gather_context** - Collects semantic search results and memory facts
   - Uses: Semantic search tool + Knowledge service
   - No LLM call needed

3. **plan_actions** - Plans tool execution sequence
   - Uses: `generateObject()` with Zod schema
   - Model: Claude 3 Haiku (via Vercel AI SDK)

4. **execute_actions** - Executes planned tools
   - Tools: `createEntity`, `semanticSearch`, `saveFact`
   - No LLM call needed

5. **generate_final_response** - Generates natural language response
   - Uses: `generateObject()` with Zod schema
   - Model: Claude 3 Haiku (via Vercel AI SDK)

---

## Code Examples

### Intent Classification

```typescript
// packages/ai/src/agent/intent-classifier.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getAnthropicModel } from './config-helper.js';

const classificationSchema = z.object({
  intent: z.enum(['capture', 'command', 'query', 'unknown']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  needsFollowUp: z.boolean(),
});

export const classifyIntent = async (message: string): Promise<IntentAnalysis> => {
  const modelName = getAnthropicModel('intent');
  
  const result = await generateObject({
    model: anthropic(modelName),
    schema: classificationSchema,
    prompt: `${systemPrompt}\n\n${userPrompt(message)}`,
    temperature: 0,
    maxTokens: 256,
  });

  return toIntentAnalysis(result.object);
};
```

### Action Planning

```typescript
// packages/ai/src/agent/planner.ts
export const planActions = async (input: PlannerInput): Promise<PlannerOutput> => {
  const modelName = getAnthropicModel('planner');
  
  const result = await generateObject({
    model: anthropic(modelName),
    schema: planSchema,
    prompt: `${plannerSystemPrompt}\n\n${buildPlannerInput(input)}`,
    temperature: 0.3,
    maxTokens: 512,
  });

  return {
    reasoning: result.object.reasoning,
    actions: result.object.actions.map(toPlannedAction),
  };
};
```

---

## Configuration

### Model Selection

Models are configured via environment variables with purpose-specific overrides:

```bash
# Base model
ANTHROPIC_MODEL=claude-3-haiku-20240307

# Purpose-specific overrides (optional)
ANTHROPIC_INTENT_MODEL=claude-3-haiku-20240307
ANTHROPIC_PLANNER_MODEL=claude-3-haiku-20240307
ANTHROPIC_RESPONDER_MODEL=claude-3-haiku-20240307
```

### Lazy Configuration Loading

Configuration is loaded lazily to avoid circular dependencies:

```typescript
// packages/ai/src/agent/config-helper.ts
export function getAnthropicModel(purpose: 'intent' | 'planner' | 'responder' | 'chat'): string {
  const config = getConfig(); // Lazy load from globalThis
  const ai = config.ai;
  
  // Check for purpose-specific override
  const purposeModel = ai.anthropic.models[purpose];
  if (purposeModel) {
    return purposeModel;
  }
  
  // Fall back to default model
  return ai.anthropic.model;
}
```

---

## Dependencies

### Core Dependencies

- **`@langchain/langgraph@^1.0.1`** - State machine orchestration
- **`ai@^4.0.0`** - Vercel AI SDK (LLM calls)
- **`@ai-sdk/anthropic@^1.0.0`** - Anthropic provider for Vercel AI SDK
- **`zod@^3.25.76`** - Schema validation

### Removed Dependencies

- ❌ `@langchain/anthropic` - Replaced by `@ai-sdk/anthropic`
- ❌ `@langchain/core` (for messages) - No longer needed
- ❌ Custom `createChatModel` wrapper - Replaced by Vercel AI SDK

### Retained Dependencies

- ✅ `@langchain/langgraph` - Still needed for state machine
- ✅ `@langchain/core` (for embeddings) - Used by embeddings provider
- ✅ `@langchain/openai` - Used for embeddings

---

## Benefits

### Why LangGraph?

- ✅ **Perfect for multi-step workflows** - State machine handles complex reasoning
- ✅ **Conditional logic** - Easy to add branching based on state
- ✅ **Tool orchestration** - Built-in support for tool calling
- ✅ **Memory/context** - State persists between steps

### Why Vercel AI SDK?

- ✅ **Simpler API** - Less boilerplate than LangChain
- ✅ **Better TypeScript** - First-class type support
- ✅ **Built-in validation** - Zod schemas ensure type-safe outputs
- ✅ **Provider-agnostic** - Easy to switch providers
- ✅ **No manual parsing** - Structured outputs handled automatically

### Combined Benefits

- ✅ **50% less code** - No manual JSON parsing needed
- ✅ **Type-safe** - Zod schemas ensure correct outputs
- ✅ **Better error handling** - Clear error messages
- ✅ **Maintainable** - Simpler codebase

---

## Best Practices

1. **Use LangGraph for orchestration** - Complex workflows, state management
2. **Use Vercel AI SDK for LLM calls** - Simple, type-safe API
3. **Always use Zod schemas** - Ensures type-safe outputs
4. **Lazy load configuration** - Avoids circular dependencies
5. **Provider-agnostic design** - Easy to switch AI providers

---

**Next**: See [Plugin System](./core-concepts/plugin-system.md) to learn how to add intelligence via plugins.

