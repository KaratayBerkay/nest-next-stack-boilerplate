# Social & Content

Posts, comments, and reactions (the "feed" content graph), friends/profile (identity-adjacent social
graph), and two always-on backend modules — `team-members`/`project-tasks` — that implement a small
project-management data model with no frontend or mobile consumer on either platform (see
[Known issues](#known-issues)). ✅ Complete (Phase 2).

| Module | Interfaces | Docs |
|---|---|---|
| [post](./post/) | GraphQL resolver | [README](./post/README.md) · [endpoints](./post/endpoints.md) |
| [comment](./comment/) | GraphQL resolver | [README](./comment/README.md) · [endpoints](./comment/endpoints.md) |
| [reactions](./reactions/) | GraphQL resolver | [README](./reactions/README.md) · [endpoints](./reactions/endpoints.md) |
| [team-members](./team-members/) | GraphQL resolver | [README](./team-members/README.md) · [endpoints](./team-members/endpoints.md) |
| [project-tasks](./project-tasks/) | GraphQL resolver | [README](./project-tasks/README.md) · [endpoints](./project-tasks/endpoints.md) |
| [friends](./friends/) | GraphQL resolver | [README](./friends/README.md) · [endpoints](./friends/endpoints.md) |
| [profile](./profile/) | GraphQL resolver | [README](./profile/README.md) · [endpoints](./profile/endpoints.md) |

Frontend: [`friends`, `find-friends(/requests)`](../../frontend/v1/README.md),
[`users/{list,detail}`](../../frontend/v1/users/README.md),
[`feed`, `posts/[uuid]`, `share`](../../frontend/v1/README.md), plus
[`settings/{account,general,privacy}`](../../frontend/v1/settings/README.md). Mobile: the same
verticals under [`mobile/v1/`](../../mobile/v1/README.md).

Notable findings from this phase: `MOB-003` (resolved)/`MOB-007` (resolved)
(two independent, 100%-reproducible mobile bugs — user-detail always shows your own profile regardless
of which user you tapped; pending-friend-requests throws on any real response due to a field-name
mismatch), `CROSS-018` (resolved) (mobile over-gates find-friends by tier well beyond
what the backend or web require), `MOB-008` (resolved)/`MOB-011` (resolved)
(a post's own author currently has no working edit/delete path anywhere on mobile — a more-complete
implementation sits dead in the tree while the live screen never wires the callbacks), and
`CROSS-016` (resolved) (web's `users/list`/`detail` are static demo content while
mobile's identically-named screens are a real, live, admin-only feature). [CROSS-002](../../issues.md#cross-002)
(`team-members`/`project-tasks` orphaned) moved from tentative to verified this phase. Full list:
[issues.md](../../issues.md).

## How the pieces fit together

`post`, `comment`, and `reactions` are three **independent** GraphQL resolvers/modules, not one
resolver with nested types — confirmed by reading source, not assumed. A comment is not a field on
`Post`; it's `CommentResolver`'s own `postComments`/`createComment`/`updateComment`/`deleteComment`
operations, linked to a post only by a flat `postId` scalar. Reactions attach to **either** a post or
a comment (`ReactionsResolver.createReaction`, exactly one of `postId`/`commentId` required) via the
same mechanism. All three share one realtime convention: every mutation calls
`RealtimeGateway.emitToTopic('feed', {renew:'Feed', type:'Post', id})` (and, where a specific post is
open, `emitToTopic('post:{id}', ...)` too) so any client watching either topic re-fetches — see
[realtime/README.md](../messaging-realtime/realtime/README.md) for the gateway itself.

`team-members` and `project-tasks` are unrelated to the post/comment/reactions content graph — they
expose a small slice (`TeamMember`, `Task`) of a larger, otherwise-unexposed Organization → Team →
Project → Task data model (see each module's README for the full schema shape). **Neither has a
discovered frontend or mobile consumer** — this was `issues.md`'s tentative `CROSS-002` row, verified
during this phase; see both modules' READMEs for the full finding.

## Known issues

- `CROSS-002` (see [`issues.md`](../../issues.md#cross-002)) — `team-members` and `project-tasks` are
  real, always-on `CORE_MODULES` with no frontend page or mobile screen consuming their GraphQL
  operations anywhere, verified by grepping both client codebases for their operation names directly
  (not just their absence from the page-route inventory). Full evidence in
  [team-members/README.md](./team-members/README.md#known-issues) and
  [project-tasks/README.md](./project-tasks/README.md#known-issues).
