# PLAN — Implement every Next.js docs feature, one commit at a time

> Source of truth: the live **Next.js 16 App Router docs** at <https://nextjs.org/docs>
> (Getting Started → Guides → API Reference), read 2026-06-28 (docs version 16.2.x).
> This file is the **step-by-step build guide**: we implement features in dependency
> order, **one feature per commit**, prove each with a test, then **push**.
>
> Companion docs: [STATUS.md](STATUS.md) · [TODO.md](TODO.md) ·
> [feature checklist/mapping](progress/nextjs-feature-checklist.md) ·
> [git-workflow.md](git-workflow.md). Update the checklist + STATUS as each feature lands.

## How we work (the loop)

For **every feature unit** `F#` below:
1. **Read the docs page** linked in the unit (don't paste from memory).
2. **Implement** it as a real route/module under `src/`.
3. **Prove it** with a test (Playwright e2e or Vitest unit/component). Building ≠ working.
4. **Update** the [checklist](progress/nextjs-feature-checklist.md) (⬜→🧪) + STATUS, and log any 2026 docs discrepancy (⚠️).
5. **Commit** with the unit's Conventional-Commit message, then **push**.

**Git flow:** one feature = one commit on `main`, pushed immediately (`git push`). _(Optional
stricter flow: `git switch -c feat/<slug>` → commit → `git push -u origin feat/<slug>` →
merge. Use it if you want PR review; otherwise commit straight to `main`.)_ Hooks
(husky/lint-staged/commitlint, landed in F6) enforce format + message on every commit.

**Decisions that shape implementation** (see [progress/README.md](progress/README.md)):
pnpm · Next 16 (Turbopack, `proxy.ts`) · React 19.2 · Tailwind v4 · TypeScript strict ·
**BFF proxy** to NestJS · **WebSocket consumed from NestJS** · TanStack Query (client) ·
Vitest + Playwright. Backend: [`../../nest-js`](../../nest-js).

**Legend:** each unit lists **Docs**, **Goal**, **Steps**, **Proof**, **Commit**.
Units marked _(optional)_ are nice-to-have; _(out of scope)_ are intentionally skipped
(logged in the checklist).

---

# Stage 0 — Foundation

### F1. Installation / scaffold
- **Docs:** /docs/app/getting-started/installation
- **Goal:** a booting Next 16 app on Turbopack, preserving the existing repo.
- **Steps:** ① `pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm` ② keep `README.md`; re-merge our `docs/` + `.env*` rules into the generated `.gitignore` ③ `pnpm dev` to confirm boot.
- **Proof:** Playwright e2e GET `/` → 200; dev server starts clean.
- **Commit:** `chore: scaffold Next.js 16 app (App Router, src/, pnpm)`

### F2. Project structure
- **Docs:** /docs/app/getting-started/project-structure
- **Goal:** feature-driven `src/` layout with import boundaries.
- **Steps:** ① create `src/{app,features,shared,hooks,lib,types}` ② add barrel `index.ts` per feature ③ ESLint rule/note for dependency direction (features→shared/lib, not reverse).
- **Proof:** lint passes; a smoke import across layers resolves via `@/*`.
- **Commit:** `chore: establish feature-driven src/ structure`

### F3. CSS — Tailwind v4
- **Docs:** /docs/app/getting-started/css (+ /docs/app/getting-started/css#tailwind)
- **Goal:** Tailwind v4 CSS-first pipeline working; CSS Modules + Global CSS demonstrated.
- **Steps:** ① `globals.css`: `@import "tailwindcss";` + `@theme { … }`; remove any `tailwind.config.js` ② add one CSS Module + one global rule as examples ③ install `prettier-plugin-tailwindcss`.
- **Proof:** e2e asserts a utility-styled element has the expected computed style.
- **Commit:** `feat(styling): tailwind v4 + css modules + global css`

### F4. Environment variables
- **Docs:** /docs/app/guides/environment-variables
- **Goal:** typed, validated env (server vs `NEXT_PUBLIC_`).
- **Steps:** ① `src/lib/env.ts` zod schema (`BACKEND_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_APP_URL`) ② fail-fast on boot ③ commit `.env.example`.
- **Proof:** unit — missing required var throws; `NEXT_PUBLIC_*` reaches the client, server-only does not.
- **Commit:** `feat(config): zod-validated environment variables`

### F5. Testing harness
- **Docs:** /docs/app/guides/testing (Vitest + Playwright sections)
- **Goal:** the verification backbone for every later feature.
- **Steps:** ① Vitest + React Testing Library (`vitest.config.ts`) ② Playwright (`playwright.config.ts`, `e2e/`) ③ scripts `test`, `test:e2e`; a trivial passing test of each kind.
- **Proof:** `pnpm test` and `pnpm test:e2e` both green.
- **Commit:** `test: set up vitest + playwright harness`

### F6. Tooling — lint/format + git hooks + CI
- **Docs:** /docs/app/getting-started/installation (ESLint) + git-workflow.md
- **Goal:** clean-tree enforcement and CI.
- **Steps:** ① ESLint flat config + Prettier; scripts `lint`/`format`/`typecheck` ② Husky + lint-staged (pre-commit) + commitlint; pre-push `typecheck` ③ GitHub Actions: install→typecheck→lint→build→test.
- **Proof:** a bad commit message is rejected; CI green.
- **Commit:** `chore: eslint/prettier, husky+commitlint, CI`

---

# Stage 1 — Routing & navigation

### F7. Layouts and pages
- **Docs:** /docs/app/getting-started/layouts-and-pages
- **Goal:** root layout + nested layouts + pages.
- **Steps:** ① `app/layout.tsx` (html/body, fonts later) ② a nested segment layout that persists ③ a couple of pages.
- **Proof:** e2e — nested layout DOM persists across navigation between its child pages.
- **Commit:** `feat(routing): root + nested layouts and pages`

### F8. Linking and navigating
- **Docs:** /docs/app/getting-started/linking-and-navigating
- **Goal:** `<Link>` client nav, prefetching, `useRouter`.
- **Steps:** ① nav with `<Link>` ② programmatic `useRouter().push` ③ note prefetch behavior.
- **Proof:** e2e — navigation happens without a full document reload (no white flash / same JS context).
- **Commit:** `feat(routing): link + client-side navigation`

### F9. Dynamic routes
- **Docs:** /docs/app/api-reference/file-conventions/dynamic-routes
- **Goal:** `[id]`, catch-all `[...slug]`, async `params`.
- **Steps:** ① `app/.../[id]/page.tsx` awaiting `params` ② a catch-all route ③ `generateStaticParams` example.
- **Proof:** e2e — param value is reflected in the rendered output for two ids.
- **Commit:** `feat(routing): dynamic + catch-all routes (async params)`

### F10. Route groups, parallel & intercepting routes
- **Docs:** route-groups · parallel-routes · intercepting-routes (file-conventions)
- **Goal:** advanced routing patterns.
- **Steps:** ① `(demos)` group (no URL impact) ② a `@slot` parallel layout (e.g. dashboard) ③ an intercepting `(.)` modal.
- **Proof:** e2e — group URL unaffected; two parallel slots render; intercepted modal vs hard-nav full page.
- **Commit:** `feat(routing): route groups, parallel + intercepting routes`

### F11. Error handling
- **Docs:** /docs/app/getting-started/error-handling
- **Goal:** `error.tsx`, `global-error.tsx`, `not-found.tsx`.
- **Steps:** ① segment `error.tsx` with reset ② `not-found.tsx` + `notFound()` ③ a deliberately-throwing demo.
- **Proof:** e2e — thrown error renders the boundary with a working retry; unknown route → not-found.
- **Commit:** `feat(routing): error + not-found boundaries`

### F12. Route Handlers
- **Docs:** /docs/app/getting-started/route-handlers
- **Goal:** Web-standard `route.ts` API endpoints (basis for the BFF).
- **Steps:** ① `app/api/health/route.ts` (GET) ② a POST handler reading JSON ③ Request/Response + status codes.
- **Proof:** e2e — GET returns JSON 200; POST round-trips a body.
- **Commit:** `feat(api): route handlers (GET/POST)`

### F13. Proxy (Next 16 middleware)
- **Docs:** /docs/app/getting-started/proxy
- **Goal:** `proxy.ts` for request gating (replaces `middleware.ts`).
- **Steps:** ① `src/proxy.ts` (not root — must be inside `src/` when using `src/` directory) with `export function proxy` (not `middleware`) ② `matcher` to exclude `/api` and static assets ③ legacy redirect demo ④ note the v16 rename ⚠️.
- **Proof:** e2e — `x-proxy` header on matched routes; `/old-about` 308 → `/about`; `/api` routes excluded by matcher.
- **Commit:** `feat(routing): proxy.ts request gating (F17)` → `fee6654`

### F14. Redirecting
- **Docs:** /docs/app/guides/redirecting
- **Goal:** `redirect`, `permanentRedirect`, `next.config` redirects.
- **Steps:** ① `redirect()` in a server action/handler ② a config-level redirect ③ note 307 vs 308.
- **Proof:** e2e — asserts redirect status + `Location`.
- **Commit:** `feat(routing): redirect helpers + config redirects`

---

# Stage 2 — Rendering & components

### F15. Server and Client Components
- **Docs:** /docs/app/getting-started/server-and-client-components
- **Goal:** RSC by default; `"use client"` boundaries; composition patterns.
- **Steps:** ① a server component fetching on the server ② a client island ③ pass server data into a client child as props.
- **Proof:** e2e — server-only data appears in initial HTML; client island is interactive after hydration.
- **Commit:** `feat(rendering): server + client component composition`

### F16. SSR vs CSR demo (headline)
- **Docs:** server-and-client-components + rendering-philosophy
- **Goal:** the side-by-side rendering contrast (foundation for the cookie demo, F23).
- **Steps:** ① `(demos)/ssr` page renders data in HTML ② `(demos)/csr` page (`"use client"`) fetches after mount ③ explainer panel.
- **Proof:** e2e — SSR data present in initial HTML; CSR data absent initially, then populated.
- **Commit:** `feat(rendering): ssr vs csr demo pages`

### F17. Static, dynamic & rendering philosophy
- **Docs:** /docs/app/guides/rendering-philosophy (+ public-static-pages)
- **Goal:** show static (cached) vs `force-dynamic` per-request.
- **Steps:** ① a static page ② a `dynamic = "force-dynamic"` page showing a timestamp ③ note the spectrum.
- **Proof:** e2e — static page byte-stable across requests; dynamic page changes each request.
- **Commit:** `feat(rendering): static vs dynamic rendering`

### F18. Streaming & loading UI
- **Docs:** /docs/app/guides/streaming (+ loading.tsx convention)
- **Goal:** `loading.tsx` + `<Suspense>` progressive rendering.
- **Steps:** ① a slow server component wrapped in `<Suspense>` ② segment `loading.tsx` ③ fast shell + streamed hole.
- **Proof:** e2e — fallback shows first, then streamed content replaces it.
- **Commit:** `feat(rendering): streaming + loading UI`

### F19. PPR / View transitions / Preserving UI state _(optional, 2026)_
- **Docs:** rendering-philosophy (PPR) · view-transitions · preserving-ui-state
- **Goal:** modern Next 16 / React 19.2 rendering niceties.
- **Steps:** ① enable PPR on one route (static shell + dynamic hole) ② a `<ViewTransition>` nav ③ Activity-based state preservation.
- **Proof:** e2e — shell static while hole streams; transition runs; state survives nav.
- **Commit:** `feat(rendering): PPR + view transitions + activity state`

---

# Stage 3 — Data fetching, mutations & caching

### F20. Fetching data
- **Docs:** /docs/app/getting-started/fetching-data
- **Goal:** server `fetch` + `React.cache`; client fetching with TanStack Query.
- **Steps:** ① server component `fetch` (through `lib/backend.ts`) ② `React.cache` dedup helper ③ TanStack Query provider + `useApi` for CSR.
- **Proof:** unit — identical server fetch deduped in one render; e2e — CSR list loads/caches.
- **Commit:** `feat(data): server fetch + React.cache + tanstack query`

### F21. Mutating data — Server Actions & Forms
- **Docs:** mutating-data · /docs/app/guides/forms · /docs/app/guides/server-actions
- **Goal:** Server Functions/Actions with `useActionState`/`useFormStatus` (no manual POST route).
- **Steps:** ① a `"use server"` action ② a form bound to it with pending UI ③ `revalidatePath` after mutate.
- **Proof:** e2e — form submit mutates + shows pending → success; list reflects change.
- **Commit:** `feat(data): server actions + forms with pending state`

### F22. Caching & revalidating + ISR
- **Docs:** caching · revalidating · how-revalidation-works · incremental-static-regeneration
- **Goal:** time-based + on-demand revalidation; ISR.
- **Steps:** ① `revalidate` segment option ② tag-based `revalidateTag` via an action ③ an ISR page.
- **Proof:** e2e — stale content updates after revalidation trigger; ISR page regenerates.
- **Commit:** `feat(data): caching, revalidation tags + ISR`

---

# Stage 4 — Backend integration & cookies (the core)

### F23. BFF proxy + httpOnly cookie auth
- **Docs:** backend-for-frontend · authentication · data-security
- **Goal:** browser ↔ Next.js BFF ↔ NestJS; Next owns the httpOnly cookies.
- **Steps:** ① `lib/backend.ts` forwards `cookies()` to `BACKEND_URL`, relays `Set-Cookie` ② `app/api/proxy/[...path]/route.ts` generic passthrough ③ `app/api/auth/{login,logout,me}` with secure-by-env cookie options ④ wire `proxy.ts` gate (F13).
- **Proof:** e2e — login sets an httpOnly cookie (not readable by `document.cookie`); authed proxied call returns NestJS data; logout clears + `me` 401s.
- **Commit:** `feat(auth): BFF proxy + httpOnly cookie auth against NestJS`

### F24. SSR vs CSR **cookies** demo (the headline test)
- **Docs:** authentication (reading sessions) + server-and-client-components
- **Goal:** prove the server/client cookie-access difference end-to-end.
- **Steps:** ① `(demos)/ssr-cookies` reads session via `cookies()` and renders user data server-side ② `(demos)/csr-cookies` shows it must call `/api/auth/me` (can't read httpOnly) ③ contrast panel.
- **Proof:** e2e — for an authed session, SSR initial HTML contains user data; CSR initial HTML does not, then populates after `me`.
- **Commit:** `feat(demos): SSR vs CSR cookie behavior`

### F25. Content Security Policy + data security
- **Docs:** content-security-policy · data-security
- **Goal:** CSP via `proxy.ts` nonce; taint/`server-only` guardrails.
- **Steps:** ① CSP header + nonce in `proxy.ts` ② `server-only` import on secret modules ③ note tainting APIs.
- **Proof:** e2e — response carries CSP header with a per-request nonce; a server-only import fails if used on the client.
- **Commit:** `feat(security): CSP nonce + data-security guardrails`

---

# Stage 5 — Real-time

### F26. Server-Sent Events
- **Docs:** route-handlers (streaming) + /docs/app/guides/streaming
- **Goal:** SSE via Route Handler `ReadableStream`, consumed by a hook.
- **Steps:** ① `app/api/sse/route.ts` emitting `text/event-stream` ② `hooks/useSSE.ts` (EventSource lifecycle + cleanup) ③ `(demos)/sse` live feed.
- **Proof:** e2e — page receives ≥N live events; connection closes on unmount.
- **Commit:** `feat(realtime): SSE route handler + useSSE`

### F27. WebSocket consumed from NestJS
- **Docs:** custom-server (why Next won't serve WS) → we consume NestJS instead
- **Goal:** browser connects directly to the NestJS WS gateway.
- **Steps:** ① `hooks/useWebSocket.ts` (native WS / socket.io-client to `NEXT_PUBLIC_WS_URL`, reconnect/backoff, cleanup) ② `(demos)/ws` connect/send/echo + status ③ decide + document cross-origin WS auth.
- **Proof:** e2e — connects, round-trips a message, shows "connected", reconnects after a drop.
- **Commit:** `feat(realtime): websocket client consuming NestJS gateway`

---

# Stage 6 — Optimizing

### F28. Image optimization
- **Docs:** /docs/app/getting-started/images
- **Goal:** `next/image` (local + remote, `sizes`, priority).
- **Steps:** ① local image with width/height ② remote image (configure `remotePatterns`) ③ responsive `sizes`.
- **Proof:** e2e — renders an optimized `<img>` with `srcset`; no CLS on the priority image.
- **Commit:** `feat(perf): next/image optimization`

### F29. Font optimization
- **Docs:** /docs/app/getting-started/fonts
- **Goal:** `next/font` self-hosted, no layout shift.
- **Steps:** ① load a Google font via `next/font/google` in the root layout ② apply via CSS variable ③ a local font example.
- **Proof:** e2e — font-family applied; no external font request at runtime.
- **Commit:** `feat(perf): next/font optimization`

### F30. Metadata & OG images
- **Docs:** /docs/app/getting-started/metadata-and-og-images (+ json-ld)
- **Goal:** static + dynamic metadata, OG image, JSON-LD.
- **Steps:** ① root layout title template (`%s — Next.js Boilerplate`) ② static `metadata` export on a demo page ③ dynamic `generateMetadata` based on route params ④ OG tags.
- **Proof:** e2e — root default title; static page title + OG tags; dynamic `generateMetadata` per slug.
- **Commit:** `feat(seo): static + dynamic metadata with generateMetadata (F19)` → `037dafd`

### F31. Scripts, lazy loading & bundling _(optional)_
- **Docs:** scripts · lazy-loading · package-bundling · third-party-libraries
- **Goal:** `next/script`, `next/dynamic`, bundle analyzer, `@next/third-parties`.
- **Steps:** ① `next/script` strategy demo ② `next/dynamic` lazy component ③ wire bundle analyzer script.
- **Proof:** e2e — lazy chunk loads on demand; analyzer runs in CI artifact.
- **Commit:** `feat(perf): scripts, lazy loading + bundle analysis`

---

# Stage 7 — Production & ops

### F32. Deploying / self-hosting
- **Docs:** deploying · self-hosting (Node + Docker, `output: standalone`)
- **Goal:** self-hostable production build (not Vercel-locked; keeps SSE/WS viable).
- **Steps:** ① `output: "standalone"` in `next.config.ts` ② multi-stage `Dockerfile` (non-root) ③ wire into `docker-compose` with the NestJS backend.
- **Proof:** prod image boots and serves `/`, an API route, and a demo page against live NestJS.
- **Commit:** `feat(ops): standalone build + production Dockerfile`

### F33. Production checklist + instrumentation _(optional)_
- **Docs:** production-checklist · instrumentation · open-telemetry
- **Goal:** observability + production hardening pass.
- **Steps:** ① `instrumentation.ts` startup hook ② OpenTelemetry traces ③ walk the production checklist.
- **Proof:** e2e/manual — startup hook runs; a trace is exported.
- **Commit:** `feat(ops): instrumentation + otel + production hardening`

---

# Out of scope for v1 (logged, may revisit)

Skipped intentionally — niche or not aligned with this boilerplate's goal (each ⏭️ in the
checklist with a one-line reason): **Internationalization** _(optional)_, Analytics/Speed
Insights (Vercel), Multi-zones, Multi-tenant, PWAs, MDX, Sass, CSS-in-JS, Draft Mode,
SPAs / Static Exports (we want a server for SSR/SSE), AI Coding Agents, Next.js MCP
Server, Videos, Migrating-from-X, CDN/CI build caching, Memory Usage, Preventing Flash.
Promote any of these to an `F##` unit if needed later.

---

# Progress tracker (one row per commit)

> Tick as each feature is committed + pushed. Mirrors the
> [checklist](progress/nextjs-feature-checklist.md) (which carries the test proof).

| F# | Feature | Committed | Pushed |
| --- | --- | --- | --- |
| F1 | Scaffold | ✅ | ✅ |
| F2 | Project structure | ✅ | ✅ |
| F3 | Tailwind v4 / CSS | ✅ | ✅ |
| F4 | Env vars | ✅ | ✅ |
| F5 | Testing harness | ✅ | ✅ |
| F6 | Tooling + hooks + CI | ✅ | ✅ |
| F7 | Layouts & pages | ✅ 34cfc61 | ✅ |
| F8 | Linking & navigating | ✅ f2e7897 | ✅ |
| F9 | Dynamic routes | ✅ 711b11c | ✅ |
| F10 | Route groups | ✅ 76b4edc | ✅ |
| F11 | Parallel routes | ✅ bfb6f3a | ✅ |
| F12 | Intercepting routes | ✅ 5e523a2 | ✅ |
| F13 | Loading UI & streaming | ✅ ea8e644 | ✅ |
| F14 | Error handling | ✅ 954d02f | ✅ |
| F15 | Redirecting | ✅ 377c33d | ✅ |
| F16 | Route Handlers | ✅ b323b03 | ✅ |
| F17 | proxy.ts middleware | ✅ fee6654 | ✅ |
| — | — | — | — |
| F18 | Server/client components | ⬜ | ⬜ |
| F19 | SSR vs CSR demo | ⬜ | ⬜ |
| F20 | Static vs dynamic | ⬜ | ⬜ |
| F21 | Streaming & loading | ⬜ | ⬜ |
| F22 | PPR/transitions/activity | ⬜ | ⬜ |
| F20 | Fetching data | ⬜ | ⬜ |
| F21 | Server actions + forms | ⬜ | ⬜ |
| F22 | Caching/revalidation/ISR | ⬜ | ⬜ |
| F23 | BFF proxy + cookie auth | ⬜ | ⬜ |
| F24 | SSR vs CSR cookies | ⬜ | ⬜ |
| F25 | CSP nonce + data security (`server-only`) | ✅ 93418ad | ✅ |
| F26 | SSE | ⬜ | ⬜ |
| F27 | WebSocket (NestJS) | ⬜ | ⬜ |
| F28 | Image optimization | ⬜ | ⬜ |
| F29 | Font optimization | ⬜ | ⬜ |
| F30 | Metadata/OG/JSON-LD | ✅ 037dafd | ✅ |
| F31 | Scripts/lazy/bundling | ⬜ | ⬜ |
| F32 | Deploy/self-host | ⬜ | ⬜ |
| F33 | Instrumentation/otel | ✅ | ✅ e2e/observability |
