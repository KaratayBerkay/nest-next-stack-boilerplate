# Feed — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/posts/`](../../../../flutter-boilerplate/lib/api/client/posts/) · Server:
[`lib/api/server/posts/`](../../../../flutter-boilerplate/lib/api/server/posts/)

**This is the owning doc for the whole `post`/`comment`/`reactions` API surface on mobile** — the
same role [posts/api.md (web)](../../../frontend/v1/posts/api.md) plays for the frontend. [posts](../posts/README.md)
and [share](../share/screen.md) both reuse every file documented here.

All calls use one shared `Dio` instance (`dioProvider`,
[`lib/lib/api_client.dart`](../../../../flutter-boilerplate/lib/lib/api_client.dart)), base URL =
`AppConfig.apiBaseUrl`. **Every file in this vertical hits the NestJS backend directly — confirmed by
reading all 9 server files, not inferred.** See
[conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
for the shape test applied to reach this conclusion.

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`list.dart`](../../../../flutter-boilerplate/lib/api/server/posts/list.dart) | Direct GraphQL (hand-rolled `_dio.post('/graphql', ...)`, no `gql_helper`) | `query PostList` | [List the feed](../../../backend/social-content/post/endpoints.md#list-the-feed) |
| [`single.dart`](../../../../flutter-boilerplate/lib/api/server/posts/single.dart) | Direct GraphQL | `query Post` | [Get a single post](../../../backend/social-content/post/endpoints.md#get-a-single-post) |
| [`create.dart`](../../../../flutter-boilerplate/lib/api/server/posts/create.dart) | Direct GraphQL | `mutation CreatePost` | [Create a post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| [`update.dart`](../../../../flutter-boilerplate/lib/api/server/posts/update.dart) | Direct GraphQL | `mutation UpdatePost` | [Update a post](../../../backend/social-content/post/endpoints.md#update-a-post) |
| [`delete.dart`](../../../../flutter-boilerplate/lib/api/server/posts/delete.dart) | Direct GraphQL | `mutation DeletePost` | [Delete a post](../../../backend/social-content/post/endpoints.md#delete-a-post) |
| [`comments.dart`](../../../../flutter-boilerplate/lib/api/server/posts/comments.dart) | Direct GraphQL | `query PostComments`, `mutation CreateComment`/`UpdateComment`/`DeleteComment` | [comment/endpoints.md](../../../backend/social-content/comment/endpoints.md) |
| [`reactions.dart`](../../../../flutter-boilerplate/lib/api/server/posts/reactions.dart) | Direct GraphQL | `mutation CreateReaction` | [Create / toggle a reaction](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| [`stats.dart`](../../../../flutter-boilerplate/lib/api/server/posts/stats.dart) | Direct GraphQL | `query MyPostStats` | [Get my post stats](../../../backend/social-content/post/endpoints.md#get-my-post-stats) |
| [`upload.dart`](../../../../flutter-boilerplate/lib/api/server/posts/upload.dart) | Direct REST | `POST /upload/single` — matches the backend's own native `@Controller('upload')`/`@Post('single')` route exactly (confirmed by reading the controller directly, not assumed from the path) | [Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) |

Note two shape differences from the web GraphQL queries that request the exact same data:
`list.dart`/`single.dart` request `updatedAt` (web's `POSTS_QUERY`/`POST_QUERY` don't), and — like
web — **neither requests `reactionBreakdown`/`whoReacted`**; mobile's `Post` type has no field for
either at all (see [posts/detail/screen.md § Known issues](../posts/detail/screen.md#known-issues)).

## Client layer (`lib/api/client/posts/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../../flutter-boilerplate/lib/api/client/posts/actions.dart) | `postActionsProvider` → `PostActions` (`create`, `update`, `delete`, `toggleReaction`, `addComment`, `updateComment`, `deleteComment`, `toggleCommentReaction`, `uploadImage`) — every mutation invalidates `paginatedFeedProvider`/`feedProvider` (mirrors web's `usePostActions().invalidate()`, per this file's own comment) plus the specific `postProvider(id)`/`postCommentsProvider(id)` affected |
| [`query.dart`](../../../../flutter-boilerplate/lib/api/client/posts/query.dart) | `paginatedFeedProvider`, `feedProvider`, `feedSearchProvider`, `postProvider`, `postCommentsProvider`, `postStatsProvider` — see [hooks.md](./hooks.md) |

### Reactions default to `'LIKE'`

`PostActions.toggleReaction(postId, {type = 'LIKE'})` and `.toggleCommentReaction(...)` both default
their `type` param to `'LIKE'` — callers that want a different reaction type must pass it explicitly.
[ReactionButtons](./widgets/reaction-buttons.md) (the shared feed widget) always passes an explicit
type from its 4-emoji picker; the simpler heart-icon toggles used by
[posts list](../posts/list/screen.md) and the dead
[posts/[uuid] tree](../posts/detail/screen.md#known-issues) rely on the default instead.

## Known issues

See [screen.md § Known issues](./screen.md#known-issues-affecting-this-screen).
