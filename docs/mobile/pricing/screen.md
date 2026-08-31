# Pricing (screen)

**Route:** `/pricing` (top-level, not under `/v1/:lang`) · **Router registration:**
[`router.dart#L198-201`](../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `PricingPageContent` in
[`views/pricing/page_content.dart`](../../../flutter-boilerplate/lib/views/pricing/page_content.dart)
**Web equivalent:** [pricing/page.md](../../frontend/pricing/page.md)

## What renders here

Nothing, ever — a 19-line `StatelessWidget` that shows a spinner and, on the first post-frame
callback, calls `context.go('/v1/en/plans')` (language **hardcoded to `'en'`**, not read from any
locale provider). This mirrors web's `(marketing)/pricing/page.tsx`, which does the identical
client-redirect-with-no-content pattern.

## Known issues

- ⚠ `CROSS-029` (resolved) — confirmed to affect mobile too, via a different
  mechanism than web's. `/pricing` itself is **not** gated by the app's global router redirect
  (`router.dart#L176-188` only intercepts routes starting with `/v1` or `/auth`) — a logged-out user
  can open it. But its *target*, `/v1/en/plans`, **is** a `/v1` route, so the same global redirect
  immediately bounces an unauthenticated user to `/auth/login` one hop later. Net effect: identical to
  web — a logged-out visitor who taps "Pricing" never sees plan data, just a login wall — via a
  redirect-into-a-redirect rather than an SSR layout guard. See
  [billing/README.md § Known issues](../../backend/billing-usage/billing/README.md#known-issues) for
  the backend half (the `planPrices` query is also unconditionally session-gated).
- The hardcoded `'en'` in the redirect target means a non-English mobile user briefly lands on the
  English-locale plans route before any locale correction could apply (this repo has an established
  pattern of catching hardcoded-locale bugs, e.g. `FE-008` (resolved)) — not independently
  filed as its own row since the net destination is identical regardless of locale (an auth redirect
  either way for a logged-out user, and `plans/screen.md` itself is locale-aware once reached).
