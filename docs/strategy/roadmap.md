---
sidebar_position: 1
title: Roadmap & MVP Scope
---

# Roadmap & MVP Scope


## MVP Goal
**"Reactive Excellence"**
The MVP focuses on a high-quality, reactive AI experience where the user is in control. Proactive features (autonomous background agents) are deferred to ensure the core interaction loop is perfect.

### Critical Capabilities (MVP)
- ✅ **Infinite Chat**: Continuous conversation history without loss of context.
- ✅ **Thread Continuity**: Semantic understanding of long-term project threads.
- 🚧 **Proposal System**: AI suggests changes (to code, docs, or entities) -> User reviews diff -> User approves/rejects.
- 🚧 **Branch Management**: "Git for thoughts". Create alternative paths for a project without losing the main thread.
- 🚧 **Real-time Streaming**: Instant feedback on AI thought processes and tool execution.

## Roadmap Phases

### Phase 1: Foundation (Completed ✅)
- **Event Sourcing**: Backend architecture fully implemented (TimescaleDB).
- **Hub Protocol**: Standardized communication between Data Pod and Intelligence Services.
- **Skill System**: AI can create and execute dynamic skills.
- **Multi-Agent Core**: Orchestrator capability established.

### Phase 2: Frontend Integration (Current Focus 🚧)
- **Objective**: Make the powerful backend visible and usable.
- **Key Tasks**:
    1.  **Streaming UI**: Visualize the "thinking" process of the AI.
    2.  **Proposal UI**: A clean interface for reviewing and accepting AI actions.
    3.  **Branching UI**: Visual tree navigation for conversation branches.
    4.  **Real-time Sync**: Full Socket.IO integration for instant updates.

### Phase 3: Intelligence Enhancement (Next)
- **Auto-Linking**: AI automatically detects and links relevant entities to the current thread.
- **Context Compression**: Algorithms to reduce token usage by 80% while preserving semantic meaning.
- **Hub Protocol Alignment**: Finalizing the contract between Hub and Spoke services.

### Phase 4: Proactive Agents (Future)
- **Background Tasks**: Agents that work while you sleep (e.g., "Research this topic and have a report ready by morning").
- **Conflict Detection**: Managing data conflicts when multiple agents (or users) edit the same entity.
- **Marketplace**: Opening the platform to third-party skills and agents.

## Strategic Decisions

### Deferring Background Tasks
We have decided to **defer background tasks** for the MVP.
- **Why?** They add significant complexity (scheduling, error handling, resource management) and the core value of "Reactive AI" is not yet fully realized in the UI.
- **Risk**: Over-engineering before validating the core chat loop.

### Focus on Frontend Data Flow
The current bottleneck is the **Frontend -> Backend** connection. The backend has advanced capabilities (branching, time-travel) that are not yet exposed in the UI. Phase 2 is entirely dedicated to closing this gap.
