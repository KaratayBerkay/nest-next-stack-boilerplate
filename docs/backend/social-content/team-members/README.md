# Team Members (backend)

**Source:** [`nest-js-boilerplate/src/team-members/`](../../../../nest-js-boilerplate/src/team-members/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

> ⚠ **No discovered frontend or mobile consumer.** This module is real, always-on production code —
> not demo-gated — but nothing in either client app calls its GraphQL operations. See
> [Known issues](#known-issues) for the full finding (this is the verified resolution of the
> tentative [`CROSS-002`](../../../issues.md#cross-002) row).

## What this module owns

`TeamMember` — a join row between a `User` and a `Team` (`{teamId, userId, isLead, joinedAt}`, unique
per `(teamId, userId)`). List all members, or create one (self-join: the member is always the calling
JWT user, never an arbitrary target user — there is no "add someone else to a team" mutation).
Wired into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES`
directly (not demo-gated, confirmed by reading the array itself, not inferred) — see
[`team-members.module.ts`](../../../../nest-js-boilerplate/src/team-members/team-members.module.ts).
GraphQL-only — no REST controller.

The resolver's own source comment states its purpose plainly: *"Exercises GraphQL through FK depth
(TeamMember → Team → Organization → User) behind the guard"* — and the input DTO's comment adds
*"TeamMember has no schema `/// @Validator` rules, so this spec proves GraphQL + FK depth... rather
than generated validators."* This reads as the same kind of docs-feature verification module the
[`implement-nestjs-feature`](../../../../nest-js-boilerplate/.claude/skills/implement-nestjs-feature/SKILL.md)
skill produces elsewhere in this repo (see [Known issues](#known-issues) for why this matters to the
CROSS-002 finding).

## The wider Organization → Team → Project → Task model has no API surface of its own

`TeamMember.team` points at a real `Team` model (`{organizationId, name, parentTeamId (self-relation),
members}`), which itself belongs to a real `Organization` model
(`{name, slug, ownerId, plan, seatLimit, storageQuotaBytes, allowedDomains, settings, memberships,
teams, projects}`) — a full, schema-complete multi-tenant data model. **None of `Organization`,
`Team`, or `Project` has its own resolver or controller anywhere in `src/`** — confirmed via
`grep -rn "OrganizationModule\|class.*OrganizationService\|class.*TeamService\b" nest-js-boilerplate/src`
(zero matches). `team-members` and [`project-tasks`](../project-tasks/) are the **only** two GraphQL
entry points into this entire model, and both only expose the *leaf* entities (`TeamMember`, `Task`)
— there is no `createOrganization`/`createTeam`/`createProject` mutation anywhere. A brand-new
database has zero `Organization`/`Team`/`Project` rows (confirmed:
[`prisma/seed.ts`](../../../../nest-js-boilerplate/prisma/seed.ts), 25 lines total, never creates any
— `grep -i "organization\|team\|project" prisma/seed.ts` is empty) — so `createTeamMember` cannot
succeed against a fresh environment at all; it needs a `Team` row to `connect` to, and nothing in the
product can create one.

## Session sync side-effect

`create()` does one thing beyond the plain DB write: after inserting the `TeamMember` row, it
re-reads the caller's full team membership list and calls
`TokenStoreService.rewriteFieldsForUser(userId, {teamIds: ...})` to patch the **live Redis session**
in place — so a team join takes effect on the user's very next guarded request instead of requiring
re-login. This mirrors the `rbacToken` tier-change mechanism documented in
[identity-access/auth/README.md § SessionAuthGuard](../../identity-access/auth/README.md#sessionauthguard--validation-order).
Best-effort: a failure here is logged and swallowed, never fails the mutation (the `TeamMember` row
is already committed by that point).

## Depends on

`AuthModule` only (guard + `TokenStoreService`, both re-exported through `AuthContractsModule`).

## Used by

**No frontend or mobile consumer found.** See [Known issues](#known-issues).

## Known issues

**[CROSS-002](../../../issues.md#cross-002) — verified during this phase.** Full write-up, evidence,
and the recommended disposition are in this phase's report; see the coordinator's updated
`issues.md` row for the final text. Summary: `team-members` (this module) and
[`project-tasks`](../project-tasks/) are real, always-on `CORE_MODULES`, confirmed to have **zero**
consumer on either platform — not merely "no dedicated page," but zero references to either
operation name (`teamMembers`, `createTeamMember`, `tasks`, `createTask`) anywhere in
`next-js-boilerplate/src` or `flutter-boilerplate/lib`, confirmed by grepping both client trees
directly for the GraphQL operation names (not just the page-route inventory). The two apparent hits
in a naive grep — `next-js-boilerplate/src/views/forms/advanced/TeamMembers.tsx` and
`next-js-boilerplate/src/views/ui/avatar/examples.tsx` — are both unrelated UI-gallery demo
components with hardcoded fake data, confirmed by reading both files; neither imports anything from
this module's GraphQL schema. Beyond the missing consumer, this module (and `project-tasks`) is
**structurally unusable as a product feature today regardless of a frontend**, since the
`Organization`/`Team`/`Project` parent entities it depends on have no creation path anywhere in the
API and aren't seeded — see [§ The wider model has no API surface](#the-wider-organization--team--project--task-model-has-no-api-surface-of-its-own).
