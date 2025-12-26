---
sidebar_position: 1
---

# Synap vs Notion

**When to choose Synap over Notion (and vice versa)**

Both are powerful knowledge management platforms, but they solve different problems and make different trade-offs.

---

## Quick Comparison

| Feature | Notion | Synap |
|---------|--------|-------|
| **Hosting** | Notion's servers | Your infrastructure |
| **Privacy** | They can access data | Your data never leaves |
| **History** | Limited version history | Infinite (event sourcing) |
| **Undo** | Limited to recent changes | Any change, anytime |
| **AI Chat** | Linear conversations | Git-like branching |
| **Knowledge Graph** | Manual relations | Automatic (AI-powered) |
| **Multi-Agent AI** | One AI assistant | Specialist team |
| **Real-Time Collab** | ✅ Excellent | ✅ Built-in |
| **API Access** | Limited, paid tiers | Full API, all features |
| **Offline** | Limited | Full (event sync) |
| **Setup** | 30 seconds | 5 minutes |
| **Pricing** | $10+/user/month | Self-hosted (infrastructure cost) |

---

## Data Ownership \u0026 Privacy

### Notion:
```
Your Data
    ↓
Notion's Servers (AWS)
    ↓
They can:
- Access your content
- Train AI on it (opt-out available)
- Change pricing anytime
- Shut down (unlikely but possible)
- Subject to their terms
```

**Pros**:
- ✅ No hosting hassle
- ✅ Automatic backups
- ✅ Global CDN

**Cons**:
- ❌ They technically can access your data
- ❌ Vendor lock-in
- ❌ Subject to price changes
- ❌ Can't customize infrastructure

---

### Synap:
```
Your Data
    ↓
Your Server/Laptop/Cloud
    ↓
You control:
- Who accesses it (only you)
- Where it's stored (US, EU, home)
- How it's backed up
- Infrastructure cost
- Complete sovereignty
```

**Pros**:
- ✅ Complete data ownership
- ✅ No vendor lock-in
- ✅ Can run air-gapped for sensitive data
- ✅ Customize infrastructure
- ✅ Export everything anytime

**Cons**:
- ❌ You manage infrastructure
- ❌ You handle backups
- ❌ Initial setup required

**When Synap Wins**:
- Medical records, legal documents, proprietary research
- Teams in regulated industries (HIPAA, GDPR)
- High-security requirements
- Want air-gapped deployment

---

## Version History \u0026 Undo

### Notion:
```
Version History:
- Last 30 days (free)
- 90 days (paid)
- Versions are snapshots at save points

Undo:
- Ctrl+Z for recent changes
- Can't undo old changes
- Can't undo deletions after 30/90 days
```

**Example Problem**:
```
Day 1: Create important note
Day 45: Accidentally delete it
Result: GONE FOREVER (past Notion's history limit)
```

---

### Synap:
```
Event History:
- INFINITE (every change recorded)
- Every edit is an immutable event
- Can rebuild any past state

Undo:
- Any change, from any time
- Time-travel to any point
- Deleted? Restore it from events
```

**Example Solution**:
```
Day 1: Create note
Day 365: Accidentally delete it
Result: View events, restore from Day 1, or any day in between
```

**Code Example**:
```typescript
// View note as it was 6 months ago
const pastState = await synap.timeline.getState({
  entityId: 'note_123',
  timestamp: sixMonthsAgo
});

// Restore it
await synap.history.restore({
  entityId: 'note_123',
  toTimestamp: sixMonthsAgo
});
```

**When Synap Wins**:
- Need compliance audit trails
- Long-term projects (years)
- Collaborative work (who changed what?)
- Legal/regulatory requirements
- Time-travel debugging

---

## AI Capabilities

### Notion AI:
```
Capabilities:
- Summarize notes
- Generate content
- Q\u0026A on your data
- Brainstorming
- Translation

Limitations:
- One AI assistant
- Linear conversations
- Can't branch for deep dives
- No AI reasoning transparency
- Limited context (current page/database)
```

**Example Flow**:
```
You: "Write a blog post about AI trends"
Notion AI: [Writes post]
You: "Actually, first research competitors"
Notion AI: [Researchescompetitors]
  [Conversation now has both blog writing AND research mixed]
You: "Back to the blog post"
Notion AI: [Has to re-read whole context]
```

