# Project members — prior art, options, decisions

**Status: COMPLETE.** Read-only investigation; no source file was edited, no git state changed.
Read-only investigation. No source file was edited.

## 0. Spot-checks of the prior census

| Claim | Verdict |
|---|---|
| `project_members` table exists with `(project_id → projects ON DELETE CASCADE, user_id, role default 'viewer', invited_by, invited_at)`, UNIQUE `(project_id,user_id)`, 3 indexes | **CONFIRMED** — `synap-backend/packages/database/src/schema/project-members.ts:22-62`, read verbatim |
| `ProjectMemberRepository.remove()` / `.updateRole()` have zero callers | **CONFIRMED** — `rg "ProjectMemberRepository"` across `synap-backend` returns 7 hits: the class itself, 1 real construction (`packages/api/src/routers/relations.ts:847`, the grant path), 2 test mocks/tripwires, 1 import, and a comment in `packages/governance-policy/src/index.ts:347` that *already names the gap* |

## 1. The three open questions — ANSWERED

### Q1. Do `verifyPermission`'s call sites cover project-content writes, or do writes reach a different gate?

**Neither. The project half of the write gate is DEAD CODE — it is not reachable from any live call site.**

`verifyPermission` (`synap-backend/packages/database/src/utils/permissions.ts:160-270`) has three levels:
- **Level 1** — workspace membership, `ALWAYS REQUIRED`, returns `"User is not a member of this workspace"`.
- **Level 2** — project-first logic, reached **only when the caller passes `project: { ids: [...] }`**. It is genuinely well-formed: project role takes precedence over workspace role, and a workspace `owner` bypasses project membership.
- **Level 3** — workspace-role-only.

**Nothing passes `project.ids`.** Verified: `rg -A12 "await verifyPermission\(\{"` across `synap-backend` (excluding tests) — the *only* line matching `project` in any call's argument object is `permissions.ts:288` itself, inside the convenience wrapper `canEdit(db, workspaceId, userId, projectIds?)`. And **`canEdit` has zero callers** across all five repos (`synap-backend`, `synap-app`, `browser`, `synap-cli`, `synap-intelligence-service`) — the only textual hits are its own definition and an unrelated local `canEdit()` inside the whiteboard canvas.

So the accurate statement is stronger than the census's: **the write path never consults `project_members` at all.** The other two write gates confirm it:
- `checkPermissionOrPropose` (`packages/api/src/utils/permission-check.ts:1004`) calls `verifyPermission` with `workspace` only.
- `assertWorkspaceWrite` (`packages/api/src/utils/workspace-write-access.ts`), the editor+ floor for row mutations, calls `getWorkspaceMembership` directly — project membership is not in its vocabulary.
- `automation-governance.ts:187` (the agent/automation write path) — `workspace` only.

**Why this matters for the recommendation:** this is *not* an inconsistency that is also incompletely applied. It is a **clean, uniform** state: writes are 100% workspace-gated, reads have a project/exposure floor. That is a coherent read-only-portal shape — it is just one nobody chose deliberately and nothing documents. Finishing it is cheaper than the census implied, because there is no half-applied project write logic to reconcile: there is unreachable code to either **wire** or **delete**.

`ADMIN_ACTIONS_RESERVED` in `packages/governance-policy/src/index.ts:347-350` already names the revoke gap in a comment, verbatim: *"`ProjectMemberRepository` has `.remove()` and `.update()`, but NO gate call site passes `subjectType: "projectMember"` with either action today — so these cannot be typed and are reserved, inheriting the floor the day such a door ships."* **The governance floor for revoke is pre-wired and waiting for a door.** That is a build already half-done.

### Q3. Can any door mint a `visible_to` edge for an external person, end to end?

**No. Both anchor doors are severed at the client boundary.**

`relations.exposeToAnchor` (`packages/api/src/routers/relations.ts:641-760`) is well-built: loads both rows, `assertWorkspaceWrite` on the exposed entity, `assertAnchorAdmin` on the anchor, then `checkPermissionOrPropose({subjectType:"relation", action:"create"})`, and `relations.create` explicitly **rejects** `visible_to` so this is the sole writer. `relations.grantAnchorMembership` is at `relations.ts:763+`.

