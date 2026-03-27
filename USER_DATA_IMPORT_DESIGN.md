# User Data Import & Restructuring — Validated Plan

## Summary

**Scope**: Import is **browser-only** (for v1). The UX lives as an **Import cell/widget** (same pattern as the terminal: usable as a cell for side panel or bento). We **transform** only a few formats into "real data"; everything else is stored on the server. **Structure first without AI** (rules/heuristics); **AI later** for classification and enrichment. Goal: **minimal friction**, beautiful UI, and a clear server pipeline (ingest → store → transform → stats).

---

## 1. Where import lives: Browser + cell/widget

- **Import only in the browser** (for v1): The user selects folders/files from their machine in the browser app. No separate "web app import" flow initially.
- **Import as a cell/widget**: Same pattern as other capabilities (e.g. AI chat, entity detail). The Import experience is a **cell** so it can:
  - Open in the **side panel** (e.g. "Import" from command palette or sidebar).
  - Optionally appear as a **bento widget** (e.g. "Import" block on a dashboard).
- **Terminal as a cell (optional)**: For development, the existing Terminal can be exposed as a **cell** so it's available in the side panel or as a widget, not only as a full view. Same registration pattern as other cells in the browser (if the browser has its own cell host for side panel, we register a `terminal` cell that wraps `TerminalView`).

So: **one place** (browser) and **one UX pattern** (cell/widget) for Import — and optionally for Terminal.

---

## 2. Data transformation priorities (no AI first)

We accept **any** files (folders, zips, drag-and-drop). Server **stores everything** (raw). Then we apply **deterministic transforms** only for:

| Input format | Transform | Output | Notes |
|--------------|-----------|--------|--------|
| **JSON**     | Parse and detect shape | **Channels + messages** (e.g. chat export) or **entities** (e.g. list of items) | If structure looks like `{ messages: [{ role, content }] }` or known chat export → channel + messages. Other JSON can be "stored as document" or later mapped to entities. |
| **Markdown** | Parse (frontmatter + body) | **Entities** (e.g. note profile) + optional **document** for body | One entity per .md file (or per heading/section if we split). Frontmatter → entity properties; body → document content or entity `content` property. |
| **CSV**      | Parse rows + column mapping | **List of entities** | One entity per row. Columns → properties. If **profile doesn't exist**, create it (or update existing profile) so that CSV columns become property defs; minimal friction so imports like "LinkedIn data" work. |
| **Other** (PDF, images, binary, etc.) | None | **Stored on backend** (MinIO + document or blob record) | No analytics or entity creation for v1; just persistence and optional later processing. |

So: **JSON → channels/messages (and possibly entities)**; **Markdown → entities (and optional document)**; **CSV → entities** with profile create/update; **other → store only**.

---

## 3. Server: ingest, store, structure, stats (no AI first)

- **Ingest**: Browser sends files (e.g. multipart or chunked upload, or zip) to an **import** API. Server writes raw bytes to **staging or final storage** (MinIO), and records an **import batch** (batchId, userId, workspaceId, file count, status).
- **Store**: Every file gets a **canonical place**: e.g. `imports/{batchId}/{path}` or `documents/` for transformed items. Raw files kept for re-runs and audit.
- **Structure (no AI)**:
  - **JSON**: Heuristic or schema detection (e.g. OpenAI export, generic `messages[]`) → create channel (type e.g. `EXTERNAL_IMPORT`) + messages. Other JSON can be stored as document or generic "json-import" entity.
  - **Markdown**: Parser (frontmatter + body) → entity (profile e.g. `note`) + optional document; folder path → tags or project.
  - **CSV**: Parser → rows; column → property mapping (user choice or auto: header row = property slugs). Profile: if none matches, **create profile** from CSV headers (or attach to existing and add property defs); then create one entity per row.
- **Stats**: Server can **report per batch**: files received, files transformed (JSON/MD/CSV), channels/messages/entities created, errors. So the UI can show "Imported 12 markdown → 12 entities; 1 JSON → 1 channel with 45 messages; 1 CSV → 30 entities."

**AI later**: Classification (profile suggestion), enrichment (topics, relations), extraction from chat ("save as note") — all additive on top of this.

---

## 4. Flow (end-to-end)

