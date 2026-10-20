# PKM ecosystem & use-case research

Date: 2026-09-07. Read-only market research; no code written.

## Evidence labels

- **VERIFIED** — I read the primary artifact myself (a stats JSON, a vendor doc page, a repo README, an issue tracker).
- **REPORTED** — a secondary source asserts it; I did not see the primary. Opinion unless it carries its own numbers.
- **INFERRED** — my reasoning over the above.

⛔ **r/ObsidianMD, r/Notion and r/PKMS were unreachable.** `reddit.com` and `old.reddit.com` refuse both WebFetch and curl from this environment; the team lead independently tried browser automation and Chrome was unresponsive. **No frequency data on abandonment exists in this report.** Every churn claim below is REPORTED from blogs/newsletters/post-mortems or from search snippets quoting threads. **Closing this gap needs a human with a working browser.** I have named the unavailable source rather than substituting confident prose for it.

---

# 0. Executive summary

**The finding that should change the demo, first:**

> In the largest plugin ecosystem in this category — 7,357 plugins, **145,337,729 downloads** — every plugin with "CRM" in its name or description has **3,063 downloads combined**. Job-hunt trackers: **~730**. Freelance/client/invoice: **~585**.
> Task plugins: **11,989,596**.
>
> **Ratio of task-tracking to personal-CRM demand: roughly 3,900 : 1.**

Personal CRM, job pipelines and client trackers are what nearly every graph-shaped PKM product demos with — Synap included. They are, measurably, what almost nobody builds.

**The second finding explains the first, and together they are one finding.**

The typed-data appetite is real and large: Dataview 4,913,035 · Templater 5,519,432 · Tasks 4,183,707 · make.md 864,106 · Metadata Menu 330,100 · Datacore 327,133. Millions of people hand-build a typed layer on a filesystem. **But what they type is not people-companies-deals.** Across four independent sources — Dataview's own doc examples, Dataview's examples gallery, Obsidian's official Bases documentation, and the Obsidian forum's Bases showcase — the entities are consistently: **tasks, projects, daily notes, books, games, movies, TV, recipes, habits, exercise logs, appointments.**

Every one of those is **an artifact or activity the vault already contains as a file.** Not one is an entity from the outside world.

**The mechanism:** Obsidian can type what the filesystem already holds. A book you took notes on is a file; a habit you logged is a file. A *person* is not a file unless you sit down and type them in — and the CRM numbers are the measured record of how many people do that. **Roughly nobody.**

So the constraint is not schema power. Dataview is enormously powerful and CRM plugins still sit at 3,063 downloads. **The missing ingredient is an inbound feed. Entities from the outside world need to arrive, or they don't exist.** No amount of type-system expressiveness fixes that, which is why five years of a very capable plugin ecosystem hasn't.

**What this means for Synap:** the differentiator is not the typed graph — Obsidian users approximate it, Anytype has it properly, and Obsidian now ships a native database layer ("Bases"). The differentiator is **being the only one of these that can populate the noun-classes the filesystem can't reach.** That is an integrations-and-governance product wearing a knowledge-graph coat, not the reverse.

**Three more findings that move decisions:**

1. **Both closest analogues abandoned PKM positioning** (VERIFIED on primary). `tana.inc` today reads verbatim *"Tana is an agentic meeting platform"*; the supertag outliner was renamed **Tana Outliner** and exiled to a subdomain. Anytype's homepage is *"A safe haven for digital **collaboration**"* and its docs renamed Spaces to **Channels**. The two companies that got closest to a typed personal knowledge graph both bolted it to a collaboration surface.

2. **"AI proposes new structure" is claimed, not unclaimed.** Notion's Agent does *"creating or editing properties, including relations to other databases."* Anytype's agent skill does *"modifying Types and Properties."* Obsidian's #1 AI plugin ships a **Bases skill** so agents author database views. Retire this differentiator.

3. **The governance gap is real but narrower than I first wrote, and I correct myself in §6.4.** Per-action approval *does* exist in Obsidian Copilot — inherited from the Claude Code CLI, and explicitly disclaimed by its own docs as *"not a security sandbox."* What nobody has is a **durable, server-side, agent-agnostic proposal record**. That distinction is defensible; "nobody has approval" is not, and I should not have implied it.

---

# 1. The census — what people type, and what they don't

**Source (primary, VERIFIED):** Obsidian's own published counters, downloaded and aggregated locally on 2026-09-06:
`https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json` + `.../community-plugins.json`.
**7,357 plugins listed** (7,317 with stats), **145,337,729 total downloads.**

## 1.1 Method, stated so it can be challenged

The lead asked how I decided a plugin was "CRM-named." Exactly this, and nothing else:

- I concatenated each plugin's **`name` + `description`** from `community-plugins.json`.
- I regex-matched **case-insensitively** over that string.
- For the CRM figure the pattern was the **word-bounded literal `\bCRM\b`** — not a semantic judgement, not my reading of what a plugin does.
- I summed `downloads` from `community-plugin-stats.json` for every match.

**`\bCRM\b` returns exactly four plugins. Here is the complete list, so the number is auditable:**

| Plugin | id | Downloads |
|---|---|---|
| Cadence | `cadence-planner` | 1,930 |
| Vault CRM | `vault-crm` | 541 |
| Arcadia Connect | `arcadia-connect` | 382 |
| Personal CRM | `personal-crm` | 210 |
| **Total** | | **3,063** |

