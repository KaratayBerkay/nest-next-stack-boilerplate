# Premium (page)

**Route:** `/v1/[lang]/premium` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/premium/page.tsx)
**Mobile equivalent:** [premium screen](../../../mobile/v1/premium/screen.md)

## ⚠ This is not a subscription-status/upsell page — verify before assuming otherwise

Despite its name and its real, permanent slot in the main nav
([`V1Nav.tsx#L34,56`](../../../../next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx), `auth: true`),
this page has nothing to do with the caller's *own* subscription. It is a live demonstration of the
backend's tier-based RBAC mechanism: every tier branch below ultimately calls
[`AdminResolver`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)'s `premiumStats`/
`growthStats` GraphQL queries, whose own source comment states plainly: *"Demonstrates the `@MinTier()`
gate with `SessionAuthGuard`."* Both queries are gated **only** by `@MinTier()` — no `@Roles()` check —
so any authenticated user at the required tier (not just staff) sees aggregate, platform-wide numbers
(total registered users, active users, a synthetic `revenue` figure computed as
`totalUsers * 9.99`, new users in the last 7 days, total posts, total friendships). If you came here
expecting "your plan, your usage, upgrade/downgrade" — that page is
[settings/billing](../settings/billing/page.md); this is a different, unrelated feature that happens to
share the "Premium" name. See ⚠ [CROSS-035](../../../issues.md#cross-035).

## What renders here

Server component. Resolves the session user, then hands off to `getTierView()`, which renders one of
four tier-branch view files based on `user.tier` — same routing convention as every other tiered page
in this codebase (compare
[messages/page.md](../messages/page.md#what-renders-here)):

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | File | What it shows |
|---|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/premium/FreePageView.tsx) | A static upsell message + link to `PRICING_PATH` — the [pricing page](../../pricing/page.md). No data fetch. |
| Basic | [`BasicPageView.tsx`](../../../../next-js-boilerplate/src/views/premium/BasicPageView.tsx) | A "Load stats" button revealing `premiumStats` (total/active users, revenue) once clicked — no auto-fetch on mount. |
| Medium | [`MediumPageView.tsx`](../../../../next-js-boilerplate/src/views/premium/MediumPageView.tsx) | [StatsSection](./components/stats-section.md) + [GrowthStatsSection](./components/growth-stats-section.md), each with its own manual "load" button. |
| Premium | [`PremiumPageView.tsx`](../../../../next-js-boilerplate/src/views/premium/PremiumPageView.tsx) | Same two sections as Medium, plus a client-side CSV export button. |

These four files (plus `BasicPageView`'s inline logic, which doesn't reuse the shared sections at all)
are **not** documented as standalone components — they're tier-branches of this one page, matching the
fold-trivial-tier-views convention used everywhere else in this doc set. `BasicPageView.tsx` duplicates
its own local copy of the stats-loading/rendering logic rather than reusing
[StatsSection](./components/stats-section.md) — a minor, harmless divergence (both render the same
three cards) worth knowing about if you're editing one and expect the other to follow.

## Data loading, by tier

Loading is manual (button-press) everywhere on web — Basic, Medium, and Premium all require an
explicit click before their first fetch, and nothing here ever re-fetches on its own. Contrast
[mobile's equivalent](../../../mobile/v1/premium/screen.md#what-renders-here), which auto-fetches on
mount for Medium/Premium. [`premium-handlers.ts`](../../../../next-js-boilerplate/src/views/premium/premium-handlers.ts)
holds the three handler functions Medium/Premium share (`loadPremiumStats`, `loadPremiumGrowthStats`,
`handleExportPremiumCSV`) — plain async functions taking `Dispatch<SetStateAction<...>>` setters
directly, not a custom hook. `handleExportPremiumCSV` builds a CSV client-side from whatever's already
loaded in state (no re-fetch) and triggers a browser download via an object URL.

## Hooks & API

No dedicated `hooks/premium/` folder — state is local `useState` inside each tier view (see table
above), same pattern as [settings/account](../settings/account/page.md#hooks--api).

- [api.md](./api.md) — the two `api/server/premium/*.ts` files this page calls

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Load stats (Basic+) | [authorization/endpoints.md § Premium stats (demo tier gate)](../../../backend/identity-access/authorization/endpoints.md#premium-stats-demo-tier-gate) |
| Load growth stats (Medium+) | [authorization/endpoints.md § Growth stats (demo tier gate)](../../../backend/identity-access/authorization/endpoints.md#growth-stats-demo-tier-gate) |

Neither query lives in a module this phase or its parallel (billing) owns — both are defined directly
on `AdminResolver` (`src/authorization/`), a Phase 1b-documented module, whose own heading names —
*"Premium stats (**demo tier gate**)"* / *"Growth stats (demo tier gate)"* — already independently
flag the same thing [CROSS-035](../../../issues.md#cross-035) does here. **Resolved post-Phase-5:**
that doc's "Used by" lines for both queries now point here and at
[mobile/v1/premium/screen.md](../../../mobile/v1/premium/screen.md) (mobile's real consumer,
`page_view.dart`, wasn't mentioned there at all before) — this was a placeholder written in
anticipation of exactly this page, reconciled directly once both sides existed.

## Known issues affecting this page

- ⚠ [CROSS-035](../../../issues.md#cross-035) — this page's real purpose (an RBAC tier-gate
  demo, not subscription status) contradicts what its name and nav placement suggest; the two
  underlying queries are tier-gated only, not role-gated, so any sufficiently-paid user (not just
  staff) can read platform-wide aggregate stats.
- See [mobile/v1/premium/screen.md](../../../mobile/v1/premium/screen.md#known-issues) for two
  mobile-only bugs in the equivalent screen (dead code, and permanently-zero stat fields) — this page's
  own web implementation has neither.
