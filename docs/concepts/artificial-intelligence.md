---
sidebar_position: 4
title: Artificial Intelligence
---

# Artificial Intelligence

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