**Known weaknesses of this method, stated honestly:**
- ⚠️ **It undercounts.** A CRM built with Dataview + Templater needs no plugin and is invisible here. The *true* number of people running a personal CRM in Obsidian is higher than 3,063 — possibly much higher.
- ⚠️ **The contrast categories are inflated by false positives.** My broader "deals/pipeline/sales" pattern matched *Regex Pipeline* (24,037) and *File Cooker* on the word "pipeline"; "people/companies" matched *Note Companion* and *Colorful Note Borders*. **I therefore do not use those aggregate numbers anywhere.** Only the clean word-bounded counts below are load-bearing.
- ✅ **But the asymmetry survives every weakness.** The undercount applies equally to tasks — Tasks-the-plugin has 4.18M downloads *despite* markdown checkboxes being free and built in. If demand for a personal CRM were anywhere near demand for task tracking, four plugins totalling 3,063 downloads is not what the ecosystem would look like.

## 1.2 The contrast, using only clean patterns (VERIFIED)

| Category | Pattern | Plugins | Total downloads |
|---|---|---|---|
| **Tasks / to-dos / kanban** | `\btasks?\b|\bto-?dos?\b|\bkanban\b` | 445 | **11,989,596** |
| **Books / reading / highlights** | `\bbooks?\b|\breading\b|\bhighlights?\b|\bkindle\b` | 387 | **3,961,836** |
| **Habits / exercise / streaks** | `\bhabits?\b|\bexercise\b|\bworkout\b|\bstreak\b` | 65 | **345,724** |
| **Movies / games / TV / anime** | `\bmovies?\b|\bgames?\b|\btv shows?\b|\banime\b` | 62 | **293,494** |
| **CRM** | `\bCRM\b` | **4** | **3,063** |
| Job-hunt tracking | — | 3 | ~730 |
| Freelance / client / invoice | — | 3 | ~585 |

## 1.3 The one place people *do* handle humans — and it is importing, not managing (VERIFIED)

Genuine people-entity plugins, hand-picked from the noisy match and listed individually so the reader can check my judgement:

| Plugin | Downloads | What it does |
|---|---|---|
| Google Calendar and Contacts Lookup | 19,703 | **pulls contacts in** |
| Contacts | 8,580 | contact notes |
| VCF Contacts | 5,764 | **imports vCards** |
| iCloud Contacts | 4,988 | **syncs from iCloud** |
| Sync Contacts on macOS | 3,871 | **syncs from macOS** |
| At People | 3,823 | `@mention` people in notes |
| **≈ Total** | **≈ 46,729** | |

**Five of the six are importers or syncers. None is a relationship pipeline.** 15× more people want contacts *pulled in from a system that already has them* than want a CRM to maintain. That is the whole thesis of this report in one table.

## 1.4 Top plugins by lifetime downloads (VERIFIED)

| # | Plugin | Downloads | Job |
|---|---|---|---|
| 1 | Excalidraw | 7,767,195 | visual thinking |
| 2 | Templater | 5,519,432 | **scaffold a typed note** |
| 3 | Dataview | 4,913,035 | **query the vault as a database** |
| 4 | Tasks | 4,183,707 | **tasks with due/recurrence** |
| 5 | Advanced Tables | 3,172,701 | tables |
| 6 | Git | 3,107,028 | versioning |
| 7 | Calendar | 3,076,639 | **daily notes** |
| 8 | Style Settings | 2,656,829 | theming |
| 9 | Kanban | 2,635,010 | **board over notes** |
| 10 | Iconize | 2,209,430 | icons |
| 11 | Remotely Save | 2,207,985 | **sync (S3/self-host)** |
| 12 | QuickAdd | 2,078,824 | **fast structured capture** |
| 13 | **Claudian** | **2,024,317** | **Claude Code/Codex agents in the vault** |
| 15 | Omnisearch | 1,831,332 | search + OCR |
| 16 | **Copilot** | **1,826,521** | **agents in the vault** |
| 18 | **Importer** | **1,634,632** | **migrate from Notion/Evernote/Apple Notes** |
| 20 | TaskNotes | 1,373,910 | tasks + calendar + time |
| 21 | Homepage | 1,311,744 | **dashboard on startup** |
| 22 | Smart Connections | 1,188,142 | AI related-notes |
| 24 | **Tag Wrangler** | **1,079,336** | **rename/merge tags — schema repair** |
| 25 | **Linter** | **1,043,725** | **normalise YAML frontmatter — schema repair** |
| 29 | Self-hosted LiveSync | 914,147 | **self-hosted sync** |
| 32 | make.md | 864,106 | **code-free databases + relational trackers** |
| 38 | **Local REST API with MCP** | 711,013 | **expose the vault to agents** |

**Note #24 and #25: two top-25 plugins, 2.1M downloads combined, exist purely to repair schema drift.** Schema maintenance is a measured cost centre in this category.

---

# 2. ⭐ What the typed layer is actually *over* (the lead's key question)

I checked four independent sources for what people put in tables. They agree.

**Source A — Dataview's own query-structure docs (VERIFIED):** the documented examples are **tasks**, **recipes** (`TABLE recipe-type, portions, length FROM #recipes`), **assignments** (`LIST FROM #assignments WHERE status = "open"`), **appointments and follow-ups**, **lists inside daily notes**, and one **contacts** array (`FLATTEN contacts as c SORT link(c).age ASC`).

**Source B — Dataview's examples gallery (VERIFIED):** **games** (twice — `TABLE time-played, length, rating FROM "games"`; `LIST FROM #games/mobas OR #games/crpg`), **tasks**, **books**, and files-by-date.

**Source C — Obsidian's official Bases docs (VERIFIED):** Bases is now a **core plugin** — table, cards, list, kanban, map layouts, with properties, formulas and filters. The documentation gives **exactly one worked example**, and it is: *"you may want to create a base called **'Books'** that has separate views for 'Reading list' and 'Recently finished'."* That is Obsidian's own bet, with better data than we have, on what people want to tabulate.

