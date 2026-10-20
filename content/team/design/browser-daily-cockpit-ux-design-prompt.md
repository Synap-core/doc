# Design Prompt: Synap Browser Daily Cockpit

**For**: Designer AI / Figma AI / v0 / Lovable / visual product exploration  
**Goal**: Generate high-fidelity UX directions for Synap Browser as a daily cockpit for capture, attention, library, and AI-assisted work.  
**Output expected**: 8-10 annotated desktop screen designs, plus optional mobile/narrow variants where useful.

---

## What You Are Designing

Synap is sovereign personal data infrastructure: capture anything, AI organizes it, and the user builds their own apps from data.

The Browser is the primary desktop surface. It should not feel like a generic web browser or an admin dashboard. It should feel like a calm personal operating environment where:

- raw thoughts, files, web pages, and imports become structured data
- AI proposes useful structure and changes
- the user reviews important decisions
- work can continue through sessions, channels, views, and cells
- the user's data stays in their own pod

The concept to visualize:

> Synap Browser as a daily cockpit: capture anything, see what needs attention, continue meaningful work, and explore a durable library.

---

## Core Mental Model

Design around four product lanes.

```text
Capture
  Get anything into Synap in under 3 seconds.

Today / Attention
  See what needs review, what changed, and what AI thinks matters.

Library / Spaces
  Browse durable knowledge by space, profile, view, entity, relation, and document.

Build / Automate
  Configure agents, views, cells, workflows, connectors, marketplace, and data structure.
```

The user should not have to understand entities, profiles, views, cells, proposals, and reactions immediately. Those primitives are real, but the UI should introduce them through useful outcomes.

---

## Existing Synap Primitives To Respect

Use these product objects in the designs:

- **Data Pod**: the user's sovereign data universe.
- **Workspace / Space**: a durable project/domain lens.
- **Entity**: a typed object such as note, task, person, company, project, bookmark, article, decision, question, research.
- **Profile**: the data shape for an entity type.
- **View / Lens**: a saved way to see data: table, list, kanban, graph, calendar, bento, etc.
- **Cell**: universal rendering unit. Cards, widgets, views, charts, documents, and generated widgets can all be cells.
- **Bento dashboard**: a configurable dashboard made from cells.
- **Channel / Room**: conversation and event stream for people and AI agents.
- **Focus Session**: a goal-bound work room with channel, dashboard, events, proposals, sources, and outputs.
- **Proposal**: a reviewable AI change.
- **Proactive AI**: suggestions and summaries triggered by captured data, tasks, questions, decisions, health checks, and schedules.

---

## Design North Star

Design Synap as:

> Calm, premium desktop software where captured context becomes useful structure.

The opening feeling should be:

> "This is mine, and it is ahead of me."

Avoid:

- generic SaaS dashboards
- decorative AI purple/glow
- a Notion clone
- a web browser with a few AI widgets
- a database admin tool
- an overwhelming all-app launcher
- marketing-style hero sections inside the app

---

## Visual Direction

Use a dark-first, warm, premium product feel.

Suggested visual language:

- compact desktop shell
- quiet icon rail
- top command/capture bar
- one dominant main work surface
- optional right side panel
- subtle surface contrast
- borders and material shifts instead of heavy shadows
- AI accent used sparingly for AI-originated suggestions
- dense but calm information layout

The app should support all-day use. It can be beautiful, but usefulness wins.

### Color and Material Guidance

Use Synap-like tokens conceptually:

```text
Base: warm near-black
Surface: slightly lifted warm charcoal
Border: low-opacity light hairline
Primary accent: warm amber/gold
AI accent: emerald/teal, only for AI-originated content
Danger: restrained red
Text primary: high-contrast off-white
Text secondary: muted warm gray
```

Do not make the whole UI one color. Avoid all-purple, all-blue, all-beige, or heavy gradient themes.

### Typography