---

### Synap AI:
```
Capabilities:
- Multi-agent system (Research, Technical, Creative specialists)
- Branching conversations (Git-like)
- Parallel AI execution
- Full reasoning transparency
- Knowledge graph context (everything connected)

Workflow:
- Orchestrator coordinates specialists
- Each specialist has deep domain expertise
- Work happens in parallel branches
- Merge insights when ready
```

**Example Flow**:
```
You: "Write a blog post about AI trends"

Orchestrator: "I'll coordinate research and writing"

[BRANCH 1: Research Specialist]
  Deep dives into AI trends (20 messages)
  Returns: 10 key trends

[BRANCH 2: Creative Specialist]
  Drafts blog post structure
  Returns: Outline

Main thread: "Based on research + outline, here's the post..."
  [Main thread stayed clean]
```

**Code Example**:
```typescript
// Automatic branching
await synap.chat.send({
  threadId: main.id,
  message: 'Write comprehensive blog post about AI'
});

// Orchestrator automatically:
// 1. Creates research branch (research specialist)
// 2. Creates outline branch (creative specialist)
// 3. Synthesizes results in main thread

// Check branches
const branches = await synap.threads.getBranches(main.id);
// [
//   { purpose: 'Research AI trends', agent: 'research' },
//   { purpose: 'Create blog outline', agent: 'creative' }
// ]
```

**When Synap Wins**:
- Complex multi-step workflows
- Need parallel AI exploration
- Want to understand AI reasoning
- Require specialist expertise per domain
- Building AI-powered products

---

## Knowledge Graph

### Notion:
```
Relations:
- Manual database relations
- Must create relation properties
- Two-way sync available
- Static (doesn't discover new connections)

Example:
1. Create "People" database
2. Create "Projects" database
3. Manually create relation property
4. Manually link people to projects
5. Keep updated manually
```

**Limitations**:
- ❌ All manual
- ❌ Doesn't suggest connections
- ❌ Can't query transitive relations easily
- ❌ No weighted/typed relations

---

### Synap:
```
Knowledge Graph:
- Automatic entity extraction (AI)
- Auto-discovered connections
- Typed relations (mentions, assigned_to, related_to)
- Bi-directional navigation
- Graph queries (shortest path, etc.)
- AI suggests new connections

Example:
1. Type: "Call Marie tomorrow about Project X budget"
2. AI automatically:
   - Extracts entity: Marie (person)
   - Extracts entity: Project X
   - Creates relation: note → mentions → Marie
   - Creates relation: note → mentions → Project X
   - Suggests task: "Call Marie tomorrow"
   - Links task → assigned_to → Marie
   - Links task → belongs_to → Project X
```

**Code Example**:
```typescript
// Find everything connected to "Marie"
const connected = await synap.graph.findRelated({
  entityId: 'person_marie',
  depth: 2,  // Two degrees of separation
  relationTypes: ['mentions', 'assigned_to', 'related_to']
});

// Returns:
// [Note: Call Marie] --mentions--> [Marie]
//                                     |
//                                 assigned_to
//                                     |
//                                 [Task: Design mockups]
//                                     |
//                                 belongs_to
//                                     |
//                                 [Project X]
```

**When Synap Wins**:
- Want automatic knowledge organization
- Need graph visualizations (Obsidian-style)
- Complex relationship queries
- Discovering hidden patterns
- Building knowledge apps

---

## API Access

### Notion:
```
API:
- Limited endpoints
- Rate limits (3 requests/second)
- Some features not available via API
- Requires paid plan for higher limits
- Can't access full version history

Typical use:
- Read databases
- Create/update pages
- Limited search
```

---

### Synap:
```
API:
- Full tRPC API (type-safe)
- All features available
- Event stream access
- Knowledge graph queries
- Real-time WebSocket
- No rate limits (you control it)

Typical use:
- Build custom UIs
- Create specialized agents
- Workflow automation
- Data sync services
- Analytics dashboards
```

