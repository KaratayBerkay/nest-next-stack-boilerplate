# ReactionBreakdown

**Source:** [`ReactionBreakdown.tsx`](../../../../../next-js-boilerplate/src/views/posts/[uuid]/ReactionBreakdown.tsx)
**Types:** [`ReactionBreakdown-types.ts`](../../../../../next-js-boilerplate/src/types/views/posts/ReactionBreakdown-types.ts)
**Used in:** [posts detail page](../page.md), Medium+ tier only (`showReactionBreakdown`)
**Mobile:** mobile has a widget with the same name but a different design and data source — see
[mobile/v1/posts/detail/screen.md § Known issues](../../../../mobile/v1/posts/detail/screen.md#known-issues)

## Purpose

A per-reaction-type count pill row (`{type} {count}`), meant to show viewers a breakdown like
"👍 3 · ❤️ 1 · 😮 2" rather than just a total. Purely presentational — reads `post.reactionBreakdown`
and renders `null` if it's empty or missing.

## ⚠ Currently always renders nothing

```tsx
if (!post.reactionBreakdown || post.reactionBreakdown.length === 0) {
  return null;
}
```

`post.reactionBreakdown` is never populated — `FE-009` (resolved), see
[page.md § Known issues](../page.md#known-issues). The backend field this component is built for is
real and working (`@ResolveField`, `@MinTier(MEDIUM)` — see
[post/endpoints.md](../../../../backend/social-content/post/endpoints.md#postreactionbreakdown-resolved-field));
the query that would populate it is the missing piece, not this component.

## Calls

None — pure display component.
