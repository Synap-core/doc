---
sidebar_position: 2
---

# Synap vs Obsidian

**When to choose Synap over Obsidian (and vice versa)**

Both focus on knowledge graphs and local-first data, but have fundamentally different approaches and capabilities.

---

## Quick Comparison

| Feature | Obsidian | Synap |
|---------|----------|-------|
| **Data Format** | Markdown files | Event-sourced database |
| **Links** | Manual `[[wikilinks]]` | Automatic (AI) + Manual |
| **Graph** | ✅ Visualization | ✅ Visualization + AI insights |
| **History** | File system history | Infinite event log |
| **AI** | Plugins (external APIs) | Built-in multi-agent |
| **Branching** | ❌ No | ✅ Git-like |
| **Collaboration** | Sync (paid) or Git | Real-time built-in |
| **Self-Hosted** | Files on disk | Docker/K8s deployment |
| **Offline** | ✅ Perfect | ✅ Full (event sync) |
| **Extensibility** | Plugins (JS) | Plugins + Full API |
| **Mobile** | iOS, Android apps | SDK (build your own) |
| **Setup** | 30 seconds | 5 minutes |

---

## Philosophy

### Obsidian:
```
"A second brain, for you, forever"

Approach:
- Markdown files on your filesystem
- You own the files
- Plain text portability
- Tools operate on files
- Simple, local-first
```

**Core Belief**: Plain text files are the most durable format

---

### Synap:
```
"Personal Data Operating System"

Approach:
- Event-sourced database
- You own the infrastructure
- API-first platform
- Tools operate on events
- Powerful, extensible
```

**Core Belief**: Events are the most complete format (can export to markdown/files anytime)

---

## Knowledge Graph

### Obsidian:
```
Linking:
Manual wikilinks: [[Note Title]]
Aliases: [[Note|Display Name]]
Block references: [[Note#^blockid]]

Graph:
- Visualizes [[links]]
- Color by folder/tag
- Filter by search
- Local/global graph
- Community detection
```

**Example**:
```markdown
# Meeting Notes

Discussed [[Project X]] with [[Marie]].
Next: [[Follow-up Meeting]].

Action items:
- Call [[Marie]] about budget
- Review [[Design Mockups]]
```

**Pros**:
- ✅ Explicit, visible links
- ✅ Full control
- ✅ Works offline
- ✅ Plain text

**Cons**:
- ❌ Manual work (have to remember to link)
- ❌ No typed relationships
- ❌ Can't query complex patterns
- ❌ No AI suggestions

---

### Synap:
```
Linking:
Automatic AI extraction
Manual explicit relations
Activity-based implicit
Typed relationships (mentions, assigned_to, etc.)

Graph:
- Automatic entity discovery
- Typed, weighted relations
- AI-suggested connections
- Query shortest paths
- Semantic similarity
```

**Example**:
```typescript
// Just create a note (natural text)
await synap.notes.create({
  content: `
# Meeting Notes

Discussed Project X budget with Marie.
Next: Follow-up meeting Thursday.

Action items:
- Call Marie about pricing
- Review design mockups
  `
});

// AI automatically creates:
// - Entity: Note
// - Entity: Person "Marie" (or links existing)
// - Entity: Project "Project X"
// Entity: Meeting (from context)
// - Relation: Note → mentions → Marie
// - Relation: Note → mentions → Project X
// - Relation: Note → related_to → Meeting
// - Task suggestions (from "Action items")
```

**Pros**:
- ✅ Automatic (AI-powered)
- ✅ Typed relations (semantic meaning)
- ✅ Can query complex patterns
- ✅ AI suggests missing connections
- ✅ Less manual work

**Cons**:
- ❌ Less explicit than [[links]]
- ❌ Depends on AI accuracy
- ❌ Need to review AI suggestions

**When Obsidian Wins**:
- Prefer explicit, manual control
- Markdown purist
- Simple note-taking
- Don't need AI features

**When Synap Wins**:
- Want automatic organization
- Need complex relationship queries
- Building knowledge apps
- Want AI assistance

---

## Version History

### Obsidian:
```
History:
- File system (if using Git)
- Snapshots (if syncing)
- Core app has no built-in history

Typical Setup:
1. Use Git for version control
2. Or use Obsidian Sync ($8/month)
3. Or no history at all

Undo:
- Ctrl+Z for current session
- Git for historical changes
- Manual management
```

**Example Flow**:
```bash
# With Git
git log myNote.md
git blame myNote.md
git checkout abc123 -- myNote.md

# Manual, technical, requires Git knowledge
```

---

### Synap:
```
History:
- Every change is an event
- Infinite, automatic
- No setup required
- Built into the core

Undo:
- Any change, anytime
- Time-travel to any point
- Automatic, no Git needed
```

