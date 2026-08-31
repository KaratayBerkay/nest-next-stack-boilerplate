# PostStatsSidebar (widget)

**Source:** [`post_stats_sidebar.dart`](../../../../../flutter-boilerplate/lib/components/feed/post_stats_sidebar.dart)
**Used in:** [feed screen](../screen.md#layout-search-list-and-sidebar) (Medium/Premium tiers, via
`_SidebarLayout`)
**Web equivalent:** [PostStatsSidebar component](../../../../frontend/v1/feed/components/post-stats-sidebar.md)

## Purpose

A click-to-load stats card (total posts, total reactions, avg reactions/post) — same concept as
web's version, but refactored to take its data-loading function as an **injected callback** rather
than calling the server function itself.

## Constructor

```dart
class PostStatsSidebar extends StatefulWidget {
  final Future<PostStats> Function()? onLoadStats;
  const PostStatsSidebar({super.key, this.onLoadStats});
}
```

## Known issues

**The "Load Stats" button is a silent no-op.** `_loadStats()` starts with
`if (widget.onLoadStats == null) return;` — and both real instantiation sites
([`feed_base_view.dart`](../screen.md)'s `_SidebarLayout`, lines ~326 and ~338) construct this widget
with **zero arguments**: `const PostStatsSidebar()`. Confirmed via
`grep -rn "PostStatsSidebar(" flutter-boilerplate/lib` — exactly those two call sites, neither
passes `onLoadStats`. Tapping "Load Stats" therefore does nothing: no spinner, no error, no data —
the button just sits there. The backing data layer is fully implemented and otherwise unused:
`postStatsProvider`/`postStatsServerProvider`
([`lib/api/client/posts/query.dart#L144-147`](../../../../../flutter-boilerplate/lib/api/client/posts/query.dart))
correctly wraps the real `myPostStats` GraphQL query, but has **zero readers anywhere in the app**
(confirmed via `grep -rn "postStatsProvider\|postStatsServerProvider" flutter-boilerplate/lib` — only
the two definition sites, no `ref.watch`/`ref.read` call anywhere).

This is the same "scaffolded-then-not-fully-wired" shape as
[CROSS-013](../../../../issues.md#cross-013)/`FE-007` (resolved) from earlier
phases — one new instance in this vertical. Filed as `MOB-009` (resolved) (see
[issues.md](../../../../issues.md)). The one-line fix is wiring
`onLoadStats: () => ref.read(postStatsServerProvider).call()` (or reading `postStatsProvider`
directly) at both `_SidebarLayout` call sites.

## Calls

None currently reachable — see [Known issues](#known-issues) above. Intended path (once wired):
`postStatsServerProvider.call()` → backend
[post/endpoints.md#get-my-post-stats](../../../../backend/social-content/post/endpoints.md#get-my-post-stats).
