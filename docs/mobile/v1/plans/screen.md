# Plans (screen)

**Route:** `/v1/:lang/plans` (GoRouter name `v1Plans`)
**Router registration:** [`router.dart#L327-L333`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => PlansPageContent(lang: state.pathParameters['lang'] ?? 'en')`
**Entry widget:** `PlansPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/plans/page_content.dart) (1 file — the
whole screen, including the private `_PlanCard` widget, lives here; no `widgets/` folder exists or is
needed for this vertical)
**Web equivalent:** [plans page](../../../frontend/v1/plans/page.md)

Unlike web, Flutter has **no unauthenticated marketing entry point** at all — there is no mobile
counterpart to web's [`/pricing` redirect page](../../../frontend/pricing/page.md). This screen is
reached only from inside the already-authenticated app shell (e.g. a nav link, or a
[`TierGate`](../../../conventions.md) upsell prompt elsewhere in the app), never as a pre-login
landing page.

## What renders here

`ConsumerWidget` rendering 4 `_PlanCard`s (FREE/BASIC/MEDIUM/PREMIUM), laid out as a vertical column
on narrow widths (`< 768`) or a horizontally-scrolling row otherwise — a deliberate, explicitly
commented adaptation of web's CSS-grid breakpoint (`sm:grid-cols-2 lg:grid-cols-4`) into something
that doesn't hide cards off-screen with no scroll cue on a real phone width.

### Real vs. placeholder price data

Mirrors web's plans page exactly, and says so in its own source comment: `priceFor(tier,
placeholder)` reads `planPricesProvider` (a `FutureProvider` wrapping the
live `planPrices` GraphQL query — see [api.md](./api.md)) and falls back to a static ARB string
(`t.pricingPriceFree`/`pricingPriceBasic`/`pricingPriceMedium`/`pricingPricePremium`, all USD-only,
stale) only until that query resolves. Same "same-shape loading placeholder, not a fallback source of
truth" pattern as [web's `TIER_PRICES_CENTS`](../../../frontend/v1/plans/page.md#real-vs-placeholder-data)
— confirmed **not** a duplicated-source-of-truth drift risk for price specifically, on either
platform.

### ⚠ Feature copy is hardcoded, unlocalized, and a fourth independent source

Unlike price, each `_PlanCard`'s feature list is a plain Dart `const [...]` literal built directly
into `buildCards()` — e.g. BASIC's is `['Enhanced feed', '50 messages/day', '3 devices', 'Basic
stats']`. Not routed through `AppLocalizations` at all (always English, regardless of device locale),
and textually unrelated to either of web's two independent feature-copy sources (the
[plans page](../../../frontend/v1/plans/page.md)'s i18n bundle or
[checkout](../../../frontend/v1/checkout/page.md)'s `TIER_FEATURES` constant) — mobile's own copy
emphasizes concrete product mechanics (message quota, device count, feed tier) that neither web
source mentions at all. See [CROSS-031](../../../issues.md#cross-031) for the full cross-app
picture (now 4 independently-maintained sources of "what does tier X include," counting both of
web's).

### Tier state

`userTierProvider` ([`hooks/use_auth.dart`](../../../../flutter-boilerplate/lib/hooks/use_auth.dart),
cross-cutting, not plans-specific) drives `isCurrent`/`included` per card — no `mySubscription` query
is called from this screen at all (contrast web, which reads it for the pending-change banner); this
screen has **no pending-change banner or indicator whatsoever**. A user with a scheduled paid↔paid
change sees no signal of that on this screen (only on `settings/billing`, Phase 4b) — worth a look
next time this screen is touched, though out of scope to fix here.

## API

[api.md](./api.md) — every call in this vertical is **direct GraphQL to the backend**, zero Next.js
BFF involvement (this app has no Next.js layer to involve in the first place — mobile talks to the
NestJS backend only).

## Known issues affecting this screen

- ⚠ [CROSS-031](../../../issues.md#cross-031) (MED) — see above.
- ⚠ `CROSS-032` (resolved) (MED) — `userTierProvider` (the value this
  screen's "Current Plan"/"Included" badges are computed from) never updates live from the
  `tier-changed` WS frame the backend pushes on a tier change — this app has no handler for that
  frame anywhere (see
  [backend billing/README.md § Making a tier change take effect immediately](../../../backend/billing-usage/billing/README.md#making-a-tier-change-take-effect-immediately)).
  A tier changed elsewhere (another device, an admin action, a scheduled change reconciling) while
  this screen is open would show stale badges until the next full session refresh.
