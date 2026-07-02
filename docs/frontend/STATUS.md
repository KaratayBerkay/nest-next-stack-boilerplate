# Project Status — at a glance

> A single, readable snapshot of **where this boilerplate is, what's done, and what's left**.
> This is the digest; the source-of-truth detail lives in:
> - [`progress/nextjs-feature-checklist.md`](progress/nextjs-feature-checklist.md) — the full feature mapping/test matrix
> - [`progress/README.md`](progress/README.md) — phases, methodology, decisions log + changelog
>
> _Last updated: 2026-06-28 (19:30 UTC) — real auth + theme cookie persistence + SEO landed._

## What this project is
A **Next.js 16 (App Router) frontend boilerplate** built the same way as the sibling
NestJS backend: implement **every relevant feature in the [Next.js docs](https://nextjs.org/docs)**
as a real route/module and **prove each one works with an automated test**. Two
deliverables at once: (1) a reusable, battle-tested Next.js starter, and (2) an answer to
"do the Next.js docs actually work as written in 2026?" — every discrepancy logged.
Headline use case: **testing SSR vs CSR cookie behavior** end-to-end against the
**NestJS backend** ([`../../nest-js`](../../nest-js)).

## Dashboard
| Metric | Value |
| --- | --- |
| Doc features **verified** (🧪 test-proven) | **58 / ~60** |
| Doc features **in progress** (🔵) | 0 |
| Doc features **blocked** (⚠️) | 1 (#25 runtimes) |
| Automated tests | **114** — 18 Vitest unit/component + 96 Playwright e2e |
| 2026 docs-issues logged (⚠️) | 3 — runtime vs `cacheComponents` (#25); CSP nonce vs PPR (#59); `dynamicParams` vs `cacheComponents` (#18) |
| Stack | Node 22 LTS · Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript (strict) · Tailwind CSS v4 · pnpm |
| Backend | NestJS ([`../../nest-js`](../../nest-js)) via **BFF proxy**; WebSocket consumed from its WS gateway |
| Build / lint / CI | Build/lint/format/typecheck/tests green; GitHub Actions CI added |

> Current state: **Auth (#16) + Theme (#17) + SEO (#14) DONE.** Real NestJS GraphQL-backed auth (login/register/logout/refresh/me) replaces mock cookie auth. Theme persistence moved from localStorage to cookies with no-flash init script. SEO: sitemap, robots.txt, JSON-LD structured data all verified.
> Every feature in the Next.js docs (routing, rendering, data fetching, BFF,
> realtime, optimizing, configuring, security, instrumentation, i18n, SEO, auth,
> theme) is implemented and verified with automated tests. The only remaining
> blocked item is #25 (runtimes — `cacheComponents` removes `export const runtime`).
> See [plan.md](plan.md) for the full build order.

## ✅ Completed & verified (0)
_Nothing yet._ The first code lands in Phase 1 (scaffold). See [TODO.md](TODO.md).

## 🔵 In progress (0)
_Nothing yet._

## ⬜ What awaits (roadmap)
Ordered by value to this boilerplate; full list in the
[checklist](progress/nextjs-feature-checklist.md).

**Headline features — ✅ DONE (the project's reason for existing)**
- ✅ **Real auth via NestJS GraphQL** — login/register/logout/refresh/me BFF Route Handlers call NestJS GraphQL mutations/query. 5 auth routes + `useAuth` hook + login/register pages + `AuthStatus` component. 10 e2e tests.
- ✅ **SSR vs CSR cookie demos** — server reads `cookies()`; client can't read `httpOnly` and must call `/api/auth/me`.
- ✅ **SSE** — Route Handler `ReadableStream` (`text/event-stream`) + `useSSE` (`c590774`).
- ✅ **WebSocket from NestJS** — client-only `useWebSocket` connecting to `NEXT_PUBLIC_WS_URL` (`ca1cc77`).
- ✅ **Security** — CSP nonce via `proxy.ts` + `server-only` guardrail (F25).
- ✅ **Instrumentation + OpenTelemetry** — `register()` startup hook + `@vercel/otel`; in-memory span processor proves trace export; `onRequestError` + production-checklist pass (F33).
- ✅ **Internationalization (#18)** — locale-scoped `/i18n/[lang]` with server-side dictionaries (en/tr/de) + `Accept-Language` negotiation and invalid-locale 404 in `proxy.ts`.
- ✅ **SEO** — dynamic `sitemap.ts` (`/sitemap.xml`), `robots.ts` (`/robots.txt`), and JSON-LD structured data via shared `JsonLd` component (`WebSite` in root layout, `BreadcrumbList` on `/seo`).
- ✅ **Theme with cookie persistence** — dark/light toggle via `useTheme` hook + `ThemeToggle`. Cookie-based persistence (no flash) via `public/scripts/theme-init.js` loaded with `next/script` `beforeInteractive`. 6 e2e tests.

**Remaining**
- **#25 runtimes** — blocked by `cacheComponents` (logged, no action). Planned feature set is otherwise complete.

**Foundations**
- Scaffold (Next 16, `src/`, `@/*`), Tailwind v4 (CSS-first `@theme`), ESLint flat + Prettier, env validation (zod), CI.

**Routing & rendering**
- Layouts/pages, dynamic/route-group/parallel/intercepting routes, loading & streaming (`<Suspense>`), error boundaries, `proxy.ts` (Next 16 middleware), Route Handlers.
- SSR, CSR, static, dynamic, PPR, RSC vs client components, runtimes.

**Data**
- Server `fetch` + `React.cache`, caching/revalidation tiers, Server Actions (`useActionState`/`useFormStatus`), ISR.

**Techniques & ops**
- Optimizing (images, fonts, metadata, scripts), testing (Vitest + Playwright), git hooks (husky/lint-staged/commitlint), Docker/CI.

## Known 2026 docs gotchas
Logged in the [checklist's Docs issues log](progress/nextjs-feature-checklist.md#docs-issues-log-️):
- **#25** — `export const runtime` (Node/Edge) is removed when `cacheComponents` is on; all pages run on Node, Edge only in `proxy.ts`.
- **#59** — nonce-based CSP is incompatible with PPR; the strict nonce CSP is scoped to `/security/*` (which opts into dynamic rendering).
- **#18** — `export const dynamicParams = false` is a build error under `cacheComponents`, and `notFound()` inside a streamed Suspense hole can't set a 404; locale negotiation + invalid-locale 404 moved into `proxy.ts`.
- Plus the rename/config shifts already absorbed: `middleware.ts` → `proxy.ts`, Tailwind v4 CSS-first, async `params`/`searchParams`.

## How to navigate the repo
- **Per-feature** — one feature ≈ one route/module under `src/`, with its proof test (`*.test.ts(x)` unit or `e2e/*.spec.ts` Playwright).
- **Demos** — `src/app/(demos)/` (auth, theme, seo, sse, ws, ssr-cookies, csr-cookies, forms, search-params, observability, etc.).
- **BFF** — `src/app/api/` Route Handlers; cookie/forwarding helpers in `src/lib/`.
- **Commands (planned)** — `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:e2e`.
