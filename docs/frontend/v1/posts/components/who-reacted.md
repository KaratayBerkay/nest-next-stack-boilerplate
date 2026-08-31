# WhoReacted

**Source:** [`WhoReacted.tsx`](../../../../../next-js-boilerplate/src/views/posts/[uuid]/WhoReacted.tsx)
**Types:** [`WhoReacted-types.ts`](../../../../../next-js-boilerplate/src/types/views/posts/WhoReacted-types.ts)
**Used in:** [posts detail page](../page.md), Premium tier only (`showWhoReacted`)
**Mobile:** mobile has a widget with the same name — see
[mobile/v1/posts/detail/screen.md § Known issues](../../../../mobile/v1/posts/detail/screen.md#known-issues)
for why it's a materially different (and non-functional) implementation, not a parity match

## Purpose

A named list of who reacted and with what (avatar + name + reaction type, one row per reaction).
Purely presentational — reads `post.whoReacted` and renders `null` if it's empty or missing.

## ⚠ Currently always renders nothing

Same root cause as [ReactionBreakdown](./reaction-breakdown.md) —
`FE-009` (resolved): `post.whoReacted` is never populated because `POST_QUERY`
never requests it, so this component's `if (!post.whoReacted || post.whoReacted.length === 0) return
null;` guard is always true in practice, even for a Premium-tier viewer on a heavily-reacted post.
The backend field is real (`@ResolveField`, `@MinTier(PREMIUM)` — see
[post/endpoints.md](../../../../backend/social-content/post/endpoints.md#postwhoreacted-resolved-field)).

## Calls

None — pure display component.
