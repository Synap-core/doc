---
sidebar_position: 11
---

# Synap vs Open Source

**Comparing Synap to AppFlowy, Affine, and Supabase**

---

## Overview

There are amazing open-source tools appearing. How does Synap fit in?

| Tool | Primary Focus | Architecture | AI Model |
|------|---------------|--------------|----------|
| **AppFlowy** | Notion Alternative | Local-First (Flutter) | Integrated Assistant |
| **Affine** | Docs + Whiteboard | Local-First (CRDTs) | Assistant Context |
| **Supabase** | Backend-as-a-Service | PostgreSQL | Vector Embeddings |
| **Synap** | **Personal Data OS** | **Event Sourcing + Agents** | **Multi-Agent System** |

---

## 1. Synap vs AppFlowy / Affine

**AppFlowy** and **Affine** are fantastic "Local-First" replacements for Notion/Miro. They focus heavily on **UI/UX parity** and **Privacy**.

**Synap's differentiator is the Kernel.**

- **They build an App**: The goal is a great editor.
- **We build an OS**: The goal is a programmable kernel.

Synap puts **Events** and **Agents** first.
- In **Affine**, you write a doc.
- In **Synap**, you emit events. An Agent might write the doc for you. Or verify it. Or link it.

If you just want a private Notion, use **AppFlowy**.
If you want a **Programmable Intelligence Layer** that you can script, automate, and extend with autonomous agents, use **Synap**.

## 2. Synap vs Supabase

**Supabase** is an open-source Firebase alternative. It gives you a database, Auth, and APIs.

**Synap uses Supabase principles but adds the "User Layer".**

- **Supabase**: Gives you raw ingredients (Postgres, Auth). You build the backend.
- **Synap**: Gives you a **complete, opinionated backend**.
    - The Database is already designed (Entities, Events, Relations).
    - The Event Bus is pre-configured.
    - The Auth is enterprise-grade (Ory).
    - The AI layer is pre-integrated.

Synap is like "Supabase + A Headless CMS + An Agent Framework" pre-assembled into a deployable Pod.

---

## Summary

- **Choose AppFlowy/Affine** if you want a polished, private note-taking app *today*.
- **Choose Supabase** if you want to build a SaaS product from scratch.
- **Choose Synap** if you want a **Personal Data Platform** that creates a permanent, intelligent memory for your life, capable of running autonomous agents.
