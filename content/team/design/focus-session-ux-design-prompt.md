# Design Prompt: Synap Focus Sessions UX

**For**: Designer AI / Figma AI / v0 / Lovable / visual product exploration  
**Goal**: Generate high-fidelity UX directions for Synap's focus-session model: a goal-bound work room that composes channels, dashboards, views, cells, whiteboards, markdown docs, imports, entities, and AI agents.  
**Output expected**: 10-12 annotated screen designs showing onboarding, pod home, workspace home, session start, active sessions, adaptive bento dashboards, and session close/recap.

---

## What You're Designing

Synap is sovereign personal data infrastructure: capture anything, AI organizes it, and users build their own apps from entities, views, cells, channels, and workflows.

The new UX concept is a **Focus Session**:

> A goal-bound period of work inside a workspace, with a channel, dashboard, event log, active humans/agents, generated entities, and final outputs.

This is not a generic browser tab, not a workspace, and not a normal AI chat. It is a focused room around a goal.

Core hierarchy:

```text
Data Pod
  -> Workspace
    -> Focus Session
      -> Channel + Dashboard + Events + Outputs
```

Design the experience so users feel:

- "I can import/capture anything."
- "Synap organizes it for me."
- "I start focused work from a goal."
- "Humans and agents collaborate in the same room."
- "The dashboard adapts to what is happening."
- "Outputs and decisions survive after the session ends."

---

## Product Vocabulary

### Data Pod

The user's sovereign universe of data. It contains global search, vault, import/connectors, personal feed, reusable people/companies/files/sources, and cross-workspace activity.

### Workspace

A durable lens and permission boundary: project, client, company, team, or domain.

Examples: Personal, Synap Company, Client ACME, Fundraising, Market Research, Sales Pipeline.

### Focus Session

A temporary goal-bound run inside a workspace.

Examples:

- "Research the open-source backend market."
- "Find 50 qualified leads and draft outreach."
- "Turn these imported files into a project knowledge base."
- "Investigate an incident and produce a postmortem."

### Channel

The conversation and event stream for humans and agents. Agents participate directly in the room instead of living in a separate AI chat.

### Cells

Universal rendering blocks. A cell can render a view, entity card, chart, metric, proposal, source card, document block, terminal output, or generated widget in dashboards, documents, whiteboards, and panels.

---

## Design North Star

Design Synap as:

> A calm, premium work environment where data becomes useful rooms.

Avoid making it feel like:

- a generic web browser
- a SaaS admin dashboard
- a Notion clone
- a whiteboard-only app
- a chat app with extra panels
- an overwhelming all-in-one tool

The user should start with intent, not configuration.

Primary entry prompt:

> What are you trying to get done?

---

## Visual Direction

Use the existing Synap Browser V2 spatial shell direction:

- calm sea background
- useful islands
- compact top context/command/status islands
- quiet left rail
- one dominant main island
- optional side island
- companion/AI as a surface, not embedded everywhere
- depth through subtle borders and material contrast
- no loud gradients, decorative blobs, or generic "AI purple"

The UI should feel premium, warm, quiet, and capable. It should support all-day work.

### Layout Ingredients

Use these components across screens:

- top context island: pod/workspace/session breadcrumb
- command island: search + command + "start focus session"
- status island: proposals, vault, notifications, user
- quiet left rail: Home, Sessions, Library, Channels, Workspaces, Settings
- main island: current home/session/view
- side island: companion, selected entity, proposal, event timeline, source inspector
- bento grid: adaptive dashboard cells
- channel panel: Discord-like conversation with human and agent identities
- whiteboard canvas: synthesis space with entity/source cells
- markdown renderer: living memo with embedded cells

---

## Screens To Design

### Screen 1 - First Onboarding: Import Before Organize

Purpose: make the product promise concrete.

Show a beautiful first-run screen where the user is invited to connect or import data:

- Google Drive
- Google Calendar
- Google Contacts
- GitHub
- Slack/Discord/Telegram
- local folders/files
- bookmarks/web capture
- CSV/JSON
- manual quick capture

The screen should communicate:

- "Bring data in. Synap organizes it."
- minimal setup
- no forced workspace decision yet
- clear privacy/sovereignty reassurance
- connectors status and vault requirement when needed

Include an option:

- "Start with a goal instead"

### Screen 2 - Pod Home: Global Data-Powered Home

Purpose: show what the browser opens to by default.

Design a pod-wide home with:

- recent focus sessions
- global capture inbox
- import/connectors health
- proactive feed
- suggested next sessions
- cross-workspace highlights
- recent entities/sources/files
- vault status
- universal search/command center

This is not a workspace dashboard. It is the user's global command center.

### Screen 3 - Workspace Home: Durable Lens

Purpose: show how a workspace differs from pod home.

Design a workspace for "Market Research" or "Sales Pipeline" with:

- active sessions
- workspace channels
- pinned views
- workspace bento dashboard
- recent entities/documents
- workspace highlights
- proposals
- members/agents

The sidebar can adapt to show views, apps, data, and highlights relevant to this workspace.

### Screen 4 - Start Focus Session

Purpose: show the intent-first start flow.