But: `rg "exposeToAnchor|grantAnchorMembership|projectMember"` across `browser`, `synap-app`, `synap-cli`, `synap-intelligence-service`, and `synap-control-plane-dashboard` returns **zero call sites** — the only hits anywhere are inside the backend itself and one team-docs page. No UI, no CLI verb, no MCP tool, no Hub REST door.

**So the client-portal substrate is complete on the server and has no consumer.** Nobody can be made an anchor member, and no row can be exposed, other than by calling tRPC by hand.

### Q2. Is the read-side widening documented anywhere a user or admin can see?

**No user- or admin-facing documentation. One team-internal page exists:** `synap-app/synap-team-docs/content/team/platform/project-centric-scope.mdx`. It documents the phases, records that the FK moved `projects → entities → projects` (0134 then 0151), and — notably — states the lens is **still not wired**: *"the project-LENS narrowing (read `X-Project-Id` → `ctx.projectLens` → `accessScopeWhere` projectLens) is NOT wired yet — the chip selects but does not narrow until this lands."* It also records a 5-agent security review (2026-06-19) that structurally proved *"lens only narrows, never widens"*.

An access rule with no user-visible surface, no admin surface, and no way to enumerate who has it, is unauditable. **NEEDS-DOGFOOD:** whether any browser surface lists project members at all (no `projectMember` string exists in `browser/`, so almost certainly not).

### Q3b. Is the project-scoped federated invite reachable? — YES, and it is bigger than the census found

`activateFederatedMember` (`packages/database/src/services/user-provisioning.ts:444+`) is called from a **live router**: `synap-backend/apps/api/src/routers/federation.ts:1689`. When `scopeKind` is not workspace, it inserts straight into `projectMembers` (escalation-only: a re-invite upgrades a role, never downgrades).

And the **Control Plane side is built too**:
- `synap-control-plane-api/src/db/schema/invitations.ts:208-210` — a CHECK constraint that explicitly enumerates `scopeKind = 'project' and project_id is not null` as a first-class invite shape, alongside `pod` and `workspace`.
- `synap-control-plane-api/src/lib/pod-project-directory.ts:194,233` — a directory that emits `grant: { scopeKind: "project", role }`.
- `synap-control-plane-api/src/lib/pod-access-ledger.ts` — a ledger carrying project-scoped assertions.

**Consequence — this is the finding that should drive the decision.** There are **TWO writers of `project_members` with different semantics**, and only one is governed:

| Writer | Gate | Governance |
|---|---|---|
| `relations.grantAnchorMembership` (tRPC) | `assertAnchorAdmin` + `checkPermissionOrPropose({subjectType:"projectMember"})` | governed, proposable — **and has zero clients** |
| `activateFederatedMember` (CP federated invite) | issuer-signed command + idempotency + escalation-only | **bypasses `checkPermissionOrPropose` entirely** — and is reachable |

So the door that nobody can reach is the governed one; the door that is wired end-to-end across two repos is the ungoverned one. **The member-of-P-not-W situation is not hypothetical: the Control Plane can already mint one.**

---

## 2. Prior art

All fetched from current vendor docs in Sept 2026, not recalled. Sources listed at the end.

### Linear — the closest analogue, and the one that changes the recommendation

**What they do.** Access lives on the **team**. Projects can span multiple teams. Linear *does* have project members — and membership deliberately **does not widen visibility**. The load-bearing statement, from an integrator's permissions writeup: *"A user can be a Project Member and still not see every Issue in the Project if they cannot access the Issue's Team (Issues remain Team-scoped)."* Linear's own private-teams doc says the same from the other side: *"Those who are not a member of the private team will not be able to see issues associated with the team"* — even when a project spans both a public and a private team, and even for people with access to the public one. External people get a distinct **Guest** role, and guests are added *to teams*, not to projects: *"Guests will only see issues belonging to the teams they're part of"* even when the project itself is visible to them.