1. **User** opens Import (cell in side panel or widget) in the **browser**.
2. **Browser** shows a clear UI: drag-and-drop or "Select folder/files" (and optionally "Import from zip"). List of selected items with type (JSON, Markdown, CSV, other).
3. **Browser** uploads to server (e.g. `import.submitBatch` or similar) with workspaceId; server returns batchId and optionally jobId for async processing.
4. **Server** stores raw files; runs **transform pipeline** (sync or async job):
   - JSON → channels/messages (and/or entities if shape fits).
   - Markdown → entities (+ optional documents).
   - CSV → entities (profile create/update + entity create per row).
   - Other → store only.
5. **Server** updates batch **stats** (counts, errors); optionally pushes progress via WebSocket or polling.
6. **Browser** shows **result**: "X entities, Y channels, Z messages created; N files stored." Links to open first entity/channel or view list.

---

## 5. Features and capabilities (checklist)

- [ ] **Browser Import cell**: UI component (drag-drop, file/folder picker, zip); shows selection list and type; triggers upload; shows progress and result.
- [ ] **Backend import API**: Accept batch upload (multipart or zip); store raw; return batchId/jobId.
- [ ] **Backend transform pipeline**:
  - [ ] JSON → channel + messages (and optionally entities).
  - [ ] Markdown → entity (+ optional document).
  - [ ] CSV → profile create/update + entities per row.
  - [ ] Other → store only (no analytics).
- [ ] **Backend stats**: Per-batch counts (files, entities, channels, messages, errors).
- [ ] **Idempotency**: Re-import same data (e.g. same path or hash) doesn't duplicate; optional "update if exists" for entities.
- [ ] **Terminal as cell (optional)**: Register terminal in browser as a cell so it can open in side panel or as widget.
- [ ] **AI later**: Profile suggestion, enrichment, "save as note" from chat — out of scope for v1.

---

## 6. What already exists (unchanged)

| Capability | Location | Notes |
|------------|----------|--------|
| Document upload | `documents.upload` | type: text, markdown, code, pdf, docx; content → MinIO + DB |
| File → content | `content.createFromFile` | Staging + entity.create.requested; downstream worker may need completion. |
| Bulk create | Hub-protocol `migration.migrate` | Profiles, entities, views; idempotent. |
| Entity create | `EntityRepository.create` | profileSlug, title, properties, documentId, skipValidation. |
| Channels & messages | `channels` + `messages` | AI_THREAD, EXTERNAL_IMPORT; messages with role, content. |
| Search / embeddings | Typesense, pgvector, entity-embedding job | For created entities/documents. |

---

## 7. Phased implementation order
Now, can you dive on something? I think for the user experience of it all, what I would want to think about is the interaction that we provide for the user. How user would use AI? I have multiple ideas. For me, there is too many things. Where there is, for example, the user is wanting to call a specific AI, for example, an AI that enables him to create content. It is a content AI with specific data about it to be perfect for creating content. Or, he would just use the personal AI or space AI that itself could call the sub-adjunct, the personality of a content creation, for example, based on what the user say. I think we should have both. So, the user that choose all ways personal AI still have the same capabilities, just the personal AI is itself choosing to switch to other personalities based on what they can do. The overall question is also based on our system, where we have the intelligence service and its own personalities, specifically on the intelligence system. Can we enable a user to create its own personality that can work on any intelligence service? So, it makes it look like an override, specific things about the prompting, about maybe the tools it can use and the protocol, etc. And how can it be integrated and used by the intelligence service? What standard or what thing do we need to validate for that flow? And, of course, we also need to think about the right user experience, the right design, etc. for the user to be able to easily reach the specific AI you want, like you would reach a specific user, a specific member of the team that is an expert on that part. What my thinking would have even be to think the system as a full system of channels, where now channels are really strong channels, exactly like Slack or Discord, separated into whatever the user wants, but maybe separated into private message. Maybe we have rightfuls, we can see all the private messages and we think AI to human messages as private messages on the channels with one man and one AI. Of course, AI can still call sub-agents, create threads, etc. And the logic of that is, for example, the user has AI personalities for, like I said, the system creation, the CTO, etc. and he could see on its channel list, the Slack version, possibly with sectioning, with specific ways to separate the capabilities, etc. He can see the new channel with the AI that you want and call it. Do you understand what I'm trying to develop on brainstorm together on how to handle the right way of the user experience for AI? What do you think first of what I just said? And that's brainstorm on what to validate and then we will compare this idea into what we currently have to see what we need to do before production within it.
1. **Import cell + backend ingest**: Browser Import cell (UI only: upload to a new endpoint); backend stores raw files and returns batchId; no transform yet.
2. **Markdown → entities**: Parser (frontmatter + body) → entity (note) + optional document; wire into import job.
3. **JSON → channels/messages**: Detect chat-like JSON → create channel + messages; wire into import job.
4. **CSV → entities**: Parser + column mapping; profile create/update; one entity per row; wire into import job.
5. **Stats + UX**: Per-batch stats; progress and result in Import cell; links to created items.
6. **Terminal as cell (optional)**: Expose terminal in side panel as cell.
7. **AI (later)**: Classification, enrichment, "save as note" from chat.

