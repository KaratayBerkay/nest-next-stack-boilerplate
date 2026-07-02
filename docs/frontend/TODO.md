# TODO — Next.js boilerplate development

> Backlog for building the boilerplate. This tracks what's actually in the codebase.
> Updated live during sessions; cross-refs to the [feature checklist](progress/nextjs-feature-checklist.md).
>
> _Last updated: 2026-06-28 (23:30 UTC) — landed **#18 swipe navigation**
> (Ctrl+Shift+mousemove / touch swipe with axis-lock, cancelGesture, page-registry gating)._


**Stats:** 96 e2e + 14 vitest = **110 automated tests**, all green. 1 pre-existing
skip (standalone Docker build needs Docker engine).

## Status board

| # | Workstream | State | Maps to |
| --- | --- | --- | --- |
| 0 | Research + docs scaffolding | ✅ Done | — |
| 1 | Scaffold app + Tailwind v4 + tooling + CI | ✅ Done | F1–F6 |
| 2 | Routing (layouts, nav, dynamic, groups, parallel, intercepting, loading, error, redirect, route handlers, proxy, metadata) | ✅ Done | F7–F17, F19 |
| 3 | Rendering (SSR, CSR, static, dynamic, PPR) | ✅ Done | F20–F24 |
| 4 | Data fetching & caching (server fetch, React.cache, revalidation, Server Actions, ISR, TanStack Query) | ✅ Done | F26–F31 |
| 5 | BFF proxy + httpOnly cookie auth | ✅ Done (`b45d5a0`) | F42–F46 |
| 6 | SSR vs CSR cookie demos (headline feature) | ✅ Done (`b45d5a0`) | F42, F21, F20 |
| 7 | SSE — Server-Sent Events | ✅ Done | F47 |
| 8 | WebSocket consumed from NestJS gateway | ✅ Done | F48 |
| 9 | Optimizing (images, fonts, scripts, lazy loading) | ✅ Done (`1ea2b79`,`b17b3c3`,`4a57024`,`a92f978`) | F49–F52 |
| 10 | Configuring & ops (standalone build, deploy) | ✅ Done (`c5ef415`) | F56 |
| 11 | Security (CSP nonce + `server-only` data-security) | ✅ Done | F25 (#59, #60) |
| 12 | Instrumentation + OpenTelemetry _(optional)_ | ✅ Done | F33 |
| 13 | Internationalization (locale routing, dictionaries, negotiation) | ✅ Done | F18 (#18) |
| 14 | SEO (sitemap, robots.txt, JSON-LD structured data) | ✅ Done | — |
| 15 | Theme (dark/light mode toggle with localStorage persistence) | ✅ Done | — |
| 16 | Real auth (NestJS GraphQL: login/register/logout/refresh/me via BFF) | ✅ Done | F42–F46 |
| 17 | Theme cookie persistence (localStorage → cookie + ThemeInitScript) | ✅ Done | — |

---

## 16. Real auth (#16)

**Goal:** replace mock cookie auth with real NestJS GraphQL-backed authentication.
BFF Route Handlers proxy `login`, `register`, `logout`, `refresh`, and `me`
mutations/queries to the NestJS backend. Access token stored in non-httpOnly cookie
(accessible to client JS); refresh token proxied from NestJS as httpOnly cookie.

**Tasks**
- [x] `/api/auth/login` — POST, calls GraphQL `login` mutation, sets `access_token` cookie, forwards `refresh_token`
- [x] `/api/auth/register` — POST, calls GraphQL `register` mutation
- [x] `/api/auth/logout` — POST, calls GraphQL `logout`, clears cookies
- [x] `/api/auth/refresh` — POST, calls GraphQL `refresh` mutation, updates cookies
- [x] `/api/auth/me` — GET, reads `access_token` cookie, calls GraphQL `me` query
- [x] `useAuth` hook + `AuthProvider` context wired into root layout
- [x] `/auth/login` page — email/password form with error display, links to register
- [x] `/auth/register` page — name/email/password/repeat-password form, links to login
- [x] `AuthStatus` component — shows Sign In / user email / Sign Out in demos header
- [x] `src/lib/backend.ts` — `graphqlFetch` helper for BFF → NestJS GraphQL calls
- [x] `src/lib/cookie.ts` — typed cookie options helpers (`accessTokenCookieOptions`, etc.)

**Tasks (future — requires running NestJS backend)**
- [ ] e2e: register → login → me → logout round-trip
- [ ] e2e: access_token refresh flow
- [ ] e2e: protected route redirect when unauthenticated
- [ ] e2e: logout clears both cookies

## 18. Swipe navigation gesture

**Goal:** Ctrl+Shift+mousemove and touch swipe navigation with page-registry chain.

**Tasks**
- [x] Ctrl+Shift+mousemode gesture (right=back, left=forward)
- [x] Touch swipe with axis-lock detection (2:1 horizontal ratio)
- [x] `enableSwipe` flag in page registry (only `users-detail` enabled)
- [x] `cancelGesture` — click outside resets gesture state without navigating
- [x] Immediate navigation on gesture completion (no 2-second hold)
- [x] Grab/grabbing cursor changes in keyboard mode
- [x] Bigger finger icon + "Click to cancel" hint in overlay

## 17. Theme cookie persistence (#17)

**Goal:** persist dark/light theme preference in a cookie instead of localStorage,
so the server can read it and the client avoids flash on reload. Anti-flash
`<script>` in `public/scripts/theme-init.js` loads before hydration via
`next/script` `beforeInteractive`.

**Tasks**
- [x] `ThemeProvider` + `useTheme` hook — read/write `theme` cookie
- [x] `ThemeToggle` component — button cycle (system → light → dark)
- [x] `ThemeInitScript` — loads from `public/scripts/theme-init.js`, no `dangerouslySetInnerHTML`
- [x] Root layout wraps `<ThemeProvider>` → `<AuthProvider>` → `<QueryProvider>`
- [x] Cookie `SameSite=Lax; Path=/; Max-Age=31536000` — persists across sessions
- [x] System preference fallback via `matchMedia('(prefers-color-scheme: dark)')`
- [x] `e2e/theme.spec.ts` — 6 tests: default, toggle, setTheme, persist, class, visibility

---

## 13. Internationalization (#18)

**Goal:** prove the Next.js Internationalization guide — a `[lang]` dynamic
segment, server-side dictionaries, and `Accept-Language` negotiation — works in
2026 under `cacheComponents`. Scoped to its own `/i18n` segment (like `/security`)
so the rest of the app isn't locale-prefixed and no existing tests change.

**Tasks**
- [x] Locale config + `Accept-Language` negotiation (`src/lib/i18n/config.ts`, `matchLocale`)
- [x] Server-only per-locale dictionaries (en/tr/de JSON, code-split via `import()`)
- [x] `/i18n/[lang]` page (`generateStaticParams` → static PPR pages) + `generateMetadata` per locale
- [x] `<Link>`-based `LocaleSwitcher` (server component, server-computed active state)
- [x] `proxy.ts`: bare `/i18n` → 307 to negotiated locale; `/i18n/{unsupported}` → 404

**Proof:** `e2e/i18n.spec.ts` (5) + `src/lib/i18n/config.test.ts` (5), all green.
**Gotcha logged (#18):** `dynamicParams` is incompatible with `cacheComponents`;
`notFound()` in a streamed Suspense hole can't 404 — so locale gating lives in the proxy.

## 4. Data fetching & caching

**Goal:** demonstrate idiomatic Next.js 16 data access — server-side `fetch` in RSC, `React.cache` for dedup, revalidation, Server Actions, ISR, and client-side TanStack Query.

**Tasks**
- [x] F20 — SSR demo (`getServerData()` in RSC, timestamp in HTML)
- [x] F21 — CSR demo (`"use client"`, fetch after hydration, loading state)
- [x] F22 — Static rendering (default caching, build-time timestamp)
- [x] F23 — Dynamic rendering (`connection()` + `<Suspense>` for per-request timestamp)
- [x] F24 — Partial Prerendering (`cacheComponents: true`, static shell + streaming greeting)
- [x] F26 — Server data fetching (`fetch` in RSC from Route Handler)
- [x] F27 — Request memoization (`React.cache`)
- [x] F28 — Caching & revalidating (`revalidatePath`, `revalidateTag`)
- [x] F29 — Server Actions & Forms (`"use server"`, `useActionState`)
- [x] F30 — Client data (TanStack Query against BFF)
- [x] F31 — Incremental Static Regeneration (ISR)
- [x] F32 — Forms (TanStack Form + Zod: field-level client validation + `createServerValidate`/`mergeForm` server validation)

**Proof:** each feature lands with its e2e or unit test; **85 tests** (71 e2e + 14 vitest) all green.
