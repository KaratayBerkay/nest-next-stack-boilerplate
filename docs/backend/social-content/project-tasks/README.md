# Project Tasks (backend)

**Source:** [`nest-js-boilerplate/src/project-tasks/`](../../../../nest-js-boilerplate/src/project-tasks/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

> ⚠ **No discovered frontend or mobile consumer.** This module is real, always-on production code —
> not demo-gated — but nothing in either client app calls its GraphQL operations. See
> [Known issues](#known-issues) for the full finding (this is the verified resolution of the
> tentative [`CROSS-002`](../../../issues.md#cross-002) row). Same situation, same root cause, as its
> sibling [`team-members`](../team-members/) — the two are documented as a pair.

## What this module owns

`Task` — the project/issue entity of a small, otherwise-unexposed project-management data model
(`Organization → Team`/`Project → Task`). List all tasks, or create one. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated, confirmed by reading the array itself). GraphQL-only — no REST controller. Not to be
confused with [`src/demo-tasks/`](../../../../nest-js-boilerplate/src/demo-tasks/) — an unrelated
`@nestjs/schedule` (Cron/Interval) demo module, `DEMO_MODULES`-gated — the resolver's own source
comment calls this distinction out explicitly.

The resolver's own source comment states its purpose plainly: *"Exercises GraphQL through 3-level FK
depth (Task → Project → Organization → User) and proves the `@MinLength`/`@MaxLength` validators
auto-generated from the Prisma schema onto `Task.title`."* The input DTO's comment adds that
`title`'s validators are inherited via `PickType` from the schema-generated `TaskCreateInput`
specifically to keep those auto-generated validators under test, and that the FK fields are
deliberately flattened to plain scalar ids (the generated nested-relation inputs carry no
`class-validator` decorators and would be silently stripped by the global
`ValidationPipe({whitelist: true})`). This reads as the same
[`implement-nestjs-feature`](../../../../nest-js-boilerplate/.claude/skills/implement-nestjs-feature/SKILL.md)-style
verification module as `team-members` — see
[team-members/README.md](../team-members/README.md#what-this-module-owns) for the sibling comment and
[Known issues](#known-issues) for why this framing matters to the CROSS-002 finding.

## `Task` itself is a rich, unused schema

The Prisma model backing this resolver is far larger than what `createTask` actually exposes:
`status` (`TaskStatus`, defaults `BACKLOG`), three separate `User` FKs (`assignee`, `reporter`,
`createdBy` — only `createdBy`, from the JWT, and optionally `assignee` are settable via this
module's mutation; `reporter` has no setter anywhere), a self-relation for subtasks
(`parentTaskId`/`subtasks`), `estimateHours`/`loggedHours`/`storyPoints`/`position`/`labels`/
`dueDate`/`completedAt`. None of these extra fields are reachable from `CreateTaskInput` — only
`title`, `description`, `priority`, `projectId`, `assigneeId` are. `findAll()` returns every field on
every `Task` row regardless (no `select`), so a caller reading the query would see them (all at their
schema defaults for anything created through this mutation) even though nothing can set them.

## Same "no parent entity has an API" problem as team-members

`Task.project` points at a real `Project` model (`{organizationId, name, key, status, leadId, budget,
startDate, dueDate, tasks}`), itself belonging to `Organization`. As with `team-members`, **neither
`Project` nor `Organization` has a resolver or controller anywhere**, and
[`prisma/seed.ts`](../../../../nest-js-boilerplate/prisma/seed.ts) never creates any — so
`createTask`'s required `projectId` can never resolve to a real row on an unseeded environment. See
[team-members/README.md § The wider model has no API surface](../team-members/README.md#the-wider-organization--team--project--task-model-has-no-api-surface-of-its-own)
for the shared evidence (both modules point at the same `Organization`/`Project`/`Team` gap).

## Depends on

`AuthModule` only (guard).

## Used by

**No frontend or mobile consumer found.** See [Known issues](#known-issues).

## Known issues

**`CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core) — verified during this phase.** See
[team-members/README.md § Known issues](../team-members/README.md#known-issues) for the full
evidence write-up (grep methodology, the two false-positive hits ruled out, and the "no parent
entity has an API" structural point) — identical conclusion applies to this module. The
recommended disposition is recorded in this phase's report to the coordinator, who owns the final
`issues.md` text.