---

## 8. Technical notes

- **Event flow**: Prefer existing events (e.g. `entity.create.requested` / validated / completed) for import-created entities so audit and side-effects (search, embeddings) stay consistent.
- **Idempotency**: By externalId or (workspaceId, profileSlug, title) or content hash so re-imports don't duplicate.
- **Quotas**: Throttle batch size and rate; run heavy transforms in background job; show progress in UI.
- **Profile for CSV**: If no profile matches, create a workspace profile with property defs derived from CSV headers (slug from header, valueType inferred or default string); user can later rename or merge profiles.

This document is the **validated plan**: browser-only import, cell/widget UX, transform JSON/MD/CSV into real data, structure without AI first, AI later.

---

## 9. Implementation blueprint (code-aligned, reusable, production-ready)

### 9.1 What to reuse (no duplication)

| Need | Reuse | Location |
|------|--------|----------|
| Store raw file | `storage.upload(path, content, options)` | `@synap/storage` |
| Create document | `documents.upload` or direct `db.insert(documents)` + storage | `routers/documents.ts` |
| Create entity | `entities.create` (tRPC) or `EntityRepository.create` | `routers/entities.ts`, `@synap/database` |
| Create channel (chat import) | `chat.createExternalChannel` + bulk message insert | `routers/channels.ts` |
| Create profile (CSV) | `profiles.create` or migration-style | `routers/profiles.ts` or hub-protocol migration |
| Workspace context | `workspaceProcedure` | `trpc.ts` |

**Do not** duplicate upload logic; use existing storage + documents/entities/channels.

### 9.2 Technology choices

- **Upload**: tRPC mutation with **base64** per file (same as `content.createFromFile`). For large batches, split into multiple `submitBatch` calls or add presigned-URL flow later.
- **Limits**: Per-file e.g. 5MB; per-batch e.g. 50 files or 20MB total. Enforce in import router.
- **MIME whitelist**: For transform accept `application/json`, `text/markdown`, `text/csv`, `text/plain`. Other → store only.
- **Filename**: Sanitize path (no `..`), safe charset, max length.
- **Parsers**: **Markdown** — `gray-matter`. **CSV** — `csv-parse/sync`. **JSON** — `JSON.parse` + detect `messages[]` with role/content.

### 9.3 New backend pieces

1. **Import router** — `synap-backend/packages/api/src/routers/import.ts`
   - `submitBatch`: `{ workspaceId, items: { path, contentBase64, mimeType }[] }` → store raw under `imports/{batchId}/{path}`; run transforms; return `{ batchId, stats }`.
   - Use workspaceProcedure; call existing documents.upload, entities.create, chat.createExternalChannel + message insert, profile create for CSV.

2. **Parsers** — `synap-backend/packages/api/src/utils/import-parsers.ts`
   - `parseMarkdown`, `parseCsv`, `detectJsonChatShape`.

3. **Registration**: Register in `index.ts` and add to `root.ts` coreRouter.

4. **Deps**: Add `gray-matter` and `csv-parse` to `@synap/api`.

### 9.4 New browser piece

- **Import cell** — `browser/electron/renderer/src/cells/ImportCell.tsx`: file picker + drag-drop; build items; `trpc.import.submitBatch.mutate`; show stats + links. Register as cell key `import` in side panel; add "Import" to command palette.

### 9.5 Security

- Per-file and per-batch size limits; MIME whitelist; path sanitization; workspace scoping; optional stricter rate limit on submitBatch.

### 9.6 Ready to apply

1. **Backend**: Add import-parsers.ts, routers/import.ts, register router, add deps.
2. **Browser**: Add ImportCell, register cell, add palette entry.
3. **Transforms** in import router: Markdown → entity + doc; JSON chat → channel + messages; CSV → profile + entities; other → store only.
4. Return stats: `filesReceived`, `entitiesCreated`, `documentsCreated`, `channelsCreated`, `messagesCreated`, `errors`.

Single flow, no duplication, production-ready for Markdown, CSV, and JSON import.
