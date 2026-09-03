# About (screen)

**Route:** `/about` (top-level, not under `/v1/:lang`) · **Router registration:**
[`router.dart#L202-206`](../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `AboutPageContent` in
[`views/about/page_content.dart`](../../../flutter-boilerplate/lib/views/about/page_content.dart)
**Web equivalent:** [about/page.md](../../frontend/about/page.md) — **not a like-for-like port**, see
below.

## What renders here

Unlike web's minimal one-sentence page, mobile's About is a genuinely built, detailed static screen: an
app-bar titled page with a `ListView` of cards covering **Tech Stack** (Flutter 3.x, Riverpod 3.x,
GoRouter 17.x, Dio, Stripe, WebSocket, JWT + Secure Storage), **Architecture** (a paragraph describing
the page-by-page port of the Next.js app, the two-layer API pattern, `TierGate`, and "114+ route
definitions"), and **Features** (a 12-item checklist spanning auth, tier gating, billing, realtime,
admin panel, audit logs, premium analytics, forms, UI demos, settings, and theming). All content is
hardcoded in-widget — no data fetch, no session dependency, reachable whether logged in or not (this
route isn't under the `/v1` or `/auth` prefixes the global router redirect intercepts).

## ⚠ No in-app nav link reaches this screen either

Same gap as web, independently confirmed: `grep -n "about" lib/views/v1/v1_nav.dart` (mobile's
authenticated-shell nav) returns nothing, and no other screen constructs a route/link to `/about`.
Reachable only via direct deep link or the app's own `GoRouter` route table — not through normal
in-app navigation on either platform. See `CROSS-038` (resolved).

## Backend endpoints this screen depends on

None.

## Known issues affecting this screen

- `CROSS-038` (resolved) — no discoverable nav entry point on either platform (see above).