**Source D — the Obsidian forum's Bases showcase (REPORTED via search snippets over forum.obsidian.md):** project/task templates, recent-files views, unresolved-notes tracking, and — quoted — *"Most uses of Bases are to record things that have happened, such as exercises performed or tracked habits"* and *"people track what they read and watch with a note per book/movie, each with date properties."*

## 2.1 The pattern, and why it is mechanical rather than cultural

Sort every entity named above into two columns:

| Things the vault already contains as files | Things that exist only in the outside world |
|---|---|
| tasks, projects, daily notes, books/reading notes, games, movies, TV, recipes, habits, workouts, appointments, unresolved links, recent files | **people, companies, deals, invoices, applications, threads** |
| **Everything in all four sources** | **One `FLATTEN contacts` example, in five years of docs** |

**This is not a preference. It is a reachability limit.** Obsidian types nouns whose instances already have a file. People and companies have no file until a human types one — and §1.3 measures how many do: five of the six people-plugins are *importers*.

**The three consequences for Synap, stated plainly:**

1. **Synap and Obsidian are not competing for the same noun-classes.** Obsidian owns artifacts-and-activities and owns them well, natively, for free, with 145M downloads of momentum. Synap should not fight there.
2. **The outside-world column is genuinely unserved — but "unserved" here means "structurally unreachable," not "overlooked."** Nobody built it because nobody *could*. Synap can, because it has OAuth integrations and a server. **That is the actual moat, and it is an integrations moat.**
3. ⚠️ **This is a different product from the one being demoed.** Demoing a personal CRM as "look, you can define a Person kind" pitches the *schema* — the part Obsidian already approximates and Anytype does better. The pitch that follows from this evidence is: **"your people, companies and threads are already in Gmail and Calendar; Synap is where they land as real entities you never typed."** The schema is the plumbing, not the product.

---

# 3. The landscape, and who is closest

## 3.1 Both closest analogues walked away from PKM positioning (VERIFIED, primary)

**Tana** (`tana.inc` and `outliner.tana.inc`, fetched 2026-09-06):
- Headline, verbatim: **"Tana is an agentic meeting platform."** Sub-copy: *"Work gets done in the meeting, not after. Agents create documents, file issues, and update your context graph while you talk."*
- The supertag outliner — the closest thing on the market to Synap's typed graph — is **renamed "Tana Outliner"** and moved to a subdomain, whose docs open with a disambiguation: *"Tana Outliner is a knowledge management tool built on an infinite outliner with supertags, views, and AI features… Not to be confused with Tana, the company's separate, newer agentic meeting platform."*
- ⚠️ A secondary source dated the split to April 2026; that source also cited a future date, so **the date is unverified — the split itself is verified on primary.**

**Anytype** (`anytype.io`, `doc.anytype.io/anytype/llms-full.txt`):
- Headline, verbatim: **"Anytype — A safe haven for digital collaboration."** Not notes, not second brain.
- The docs renamed the core container: **Spaces are now "Channels"** — *"**The rooms in your house.** Channels are where all the work happens. Also known as Spaces"* — a messaging metaphor.

**INFERRED, carefully:** two points are a pattern, not a law. But the honest reading is that **"typed personal knowledge graph, for one person" has not proven to be a business on its own** for either company that got closest. Synap should choose deliberately whether it is taking the contrarian bet that agents changed those economics — a defensible position — or heading somewhere similar. Drifting is the bad outcome.

## 3.2 Anytype's model maps almost 1:1 to Synap's (VERIFIED)

| Anytype | Synap |
|---|---|
| Vault (E2E-encrypted, key-only, unrecoverable) | pod |
| **Channel** (formerly Space) | workspace |
| **Object** | entity |
| **Type** (Note, Task, Person, Book; user-definable) | kind / entity profile |
| **Property** (incl. object links — *"connecting a book to its movie adaptation"*) | property def / relation |
| **View** (table/list/gallery/kanban/graph/calendar → sidebar Widgets) | view / bento widget |
| Sets (query-backed) vs Collections (curated) | saved view vs manual list |

