# Project Tasks — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/project-tasks/`](../../../../nest-js-boilerplate/src/project-tasks/)

Resolver: [`project-tasks.resolver.ts`](../../../../nest-js-boilerplate/src/project-tasks/project-tasks.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. No REST controller exists for this module.

## GraphQL

### List tasks

**Kind:** GraphQL Query · **`tasks: [Task!]!`**
**Source:** [`project-tasks.resolver.ts#L20-23`](../../../../nest-js-boilerplate/src/project-tasks/project-tasks.resolver.ts),
[`project-tasks.service.ts#L9-11`](../../../../nest-js-boilerplate/src/project-tasks/project-tasks.service.ts)
**Response:** every `Task` row (all fields, no `select`), ordered by `createdAt` ascending — no
filtering by project/organization/caller, no pagination.
**Used by:** no frontend or mobile caller found — see
[README.md § Known issues](./README.md#known-issues).

### Create a task

**Kind:** GraphQL Mutation · **`createTask(data: CreateTaskInput!): Task!`**
**Source:** [`project-tasks.resolver.ts#L25-31`](../../../../nest-js-boilerplate/src/project-tasks/project-tasks.resolver.ts),
[`project-tasks.service.ts#L13-27`](../../../../nest-js-boilerplate/src/project-tasks/project-tasks.service.ts),
input [`create-task.input.ts`](../../../../nest-js-boilerplate/src/project-tasks/dto/create-task.input.ts)
**Input:** `title` (string, 1-200 chars, validators inherited from the schema-generated
`TaskCreateInput` via `PickType`) · `description?` (string) · `priority?` (`TaskPriority` enum,
service defaults to the Prisma column default `MEDIUM` if omitted) · `projectId` (UUID, required —
must reference an existing `Project` row) · `assigneeId?` (UUID). `createdBy` is always the calling
JWT user; there is no `reporter` field on this input at all despite the Prisma model having one. See
[README.md § Task itself is a rich, unused schema](./README.md#task-itself-is-a-rich-unused-schema).
**Errors:** a Prisma FK-constraint failure (raw `500`, not a friendly `404`/`400`) if `projectId`
(or `assigneeId`) doesn't reference an existing row — which, on an unseeded environment, is every
`projectId`. See
[README.md § Same "no parent entity has an API" problem](./README.md#same-no-parent-entity-has-an-api-problem-as-team-members).
**Used by:** no frontend or mobile caller found — see
[README.md § Known issues](./README.md#known-issues).

## Known issues

See [README.md § Known issues](./README.md#known-issues) — this is the module half of the resolved
`CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core) finding.
