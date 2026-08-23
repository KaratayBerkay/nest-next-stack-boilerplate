# StatsSection

**Source:** [`StatsSection.tsx`](../../../../../next-js-boilerplate/src/views/premium/StatsSection.tsx)
**Used in:** [premium page](../page.md) (Medium and Premium tiers only — Basic renders an inline
equivalent of its own instead, see [page.md](../page.md#what-renders-here))
**Mobile equivalent:** none — mobile's live implementation is an inline private widget
(`_StatsGrid` in [`page_view.dart`](../../../../mobile/v1/premium/screen.md)), not a standalone file.

## Purpose

Pure, stateless presentation: a "Load stats" (or CSV export) button row plus a 3-card grid (total
users, active users, revenue) once `stats` is non-null. All state and fetching live in the parent tier
view — see [page.md](../page.md).

## Props (`StatsSectionProps`)

| Prop | Purpose |
|---|---|
| `stats` | `PremiumStats \| null` — `{totalUsers, activeUsers, revenue}`, the exact shape [`premiumStats`](../../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts) returns |
| `loadingStats` | disables the button + swaps its label while a fetch is in flight |
| `onLoadStats` | callback, wired by the parent to [`loadPremiumStats`](../api.md#calls) |
| `onExportCSV` | optional — only passed by `PremiumPageView`; renders a second button when present |
| `t` | the `premium` i18n message bundle, threaded through as a prop rather than called via a hook here |

## Calls

None directly — `onLoadStats`/`onExportCSV` are supplied by the parent tier view. See
[page.md § Backend endpoints this page depends on](../page.md#backend-endpoints-this-page-depends-on)
and [api.md](../api.md) for what they resolve to.
