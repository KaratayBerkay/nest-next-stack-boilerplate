# Premium (screen)

**Route:** `/v1/:lang/premium` (GoRouter name `v1Premium`)
**Router registration:** [`router.dart#L335-338`](../../../../flutter-boilerplate/lib/app/router.dart) →
`PremiumPageContent`
**Entry widget:** `PremiumPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/premium/page_view.dart)
**Web equivalent:** [premium page](../../../frontend/v1/premium/page.md) — see that doc's own warning:
**this is not a subscription-status page**, it's an RBAC tier-gate demo. Everything in that warning
applies here identically; not repeated in full below.

## ⚠ 7 of this vertical's 8 files were dead code — since deleted

**Resolved by deletion:** the seven dead files below were removed in the cross-stack dead-code pass
(commit `b98fac8a`), closing [MOB-022](../../../issues.md#mob-022) — `lib/views/premium/` now
contains only the live `page_view.dart`. The original analysis is kept for the record.

`lib/views/premium/` contained 8 files. Only **one**, `page_view.dart`, was ever actually reached:

```dart
// router.dart
builder: (_, state) => PremiumPageContent(...)   // from page_view.dart only
```

`PremiumPageContent` wraps a `TierGate` around **four private classes defined inline in the same
file** — `_FreePremiumView`, `_BasicPremiumView`, `_MediumPremiumView`, `_PremiumPremiumView` — plus
its own private `_StatsGrid`/`_GrowthStatsGrid`/`_StatCard`/`_StatsLoadingRow`. The other seven files
(all deleted in `b98fac8a`) — `free_page_view.dart`, `basic_page_view.dart`, `medium_page_view.dart`,
`premium_page_view.dart`, `premium_handlers.dart`, `growth_stats_section.dart`,
`stats_section.dart` — formed a second, complete, independently-built implementation of the exact
same four tier views, and were **never imported by the router or by `page_view.dart`**. Confirmed via a full-repo grep for every
public symbol these seven files export (`FreePremiumPage`, `BasicPremiumPage`, `MediumPremiumPage`,
`PremiumPremiumPage`, `GrowthStatsSection(`, `PremiumStatsSection(`, `exportStatsCSV`,
`refreshPremiumData`) — every match is inside this same dead cluster, referencing itself. This is the
largest single instance (by file count) of this doc effort's recurring "scaffolded, then reimplemented
inline, original left behind" pattern (compare
[CROSS-013](../../../issues.md#cross-013)/[MOB-006](../../../issues.md#mob-006), 2-3 files each) — but,
unlike [MOB-008](../../../issues.md#mob-008), the live and dead versions are functionally equivalent
(same providers, same fields, same bugs — see below), so there's no capability gap between them, just
duplicated, unreachable code. See ⚠ [MOB-022](../../../issues.md#mob-022).

Everything below describes the **live** code only (`page_view.dart`'s inline classes).

## What renders here

Same `TierGate` pattern as every tiered mobile screen:

| Tier | Inline class | What it shows |
|---|---|---|
| Free | `_FreePremiumView` | Static upsell message + button (currently a no-op `onPressed: () {}` — it does not navigate to plans; a real, if minor, gap worth noting even though it's cosmetic) |
| Basic | `_BasicPremiumView` | "Load stats" gate (`_loaded` bool) then `premiumStatsProvider`'s 3-card grid |
| Medium | `_MediumPremiumView` | Both stat grids, auto-fetched |
| Premium | `_PremiumPremiumView` | Both stat grids, auto-fetched, plus a clipboard CSV export |

**Auto-fetch differs from web**: `_MediumPremiumViewState`/`_PremiumPremiumViewState.initState()` call
`ref.invalidate(premiumStatsProvider)` (and `growthStatsProvider` for Premium) inside a
`Future.microtask`, forcing a fetch on first build — [web's equivalent tiers](../../../frontend/v1/premium/page.md#data-loading-by-tier)
require an explicit button press with no auto-fetch anywhere. Both also support pull-to-refresh
(`RefreshIndicator`), which web has no equivalent of (it's not a scrollable list there).

## ⚠ Two growth-stat fields never load real data

`_GrowthStatsGrid` (and its dead twin, `GrowthStatsSection`) renders **"New Subs (Month)"** and
**"Growth Rate"** — but the backend's `growthStats` query has no such fields at all (only `totalUsers`,
`newUsersLast7Days`, `totalPosts`, `totalFriendships` — see
[web's GrowthStatsSection](../../../frontend/v1/premium/components/growth-stats-section.md), which
renders all four *real* fields correctly). `GrowthStats.fromJson`
([`growth_stats.dart`](../../../../flutter-boilerplate/lib/api/server/premium/growth_stats.dart))
silently defaults the nonexistent `newSubscriptionsThisMonth`/`growthRate` JSON keys to `0`/`0.0`
rather than erroring — so these two cards are **permanently stuck at "0" and "0.0%"** for every user
who ever reaches Medium/Premium tier. Meanwhile the two fields the backend *does* provide and the
query *does* fetch — `totalPosts`, `totalFriendships` — are parsed nowhere and never appear in the UI
at all. `newUsersLast7Days` is also mislabeled "New Users (Month)" here despite being a genuine 7-day
window (web's label gets this right). See ⚠ [MOB-023](../../../issues.md#mob-023).

## API

[api.md](./api.md) — both backend queries are called via direct, hand-rolled GraphQL POSTs; no widgets
subfolder for this vertical (no standalone, live widget files — see the dead-code note above).

## Known issues

- ⚠ [MOB-022](../../../issues.md#mob-022) — 7 of 8 files in this vertical are dead code.
- ⚠ [MOB-023](../../../issues.md#mob-023) — "New Subs (Month)"/"Growth Rate" never load real
  data; `totalPosts`/`totalFriendships` are fetched but never shown.
- ⚠ [CROSS-035](../../../issues.md#cross-035) — inherited from the web page (same backend
  queries): this whole vertical is an RBAC tier-gate demo, not subscription status — see
  [premium (web) page.md](../../../frontend/v1/premium/page.md#-this-is-not-a-subscription-statusupsell-page--verify-before-assuming-otherwise).