- UI text should be compact and readable.
- Reserve large type for true top-level greetings or empty states.
- Use small, precise labels in dashboards and panels.
- Avoid long explanatory text on the screen. Use labels and state.

---

## Shell Layout

Design for desktop first.

Recommended shell:

```text
┌─ Left rail ─┬─ Top command/status bar ─────────────────────────┬─ Optional side panel ┐
│ Home        │ Capture/search/command                           │ Entity / proposal    │
│ Capture     │ Workspace/pod breadcrumb                         │ AI companion         │
│ Attention   │ Sync, vault, review count, user                   │ Source inspector     │
│ Library     ├───────────────────────────────────────────────────┤                      │
│ Work        │ Main surface                                      │                      │
│ Build       │                                                   │                      │
│ Settings    │                                                   │                      │
└─────────────┴───────────────────────────────────────────────────┴──────────────────────┘
```

Rail should be quiet and icon-forward, but labels may appear when expanded.

Primary rail items:

- Home
- Capture
- Attention
- Library
- Work

Secondary:

- Build
- Settings

---

## Screens To Design

### Screen 1 - First Run: Capture Before Configure

Purpose: make the promise concrete.

Show first-run Browser with one primary question:

> What do you want Synap to help you remember or work on?

The user can:

- capture a thought
- save a web page
- import files
- connect a source
- start with a goal

Design requirements:

- no schema setup first
- no big app grid
- clear pod/sovereignty reassurance
- optional "connect existing pod" state
- one visible primary action

Annotation callouts:

- "Capture first, organize never."
- "AI handles type, relations, and workspace routing."
- "The user can review before durable writes."

### Screen 2 - Pod Home: Daily Cockpit

Purpose: show the primary daily landing page.

Include:

- top command/capture bar
- greeting or status line
- attention summary
- continue work sessions
- recent captures
- proactive suggestions
- spaces/workspaces
- connector/import health
- vault/sync status

Suggested content examples:

- "2 changes need review"
- "Continue: Market research session"
- "7 captures organized today"
- "AI found a question emerging from your notes"
- "Google Drive sync paused"

Design requirements:

- Home should be useful on a quiet day and an active day.
- Capture should be always visible.
- Attention should feel important but not alarming.
- Proactive AI should feel useful, not spammy.

### Screen 3 - Attention: Unified Decision Inbox

Purpose: unify proposals, proactive suggestions, import reviews, vault requests, and session outputs.

Include:

- filters: All, Review, Suggestions, System, Done
- list of review items
- selected item detail in side panel
- approve, edit, reject actions
- "why this" disclosure
- affected entities/workspace preview
- risk or permission badge
- safe batch action for low-risk items

Example items:

- "AI wants to create 3 entities from your capture"
- "Import mapping ready for LinkedIn contacts"
- "Coder requests vault access for GitHub token"
- "Session output ready: Market summary memo"
- "Synap suggests a view for repeated tasks"

Annotation callouts:

- "AI proposes, user disposes."
- "Attention is the user-facing shape of proposals and event-chain review."

### Screen 4 - Quick Capture Overlay

Purpose: zero-to-captured in under 3 seconds.

Show a lightweight overlay opened by shortcut.

States to include:

- initial input
- structuring
- AI follow-up question
- review result
- done state with link to created entity

Design requirements:

- minimal chrome
- autofocus input
- support text, URL, file, selected text
- show confidence and dedup only when needed
- do not force workspace/type selection unless necessary

### Screen 5 - Library: Durable Knowledge

Purpose: show where captured structure lives.

Include:

- recent entities across profiles
- profile sections
- saved views
- spaces/workspaces
- search
- relation preview
- documents/sources
- side panel entity detail

Design direction:

This should feel like "my knowledge has shape", not "raw database table".

Interactions:

- open entity in side panel
- switch lens
- ask AI about selected data
- start session from selection
- save current filter as view

### Screen 6 - Workspace Home: A Durable Lens

Purpose: show how workspace differs from pod home.