**Example Flow**:
```typescript
// View history (built-in)
const history = await synap.events.getHistory({
  subjectId: 'note_123'
});

// Time-travel
const pastState = await synap.timeline.getState({
  entityId: 'note_123',
  timestamp: lastWeek
});

// Restore
await synap.history.restore({
  entityId: 'note_123',
  toTimestamp: lastWeek
});

// No Git, automatic, simple API
```

**When Obsidian Wins**:
- Already using Git
- Want file-level control
- Technical user comfortable with Git

**When Synap Wins**:
- Want automatic history
- Non-technical users
- Need audit trails (compliance)
- Time-travel debugging

---

## AI Integration

### Obsidian:
```
AI Support:
- Plugins connect to external APIs
- ChatGPT plugin
- Ava plugin
- Smart Connections
- Various community plugins

Flow:
You → Plugin → External API (OpenAI, etc.) → Response
```

**Example** (with plugin):
```markdown
# Prompt
Generate outline for blog post about AI

# Plugin calls OpenAI API
# Response inserted
```

**Limitations**:
- ❌ One AI assistant (per plugin)
- ❌ Linear conversations
- ❌ Can't branch
- ❌ Limited context (current note)
- ❌ No specialist agents
- ❌ Depends on plugins

---

### Synap:
```
AISupport:
- Multi-agent system built-in
- Orchestrator + specialists
- Branching conversations
- Full knowledge graph context
- Agent reasoning transparency

Flow:
You → Orchestrator → Specialists (parallel) → Synthesis
```

**Example**:
```typescript
await synap.chat.send({
  threadId: main.id,
  message: 'Research AI trends and write blog post'
});

// Orchestrator auto-creates:
// [BRANCH 1: Research Agent]
//   Deep research on AI trends
// [BRANCH 2: Creative Agent]
//   Blog post structure
// 
// Main thread: Synthesized result
```

**When Obsidian Wins**:
- Don't need AI
- Simple AI queries
- Prefer plugins

**When Synap Wins**:
- Complex AI workflows
- Multi-step processes
- Want specialist expertise
- Need branching conversations
- Building AI products

---

## Collaboration

### Obsidian:
```
Options:
1. Obsidian Sync ($8/month)
   - End-to-end encrypted
   - Version history
   - No real-time editing

2. Git-based
   - Push/pull manually
   - Merge conflicts possible
   - Technical setup

3. Shared folder (Dropbox, etc.)
   - Sync conflicts likely
   - No conflict resolution
```

**Real-Time?** ❌ No (Obsidian Sync has versioning, not live editing)

---

### Synap:
```
Collaboration:
- Real-time editing (Google Docs-style)
- Live cursors
- Presence indicators
- Automatic conflict resolution (CRDT)
- Version history built-in
- WebSocket-based

Flow:
User A edits → WebSocket → Server → WebSocket → User B sees change
(Immediate, no sync delays)
```

**Code Example**:
```typescript
// Start collaborative session
const session = await synap.documents.startSession({
  documentId: 'doc_123'
});

// See who's editing
const collaborators = session.activeCollaborators;
// ["user_alice", "user_bob"]

// Real-time updates automatic
// No conflicts, CRDT-based
```

**When Obsidian Wins**:
- Solo user
- Don't need real-time
- Prefer file-based workflows

**When Synap Wins**:
- Team collaboration
- Need real-time editing
- Want conflict-free sync
- Multiple simultaneous editors

---

## Data Portability

### Obsidian:
```
Storage:
- Plain markdown files
- On your filesystem
- Assets in folder
- Portable by design

Export:
- Already exportable (it's files!)
- Can use any markdown tool
- Future-proof format
```

**Pro**: Maximum portability

---

### Synap:
```
Storage:
- Event-sourced database
- PostgreSQL + file storage

Export:
- Markdown export available
- JSON export (full fidelity)
- HTML export
- Can rebuild from events

Format:
# Note Title

Content here...

## Metadata
Created: 2024-12-19
Modified: 2024-12-19
Tags: project-x, research

## Relations
- Mentions: [[Marie]]
- Project: [[Project X]]
```

**Pro**: Richer metadata, can export to markdown anytime

**When Obsidian Wins**:
- Want plain text forever
- Markdown purist
- Maximum simplicity

**When Synap Wins**:
- Need rich metadata
- Want full event history
- Building on platform
- Can export when needed

---

## Extensibility

### Obsidian:
```
Plugins:
- JavaScript-based
- Access to Obsidian API
- Community marketplace
- Local execution

Popular Plugins:
- Dataview (query notes)
- Templater (templates)
- Calendar
- Kanban
- Excalidraw
```

**Pro**: Rich plugin ecosystem, easy to build

---