**Code Example**:
```typescript
import { SynapClient } from '@synap/client';

const client = new SynapClient({
  url: 'http://your-synap-instance.com'
});

// Full type safety
const notes = await client.notes.list();
//    ^? Note[]

// Query knowledge graph
const graph = await client.graph.query({ ... });

// Subscribe to events
const events = await client.events.subscribe({
  types: ['note.created', 'task.completed']
});

// Real-time updates
const ws = client.realtime.connect();
ws.onMessage(data => console.log(data));
```

**When Synap Wins**:
- Building products on top
- Need full programmatic control
- Creating custom agents/workflows
- Data sync with other systems
- Advanced automation

---

## Real-World Use Cases

### When to Choose Notion:

✅ **Team Wiki \u0026 Documentation**
- Quick setup for non-technical teams
- Beautiful database views
- Great templates
- Easy onboarding

✅ **Project Management**
- Kanban boards, calendars, timelines
- Comment and @mention workflows
- Proven for team collaboration

✅ **Marketing/Sales**
- Content calendars
- CRM-lite use cases
- Campaign planning

**Ideal User**: Non-technical teams needing quick, beautiful collaboration

---

### When to Choose Synap:

✅ **Personal Knowledge Management**
- Second brain with AI
- Research repository
- Professional development tracking
- Time-travel to past learnings

✅ **Regulated Industries**
- Healthcare (HIPAA compliance)
- Legal (client confidentiality)
- Finance (SOX compliance)
- Self-hosted, air-gapped deployment

✅ **Developer Tools**
- API documentation with graph
- Technical research
- Code knowledge base
- Full programmatic control

✅ **AI-Powered Products**
- Build on top of Synap
- Custom AI workflows
- Knowledge graph apps
- Multi-agent automation

**Ideal User**: Developers, researchers, regulated industries, AI builders

---

## Migration Path

### From Notion to Synap:

```bash
# 1. Export from Notion
Settings → Export all workspace content
Format: Markdown \u0026 CSV

# 2. Import to Synap
npx synap-import --from notion --path ./notion-export

# 3. Verify
✓ Notes imported
✓ Databases → Projects/Entities
✓ Relations preserved
✓ Files migrated
```

**What Transfers**:
- ✅ All notes (as markdown)
- ✅ Databases → Synap entities
- ✅ Relations → Knowledge graph
- ✅ Files/images

**What Doesn't**:
- ❌ Comments (becomes notes)
- ❌ Page history (starts fresh)
- ❌ Database views/formulas (manual recreation)

---

## Cost Comparison

### Notion Cost:
```
Team: $10/user/month
- 10 users = $100/month = $1,200/year
- 50 users = $500/month = $6,000/year
- Plus: Enterprise features are $$$$
```

### Synap Cost (Self-Hosted):
```
Infrastructure:
- Small team (1-10): $20-50/month (VPS)
- Medium team (10-50): $100-200/month (managed DB)
- Large team (50+): $500+/month (scaled infra)

Plus:
- Your time (setup, maintenance)
- BUT: No per-user fees
- Scale hardware, not user count
```

**Break-Even Analysis**:
```
For 10 users:
- Notion: $1,200/year
- Synap: ~$600/year (infrastructure) + setup time

For 50 users:
- Notion: $6,000/year
- Synap: ~$2,400/year + setup time

Synap ROI increases with team size
```

---

## Final Recommendation

### Choose Notion if:
- ✅ Want zero setup time
- ✅ Non-technical team
- ✅ Need proven templates
- ✅ Want Notion's beautiful UI
- ✅ Don't need full data sovereignty
- ✅ Okay with vendor lock-in
- ✅ Team \<10 people

### Choose Synap if:
- ✅ Need data sovereignty
- ✅ Want infinite version history
- ✅ Need multi-agent AI
- ✅ Want knowledge graph automation
- ✅ Building products on top
- ✅ Regulated industry (HIPAA, etc.)
- ✅ Developers/technical team
- ✅ Want full API control
- ✅ Team scales (per-user fees add up)

---

## Try Both?

You can:
1. **Start with Notion** for quick team setup
2. **Migrate to Synap** when you need:
   - Data sovereignty
   - Advanced AI
   - Full API access
   - Cost optimization (large teams)

**Migration is supported**: Export from Notion → Import to Synap

---

**Next**: [Synap vs Obsidian](./vs-obsidian) | [Migration Guide](../migration/from-notion)
