# PostContentView

**Source:** [`PostContentView.tsx`](../../../../../next-js-boilerplate/src/views/posts/[uuid]/PostContentView.tsx)
**Types:** [`PostContentView-types.ts`](../../../../../next-js-boilerplate/src/types/views/posts/PostContentView-types.ts)
**Used in:** [posts detail page](../page.md), when not in edit mode

> ⚠ Not to be confused with [`components/feed/PostContent.tsx`](../../feed/components/post-content.md)
> — the feed card's equivalent, which also has an inline edit mode built into it; this component has
> no edit mode of its own, [PostEditForm](./post-edit-form.md) is swapped in for that instead.

## Purpose

The read-only, full-content rendering of a post: full-width cover image (`imageUrl(post.imageUrl,
"full")` — the large-size variant, vs. the feed card's `"badge"`-size 64×64 thumbnail), title, the
**full, untruncated** body text, and a comment-count line. Purely presentational, no props beyond
`post`, no API calls.

## Calls

None.