### Synap:
```
Plugins:
- Direct plugins (in codebase)
- Remote services (HTTP/WebSocket)
- Hybrid approach
- Full API access

Capabilities:
- Custom agents
- LangGraph workflows
- tRPC routers
- Event handlers
- Database access
```

**Code Example**:
```typescript
// Create custom agent plugin
export const competitorAnalyst = {
  id: 'competitor_analyst',
  capabilities: ['competitor_research'],
  systemPrompt: `Expert competitor analyst...`,
  tools: [webSearch, dataExtraction],
  model: 'claude-3-7-sonnet'
};

// Register
await synap.agents.register(competitorAnalyst);

// Use in branches
await synap.threads.createBranch({
  agentId: 'competitor_analyst'
});
```

**When Obsidian Wins**:
- Need specific Obsidian plugins
- Prefer JS plugin development
- Want community ecosystem

**When Synap Wins**:
- Need full API access
- Building custom agents
- Want server-side logic
- Creating products on top

---

## Mobile Experience### Obsidian:
```
Mobile Apps:
- ✅ iOS app
- ✅ Android app
- Sync via Obsidian Sync or Git
- Most plugins work
- Full-featured
```

**Pro**: Official mobile apps, great experience

---

### Synap:
```
Mobile:
- SDK available
- Build your own app
- Or use mobile web
- Full API access
- PWA support

Future:
- Reference mobile app
- React Native template
```

**When Obsidian Wins**:
- Need mobile app NOW
- Don't want to build one
- Mobile-first workflow

**When Synap Wins**:
- Want custom mobile app
- Building product
- PWA sufficient

---

## Use Case Recommendations

### Choose Obsidian for:

✅ **Personal Zettelkasten**
- Solo knowledge management
- Markdown workflow
- Offline-first
- Simple setup

✅ **Academic Research**
- Citation management
- Paper notes
- Literature review
- LaTeX integration

✅ **Daily Journaling**
- Simple daily notes
- Templates
- Calendar view
- Privacy (local files)

**Ideal User**: Solo knowledge worker, researcher, writer

---

### Choose Synap for:

✅ **Team Knowledge Base**
- Real-time collaboration
- Knowledge graph
- AI-assisted research
- Event audit trail

✅ **AI-Powered Applications**
- Build products on Synap
- Custom agents/workflows
- Knowledge graph apps
- Programmatic access

✅ **Developer Documentation**
- Code knowledge base
- API documentation
- Technical research
- Git-like branching for exploration

✅ **Regulated Industries**
- Compliance audit trails
- Data sovereignty
- Time-travel debugging
- Self-hosted

**Ideal User**: Teams, developers, AI builders, regulated industries

---

## Can You Use Both?

Yes! Common pattern:

### Hybrid Approach:
```
Obsidian:
- Personal daily notes
- Quick captures
- Markdown drafts
- Local-first simplicity

Synap:
- Team collaboration
- AI workflows
- Knowledge graph queries
- Product backend
```

**Sync Between**:
- Export Obsidian → Import to Synap (for team sharing)
- Export Synap → Obsidian (for personal editing)

---

## Migration Path

### From Obsidian to Synap:

```bash
# Your Obsidian vault
vault/
├── Daily Notes/
├── Projects/
├── Research/
└── Assets/

# Import to Synap
npx synap-import --from obsidian --path ./vault

# What transfers:
✓ Markdown content  → Notes
✓ [[Links]]         → Relations (knowledge graph)
✓ Tags             → Entity metadata
✓ Files/images     → File storage
✓ Folder structure → Projects/tags
```

**Note**: Synap enhances with:
- AI-discovered entities
- Automatic connections
- Event history going forward
- Knowledge graph queries

---

## Final Recommendation

### Choose Obsidian if:
- ✅ Solo user
- ✅ Love markdown
- ✅ Want local files
- ✅ Need it NOW (30-sec setup)
- ✅ Don't need AI/collaboration
- ✅ Prefer simplicity
- ✅ Rich plugin ecosystem

### Choose Synap if:
- ✅ Team collaboration needed
- ✅ Want AI assistance
- ✅ Need git-like branching
- ✅ Building products on top
- ✅ Full API access required
- ✅ Automatic knowledge graph
- ✅ Infinite event history
- ✅ Technical user/developer

---

## Cost Comparison

### Obsidian:
```
Free:
- Core app
- Unlimited vaults
- Plugins

Paid (optional):
- Sync: $8/month
- Publish: $8/month (website)
- Commercial license: $50/year/user

Typical: $0-16/month per user
```

### Synap:
```
Self-Hosted:
- Infrastructure: $20-500/month (scales with team)
- No per-user fees
- Open source (MIT)

Typical: $50-200/month (team size independent)
```

**Break-even**: Synap cheaper for teams >10 users

---

**Next**: [Synap vs Standard Notes](./vs-standard-notes) | [Migration Guide](../migration/from-obsidian)