**Why.** One access boundary, one place to audit. A project is a cross-cutting organizing object; making it a second grant source would mean every visibility question has two answers that must agree.

**What it cost them.** Real expressiveness. There is no way to say "this contractor sees only this project inside this team" — the contractor gets the whole team. Linear accepted a coarser grant rather than a second permission system, and their role model stays deliberately small (Admin / Member / Guest, no custom roles).

**What it means for Synap.** This is the direct precedent for the member-of-P-not-W question, from the product Synap's projects most resemble, and **it answers it the opposite way to Synap's current read floor.** `exposureMemberWhere` ORs project membership into the floor so that *"an anchor member sees that anchor's exposed data even in workspaces they are not a member of."* Linear had the same option and refused it. That is not proof Synap is wrong — Synap has a client-portal ambition Linear does not — but it means the widening must be a *chosen, named* product feature, not a floor branch nobody documented.

### GitHub — the client-portal analogue done as a separate principal

**What they do.** Org → team → repo, plus **outside collaborators**: *"a person who is not a member of your organization, but has access to one or more of your organization's repositories."* Access is repo-level only; they cannot see org-level resources; and critically: *"Outside collaborators cannot be added to a team, team membership is restricted to members of the organization."*

**Why.** The external person is a **different kind of principal**, not a member with a narrow scope. That makes "who is external?" a single query, and makes it impossible for an external grant to accidentally compose with an internal one.

**What it cost them.** Bookkeeping: forks need separate grants, 2FA policy has to be enforced on a second population, seats are consumed, and Enterprise had to add a switch to forbid outside collaborators entirely.

**What it means for Synap.** `project_members.user_id` is a plain `text` user id — **Synap has no guest/external principal type at all.** A CP-issued project-scoped invite produces a row indistinguishable from an internal one. GitHub's model says the type distinction is the thing that makes the portal auditable, and it is the piece Synap is missing, not the table.

### Notion — the cascade, and why teamspaces were retrofitted

**What they do.** Permissions cascade workspace → teamspace → page, with five page-level permission levels, and **"highest permission wins"** when a user reaches content by more than one path. Teamspaces arrived in Notion 2.18 (Aug 2022) — *after* page-level sharing — to give content "a consistent working group" home and per-space privacy/roles, plus per-space admin control over web publishing, export, and guest invitations.

**Why teamspaces came later.** Page-level sharing alone produced content with no container and no consistent owner; teamspaces exist to give scattered per-page grants a boundary that can be administered and audited as a unit.

**What it cost them.** "Highest permission wins" over a cascade is the most complex model in this survey, and it is the one users most often get wrong — you cannot tell from a page who can see it without walking every inherited path.

**What it means for Synap.** ⚠️ **Synap's `visible_to` edge is per-item sharing, and ORing `exposureMemberWhere` into the access floor *is* "highest permission wins."** Synap is at the exact starting point Notion had to retrofit a container onto. The mitigating difference is real and worth stating: Synap's exposure is a **whitelist of two relation types** (`EXPOSURE_RELATION_TYPES`) with a type-level guard, not arbitrary per-item ACLs — so it cannot sprawl the way Notion's did. Keep that whitelist narrow; it is the thing standing between Synap and Notion's problem.

### Slack — external collaboration as a channel-scoped, separately-typed thing

**What they do.** Two distinct mechanisms. **Single-channel guests** are internal-facing, added by an admin, and *cannot browse other channels or see members outside their channel*. **Slack Connect** is for external organizations, works on shared channels, and explicitly **does not work with guest accounts** — *"guest accounts are internal-only and cannot be shared externally."*

**Why.** Slack refused to model "external person" as a narrowly-scoped member. Guest and external are different types with different rules.

**What it means for Synap.** The same message as GitHub, from a second vendor: the container (channel/repo) is the grant unit, and the external principal is a separate type. Synap has neither the type nor a container-level revoke.

### Jira / Asana — the documented cost of project-level permission schemes

**What they do.** Jira attaches a **permission scheme** to each project, mapping permissions to **project roles**.