**Where Synap genuinely differs (VERIFIED from Anytype's docs):**
- **Self-hosting is real but rough**: Docker Compose or Ansible/Puppet, requires a network configuration file, *"All your devices should be manually switched to the same self-hosted network"*, a **separate identity recommended per network**, and migrating off means **export everything and import into a new identity**. That is a migration with identity loss, not a switch.
- **No account recovery**: *"If you lose your Key, your account cannot be recovered—by anyone, including Anytype."* A hard consumer ceiling, and an opening for a sovereign product with recoverable accounts.

## 3.3 Obsidian shipped the database layer natively (VERIFIED)

**Bases is now a core plugin**: *"create database-like views of your notes"*, over local Markdown + frontmatter, with **properties, five layouts (table/cards/list/kanban/map), formulas and filters**, saved as `.base` files. The changelog shows active work — kanban with drag-and-drop reordering, collapsible groups.

Obsidian also shipped an **iOS Share Sheet** (v1.13 mobile): *"save content from Safari, YouTube, and other apps without opening Obsidian"*, with capture location and template variables. **Capture friction is being actively closed by the incumbent.**

⚠️ **The Bases docs do not describe typed relations between notes as a property type.** VERIFIED as *not documented*; **NOT verified as impossible** — I did not test the product. Confirm in-product before this appears in any competitive claim.

**Implication: "databases over your notes" is no longer a differentiator against Obsidian.**

## 3.4 Not researched (honest omission)

**Logseq, Capacities, Reflect, Mem, Roam, Amplenote, Siyuan, AFFiNE** — not examined on primary. Searches for this tier returned almost entirely SEO affiliate pages ("Best X Alternatives in 2026"), which I declined to treat as evidence. I spent the budget on the three products that matter to Synap's positioning. ⚠️ Specifically, **the brief's premise that Mem repositioned is unconfirmed** — secondary sources describe a "Mem 2.0" continuing the same thesis.

---

# 4. Churn — why second brains get abandoned

⚠️ **Evidence quality: this is the weakest section in the report and the most important.** With reddit unreachable I have **no frequency data**. What follows is a mechanism analysis from essays and quoted snippets. Consistent across sources, good face validity, **but nobody here has measured how many people abandon or when.** Treat as hypotheses. Per the lead's instruction I have preferred sources carrying their own numbers, and there are very few.

## 4.1 The five mechanisms

**1. Setup cost is paid before any value arrives.**
The most quotable line, REPORTED from *"I Ditched Notion for Apple Notes"*: the author *"spent 3 hours configuring Obsidian to save 10 minutes per month"* and describes the system as having *"become a part-time job."* Search snippets from the reddit discourse echo it: people *"spend so much time organizing notes and creating connections that they hardly have time left for their actual work."*
→ **The killer ratio is configuration-hours vs payoff-minutes, and it is inverted at the start.**

**2. The system becomes the goal. — the one I'd bet on**
Multiple sources converge on the same framing: the second brain *"turns from a tool into a project of its own"*; people become preoccupied with *"note-taking techniques and the perfect tagging system."*
→ ⚠️ **This is the direct risk to Synap's stated premise.** "Users create their own use," "user-definable kinds and properties" — viewed unkindly, that is *a schema-tinkering surface*, the highest-grade fuel for this failure mode. **Structure must be a consequence of capture, never a prerequisite for it.**

**3. The Collector's Fallacy (VERIFIED, primary essay — zettelkasten.de).**
Verbatim: *"'to know about something' isn't the same as 'knowing something'."* And the mechanism, which is the useful part: *"Pressing the 'copy' button is immediately rewarded with copied paper. These reinforcements are satisfying."* The author explicitly invokes Skinner's operant conditioning.
→ **Capture is a slot machine; retrieval is work.** A product that perfects capture and ships nothing else has optimised the addictive half and skipped the valuable half. The essay's prescribed remedy is a cycle — *"Research, Read, Assimilate; rinse and repeat"* — **a loop, not a store.**

**4. Config sprawl — and here the cost is measured, not asserted.**
REPORTED: people *"burning out on Obsidian by chasing plugins and folder hierarchies."* **VERIFIED corroboration:** Tag Wrangler (1,079,336) and Linter (1,043,725) are top-25 plugins whose entire job is repairing schema drift — renaming/merging tags, normalising YAML. **2.1M downloads of "fix my own metadata mess."**

**5. Retrieval failure.** The Apple Notes convert's stated reason was frustration *searching for client notes across multiple apps*; now they find *"any note in under 5 seconds."* People leave because they couldn't find the thing.

## 4.2 What a product must do differently (INFERRED, my opinion)

1. **Value on day one with zero configuration.** If the first session requires defining a kind, the churn clock has already started. Synap's available answer: **integrations populate the graph before the user models anything.**
2. **Structure retrofits onto captured data, never gates it.** AI-proposes-a-kind is the right *shape* precisely because it inverts the setup cost — the user says "yes, that's a Book" rather than designing a Book type at 11pm.
3. **Ship the resurfacing half.** Readwise is the proof that the loop is the business (§5.3).
4. **Treat schema maintenance as a first-class surface.** 2.1M downloads say this work exists and is currently done with regex-grade tools.
5. **Disqualify aggressively.** The category's own converts say these tools are *"over-dimensioned for 95% of people."* Synap's user is the one with **data arriving from many systems.** That is the qualifier; everyone else should use Apple Notes and Synap should say so.

---

# 5. Capture, import, and what Readwise teaches

## 5.1 How data actually gets in (VERIFIED counts)

**Reading/highlights is the most-served lane:** Zotero Integration 550,233 · Annotator 595,201 · PDF++ 768,281 · Readwise Official 242,697 · Book Search 229,998 · Weread 193,432 · Kindle Highlights 165,814 · ReadItLater 134,934 · **Omnivore 133,168 (for a dead service)** · Clipper 75,414 · Snipd 72,012 · Raindrop 32,945 · Instapaper 8,753.

**Tool migration is the other:** **Importer 1,634,632** (Apple Notes / OneNote / Notion / Evernote).

**Email-to-notes is nearly absent:** Send Email into Vault 7,346; all Gmail-named plugins <1k combined. **INFERRED: not from lack of desire but because OAuth-shaped integrations are exactly what a local file app cannot do.** Structurally Synap's lane, not Obsidian's — and consistent with §2.1.

## 5.2 The Omnivore lesson (REPORTED, consistent across many sources)

Omnivore — open-source read-later — was acqui-hired by ElevenLabs (announced 2024-10-29, team moved 2024-11-01) and **the service shut down 2024-11-15 with user data deleted after that date.** Roughly half a million users lost saved libraries on a two-week timer. **133,168 people had wired the Obsidian Omnivore plugin into their vault; those downloads are now a monument.**

→ The best real-world argument for Synap's premise, and note *which* argument it is: **not privacy — continuity.** *"A read-later library you do not control is only as permanent as someone else's business model."* Sovereignty sold as continuity is a much stronger pitch, and Omnivore is the case study.

## 5.3 Readwise (VERIFIED from readwise.io + /pricing)

- **Headline:** *"Get the most out of what you read."* Loop: **Import Highlights → Review → Remember.**
- **The product is the resurfacing loop, not the store**: a **daily review email + app**, using **spaced repetition**.
- **Pricing:** Lite **$5.59/mo** annually (daily review, search, sync, tags). Full **$9.99/mo** — adds **export to Notion/Obsidian** and **Readwise Reader**. 30-day trial, 50% student discount, +30 trial days per referral, **lifetime price lock** on Full.
- ⛔ **Retention: NOT FOUND.** No published figure. The pricing page's only number — *"these and 1,724 other readers"* — is a **testimonial carousel string, not a subscriber count**, and must never be quoted as one. **Readwise's retention story is widely asserted and unverified by this dive.**

**Four transferable lessons:**
1. **They sell the loop.** The daily review is a *scheduled outbound artifact*: it arrives on its own. Nothing in this category retains without that.
2. **One narrow high-volume input** (highlights), done against every source — not a general knowledge tool.
3. **They monetise the export.** "Export to Notion/Obsidian" is the paid tier. **Being the pipe into someone else's vault is a business** — worth noting before assuming Synap must own the vault.
4. **Lifetime price lock + student pricing** = management betting on very long tenure.

## 5.4 "No duplication" means three different things (INFERRED)

No primary study found. The phrase conflates three things and Synap should not:
- **(a) One entity, many appearances** — a person exists once, shows up in five views. *This is what the founder means.* Synap does it natively.
- **(b) Dedup on import** — the same article from a clipper and from Readwise; the same person from Google Contacts and an email thread. This is **identity resolution** (`IdentityResolutionService`, strong-signal atoms). Unglamorous, and the actual hard part.
- **(c) No re-typing** — not entering data a system I already use already has. An *integrations* claim.
→ **The founder means (a); users experience (b) and (c).** Nailing (a) alone will not feel like "no duplication" to anyone.

---

# 6. AI and agents in PKM — the deep dive

## 6.1 What AI is for, by tier (VERIFIED)

- **Relate:** Smart Connections 1,188,142.
- **Write:** Text Generator 578,372; Notion AI.
- **Fill:** Notion **AI autofill** — from notion.com/help/autofill, it *"works exclusively with existing properties—it doesn't create new ones"*; Basic (page content) vs **Custom Agent Autofill** (workspace + web search); runs manually, on create, on edit, **or on a schedule**.
- **Act:** the 2026 shift, and it is *coding agents inside the knowledge base*.

## 6.2 What these agents actually DO once inside (VERIFIED from READMEs/docs)

**Claudian (2,024,317, #13)** — *"embeds AI coding agents (Claude Code, Codex, Grok, Opencode, Pi) in your vault. **Your vault becomes the agent's working directory — file read/write, search, bash, and multi-step workflows** all work out of the box."* Features: inline edit with word-level diff, `@mention` of vault files and subagents, slash-commands/Skills, **Plan Mode** (*"the agent explores and designs before implementing, then presents a plan for approval"*), MCP servers via each CLI's native config.

**Copilot (1,826,521, #16)** — *"Agents for your Obsidian vault… brings opencode, Claude Code, and Codex into Obsidian."* Agent *"can inspect notes, use tools, create Obsidian files, and continue across several turns with permissions you control."*

**⭐ The answer to "is anyone using agents to CREATE structure": YES, and the #1 AI plugin ships it as a feature.** Copilot's README, verbatim: *"Copilot also includes **skills for Obsidian Markdown, Bases, Canvas, and the Obsidian CLI**."* A **Bases** skill is a skill for authoring database views — i.e. the agent builds the typed layer. Alongside Notion's Agent (*"creating or editing properties, including relations to other databases"*) and Anytype's skill (*"modifying Types and Properties"*), **structure-creation by agent is shipped in all three ecosystems.**

**But note the ceiling in Obsidian**, and it is the §2.1 point again: the agent's interface is *the filesystem* — read/write/search/bash over markdown. It can write frontmatter and `.base` files, but there is no entity, no identity, no relation the system understands. **Agents in Obsidian can only create structure-as-convention.** Synap's agents write to a typed graph with resolution and referential meaning. That is a real difference and it is not one Obsidian can close without becoming a database.

## 6.3 What users complain about (VERIFIED — GitHub issue trackers)

I read the open issues, ranked by reactions: **Copilot 72 open, Claudian 36 open.**

**The complaints are overwhelmingly plumbing, not governance.** Representative: *"opencode acp stdin/stdout mode crashes on Windows"*; *"Codex npm setup fails at login"*; *"Copilot doesn't accept my API Keys"*; *"Claude Code process exited with code 1"*; *"Plugin-scoped MCP server tools not exposed to session"*; *"User-scope MCP server never connects"*; *"Sending an image to a non-multimodal model permanently poisons the conversation"*; *"对话内容丢失"* (conversation content lost).

**Two that are structurally interesting:**
- *"**Let users exclude vault paths from Agent Mode file access**"* — users want **scoping**, and it does not exist.
- *"Consider allowing generated directories and skills to be disabled"* — agents generating artifacts the user didn't ask to keep.

**⚠️ The honest finding the lead asked me to give either way: "the AI wrote wrong structure into my knowledge base" is NOT yet a felt pain in these trackers.** Nobody is filing that issue. **INFERRED: this is an adoption-depth artifact, not evidence the problem is imaginary** — the population is ~4M installs old, mostly running read-and-summarise, and the scoping request above is the leading edge of exactly this concern. But I will not dress it up: **Synap's governance thesis is currently ahead of demonstrated demand.** It is a bet on where this goes, and it should be argued as a bet, not as a response to complaints users are making today.

## 6.4 ⚠️ Correcting my earlier claim about the governance gap

In my first pass I wrote that neither product has per-change approval. **That was too strong for Obsidian Copilot, and I'm correcting it.** From its own docs:

> *"When an action needs approval, Agent Chat displays a **Permission required** card with the proposed change or tool input. Choose one of the temporary or persistent allow or deny options."* Permission modes are **Default / Plan / Auto**, where Auto *"reduces approval prompts."*

So a genuine per-tool-call approval flow exists — **inherited from the Claude Code CLI's permission system**, surfaced in the plugin. Claudian's Plan Mode likewise *"presents a plan for approval."*

**Here is the precise, defensible statement of the gap, with the four properties that differ:**

| | Obsidian Copilot | Notion Agents | Anytype Skill | **Synap** |
|---|---|---|---|---|
| Per-action approval | ✅ Permission card (from the CLI) | ❌ scope pre-auth + warnings; their security page describes **no approval workflow before execution, and no undo** | ❌ delegated — *"You see the script before it runs (**in most agents**)"* | ✅ |
| **Where it lives** | client-side, in the plugin UI | — | **in the third-party agent client** | **server-side, in the data layer** |
| **Survives the turn** | ❌ ephemeral modal | ❌ | ❌ | ✅ **durable proposal record** |
| **Agent-agnostic** | ❌ only agents Copilot wraps | ❌ | ❌ breaks for a cron job or a headless agent | ✅ |
| Own docs' disclaimer | *"**Your vault or project is the agent's working directory, not a security sandbox.** Auto or bypass permissions can reach other files and services available to the agent or your account."* | — | *"**Review scripts before running them.** … A 'delete all Objects matching X' script run by mistake is hard to recover from."* | — |

**The defensible claim is therefore not "nobody has approval." It is: every existing gate is a modal in a client, disclaimed by its own authors as not a boundary, and it evaporates the moment the agent isn't a human-attended chat window.** Under BYOA — a cron job, a headless runner, five agents — *"most agents show you the script first"* stops being a control at all. A **server-side proposal record the pod owns** is what remains. That is worth building and worth saying; the overclaim is not.

**⭐ Prior art worth copying (VERIFIED, Notion):** Notion has a **"Can edit content"** permission level that *"prevents accidental edits to the database's **structure** — views, filters, property names, property types — while still allowing colleagues to edit the content inside."* **A content/structure permission split, already validated in a market of millions.** Synap's default governance floor for agents should have exactly this rung: write content freely, propose on structure.

---

# 7. Paths prior art says are wrong

**1. Making schema definition a prerequisite. (Strongly supported)**
Churn mechanism #2; the 3-hours-for-10-minutes anecdote; and the best single artifact — the Anytype community's own thread, titled **"How do you handle the friction of creating new Object Types? (Anytype vs. Tana workflow)."** *Type-creation friction is a named, discussed pain in the community of the product closest to Synap.* Corroborating framing: Tana is *"better for capturing messy thoughts that gradually become structured"*, Anytype *"better for building well-organized systems from the start"* — and it is Anytype's community with the friction thread.

**2. AI that organises without user control. (Supported)**
REPORTED: AI-first PKM is described as *"a trade-off of less control over organization"*; users *"still prefer tags for reliability"*; and the pattern described as working is explicitly review-gated — *"users review and accept or reject each suggestion before the graph changes."* This cuts **for** Synap's proposal flow and **against** any "the AI just organises it for you" positioning.

**3. "Capture everything" with no resurfacing loop. (Strongly supported)**
Mechanism from the Collector's Fallacy essay (primary), counter-proof from Readwise, tombstone from Omnivore.

**4. Plugin ecosystems that fragment the data model. (Supported by measurement — and it corrected my prior)**
Obsidian's ecosystem is not failing: 145.3M downloads. But it fragments the *type layer*. **Dataview (4,913,035), make.md (864,106), Metadata Menu (330,100), Datacore (327,133), Modal Forms (69,485) are five mutually incompatible ways to type the same notes** — and Obsidian then shipped a sixth, first-party (Bases). The cost is visible: Tag Wrangler (1,079,336) + Linter (1,043,725) in the top 25.
→ **INFERRED but well-grounded: if Synap lets packages define kinds freely it reproduces this.** The lesson is not "no ecosystem" — it is **one canonical type system that extensions extend, never a second one they bring.**

**5. Leading with personal CRM.** §0/§1. ~3,063 downloads against 11,989,596 for tasks.

**6. Pitching the schema rather than the feed.** §2.1. The typed graph is the part competitors have or approximate; the inbound population is the part they can't reach.

---

# 8. Use-case families — cases that hurt *because existing tools are rigid*

Per the lead's framing: I am **not** listing what Synap could model. The substrate models almost anything, which is exactly why an unfiltered list is useless. Each case below must pass one test: **it is painful specifically because today's tools are rigid or unreachable.** Where a workflow fits Obsidian + Dataview comfortably, I say so and drop it — that is a finding.

**The filter, derived from §2.1:** Synap wins where the entities are **from the outside world** (so the filesystem can't reach them), arriving **from multiple systems** (so identity resolution matters), written by **agents** (so governance matters). Two of three minimum.

---

### #1 — The multi-tool operator ⭐ recommended wedge
**Person:** solo founder, consultant, chief-of-staff. Work spread across Gmail, Calendar, Slack, Linear/GitHub, Notion, and a CLI agent.
**Job:** "what is the state of everything, and what needs me today."
**Today:** Notion with everything re-typed by hand, plus 40 browser tabs. Or their head.
**Data in:** email threads, calendar events, issues/PRs, meeting transcripts, agent output.
**Structure:** person · company · project · commitment · decision — **populated by integration, never authored.**
**The rigidity that makes it hurt:** every one of those entities lives in a system that will not let it out as an entity. Obsidian cannot reach them at all (no OAuth). Notion can hold them but you type them. So the operator re-keys the same person into three tools and reconciles by memory.
**Why Synap:** the only candidate that can *land* these as resolved entities. Passes all three filters.
**Honest risk:** every "AI chief of staff" startup pitches this. Synap's non-copyable part is pod + governance, not summarising.

### #2 — The agent-operator's memory ⭐ the defensible one
**Person:** developer or power user running Claude Code / Cursor / cron agents daily.
**Job:** durable, structured, *reviewable* memory across sessions.
**Today:** `CLAUDE.md` and markdown memory files; or a vault + MCP. **Measured demand:** Claudian 2,024,317 · Copilot 1,826,521 · Local REST API with MCP 711,013 · ~51 MCP-named plugins · Anytype shipping Local API + MCP + an agents skill.
**Data in:** agent-captured lessons, decisions, task state, run receipts.
**Structure:** knowledge · decision · task · session — **Synap already ships these.**
**The rigidity:** agents write markdown into a filesystem with no identity, no relations, and a gate that is a modal in whichever client happened to be attended (§6.4). Five agents and a cron job break that model completely.
**Why Synap:** §6.4 — server-side, durable, agent-agnostic proposals.
**Honest risk:** ⚠️ per §6.3, **nobody is complaining about this yet.** Small, opinionated, low-willingness-to-pay audience. This is a *wedge and a proof of the thesis*, not a market — and the thesis is ahead of demonstrated demand.

### #3 — Import-then-propose-structure ⭐ the on-ramp
**Person:** long-time Notion/Evernote/Apple Notes/Obsidian user with five years and thousands of items in no coherent model.
**Job:** get it in one place, deduplicated, and *retroactively* typed.
**Today:** **Obsidian Importer, 1,634,632 downloads** — migration is a top-20 job. Then Tag Wrangler (1,079,336) + Linter (1,043,725) to clean up by hand.
**The rigidity:** every tool makes you define structure *before* the data arrives, then offers regex-grade tools to fix the mismatch afterwards. **2.1M downloads of schema-repair plugins is the measured cost of that ordering.**
**Why Synap:** it inverts the setup cost — the single biggest churn driver (§4.1 #1). Import first; be *shown* proposed kinds derived from what is actually there; approve. It makes the proposal flow the **onboarding** rather than an advanced feature, and it exercises identity resolution on real duplicates, which is what "no duplication" means to a user (§5.4b).
**Honest risk:** import fidelity is brutal and unglamorous; a bad import loses the user permanently on day one.

### #4 — Reading pipeline as a typed destination
**Person:** researcher, analyst, PhD, serious non-fiction reader.
**Today:** Readwise Full ($9.99/mo) + Obsidian + Zotero. **Measured:** PDF++ 768,281 · Annotator 595,201 · Zotero 550,233 · Readwise 242,697 · Kindle 165,814 · Omnivore 133,168 (dead).
**The rigidity — and it is narrow:** highlights land as *text in files*. The **author** and the **concept** are strings, not entities shared with the rest of the graph. You cannot ask "everything I've read by people I've met."
**Why Synap:** a typed author/concept graph, plus sovereignty-as-continuity (Omnivore, §5.2).
⚠️ **Honest:** Readwise owns the pipe and is excellent. **Do not build a Readwise clone.** The play is to be the **typed destination Readwise already exports into at its $9.99 tier** — competing with Obsidian for the landing zone, not with Readwise for the source. And note that books/reading is exactly the column Obsidian *does* serve well (§2.1), so this is a narrower win than it looks.

### #5 — The relationship graph, only if it fills itself
**Person:** founder raising, BD lead, community builder.
**Job:** who do I know, who introduced us, what did I promise.
**Structure:** person · company · interaction · commitment · intro (a person↔person edge with provenance). Kind+facet is genuinely right: a person is not a "contact"; they wear an investor hat in one lens, a friend hat in another.
**The rigidity:** real CRMs are built for a team pipeline and are absurd for one person; notes tools cannot reach the inbox.
⚠️ **Ranked #5 deliberately, against instinct.** §1: four CRM plugins, 3,063 downloads, against 11,989,596 for tasks — while contact **importers** outdraw CRMs 15:1. **A personal CRM you maintain has been tried at scale by this exact audience and they stopped.** If Synap ships this, **the auto-population IS the product** and the pitch is *"it fills itself from your inbox."* A demo that shows defining a Person kind is demoing the part that already failed.

### #6 — Life admin / household record
**Person:** an adult with a house, a car, insurance, kids, warranty PDFs across six inboxes.
**Structure:** asset · document · vendor · renewal date. **Few kinds, all obvious, none the user wants to design.**
**The rigidity:** this data is *only* in email and PDFs. No PKM tool touches it — these people don't use PKM tools.
**Why Synap:** the one family where "self-hosted, encrypted, mine" is a *lay* argument, not an ideological one; and expiry dates give a natural resurfacing loop (§5.3) attached to real consequences.
**Honest risk:** consumer distribution and support expectations; Anytype's unrecoverable key shows how badly sovereign consumer products fail on recovery. A strong second market and a good story — not first.

---

### ⛔ Explicitly declined — where Obsidian/Notion/Readwise already win

Naming these is the useful half of the exercise.

- **Media logs, habits, journals, reading lists, recipes, games.** Measured: Media DB 71,157 · habits 345,724 total · movies/games 293,494 total — an order of magnitude below tasks. **These are the column Obsidian owns natively** (§2.1): cheap with Dataview + a template, now cheaper with Bases (whose *one* official example is a Books base), not sensitive, no integration lane to own, and the users are hobbyists who **enjoy the tinkering** — the population least likely to pay to have it removed.
- **Task and project management.** 11,989,596 downloads says the demand is real and says it is *served*. Obsidian Tasks + Kanban + TaskNotes, or any real task app. Synap should hold tasks as *entities other things link to*, not compete as a task manager.
- **Writing and thinking in linked prose.** Obsidian. Files, plain text, no server, 7,357 plugins. Do not fight this.
- **A team wanting one shared workspace tomorrow.** Notion — distribution, templates, collaboration, and now agents that build the schema for you.
- **Visual thinking.** Excalidraw at 7,767,195 is the single most-installed thing in PKM.
- **Highlight retention.** Readwise. Be its destination.

### If I had to pick two

**#3 (import → propose structure) as the on-ramp** — it converts the biggest churn driver into Synap's opening move, and 1.63M Importer downloads say the job is already being done.
**#1 (multi-tool operator) as the market** — it is the only family where the outside-world entity column (§2.1) is the entire value, which is the one thing no competitor can reach.

**#2 (agent memory) is the thesis proof and the founder's own use** — keep it, dogfood it, but per §6.3 do not mistake it for validated demand.

---

# 9. Gaps — read before quoting anything

1. ⛔ **Reddit unreachable.** No abandonment frequency data. §4 is mechanism, not measurement. **Highest-value follow-up; needs a human with a browser.**
2. ⛔ **Notion template marketplace best-sellers: NOT RETRIEVED.** So §1–2's frequency data is **Obsidian-only**, and Obsidian's population skews technical and privacy-minded. ⚠️ **A real bias**: Notion's audience is likelier to build CRMs and client trackers, which could soften the §0 headline. The *mechanism* in §2.1 (filesystem reachability) is Obsidian-specific and does not transfer to Notion unchanged. **This is the most important caveat on my strongest finding, and it should be checked before the finding drives a roadmap.**
3. ⛔ **Readwise retention: NOT FOUND.** No published figure. *"1,724 other readers"* is a testimonial carousel string, not a subscriber count.
4. ⚠️ **Obsidian Bases relations: verified as *not documented*, not as impossible.** Confirm in-product.
5. ⚠️ **Tana split date unverified** (the split itself is verified on primary).
6. ⛔ **Logseq, Capacities, Reflect, Roam, Amplenote, Siyuan, AFFiNE not researched on primary** — deliberate; searches returned SEO affiliate pages I declined to treat as evidence.
7. ⚠️ **Mem pivot unconfirmed** — the brief's premise is not supported by anything I verified.
8. ⚠️ **§6.3 is a null result on a small sample** (108 open issues across two repos). "No governance complaints yet" is weak evidence, honestly labelled.

---

# Sources

**Primary (fetched and read directly):**
[Obsidian community plugin stats](https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json) ·
[Obsidian community plugins](https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json) ·
[Obsidian Bases help](https://obsidian.md/help/bases) ·
[Obsidian Bases views](https://obsidian.md/help/bases/views) ·
[Obsidian changelog](https://obsidian.md/changelog/) ·
[Dataview query structure](https://blacksmithgu.github.io/obsidian-dataview/queries/structure/) ·
[Dataview examples](https://blacksmithgu.github.io/obsidian-dataview/resources/examples/) ·
[Claudian README](https://github.com/YishenTu/claudian) ·
[Obsidian Copilot README](https://github.com/logancyang/obsidian-copilot) ·
[Copilot agent mode & tools doc](https://github.com/logancyang/obsidian-copilot/blob/master/docs/agent-mode-and-tools.md) ·
Copilot + Claudian open issue trackers (GitHub API, 2026-09-07) ·
[Tana](https://tana.inc/) · [Tana Outliner](https://outliner.tana.inc/) ·
[Anytype](https://anytype.io/) · [Anytype full docs](https://doc.anytype.io/anytype/llms-full.txt) · [Anytype self-hosting](https://doc.anytype.io/anytype/data/sync-and-backup/self-host.md) ·
[Notion AI autofill](https://www.notion.com/help/autofill) · [Notion Custom Agents](https://www.notion.com/help/custom-agents) · [Notion Custom Agents security](https://www.notion.com/help/custom-agents-security-features) ·
[The Collector's Fallacy](https://zettelkasten.de/posts/collectors-fallacy/) ·
[Readwise](https://readwise.io/) · [Readwise pricing](https://readwise.io/pricing)

**Secondary (REPORTED — opinion unless it carries its own numbers):**
[Omnivore exit post-mortem](https://www.creativerly.com/the-exit-us-of-omnivore-from-open-source-to-ai-vc-money/) ·
[Omnivore is Dead](https://molodtsov.me/2024/10/omnivore-is-dead-where-to-go-next/) ·
[RIP Omnivore (MacPowerUsers)](https://talk.macpowerusers.com/t/rip-omnivore-omnivore-to-shut-down-on-15-november/38868) ·
[Anytype forum: friction of creating new Object Types](https://community.anytype.io/t/how-do-you-handle-the-friction-of-creating-new-object-types-anytype-vs-tana-workflow/30476) ·
[Obsidian forum: Bases for project tracking](https://forum.obsidian.md/t/a-bases-template-for-project-tracking-or-task-management/104249) ·
[Obsidian forum: Bases to record data (habits, exercise)](https://forum.obsidian.md/t/using-bases-to-record-data-habit-tracking-exercise-log-etc/108974) ·
[I Ditched Notion for Apple Notes](https://bloomthedigitallens.substack.com/p/i-ditched-notion-for-apple-notes) ·
[The Trap of PKMs](https://josiahalenbrown.substack.com/p/the-trap-of-pkms) ·
[Why I use Apple Notes](https://cote.io/2025/01/10/why-i-use-apple-notes.html) ·
[The PKM Reboot: Stop Over-Automating](https://medium.com/pen-with-paper/the-pkm-reboot-stop-over-automating-your-notes-ef8a439e56db) ·
[Notion 3.0 agents](https://alternativeto.net/news/2025/9/notion-3-0-introduces-new-ai-agents-to-automate-nearly-all-tasks-a-human-can-do-in-the-app)
