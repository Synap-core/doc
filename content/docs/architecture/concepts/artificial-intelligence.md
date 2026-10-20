---
sidebar_position: 4
title: 'Artificial Intelligence'
description: Documentation covering Artificial Intelligence
section: general
audience: users
version: 1.0+
last_updated: '2026-09-19'
tags: []
hide_title: false
toc: true
---

> **Philosophy**: AI in Synap is not just a chatbot; it is a **collaborator** that lives alongside your data, understanding context and capable of taking action.

## 1. The "Intelligence Service"

Synap uses a dedicated microservice called the **Intelligence Service** to handle all AI operations. This separation ensures:
- **Scalability**: Heavy inference tasks don't block the main application.
- **Security**: The "Brain" interacts with the "Body" (Backend) through strict protocols.
- **Modularity**: Different AI models or providers can be swapped without changing the core app.

## 2. Architecture: The 3-Protocol System

We define three distinct ways for AI to interact with Synap:

### Protocol 1: Hub Protocol (Internal)
*   **Purpose**: The "Spine" of the system. Secure, high-bandwidth communication between Synap Backend and the Intelligence Service.
*   **Mechanism**: A specialized tRPC client with identifying scopes (`hub-protocol.read`, `hub-protocol.write`).
*   **Capabilities**:
    *   Read full Thread Context (history, linked entities).
    *   Search the entire Knowledge Graph.
    *   Create/Update Entities and Documents.
    *   Manage Branches.

### Protocol 2: MCP Server (Tools)
*   **Purpose**: To allow *external* AI tools (like Claude Desktop or generic MCP clients) to access Synap data.
*   **Standard**: Implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).
*   **Capabilities**: "Read-only" or safe actions exposed as secure tools.

### Protocol 3: A2A (Agent-to-Agent) [Future]
*   **Purpose**: To allow autonomous agents from other systems to negotiate and collaborate with Synap agents.

## 3. Core Capabilities (MVP)

### 1. Context-Aware Chat
The AI doesn't just see your last message. It sees:
- **Conversation History**: The full thread.
- **Linked Context**: Entities or Documents you explicitly attached to the thread.
- **User Memory (Mem0)**: It remembers your preferences and past facts (via Mem0 integration).

### 2. Reactive Actions
The AI can perform actions, but (for the MVP) it is **reactive**—it acts only when you ask.
- **Search**: "Find that note about the Q3 roadmap."
- **Create**: "Make a task for the design review."
- **Update**: "Add a 'High Priority' tag to this project."

### 3. Proposals & Diffs
When the AI wants to make significant changes (like rewriting a document/code), it doesn't just overwrite.
1.  **Proposal**: The AI submits a "Proposal" (e.g., a Document Diff).
2.  **Review**: You see a visual diff (Before vs. After).
3.  **Decision**: You click "Approve" to commit the change, or "Reject" to discard.

## 4. Technical Flow

1.  **User Message**: "Refactor `utils.ts` to be cleaner."
2.  **Backend**: Stores message, forwards to Intelligence Service via Redis/Queue.
3.  **Intelligence Service**:
    *   Fetches Thread Context via **Hub Protocol**.
    *   Injects "Linked Documents" (`utils.ts`) into the System Prompt.
    *   Calls LLM (e.g., Claude 3.5 Sonnet).
4.  **Action**: LLM decides to call `update_document`.
5.  **Hub Protocol**: Sends `createDocumentProposal` to Backend.
6.  **Frontend**: Real-time update shows a "Review Proposal" card in the chat.

## 5. Where your data goes (AI sub-processors)

Your data lives in your Data Pod. To answer an AI request, the Intelligence
Service sends the text that request needs (a capture, a message and its
context) to an AI model provider. Unless your pod runs a self-hosted model,
**that text leaves Synap infrastructure** for the provider below that serves
the call. Which providers are active depends on the keys the Intelligence
Service is configured with; a pod admin can also add providers.

| Provider | Used for | When |
|---|---|---|
| OpenRouter (openrouter.ai) | Chat, capture structuring, workspace routing; also text embeddings. OpenRouter forwards each call to the model vendor it routes to (e.g. DeepSeek, NVIDIA) | Default provider |
| DeepSeek (api.deepseek.com) | Chat / reasoning models | When configured |
| Anthropic (api.anthropic.com) | Chat / reasoning models | When configured |
| Google AI (generativelanguage.googleapis.com) | Chat / vision models | When configured |
| Groq (api.groq.com) | Fast chat models | When configured |
| Cerebras (api.cerebras.ai) | Fast chat models | When configured |
| OpenAI (api.openai.com) | Text embeddings for semantic search | When configured (fallback after OpenRouter) |
| Self-hosted vLLM | Any tier | When your deployment runs one; data stays on your infrastructure |
| TypeSafe (api.typesafe.ai) | Choosing which workspace a capture belongs in | When configured (`TYPESAFE_API_KEY`) |

**TypeSafe decision model.** When the Intelligence Service has a TypeSafe key,
the workspace decision sends it: the capture text (up to 4,000 characters), the
names and descriptions of the candidate workspaces, and short snippets of your
recent routing corrections and confirmations (where you moved or kept past
captures). Without a key the choice is made by the providers above.

A TypeSafe-only, per-pod consent flag existed briefly and was **withdrawn on
2026-09-20**. It was inconsistent: every other provider in this table already
receives capture content with no per-pod switch, and the flag gated the
smallest flow (a 4,000-character routing question) while extraction — the
larger one — stayed ungated. Per-vendor switches also do not scale to eight
processors, and asking someone to consent to a vendor they cannot evaluate is
not meaningful consent. WHICH processors the fleet uses is an operator
decision, made in the Intelligence Service's provider configuration and
disclosed in this table; a per-request `allowDecisionModel` flag remains the
opt-out for individual routes. A pod-level AI-processing POLICY covering every
provider uniformly is the intended replacement.

The provider list is maintained in the Intelligence Service
(`registry/seed-providers.ts`, `services/embeddings.ts`,
`lib/decision-model.ts`); update this table when a provider is added.

---

:::info Learn more on the website
- [User-friendly guide to AI Features](https://www.synap.live/guides/ai) — practical overview of Synap's AI capabilities
:::
