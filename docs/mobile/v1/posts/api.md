# Posts — API

Vertical: [README.md](./README.md)

This vertical has no `api/client/posts/`/`api/server/posts/` files of its own — every screen here
([list](./list/screen.md), [create](./create/screen.md), [detail](./detail/screen.md)) calls the
same shared layer [feed](../feed/screen.md) owns and fully documents in
[feed/api.md](../feed/api.md), including the shape-per-file table and the confirmation that this
entire vertical is direct-to-backend GraphQL (except the REST-shaped image upload, unused by any
screen in this particular sub-vertical — only [share](../share/screen.md) uploads an image).

## Per-screen call summary

| Screen | Reads | Writes |
|---|---|---|
| [list](./list/screen.md) | `feedProvider` → [List the feed](../../../backend/social-content/post/endpoints.md#list-the-feed) | `postActionsProvider.toggleReaction()` (default `'LIKE'`) → [reactions](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| [create](./create/screen.md) | — | `postActionsProvider.create()` (no image) → [Create a post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| [detail](./detail/screen.md) | `postProvider`, `postCommentsProvider` → [Get a single post](../../../backend/social-content/post/endpoints.md#get-a-single-post), [List a post's comments](../../../backend/social-content/comment/endpoints.md#list-a-posts-comments) | `postActionsProvider.addComment()` → [Create a comment](../../../backend/social-content/comment/endpoints.md#create-a-comment) — the **only** write this screen makes, see [detail/screen.md § Known issues](./detail/screen.md#known-issues) for what's missing |

See [feed/api.md](../feed/api.md) for the full per-file shape table, the client-layer provider
catalogue, and the reaction-default-type note.
