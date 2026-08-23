# PostEditForm

**Source:** [`PostEditForm.tsx`](../../../../../next-js-boilerplate/src/views/posts/[uuid]/PostEditForm.tsx)
**Types:** [`PostEditForm-types.ts`](../../../../../next-js-boilerplate/src/types/views/posts/PostEditForm-types.ts)
**Used in:** [posts detail page](../page.md), swapped in for [PostContentView](./post-content-view.md)
when editing

## Purpose

A plain title `<Input>` + content `<Textarea>` + Save/Cancel buttons. All state (`editTitle`,
`editContent`) is owned by the page's `PostDetailContent`, not this component — purely a controlled
form. No inline validation beyond the browser's native `required`-less inputs (the actual
3-200-char/min-1-char rules are enforced only by the backend DTO — see
[post/endpoints.md § Update a post](../../../../backend/social-content/post/endpoints.md#update-a-post)).

## Props (`PostEditFormProps`)

| Prop | Purpose |
|---|---|
| `post` | unused for display (title/content come from the controlled `editTitle`/`editContent` props instead) — kept for type consistency with the sibling components |
| `editTitle`, `editContent`, `onEditTitleChange`, `onEditContentChange` | controlled form state |
| `onSave()`, `onCancel()` | callbacks into `PostDetailContent` |

## Calls

None directly — `onSave` is a callback into `PostDetailContent.handleSave`, which calls
[`usePostActions().updatePost()`](../api.md#update--delete-a-post-client). See
[page.md](../page.md#what-renders-here).