**Why it is instructive.** Atlassian's own guidance and the practitioner literature converge on: **reuse a small number of schemes; one scheme per project is an anti-pattern.** At scale it creates real performance cost and an unauditable surface. The recommended shape is a small fixed role vocabulary (Project Admin, Developer, Tester, Reporter, Read-Only) reused across projects, with users assigned roles *per project* rather than new schemes minted per project.

**What it means for Synap.** Synap is already correct here by accident: `project_members.role` is a fixed 4-value vocabulary reused across all projects, with no per-project scheme object. **Do not add per-project permission configuration.** The role column is enough, and prior art says the moment it becomes a configurable scheme, the cost curve turns.

### Google Drive — the container beats per-item sharing on lifecycle

**What they do.** Shared drives are owned by the team, not a person: *"anything added to a shared drive stays there no matter who comes or goes"*, and when an account is deleted, files created in a shared drive remain. Membership is at the **drive** level and grants access to everything in it by role. My Drive per-item sharing ties every file to an individual owner — when that person leaves, the shared files are lost.

**What it means for Synap.** The argument for `project_members` as a container membership is the strongest one in this survey: it survives the departure of whoever did the sharing. `visible_to` per-item edges do not have that property on their own. If Synap keeps the exposure edge, the *membership* should be what grants durable access and the edge should be what scopes it — which is how `project-scope.ts` is already shaped.

### The paths prior art says are WRONG

1. **Two permission systems that must agree.** Every product surveyed collapsed to one boundary (team / repo / teamspace / channel / drive) rather than maintaining two. **Synap already has two** — a workspace write gate and a workspace-or-project read floor — and they currently disagree. Prior art is unanimous that this is the thing to remove, not to grow.
2. **Cascading per-item permissions with "highest permission wins."** Notion's model, and the one nobody copies. Synap's floor `OR` is this semantics; its saving grace is the two-type relation whitelist. **Never widen `EXPOSURE_RELATION_TYPES` casually — that whitelist is the guardrail.**
3. **Modelling the external person as a narrowly-scoped internal member.** GitHub, Slack, and Linear all refused this and use a separate principal type. Synap currently does exactly the refused thing: a CP project-scoped invite writes an ordinary `project_members` row with an ordinary user id.
4. **Per-project permission configuration.** Jira's documented anti-pattern. Keep the fixed role vocabulary.
5. **Granting write through the secondary axis.** Nothing surveyed lets a cross-cutting label confer write access that the container denies. `verifyPermission` Level 2 does exactly that (project role *takes precedence*, including over a workspace `viewer`) — and it is unreachable dead code. **Prior art says do not wire it.**

---

## 3. Options

Three real options. They differ on **one question**: does project membership widen access beyond the workspace, or not?

### Option A — "Linear's answer": project membership never widens

Make the workspace the single access boundary, on both sides.

- Remove `exposureMemberWhere`'s membership branch from the read floor, **or** AND it with workspace membership so a project member sees project data only in workspaces they already belong to.
- **Delete** `verifyPermission` Level 2 and `canEdit` (both already unreachable — this is deletion, not change).
- `project_members` survives as a **lens/organizational** construct and as CP's directory anchor.
- `visible_to` becomes narrowing-only or is parked.

**Already built:** everything. This is subtraction plus one predicate change.
**Cost:** kills the client portal as currently designed. Any external-collaborator story restarts from a different shape (a guest principal type).
**Forecloses:** nothing permanently — re-adding one OR branch to the floor is a small change. **This asymmetry is the argument for A as a holding position.**
**Risk:** if the CP has already provisioned project-scoped members who are not workspace members, this *revokes live access*. Measure first (§5, query 2).

### Option B — "Expose and finish what exists": a governed, auditable read-only portal

Keep the widening floor, but make it a named product feature with the missing halves built.

