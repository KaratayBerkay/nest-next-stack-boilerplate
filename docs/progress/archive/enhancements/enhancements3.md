# Enhancements 3 — Extract auth surface from demos, wire middleware, close layout & i18n gaps

> Planning tracker, written 2026-07-06. Status: **fully implemented (commits `9daced2` +
> `HEAD`), verified via `pnpm build` (217 pages), `pnpm test` (77/77), `pnpm lint` (0
> errors), `tsc --noEmit` (clean)** — all 8 tasks addressed, with T3 unblocked in a
> second pass via `ClientLocaleProvider` (client-side cookie hydration). T1 implemented
> differently than planned (proxy auto-detected by Next.js 16). Verify-loop items that
> require a running browser are unconfirmed; everything that can be verified statically
> is green.
>
> Scope: the ~48 pages outside `v1/[lang]` and their relationship to the real application.
> The `(demos)` route group has been the project's teaching-explosion room since Phase 1, but
> four of its pages (`/auth/login`, `/auth/register`, `/auth/reset-password`,
> `/auth/verify-email`) are **not teaching aids** — they are the real authentication surface
> of the production application. They sit inside a demo layout, share no locale segment,
> and inherit the root layout's hardcoded English `MessagesProvider`. Meanwhile the
> middleware (`proxy.ts`) that handles locale negotiation / version gating / CSP / dashboard
> protection was never registered as `middleware.ts`, so all of those features are inactive.
> And the Settings → Billing "Upgrade plan" button links to a route that doesn't exist.
>
> This tracker maps every page outside `v1/[lang]`, classifies it as **demo** vs **real**,
> identifies every concrete gap, and proposes a staged fix plan. Decisions D1–D6 set the
> architectural direction; Stage A–D are the implementation tasks.

## Survey — every page outside `v1/[lang]`

Pages are grouped by route group / segment, then classified as **demo** (pure teaching,
no action needed), **real** (production page), or **mixed** (teaching content but on a
real endpoint that real users will hit).

