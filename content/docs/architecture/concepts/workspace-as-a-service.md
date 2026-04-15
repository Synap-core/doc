---
sidebar_position: 2
---

# Workspace as a Service

## The Paradigm Shift

Most applications are silos. They hold your notes, your tasks, or your calendar, but they don't talk to each other. When you want to build something new, you have to start from scratch: set up a database, build an API, handle authentication, manage state.

Synap flips this model. We don't just give you an app; we give you a **Personal Data Operating System**.

---

## The "Kernel" Analogy

Think of Synap's Backend not as a traditional API server, but as an **OS Kernel** for your digital life.

### 1. The Kernel (Synap Backend)
Just like Linux handles files, processes, and memory, the Synap Kernel handles:
*   **Event Log**: The immutable history of every action (Time Travel).
*   **Global Validator**: The policy engine that decides what is allowed (Permissions).
*   **Entity Graph**: The semantic web connecting all your data (Knowledge).
*   **Hub Protocol**: The secure bridge for Intelligence (AI).

### 2. User Space (The Frontend)
The Synap App is just **one** view into your OS. It's a "shell" that lets you interact with your data. You can swap it out, modify it, or build entirely new interfaces on top of the same Kernel.

### 3. Services (Supabase-like Architecture)
The Backend acts as a **"Local Supabase"**, providing critical services to any app you build on top of it:
*   **Database**: PostgreSQL with Drizzle ORM and automatic migrations.
*   **Search**: Typesense (full-text) + pgvector (semantic / AI-powered).
*   **Realtime**: Socket.IO + Yjs (CRDTs) for instant updates and collaborative editing.
*   **Storage**: MinIO / R2 for file handling with automatic deduplication.
*   **Auth**: Better Auth for secure identity management.
*   **Jobs**: pg-boss for async background processing.

---

## Why "Workspace as a Service"?

Because it transforms how you build and extend your tools.

### 🚫 The Old Way (Building from Scratch)
To build a "Personal CRM":
1.  Spin up Postgres.
2.  Write an Express server.
3.  Build a React frontend.
4.  Implement "Contacts" API.
5.  Implement "Notes" API.
6.  Connect them manually.

### ✅ The Synap Way (Mounting an App)
To build a "Personal CRM" on Synap:
1.  **Define Entity**: `Contact` (The OS handles DB, API, Realtime).
2.  **Mount View**: Build a simple React component for contacts.
3.  **Inherit Power**:
    *   Your contacts are *automatically* searchable.
    *   Your contacts are *automatically* linked to your Notes in the Graph.
    *   Your AI agents *automatically* understand how to query contacts.

---

## Running Multiple Spaces on One Pod

One pod can host many workspaces ("spaces") at the same time — a CRM space, a content production space, a personal knowledge space, all pointing at the same underlying entity graph.

**The same Person can live in all three spaces simultaneously**, with each space attaching its own custom fields without stepping on the others. Relay might track an investment thesis; your Knowledge space might track notes written about that person; your Content Studio might track audience fit. None of those fields leak across spaces.

This is possible because property definitions are **layered**: base fields belong to the profile globally, and each workspace can add overlay fields scoped to itself. Reads filter through the current workspace's lens at SQL level, so performance doesn't degrade as you add more spaces.

See [Profile Schemas →](./profile-schemas) for the full model.

## What You Can Build

This platform is designed to be the foundation for **any** knowledge-driven application:

*   **Vertical SaaS**: Legal Case Management, Medical Records, Academic Research.
*   **Personal Tools**: Habit Trackers, Journaling Apps, Finance Dashboards.
*   **Team Collaboration**: Project Management, Wikis, intranets.

**You focus on the domain logic. The OS handles the data physics.**
