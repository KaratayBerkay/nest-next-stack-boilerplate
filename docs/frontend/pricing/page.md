# Pricing (page)

**Route:** `/pricing` · **Source:** [`page.tsx`](../../../next-js-boilerplate/src/app/(marketing)/pricing/page.tsx)
(real source folder is `src/app/(marketing)/pricing/` — `(marketing)` is a Next.js **route group**,
invisible in the actual URL, dropped from this doc path the same way dynamic `[segments]` are per
[conventions.md §1](../../conventions.md#1-folder-structure-rule))
**Layout:** [`(marketing)/layout.tsx`](../../../next-js-boilerplate/src/app/(marketing)/layout.tsx) —
a genuinely public shell (logo, a "Pricing" nav link, theme toggle), no session check of any kind
**Mobile equivalent:** none — see [§ What this page actually does](#what-this-page-actually-does)

## What this page actually does

Despite `(marketing)` being a real, public, unauthenticated route group (confirmed: its `layout.tsx`
never calls `getSessionUser`/never redirects), **this specific page renders no pricing content of its
own at all.** [`views/pricing/PageContent.tsx`](../../../next-js-boilerplate/src/views/pricing/PageContent.tsx)
is a `"use client"` component whose entire body is:

```ts
useEffect(() => {
  const lang = readLangCookie();
  router.replace(plansPath(lang)); // -> /v1/${lang}/plans
}, [router]);
return null;
```

It reads a language cookie and immediately client-redirects to
[`/v1/{lang}/plans`](../v1/plans/page.md) — the real tier/pricing UI lives there instead. This page
exists purely so `/pricing` (a short, memorable, marketing-friendly URL with no locale segment) has
somewhere to send a visitor before the app knows their `lang`.

## ⚠ This redirect defeats the entire point of a public pricing page

See [CROSS-029](../../issues.md#cross-029) for the full write-up; summarized here since it's
this exact page's own behavior that causes it:

`/v1/{lang}/plans`'s own layout
([`v1/[lang]/layout.tsx`](../../../next-js-boilerplate/src/app/v1/[lang]/layout.tsx)) does, at the
very top of the server component, unconditionally:

```ts
const user = await getSessionUser();
if (!user) redirect(LOGIN_PATH);
```

— with no exception for `/plans` or any other route under `v1/[lang]/**`. `getSessionUser()`
genuinely returns `null` for a visitor with no session (confirmed in
[`lib/auth-ssr.ts`](../../../next-js-boilerplate/src/lib/auth-ssr.ts) — there is no guest/anonymous
fallback object). The practical effect: **a logged-out visitor who clicks "Pricing" — from this
page's own nav link, an ad, a marketing email, organic search — is bounced straight to `/auth/login`
without ever seeing a single price, plan, or feature.** The one route in this entire app whose job is
to be a public acquisition page for people who don't have an account yet is the one route that a
person without an account can never actually see. This isn't mitigated on the backend either: the
GraphQL `planPrices` query the destination page would call is itself behind a class-level
`SessionAuthGuard` with no public exception (see
[backend billing endpoints.md § Get plan prices](../../backend/billing-usage/billing/endpoints.md#get-plan-prices)) —
so even a hypothetical fix that let `/v1/{lang}/plans` render for anonymous visitors would still need
a second, backend-side change before it could show real prices.

There is no mobile equivalent of this page — Flutter has no public/pre-login marketing surface at
all; its [plans screen](../../mobile/v1/plans/screen.md) is reached only from inside the
already-authenticated app shell (see that screen's own routing).

## Backend endpoints this page depends on

None — the redirect fires before any data fetch, and this component never imports anything from
`@/api/`.

## Known issues affecting this page

- ⚠ [CROSS-029](../../issues.md#cross-029) (HIGH) — see above; this page is the frontend half
  of the finding, [`v1/[lang]/layout.tsx`](../../../next-js-boilerplate/src/app/v1/[lang]/layout.tsx)'s
  unconditional auth gate and the backend's `planPrices` guard are the other two parts.
