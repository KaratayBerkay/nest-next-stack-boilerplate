# ReactionButtons (`ReactionInline`, `ReactionPicker`)

**Source:** [`ReactionButtons.tsx`](../../../../../next-js-boilerplate/src/components/feed/ReactionButtons.tsx)
**Types:** [`ReactionButton-types.ts`](../../../../../next-js-boilerplate/src/types/feed/ReactionButton-types.ts)
**Used in:** [PostHeader (feed)](./post-header.md), [CommentCard](./comment-card.md),
[PostHeader (posts detail)](../../posts/components/post-header.md)
**Mobile equivalent:** [ReactionButtons widget](../../../../mobile/v1/feed/widgets/reaction-buttons.md)

## Purpose

The one reaction UI both posts and comments share: a smiley-face trigger showing the total reaction
count, opening a [`Popover`](../../../../../next-js-boilerplate/src/components/ui/popover/) with 4
emoji buttons (`LIKE 👍`, `LOVE ❤️`, `LAUGH 😂`, `WOW 😮`) — a subset of the backend's 6-value
`ReactionType` enum (`SAD`/`ANGRY` have no UI trigger on either platform, confirmed by reading both
this file and the mobile equivalent). Exports two components: `ReactionInline` (the trigger + popover
wrapper, what every caller actually renders) and `ReactionPicker` (the emoji row inside the popover,
not exported/used standalone anywhere).

## Props (`ReactionButtonProps`)

| Prop | Purpose |
|---|---|
| `postId` | set when reacting to a post (mutually exclusive with `commentId`) |
| `commentId` | set when reacting to a comment |
| `reactions` | the target's current reaction list, for computing per-type counts and "did I react" state |
| `currentUserId` | whose reactions count as "active" |
| `onReactionChange()` | callback after a successful toggle — every caller wires this to a query invalidation |

## Behavior notes

- Clicking an emoji closes the popover (`usePopover().close()`) immediately after the mutation
  resolves — no optimistic UI; the button re-renders once the parent's invalidated query refetches.
- A submit-in-flight guard (`submitting` state) disables all 4 buttons for the duration of one
  request, preventing a double-click from firing two toggles.

## Calls

```
ReactionInline (button click) → usePostActions().toggleReaction({type, postId?, commentId?})
  — src/api/client/posts/actions.ts
  → toggleReactionServer()                — src/api/server/posts/reactions.ts
    → backend: createReaction mutation
```

- Frontend API layer: [posts/api.md § Toggle a reaction](../../posts/api.md#toggle-a-reaction-client)
- Backend endpoint: [reactions/endpoints.md § Create / toggle a reaction](../../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction)

On failure, shows a toast (`"Failed to react"`) via the shared `useToast()` — no rollback needed
since there's no optimistic state to unwind.
