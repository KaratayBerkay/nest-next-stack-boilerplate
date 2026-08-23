# PostStatsSidebar

**Source:** [`PostStatsSidebar.tsx`](../../../../../next-js-boilerplate/src/components/feed/PostStatsSidebar.tsx)
**Used in:** [FeedBaseView](../page.md#what-renders-here) (Medium/Premium tiers only, via `showSidebar`)
**Mobile equivalent:** [PostStatsSidebar widget](../../../../mobile/v1/feed/widgets/post-stats-sidebar.md) —
⚠ see that doc's Known issues; the mobile version is not wired to real data

## Purpose

A click-to-load stats card: total posts, total reactions, and average reactions/post for the
signed-in user's own posts. Starts empty with a "Load Stats" button — the query is not fetched
automatically on mount, only on demand. Client component, self-contained (calls its own server
function directly, unlike most of this vertical's components which go through `usePostActions`).

## Behavior notes

- No props — entirely self-contained `useState` for `stats`/`loading`.
- Calls `fetchPostStatsServer()` directly rather than going through React Query — a plain `useState`
  + manual fetch, not a `useQuery`. This means the stats never auto-refresh; navigating away and back
  to the feed page re-mounts the component and clears `stats` back to `null`, requiring another
  manual click.
- On failure, shows a toast (`t.networkError`) and leaves the button in its un-loaded state (no
  retry-specific UI — clicking the same button again retries).

## Calls

```
PostStatsSidebar ("Load Stats" click) → fetchPostStatsServer()
  — src/api/server/posts/stats.ts (posts to /api/gql, a generic authenticated GraphQL passthrough BFF route)
    → backend: myPostStats query
```

- Frontend API layer: [posts/api.md § Get my post stats](../../posts/api.md#get-my-post-stats-client)
- Backend endpoint: [post/endpoints.md § Get my post stats](../../../../backend/social-content/post/endpoints.md#get-my-post-stats)
  (`@MinTier(MEDIUM)` — enforced redundantly here too, since this component only ever renders for
  Medium/Premium viewers in the first place)
