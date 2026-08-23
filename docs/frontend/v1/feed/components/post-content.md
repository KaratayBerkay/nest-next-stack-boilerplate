# PostContent

**Source:** [`PostContent.tsx`](../../../../../next-js-boilerplate/src/components/feed/PostContent.tsx)
**Types:** [`PostContent-types.ts`](../../../../../next-js-boilerplate/src/types/feed/PostContent-types.ts)
**Used in:** [PostCard](./post-card.md)

> ⚠ Not to be confused with [`views/posts/[uuid]/PostContentView.tsx`](../../posts/components/post-content-view.md)
> — the post-detail page's equivalent, a separate component with different props and no edit mode of
> its own (the detail page swaps to a whole separate [PostEditForm](../../posts/components/post-edit-form.md)
> instead of an inline mode).

## Purpose

Renders a post's cover image (64×64 thumbnail, via `imageUrl(postData.imageUrl, "badge")` — a
sized-variant helper, not the raw URL), title, and a 200-char-truncated body preview — or, in edit
mode, plain `<input>`/`<textarea>` elements bound directly to `PostCard`'s edit state. Client
component, purely presentational (no state or API calls of its own).

## Props (`PostContentProps`)

| Prop | Purpose |
|---|---|
| `postData` | the post row |
| `editing` | switches title/body between static text and editable inputs |
| `editTitle`, `editContent` | controlled values while editing |
| `onTitleChange`, `onContentChange` | change handlers, wired to `PostCard`'s `setEditTitle`/`setEditContent` |

## Behavior notes

- Only ever reads `postData.imageUrl` — never `postData.coverImage`, the base64 alternative field the
  backend also supports. See
  [post/README.md § coverImage vs imageUrl](../../../../backend/social-content/post/README.md#what-this-module-owns).
- Body preview truncates client-side at 200 characters (`+ "..."`) — the full body is only shown on
  the [posts](../../posts/page.md) detail page via
  [PostContentView](../../posts/components/post-content-view.md).

## Calls

None — pure presentational component, all state lives in [PostCard](./post-card.md).
