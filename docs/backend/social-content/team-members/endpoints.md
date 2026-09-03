# Team Members — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/team-members/`](../../../../nest-js-boilerplate/src/team-members/)

Resolver: [`team-members.resolver.ts`](../../../../nest-js-boilerplate/src/team-members/team-members.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. No REST controller exists for this module.

## GraphQL

### List team members

**Kind:** GraphQL Query · **`teamMembers: [TeamMember!]!`**
**Source:** [`team-members.resolver.ts#L16-19`](../../../../nest-js-boilerplate/src/team-members/team-members.resolver.ts),
[`team-members.service.ts#L15-17`](../../../../nest-js-boilerplate/src/team-members/team-members.service.ts)
**Response:** every `TeamMember` row in the database, ordered by `joinedAt` ascending — no filtering
by organization/team/caller, no pagination.
**Used by:** no frontend or mobile caller found — see
[README.md § Known issues](./README.md#known-issues).

### Join a team

**Kind:** GraphQL Mutation · **`createTeamMember(data: CreateTeamMemberInput!): TeamMember!`**
**Source:** [`team-members.resolver.ts#L21-27`](../../../../nest-js-boilerplate/src/team-members/team-members.resolver.ts),
[`team-members.service.ts#L19-49`](../../../../nest-js-boilerplate/src/team-members/team-members.service.ts),
input [`create-team-member.input.ts`](../../../../nest-js-boilerplate/src/team-members/dto/create-team-member.input.ts)
**Input:** `teamId` (UUID, required — must reference an existing `Team` row) · `isLead?` (boolean).
The member is always the calling JWT user (`user.userId`) — this mutation has no way to add a
*different* user to a team.
**Errors:** a Prisma FK-constraint failure (surfaces as a raw `500`, not a friendly `404`/`400`) if
`teamId` doesn't reference an existing row — which, on an unseeded environment, is every `teamId`,
since nothing can create a `Team` row in the first place. See
[README.md § The wider model has no API surface](./README.md#the-wider-organization--team--project--task-model-has-no-api-surface-of-its-own).
**Side-effect:** rewrites the caller's `teamIds` in their live Redis session (best-effort, never
fails the mutation) — see [README.md § Session sync side-effect](./README.md#session-sync-side-effect).
**Used by:** no frontend or mobile caller found — see
[README.md § Known issues](./README.md#known-issues).

## Known issues

See [README.md § Known issues](./README.md#known-issues) — this is the module half of the resolved
`CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core) finding.