Use an example workspace such as "Market Research" or "Sales Pipeline".

Include:

- workspace capture
- active sessions
- pinned views
- recent entities/documents
- workspace proposals
- workspace members/agents
- bento dashboard cells
- workspace-specific proactive insight

Annotation callouts:

- "Pod Home is global. Workspace Home is a durable lens."
- "The same cells/views appear in dashboards, panels, and session rooms."

### Screen 7 - Work / Focus Session Room

Purpose: show meaningful AI-assisted work.

Use a session goal:

> Research the open-source backend market and produce a decision memo.

Include:

- session banner with goal and expected outputs
- human/agent participants
- channel stream
- event timeline
- proposal queue
- generated artifacts
- source list
- adaptive bento cells
- output cards: memo, table, dashboard, decision

Design requirements:

- should not feel like only chat
- show work becoming durable entities/views/docs
- proposals should be visible without taking over the room
- allow pause, close, run again, save as playbook

### Screen 8 - Build: Progressive Power Surface

Purpose: show where advanced primitives live.

Group power tools by user goal:

- Data model: profiles, properties, relations
- Interfaces: views, bento dashboards, cells
- Automation: workflows, reactions, webhooks
- AI: agents, skills, playbooks, governance
- Connections: imports, connectors, vault, sync

Design requirements:

- do not show a raw app dump
- explain through outcomes
- include contextual "suggested by AI" build actions
- keep power accessible for builders

Example cards:

- "Create a view from repeated tasks"
- "Turn this review pattern into an automation"
- "Add a property to track priority"
- "Create a session template from last run"

### Screen 9 - Proactive AI Suggestion Detail

Purpose: make proactive intelligence feel trustworthy.

Show a suggestion opened from Home or Attention:

- title
- why Synap is suggesting it
- source captures/entities
- suggested action
- confidence or freshness
- controls: accept, tune, mute, dismiss

Example:

> "Three recent captures look like one open question: Should we build the browser daily cockpit first?"

Actions:

- create question
- start research session
- link related notes
- dismiss

Annotation callout:

- "Proactive AI should show its evidence and let the user tune frequency."

### Screen 10 - Narrow / Compact Variant

Optional but useful.

Show how the same cockpit compresses:

- rail collapses to icons
- side panel becomes drawer
- Home sections stack
- Attention list becomes single-column
- Capture remains first-class

---

## Component Inventory To Reuse Across Screens

Design these as reusable system pieces:

- global capture/command bar
- rail item with count badge
- attention item
- proposal preview
- proactive insight card
- session card
- recent capture row
- entity card
- saved view card
- workspace card
- connector health chip
- vault/sync status chip
- AI suggestion detail
- side panel entity/proposal/source inspector
- build category card

---

## UX Copy Guidance

Use:

- Capture
- Needs attention
- Continue
- Library
- Spaces
- Review changes
- Suggested by AI
- Start a session
- Build
- Ask Synap

Avoid as first-level language:

- Profiles
- Relation defs
- Reactions
- Cell instances
- Widget definitions
- Raw data
- Config
- Router

Those words can appear in Build, Settings, developer surfaces, or inspector panels.

---

## Quality Bar

The designs are successful if:

1. A new user understands what to do first without reading documentation.
2. A returning user can see what needs attention in under 10 seconds.
3. Capture is the most obvious action.
4. AI feels helpful but governed.
5. The UI shows real Synap primitives without exposing all of them at once.
6. The product feels like a calm personal OS, not a SaaS dashboard.
7. Builder power remains visible but secondary.

---

## Deliverables

Produce:

- 8-10 high-fidelity desktop screens
- annotations explaining the main UX decisions
- one navigation model diagram
- component callouts for reusable pieces
- at least two states per major surface: empty/quiet and active/busy
- optional compact/narrow variant

Do not produce:

- marketing landing pages
- decorative hero art
- generic dashboard templates
- screens dominated by fake charts
- a raw app launcher as the primary home