- **Decide and document that writes stay workspace-gated forever** → delete Level 2 / `canEdit` (same deletion as A).
- **Ship revoke + role-change.** `ProjectMemberRepository.remove()`/`.updateRole()` already exist, and `ADMIN_ACTIONS_RESERVED` already reserves `projectMember.remove` / `projectMember.updateRole` so they inherit the destructive floor the day a door ships. This is ~a router procedure each.
- **Give the two anchor doors a client.** `grantAnchorMembership` and `exposeToAnchor` are complete, gated, and have zero callers in every repo.
- **Bring the CP invite path under the same gate.** `activateFederatedMember` writes `project_members` without `checkPermissionOrPropose`. Either route it through the governed door or make the divergence explicit and reviewed.
- **Add an admin surface** that lists, per project, who has access and via which edge — the audit view that does not exist today.
- **Add an external/guest principal marker** (prior art item 3) so a portal member is distinguishable from a colleague.

**Already built:** the table, the floor, the exposure whitelist, both governed doors, the repository methods, the governance reservations, the CP invitation schema + directory + ledger. **The build is the last mile, not the substrate.**
**Cost:** you are choosing to run "two permission systems that must agree" — the thing every product surveyed avoided. That is survivable only if the asymmetry is *deliberate and stated*: **project membership grants READ ONLY, never write.** Write that as a tripwire, not a comment.
**Forecloses:** the simple mental model. Every future access question gains a second branch.

### Option C — Wire Level 2: project membership grants writes too

Pass `project.ids` at the write gates so a project `editor` can write project content in a workspace where they are a `viewer` or a non-member.

**Already built:** the logic, fully written and tested-shaped, at `permissions.ts:190-240`.
**Cost:** this is prior-art anti-pattern #5, and it also breaks `assertWorkspaceWrite`, which has no project vocabulary — you would be adding a third gate that must agree with the other two.
**Recommendation: do not do this.** It is listed because the code exists and someone will find it and assume it was intended.

### Recommendation

**Option B if the client portal is a real near-term product; Option A otherwise — and A does not foreclose B.**

The census framing was "an inconsistency in two systems that will drift." The stronger reading after this investigation is: **the read-only portal is ~80% built across three repos, and what is missing is not capability but *accountability*** — revoke, an audit surface, a guest type, and one governed write door instead of two ungoverned-and-unreachable ones. That is a consolidation, which is the outcome you prefer, and prior art supports the *shape* (container membership, fixed roles, narrow exposure whitelist) even while warning about the *cost* (two systems).

Both options share a hard prerequisite and two shared deletions, so **start with the intersection regardless of which you pick**:
1. Run §5 query 2 — does any member-of-P-not-W actually exist on the live pod?
2. Delete `canEdit` + `verifyPermission` Level 2 (unreachable in both options; Option C is the only thing that wants them, and it is rejected).
3. Ship `projectMember.remove` — access that cannot be withdrawn is a defect under every option, and its governance floor is already reserved.

---

## 4. Decisions for the user

### D1 — Does project membership widen access beyond the workspace? (the member-of-P-not-W question)

The code answers this two ways today: the read floor says **yes** (`exposureMemberWhere`: *"an anchor member sees that anchor's exposed data even in workspaces they are not a member of"*), the write path says **not applicable** (it never consults `project_members`).