### Root (`/`) — real
- `/` — splash page with Sign in / Register / Chat Room / Messages links. Hardcoded
  English strings, hardcoded `/v1/en/chat-room` and `/v1/en/messages` URLs (should use
  the user's locale).

### `(marketing)` route group — mixed
Layout: `(marketing)/layout.tsx` shows a "Marketing" badge and a paragraph about route
groups being "not part of the URL" — pure teaching chrome.

| Page | Class | Notes |
|------|-------|-------|
| `/about` | demo | Placeholder about page. |
| `/pricing` | **real** | Used by real users to see/upgrade plans. Has its own `getCookieLang()` hack (reads cookie manually) because it lives outside the `v1/[lang]` param-driven locale. |

### `(demos)` route group — see classification per page
Layout: `(demos)/layout.tsx` wraps everything in a "Demos" heading, `AuthStatus`,
`ThemeToggle`, `LangSwitcher`, and `RealtimeProvider`.

| Page | Class | Notes |
|------|-------|-------|
| index `/` | demo | Demo list. |
| `/ssr`, `/csr`, `/static`, `/dynamic`, `/ppr` | demo | Rendering strategy demos. |
| `/data-fetching`, `/request-memoization`, `/caching`, `/server-actions`, `/client-data` | demo | Data demos. |
| `/sse`, `/ws` | demo | Realtime demos. |
| `/ssr-cookies`, `/csr-cookies` | demo | Cookie demos. |
| `/lazy-loading`, `/images`, `/scripts`, `/fonts` | demo | Asset demos. |
| `/search-params`, `/form` | demo | Form/input demos. |
| `/observability`, `/seo`, `/theme` | demo | Feature demos. |
| **`/auth/login`** | **🔴 real** | **Real login page — trapped in demo layout.** |
| **`/auth/register`** | **🔴 real** | **Real registration page — trapped in demo layout.** |
| **`/auth/reset-password`** | **🔴 real** | **Real password-reset page — trapped in demo layout.** |
| **`/auth/verify-email`** | **🔴 real** | **Real email-verification page — trapped in demo layout.** |

### Standalone segments — all demo

| Segment | Pages | Classification |
|---------|-------|---------------|
| `/routing/*` | 11 pages (index, a, b, slow, boom, missing, redirect-*, items/*, metadata-demo/*) | demo — routing teaching examples |
| `/dashboard/*` | 3 pages (+ parallel slots `@team`, `@analytics`) | demo — parallel routes teaching example |
| `/gallery/*` | 4 pages (+ parallel slot `@modal`) | demo — intercepting routes teaching example |
| `/i18n/[lang]/*` | 1 page | demo — i18n teaching example |
| `/security/csp` | 1 page | demo — CSP teaching example |

**Net: 4 real pages trapped inside a 28-page demo shell, zero middleware active, 1 dead link.**

## Findings

### F1. 🔴 Critical — Auth pages live inside `(demos)` layout, not the real app shell

`login-form.tsx:12-14` correctly calls `useMessages("auth")` and every auth form component
uses proper i18n keys. The problem is structural: these pages inherit the `(demos)` layout
(`(demos)/layout.tsx:7-31`) which renders:

```
[Demos heading]
[Side-by-side rendering comparisons.]
[AuthStatus] [ThemeToggle] [LangSwitcher]
─────────────────────────────────────────
  {children} (login/register form)
```

A user navigating to `/auth/login` sees:
1. A "Demos" heading at the top — confusing, this is the real login
2. An `AuthStatus` widget showing whether they're logged in — on the login page itself
3. No locale in the URL — `/auth/login` vs the v1 convention `/v1/{lang}/auth/login`
4. The root layout's `MessagesProvider` — always English (see F2)
5. `RealtimeProvider` wrapping the whole tree — unnecessary for login/register

**Fix:** extract auth pages from `(demos)` into a dedicated `(auth)` route group with
its own minimal centered-card layout, or into `v1/[lang]` with unrestricted access.

### F2. 🔴 Critical — Root layout hardcodes English locale

`layout.tsx:55`: `const messages = getAllMessages<I18nMessages>(DEFAULT_LANG)` — the
root-level `MessagesProvider` always loads English. Every page outside `v1/[lang]`
(including `/auth/login`, `/auth/register`, `/pricing`, `/`) inherits this English-only
context. The `v1/[lang]/layout.tsx:21` overrides it per-locale, but only for routes
inside `v1/[lang]`.

The `proxy.ts` i18n-redirect machinery exists to solve exactly this (resolve locale
from cookie → Accept-Language → default, then enforce it) but was never wired as
`middleware.ts` (see F3).

**Fix:** wire middleware to enforce locale presence on auth routes, or make the root
layout load messages dynamically.

### F3. 🔴 Critical — `proxy.ts` exists but was never registered as `middleware.ts`

`proxy.ts:206-208` exports a `config` matcher with the standard Next.js middleware skip
pattern (`/((?!api|_next/static|_next/image|favicon.ico).*)`), and the file contains a
full `proxy(request)` function with:
- i18n locale negotiation (redirect bare `/i18n` → `/i18n/{locale}`, 404 unknown locales)
- Version gating (redirect unknown version / locale to defaults)
- CSP nonce injection (scoped to `/security/*`)
- Dashboard cookie-presence guard
- Request ID tracking, lang cookie enforcement

But there is **no `middleware.ts`** that imports and exports this. The file sits at
`src/proxy.ts`, not `src/middleware.ts`, so Next.js never calls it. All of the above
is **inactive in production**.

### F4. 🟠 High — Dead link: Settings → Billing "Upgrade plan" points to non-existent route

`settings/billing/views/FreePageView.tsx:56`:
```tsx
href={`/v1/${params?.lang ?? ""}${PRICING_PATH}`}
```
`PRICING_PATH = "/pricing"` (`constants/routes.ts:6`). The resolved URL is
`/v1/en/pricing` — but the pricing page lives in the `(marketing)` route group at
`/pricing` (no version prefix). A user clicking "Upgrade plan" from Settings → Billing
gets a 404 or catch-all miss.

Same pattern duplicated on line 63 for non-FREE tiers (both buttons point to the same
non-existent route).

**Fix:** change the href to `PRICING_PATH` alone (no `/v1/${lang}` prefix), or add locale
as a search param if the destination needs to remember the user's language.

### F5. 🟠 High — Auth pages have no locale in the URL

`constants/routes.ts:1-3`:
```ts
export const LOGIN_PATH = "/auth/login" as const;
export const REGISTER_PATH = "/auth/register" as const;
```
These are locale-agnostic paths. A user on the Turkish (`tr`) version of the app who
clicks "Sign in" is taken to `/auth/login` — which renders in English (root layout's
`DEFAULT_LANG`). The locale is lost on navigation.

The root page (`page.tsx:17-28`) uses `LOGIN_PATH` and `REGISTER_PATH` directly.
The pricing page (`pricing/page.tsx:130`) uses `LOGIN_PATH` for the "Sign in to upgrade"
CTA. Neither carries locale context.

**Fix:** either make auth routes locale-aware (e.g. `/auth/login?lang=tr` or
`/v1/en/auth/login`) or ensure the middleware enforces the lang cookie on every page.

### F6. 🟡 Medium — Root page has hardcoded English strings and hardcoded `/v1/en/` links

`page.tsx:13-39`:
- `<h1>{SITE.name}</h1>` — translatable but not using i18n
- "Sign in", "Register" — hardcoded English
- `href="/v1/en/chat-room"` and `href="/v1/en/messages"` — hardcoded `en`

The two app-entry links should use the resolved locale (from cookie or middleware), not
literally `"en"`.

### F7. 🟡 Medium — Pricing page's `getCookieLang()` is a fragile workaround

`pricing/page.tsx:64-69`:
```tsx
function getCookieLang(): string {
  if (typeof document === "undefined") return DEFAULT_LANG;
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  const val = match?.[1];
  return val && (LANGS as readonly string[]).includes(val) ? val : DEFAULT_LANG;
}
```
This exists because the pricing page (outside `v1/[lang]`) doesn't have access to param-
based locale. It reads the cookie directly — but if `proxy.ts`'s lang-cookie enforcement
is inactive (F3), the cookie may be missing or stale. Works accidentally in the happy
path, unreliable in edge cases.

### F8. 🟡 Medium — Auth pages inherit `RealtimeProvider` unnecessarily

`(demos)/layout.tsx:13` wraps all 28 demo pages (including the 4 auth pages) in
`<RealtimeProvider>`. For auth pages, this means:
- A WebSocket connection is initiated on the login page (wasted, user isn't authenticated)
- `useConversations`/`useNotifications` hooks would fire useless queries
- Bundle includes realtime code on a page that doesn't need it

**Fix:** after extracting auth pages to their own layout (F1), don't include
`RealtimeProvider` in the auth layout.

### F9. 🟡 Medium — `(marketing)` layout is teaching chrome, not a production marketing shell

`(marketing)/layout.tsx:16-24` renders a "Marketing" uppercase badge and an explanation
about route groups. This is useful for teaching but inappropriate for a production
visitor to `/pricing` or `/about`. A real marketing layout would show a proper header
(brand, nav links, CTA) and a footer.

### F10. 🟢 Low — No `Forgot Password` page

The backend has a `requestPasswordReset` mutation and the frontend has an
`/api/auth/request-password-reset` BFF route, but there is **no UI page** where a user
can enter their email to request a reset link. The only password-reset flow requires a
token already in the URL (`/auth/reset-password?token=...`). If a user forgets their
password, they have no way to initiate a reset from the UI — the login form has no
"Forgot password?" link.

### F11. 🔵 Enhancement — Login redirect destination

Login currently redirects to `"/"` (root). A more natural destination for an authenticated
user is `/v1/{lang}/feed` or `/v1/{lang}/messages`. The redirect path should also be
locale-aware.

### F12. 🔵 Enhancement — CSP never extended to real app routes

`proxy.ts:146` scopes the nonce-based CSP to `/security/*` only. The docs/frontend tracking
(decs/frontend/progress/nextjs-feature-checklist.md) logged this as a deliberate trade-off
in the same commit that enabled `cacheComponents: true` (PPR) — a per-request nonce forces
dynamic rendering. With `cacheComponents` now a proven choice, this is worth revisiting:
either the v1 routes also opt into dynamic rendering for CSP, or an alternative protection
(COOP/COEP headers, strict `default-src 'self'`) is applied to the production surface.

## Decisions

- **D1 — Auth pages get their own `(auth)` route group, separate from both `(demos)` and
  `v1/[lang]`.** They are not demos, and they don't belong inside the authenticated v1
  shell (which requires a session — chicken-and-egg for login/register). A dedicated
  `(auth)` route group with a minimal centered-card layout keeps them independent,
  locale-resolvable, and free of the demo chrome / realtime overhead.
  - Path: `/auth/login`, `/auth/register`, `/auth/reset-password`, `/auth/verify-email`
    — same URL paths, different layout.
  - Layout: centered card, brand logo, language switcher, no sidebar, no realtime.
  - Messages: resolved via middleware-set lang cookie, or dynamically in the layout.

- **D2 — Wire `proxy.ts` as `middleware.ts`.** Rename `proxy.ts → middleware.ts` or
  create a thin `middleware.ts` that imports and re-exports `proxy` from `proxy.ts`.
  The `config` matcher export is already correct. This activates locale negotiation,
  version gating, lang cookie enforcement, and CSP for `/security/*` immediately.

- **D3 — Auth routes become locale-aware.** After middleware is active (D2) and the
  lang cookie is guaranteed, auth pages read locale from the cookie (server-side via
  `cookies()` or client-side via `document.cookie`). No URL param needed — the root
  layout's `MessagesProvider` is replaced with one that reads the cookie.

- **D4 — Fix the dead link.** Settings → Billing "Upgrade plan" points to `/pricing`
  (not `/v1/{lang}/pricing`). The `FreePageView.tsx` button href is corrected.

- **D5 — Pricing page is the priority production page outside v1.** It gets the
  `(marketing)` layout improved to a real marketing shell once the auth and middleware
  work is stable. `/about` can stay as-is or get the same shell.

- **D6 — CSP for v1 routes is deferred.** This was deliberately scoped out in the
  `cacheComponents: true` trade-off. Revisit after middleware is live and the build
  can be profiled for PPR compatibility with nonce-based CSP on v1 routes. Tracked
  in the existing checklist (decs/frontend/progress/nextjs-feature-checklist.md).

## Tasks

### Stage A — Middleware activation (prerequisite for everything else)

- [x] **T1 (S) — Activate `proxy.ts` as middleware.**
  **Done — implementation differed from the plan because Next.js 16.2 natively detects
  `src/proxy.ts` as middleware (it's the v16 equivalent of `middleware.ts`).** Creating
  a separate `middleware.ts` that re-exports caused a build error: *"Both middleware file
  and proxy file are detected. Please use proxy.ts only."* The solution: removed
  `middleware.ts`, kept the Edge-compatible `proxy.ts` (removed `node:crypto` / `Buffer`
  imports that fail in Edge runtime). The build output confirms middleware activation:
  `ƒ Proxy (Middleware)` in the route table.
  To verify: access `/v1/fr/feed` without a lang cookie → redirected to `/v1/en/feed`.
  Access `/dashboard` without auth → redirected to `/auth/login`. Access `/i18n/fr` → 404.

### Stage B — Auth route group extraction

- [x] **T2 (M) — Create `(auth)` route group with its own layout.**
  1. `next-js-boilerplate/src/app/(auth)/layout.tsx`:
     ```tsx
     import { containerClass } from "@/constants/site";
     import { ThemeToggle } from "@/components/layout/ThemeToggle";
     import { LangSwitcher } from "@/components/layout/LangSwitcher";

     export default function AuthLayout({ children }: { children: React.ReactNode }) {
       return (
         <main className={`${containerClass} flex min-h-screen flex-col items-center justify-center py-16`}>
           <div className="flex w-full max-w-sm flex-col gap-6">
             <div className="flex items-center justify-between">
               <p className="text-brand text-sm font-semibold tracking-wide uppercase">
                 {SITE.name}
               </p>
               <div className="flex items-center gap-2">
                 <LangSwitcher />
                 <ThemeToggle />
               </div>
             </div>
             <section className="surface flex flex-col gap-4 p-6">
               {children}
             </section>
           </div>
         </main>
       );
     }
     ```
     No `RealtimeProvider`. No `AuthStatus`. Centered card layout matching the
     established project style.
  2. Move `(demos)/auth/login/page.tsx` → `(auth)/login/page.tsx`
  3. Move `(demos)/auth/register/page.tsx` → `(auth)/register/page.tsx`
  4. Move `(demos)/auth/reset-password/page.tsx` → `(auth)/reset-password/page.tsx`
  5. Move `(demos)/auth/verify-email/page.tsx` → `(auth)/verify-email/page.tsx`
  6. Remove the now-empty `(demos)/auth/` directory.
  7. Verify: `/auth/login` no longer shows "Demos" heading, no `AuthStatus` widget,
     no `RealtimeProvider` in the tree. `/auth/login?lang=tr` renders Turkish messages
     (after Stage A middleware is live, or via a T3 fallback).
  *Depends on:* T1 (middleware must be active so lang cookie is guaranteed).

- [x] **T3 (S) — Auth layout loads locale dynamically.**
  **Done via `ClientLocaleProvider` after the initial commit.** The `cookies()` approach
  is blocked by `nextConfig.cacheComponents: true` (PPR), but a client-side hydration
  solution works:
  1. `scripts/generate-i18n-types.ts` was extended to emit aggregated JSON per locale
     (`src/generated/i18n-messages-{en,tr}.json`) for static client-side import.
  2. `src/components/ClientLocaleProvider.tsx` — a `"use client"` component that receives
     the server-default (English) messages as a prop, reads the lang cookie on mount, and
     swaps the `MessagesProvider` to the correct locale. This is safe because the message
     JSON files are small (~292 KB total across both locales) and imported statically.
  3. Integrated in `src/app/layout.tsx`: the root layout passes `getAllMessages(DEFAULT_LANG)`
     to `<ClientLocaleProvider defaultMessages={...}>` instead of rendering
     `<MessagesProvider messages={...}>` directly.
  4. `LangSwitcher` fallback (`localizePathname`): when no locale segment is found in the
     URL (e.g. on `/auth/login`), it now returns the current pathname instead of navigating
     to `/v1/{target}`. The cookie is set, and the next page navigation picks up the new locale.
  The static HTML shell always renders English; after client hydration the correct locale
  messages appear. This pattern follows next-intl's recommended no-routing approach for
  pages without a locale segment.

### Stage C — Fix dead link + root page i18n

- [x] **T4 (S) — Fix Settings → Billing "Upgrade plan" dead link.**
  `settings/billing/views/FreePageView.tsx:56,63`:
  ```diff
  - href={`/v1/${params?.lang ?? ""}${PRICING_PATH}`}
  + href={PRICING_PATH}
  ```
  Both CTA buttons (FREE tier and non-FREE tier) point to the same pricing page —
  the user's locale is already carried by the middleware's lang cookie, so no URL
  locale prefix is needed. Verify: clicking "Upgrade plan" on `/v1/tr/settings/billing`
  lands on `/pricing` (not `/v1/tr/pricing`), and the user sees the Turkish pricing
  page because the lang cookie is `tr`.

- [x] **T5 (M) — Make root page locale-aware.**
  **Done with the same PPR caveat as T3.** Hardcoded English strings replaced with i18n
  keys (`t.signIn`, `t.register`, `t.chatRoom`, `t.messages`). The `href` URLs now use
  `DEFAULT_LANG` instead of literal `"en"`. Full cookie-driven locale resolution is
  blocked by `cacheComponents` — the build error is identical to T3's. The home i18n
  namespace (existing at `messages/{en,tr}/home/messages.json`) is used via
  `getAllMessages(DEFAULT_LANG)`.

- [x] **T6 (S) — Add "Forgot password?" link to login form.**
  `login-form.tsx` — added below the password field, uses `RESET_PASSWORD_PATH` constant
  and `t.form.login.forgotPassword` i18n key. Keys added to both `en`/`tr` auth messages.
  `pnpm generate-i18n-types` run.

### Stage D — Marketing shell + login redirect

- [x] **T7 (M) — Improve `(marketing)` layout for production.**
  Teaching chrome removed. Replaced with brand logo (links to `/`), nav links (Pricing,
  About), and `ThemeToggle` — a clean, production-appropriate header.

- [x] **T8 (S) — Change login redirect to v1 feed.**
  `login-form.tsx:58`: `router.push("/")` → reads lang cookie client-side,
  pushes `"/v1/${lang}/feed"`.

## Verify loop (phase gate)

- [x] `/auth/login` renders without "Demos" heading, without `AuthStatus`, without
  realtime overhead — confirmed statically (route moved out of `(demos)`).
- [ ] `/auth/login` on a Turkish-browser-profile machine renders Turkish labels —
  **Implemented via `ClientLocaleProvider`** — reads the lang cookie on client hydration
  and swaps `MessagesProvider` to Turkish. Static shell shows English until hydration
  completes. Not yet confirmed in a live browser.
- [x] `/auth/register`, `/auth/reset-password`, `/auth/verify-email` all render in
  the new `(auth)` layout — confirmed statically.
- [x] Settings → Billing "Upgrade plan" → lands on `/pricing`, not a 404 —
  confirmed statically (href changed to `PRICING_PATH`).
- [x] Root page shows i18n-sourced strings and `/v1/{lang}/chat-room` links with
  `DEFAULT_LANG` — confirmed statically.
- [x] Login form has "Forgot password?" link → `/auth/reset-password` — confirmed.
- [ ] Login success redirects to `/v1/{lang}/feed` (not `/`) — confirmed at code
  level, not yet in a live browser.
- [ ] `/dashboard` without auth cookie → redirected to `/auth/login` — middleware
  activation confirmed in build output (`ƒ Proxy (Middleware)`), not yet in a
  live browser.
- [ ] `/i18n/fr` → 404, `/i18n` → 307 to `/i18n/{locale}` — middleware activation
  confirmed in build output, not yet in a live browser.
- [x] `pnpm test` green in frontend — 77/77.
- [x] `pnpm lint`/`tsc --noEmit` green.