Design a modal or full-screen focused creation flow:

- prompt: "What are you trying to get done?"
- goal field
- suggested templates:
  - Research Room
  - Lead Sprint
  - Decision Memo
  - Import Cleanup
  - Incident Room
  - Campaign Intelligence
- workspace selector:
  - use current workspace
  - choose existing
  - create new
- expected output picker:
  - memo
  - CSV
  - dashboard
  - whiteboard
  - outreach drafts
  - decision record
- participants:
  - invite people
  - choose agents/personas

Keep it light. Do not make it feel like a long form.

### Screen 5 - Active Research Room

Purpose: flagship flow for turning messy sources into a decision.

Scenario:

> Research whether Synap should position itself as open-source personal data infrastructure.

Show:

- session goal and progress
- main research channel
- source capture queue
- evidence/claims matrix
- synthesis whiteboard preview
- markdown decision memo preview
- pending AI proposals
- next recommended action

Agents should post directly in the channel with useful updates, not generic chatbot responses.

### Screen 6 - Active Lead Sprint

Purpose: show a concrete operational workflow.

Scenario:

> Find 50 qualified leads and draft outreach messages.

Show:

- progress: 17/50 leads
- lead table cell
- lead quality distribution chart
- source coverage widget
- outreach draft queue
- approval queue before sending
- active agents: research, enrichment, copywriting
- final export target: CSV + message drafts

Make it feel focused and measurable.

### Screen 7 - Adaptive Bento Dashboard

Purpose: show AI proposing dashboard updates based on session events.

Design a dashboard where an agent proposes:

> I noticed this session is creating many person entities. Add a lead quality table and source coverage chart?

Show:

- proposed widget cards ghosted in the bento grid
- before/after layout preview
- "Approve", "Modify", "Dismiss"
- explanation of why the widget is useful
- proposal governance state

The dashboard should be user-editable and AI-assistable.

### Screen 8 - Whiteboard Synthesis

Purpose: show how whiteboard fits into the session.

Design a whiteboard view embedded in the session:

- source cards
- claim clusters
- entity cards
- contradiction markers
- decision branches
- sticky notes
- AI-suggested clusters
- link back to channel messages and sources

This should feel like visual thinking over structured data, not an isolated drawing tool.

### Screen 9 - Markdown Decision Memo

Purpose: show the final artifact as a living document.

Design a markdown renderer with embedded cells:

- source cards
- evidence matrix
- decision card
- risk list
- related entities
- chart/view widget
- unresolved questions
- next actions

Show that cells can live inside the memo and remain live/reusable.

### Screen 10 - Session Event Timeline

Purpose: show traceability and separation of concerns.

Design a timeline/side panel with:

- captures
- entities created/updated
- proposals approved/rejected
- dashboard changes
- channel milestones
- terminal runs
- vault requests
- document edits
- final outputs

This is the audit/history of the focused work.

### Screen 11 - Close Session Recap

Purpose: show the end of a session.

Design a recap screen with:

- goal completion state
- key outputs
- entities created/updated
- sources captured
- decisions made
- unresolved questions
- pending proposals
- suggested next sessions
- archive/resume/duplicate/template actions

The user should feel nothing was lost.

### Screen 12 - Resume From Pod Home

Purpose: show continuity.

Back on pod home, show:

- recently closed session
- final artifact shortcut
- suggested follow-up
- cross-workspace updates
- ability to resume or start related session

---

## Interaction Details To Explore

Include annotations for:

- how a session chooses or creates a workspace
- how the session channel differs from a generic AI chat
- how AI proposes widgets/views instead of silently changing dashboards
- how dashboard cells can be embedded into markdown and whiteboard
- how generated entities are visible during and after the session
- how proposals keep AI actions reversible
- how pod-wide home differs from workspace home
- how the sidebar adapts to workspace-local views/apps/highlights
- how the user can move from "import data" to "start focused work"

---

## Design Constraints

Keep the interface:

- visually calm
- focused on the user's current goal
- sparse at first, richer as data appears
- usable with few or many entities
- clear about what AI did and what AI proposes
- grounded in real work outputs, not decorative AI moments

Do not:

- show giant marketing hero sections inside the app
- make everything a card inside another card
- rely on purple/blue AI gradients
- use generic dashboard filler charts
- make users configure schemas before they can start
- hide approvals or AI mutations
- create separate AI chat for every app

---

## Preferred Sample Data

Use one or both flagship scenarios.

### Research Room

- topic: open-source personal data infrastructure positioning
- sources: competitor pages, articles, GitHub repos, analyst notes
- entities: companies, claims, risks, sources, decisions, tasks
- output: decision memo

### Lead Sprint

- goal: find 50 qualified leads
- entities: people, companies, sources, outreach drafts
- output: CSV + message drafts
- constraints: no sending without approval

---

## Deliverable Format

For each screen, provide:

- screen title
- product purpose
- layout description
- important components
- key interaction states
- annotations/callouts
- one variant for empty/low-data state where relevant

The designs should be high-fidelity enough to guide Browser V2 UI implementation, but exploratory enough to compare multiple directions for pod home, workspace home, and active focus sessions.