- **Answer "no" (Linear's answer, Option A):** one boundary, simplest audit. Costs the client portal's current shape and may revoke live CP-provisioned access.
- **Answer "yes, read-only" (Option B):** keeps the portal. Costs a permanently two-system model that must be defended by a tripwire, not a comment.
- **Answer "yes, read and write" (Option C):** rejected by all six prior-art products.

**This is the only decision that must be made first** — D2–D4 all depend on it.

### D2 — Is `projectMember.add` AI-proposable or human-only?

Today it is **proposable**: `grantAnchorMembership` routes through `checkPermissionOrPropose({subjectType:"projectMember", action:"create"})`, so an agent can file it and a human approves. That is consistent with the platform model.

But note the governance shape: `projectMember.remove` / `.updateRole` are in `ADMIN_ACTIONS_RESERVED`, meaning that **the day a revoke door ships it inherits the ADMIN/DESTRUCTIVE floor and can never be auto-approved** — while `create` today is not reserved. **Granting access is easier than withdrawing it.** That asymmetry is defensible (revocation is destructive) but should be a stated choice. If access grants are the sensitive direction for a client portal, `projectMember.create` should be floored too.

### D3 — Revoke: its own door, or a general anchor-membership door with cross-door parity?

The census's parity finding holds: `grantAnchorMembership` is **tRPC-only** — no Hub REST, no MCP tool, no CLI verb, no UI. Shipping revoke as a fourth lonely tRPC procedure repeats the pattern.

- **Its own door:** fastest; the floor is pre-reserved; unblocks the "cannot withdraw access" defect immediately.
- **General `anchorMembership.{grant,updateRole,revoke}` with parity across tRPC / Hub REST / MCP / CLI:** the consolidation. It also gives you the natural place to fold in `activateFederatedMember`'s ungoverned write, which is the real parity break — two writers, one governed and unreachable, one ungoverned and live.

**Recommendation: the general door**, specifically so the CP invite path can be brought under it. But ship revoke first if that would delay it.

### D4 — What does a zero-member project mean, and what happens to today's projects?

Unresolved in code. `project_members` has no owner-backfill: creating a project does not appear to insert a member row. So today's projects most likely have **zero rows**, and the owner's access comes entirely from workspace membership.

Two coherent answers:
- **Zero members = "workspace-visible" (implicit).** Membership is purely *additive* — it only ever grants extra people access. Nothing changes for existing projects; no backfill. Matches how the floor is written (an OR branch).
- **Zero members = "nobody but workspace admins" (explicit).** Requires backfilling an owner row for every existing project, and makes membership *restrictive* as well as additive — a second, narrowing meaning. Google Drive's shared-drive model, but a much bigger change.

**Recommendation: additive-only**, and say so in the schema comment. The restrictive reading is what turns membership into Notion's cascade. Confirm with §5 query 5 before deciding.

### D5 (not asked, but forced by the findings) — Is an external/portal member a distinct principal type?

Prior art from GitHub, Slack, and Linear all say yes, unanimously. Synap has no such type: a CP project-scoped invite writes a `project_members` row indistinguishable from a colleague's. If the portal is real (Option B), this is the piece to add — and it is cheap now (a column or a role value) and expensive after the table has production rows.

---

## 5. What to measure on the live pod

⚠️ **Not run** — the pod MCP servers were unreachable this session (`ENOTFOUND pod.antoinesrvt.synap.live` / `pod.thearch.synap.live`). Specified for later.

**Q2 is the one that de-risks the whole decision.** If it returns 0, the read/write contradiction has never fired in production, and D1 can be answered either way without revoking anyone's live access.

```sql
-- 1. Is the table populated at all?
SELECT count(*) AS rows,
       count(DISTINCT project_id) AS projects,
       count(DISTINCT user_id) AS users
FROM project_members;

-- 2. ⭐ THE DECIDING QUERY — members of a project who are NOT members of that
--    project's workspace. These are the only users the read-side widening
--    actually affects, and the only ones Option A would revoke.
SELECT pm.project_id, pm.user_id, pm.role, pm.invited_by, pm.invited_at,
       p.workspace_id
FROM project_members pm
JOIN projects p ON p.id = pm.project_id
LEFT JOIN workspace_members wm
       ON wm.workspace_id = p.workspace_id AND wm.user_id = pm.user_id
WHERE wm.user_id IS NULL;

-- 3. Has the generic exposure edge ever been minted? (expected: 0 — no client
--    calls `exposeToAnchor` in any repo)
SELECT count(*) FROM relations WHERE type = 'visible_to';

-- 4. Is the project axis carrying real data?
SELECT count(*) FROM relations WHERE type = 'belongs_to_project';

-- 5. D4: projects with zero member rows (expected: nearly all)
SELECT count(*) FROM projects p
LEFT JOIN project_members pm ON pm.project_id = p.id
WHERE pm.id IS NULL;

-- 6. Is anything other than the DEFAULT role in use? A table of only 'viewer'
--    means the role column has never been exercised.
SELECT role, count(*) FROM project_members GROUP BY role;

-- 7. Which writer produced these rows? `invited_by` is set by the governed
--    tRPC door; the CP federated path's provenance is in federated_access_receipts.
SELECT invited_by IS NULL AS anonymous, count(*)
FROM project_members GROUP BY 1;

SELECT scope_kind, count(*) FROM federated_access_receipts GROUP BY scope_kind;
--    ^ a non-zero 'project' count = the ungoverned CP writer is live.

-- 8. Has the governed grant door ever been exercised?
SELECT count(*) FROM proposals WHERE subject_type = 'projectMember';
```

**Also NEEDS-DOGFOOD (not answerable by query):**
- Does any browser surface show project members? (`rg projectMember browser/` → 0 hits, so almost certainly not — but `git grep` misses untracked files in `browser/`, and this used `rg`.)
- Does the CP admin UI actually offer a project-scoped invite, or only pod/workspace? The schema and directory support it; whether the UI exposes it is unverified.

---

## Appendix — file references

| What | Where |
|---|---|
| Table | `synap-backend/packages/database/src/schema/project-members.ts:22-62` |
| Read floor (exposure axis) | `synap-backend/packages/api/src/utils/project-scope.ts` — `EXPOSURE_RELATION_TYPES`, `userAnchorIdsSubquery`, `exposureMemberWhere`, `accessScopeWhere` |
| Write gate (workspace-only) | `synap-backend/packages/database/src/utils/permissions.ts:160-270` (Level 2 unreachable); `packages/api/src/utils/workspace-write-access.ts`; `packages/api/src/utils/permission-check.ts:1004`; `packages/jobs/src/utils/automation-governance.ts:187` |
| Dead wrapper (only `project.ids` producer, 0 callers) | `packages/database/src/utils/permissions.ts:278-293` — `canEdit` |
| Governed doors (0 clients) | `packages/api/src/routers/relations.ts:641` `exposeToAnchor`; `:763` `grantAnchorMembership` |
| Repository (remove/updateRole, 0 callers) | `packages/database/src/repositories/project-member-repository.ts:30` |
| Governance reservations | `packages/governance-policy/src/index.ts:347-350` |
| Ungoverned live writer | `packages/database/src/services/user-provisioning.ts:444+` ← `apps/api/src/routers/federation.ts:1689` |
| CP side | `synap-control-plane-api/src/db/schema/invitations.ts:208-210`; `src/lib/pod-project-directory.ts:194,233`; `src/lib/pod-access-ledger.ts` |
| Only documentation | `synap-app/synap-team-docs/content/team/platform/project-centric-scope.mdx` (team-internal) |

## Sources (prior art, fetched Sept 2026)

- [Linear — Members and roles](https://linear.app/docs/members-roles)
- [Linear — Private teams](https://linear.app/docs/private-teams)
- [Linear — Projects](https://linear.app/docs/projects)
- [Merge — Linear integration nuances (permissions)](https://help.merge.dev/articles/6120922305-linear-integration-nuances-permissions)
- [GitHub — Adding outside collaborators to repositories](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization)
- [WorkOS — Multi-tenant permissions done right: Slack, Notion, Linear](https://workos.com/blog/multi-tenant-permissions-slack-notion-linear)
- [Notion 2.18 release — teamspaces](https://www.notion.com/releases/2022-08-29)
- [Notion — Teamspaces give every team a home](https://www.notion.com/help/guides/teamspaces-give-teams-home-for-important-work)
- [Slack — Guests vs channels in Slack Connect](https://slack.com/resources/slack-for-admins/guests-vs-channels-in-slack-connect)
- [Slack — Understand guest roles](https://slack.com/help/articles/202518103-Understand-guest-roles-in-Slack)
- [Atlassian — Jira permissions general overview](https://support.atlassian.com/jira/kb/jira-permissions-general-overview/)
- [The Jira Guy — Project permissions done right](https://thejiraguy.com/2020/11/25/project-permissions-done-right/)
- [Google Workspace — What are shared drives?](https://support.google.com/a/users/answer/7212025?hl=en)

**Status: COMPLETE.**
