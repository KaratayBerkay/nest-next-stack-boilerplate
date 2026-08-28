# GrowthStatsSection

**Source:** [`GrowthStatsSection.tsx`](../../../../../next-js-boilerplate/src/views/premium/GrowthStatsSection.tsx)
**Used in:** [premium page](../page.md) (Medium and Premium tiers)
**Mobile equivalent:** the *name* exists on mobile too
(previously `growth_stats_section.dart`; mobile's premium tier views were consolidated into a single
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/premium/page_view.dart) in `b98fac8a`)
but is dead code there — mobile's live implementation is a different, inline private widget
(`_GrowthStatsGrid`). See [mobile/v1/premium/screen.md § Known issues](../../../../mobile/v1/premium/screen.md#known-issues).

## Purpose

Pure, stateless presentation: a "Load growth stats" button plus a 4-card grid once `growthStats` is
non-null. All state and fetching live in the parent tier view.

## Props (`GrowthStatsSectionProps`)

| Prop | Purpose |
|---|---|
| `growthStats` | `PremiumGrowthStats \| null` — `{totalUsers, newUsersLast7Days, totalPosts, totalFriendships}`, the exact shape [`growthStats`](../../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts) returns. Note the field is genuinely a **7-day** window, not "this month" — the label (`t.newUsers7d`) gets this right, unlike mobile's equivalent (see the cross-reference above). |
| `loadingGrowth` | disables the button while a fetch is in flight |
| `onLoadGrowthStats` | callback, wired by the parent to [`loadPremiumGrowthStats`](../api.md#calls) |
| `t` | the `premium` i18n message bundle |

All four backend fields are rendered — `totalUsers` appears in both this section and
[StatsSection](./stats-section.md) simultaneously (Medium/Premium show it twice, once per section);
not a bug, just two independent queries that both happen to include it.

## Calls

None directly — `onLoadGrowthStats` is supplied by the parent tier view. See
[page.md § Backend endpoints this page depends on](../page.md#backend-endpoints-this-page-depends-on)
and [api.md](../api.md).
