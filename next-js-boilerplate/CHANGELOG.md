# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Entries are derived from the [Conventional Commits](https://www.conventionalcommits.org)
history; see [`../docs/frontend/git-workflow.md`](../docs/frontend/git-workflow.md) for the release process.

## [Unreleased]

### Added

- **Real auth (NestJS GraphQL)** — replaces mock cookie auth with real
  login/register/logout/refresh/me backed by NestJS GraphQL mutations and query.
  BFF Route Handlers proxy each call, manage `access_token` (httpOnly) and
  `refresh_token` (httpOnly from NestJS). Auth forms at
  `/auth/login` and `/auth/register`. `useAuth` hook + `AuthProvider` context.
  `AuthStatus` component in demos header. (5 BFF routes + 2 pages + 1 context +
  1 component + 10 e2e tests.)
- **Theme cookie persistence** — replaces localStorage with cookie-based theme
  storage (`document.cookie`). Anti-flash `<script>` extracted to
  `public/scripts/theme-init.js`, loaded via `next/script`
  `strategy="beforeInteractive"` — no `dangerouslySetInnerHTML`.
- **SEO (sitemap, robots, JSON-LD)** — `sitemap.ts`, `robots.ts`, `JsonLd`
  component. `/seo` demo page with `BreadcrumbList` structured data. (5 e2e tests.)
- **Versioned + localized app surface** — `/v1/[lang]` segment with its own
  persistent layout, a custom `error.tsx` boundary, and a custom `not-found.tsx`
  boundary. `proxy.ts` redirects anything unrecognized to a sensible default
  instead of dead-ending: bare `/v1` → negotiated locale (307); unsupported
  locale (e.g. `/v1/fr`) → default locale, preserving the path (307); unknown
  version (e.g. `/v2`) → default version `/v1`, preserving the path (308). Backed
  by `src/lib/version/config.ts` (mirrors the i18n config). Proven by
  `e2e/v1.spec.ts` (8) + `src/lib/version/config.test.ts` (4).

## [1.0.0] - 2026-06-28

First stable release. A feature-complete Next.js 16 (App Router) boilerplate that
implements every relevant feature from the Next.js docs as a real route/module and
proves each one with an automated test (14 Vitest unit/component + 71 Playwright e2e).
Stack: Node 22 LTS · Next.js 16.2.9 (Turbopack) · React 19.2 · TypeScript (strict) ·
Tailwind CSS v4 · pnpm. Talks to a separate NestJS backend through a BFF proxy.

### Added

- **Routing** — nested layouts persisting across navigation (F7); client-side
  `<Link>`/`useRouter` navigation (F8); dynamic `[id]` routes with async `params`
  (F9); `(marketing)` route groups (F10); parallel `@team`/`@analytics` slots (F11);
  intercepting `(.)` routes for modal-vs-hard-nav (F12); `loading.tsx` + `<Suspense>`
  streaming (F13); `error.tsx` + `not-found.tsx` boundaries (F14); `redirect()` 307 +
  `permanentRedirect()` 308 (F15); Route Handlers with GET/POST JSON round-trip (F16);
  `proxy.ts` request gating with matcher + legacy redirect (F17); search params via
  `searchParams` prop + `useSearchParams`.
- **SEO** — static + dynamic metadata via `generateMetadata` (F19).
- **Rendering** — SSR, CSR, static & dynamic rendering demos (F20–F23); Partial
  Prerendering via `cacheComponents` (F24).
- **Data fetching & caching** — server `fetch` in RSC (F26); request memoization with
  `React.cache` (F27); caching, revalidation & ISR (F28, F31); Server Actions and
  mutations (F29); client data with TanStack Query (F30).
- **Forms** — TanStack Form signup demo with client + server validation (Zod) (F32).
- **Backend / BFF** — BFF proxy and `httpOnly` cookie auth, with the headline
  SSR-vs-CSR cookie demos (F42–F46).
- **Real-time** — Server-Sent Events (F47); WebSocket consumed from the NestJS WS
  gateway (F48).
- **Optimizing** — image optimization with `next/image` (F49); font optimization with
  `next/font` (F50); script optimization with `next/script` (F51); lazy loading with
  `next/dynamic` (F52).
- **Internationalization** — locale routing under `/i18n/[lang]` with server-side
  dictionaries (en/tr) and `Accept-Language` negotiation (F18).
- **Observability** — instrumentation `register()` hook + OpenTelemetry (`@vercel/otel`)
  with an in-memory span processor, `onRequestError` capture, and a production-hardening
  pass (F33).
- **Configuration & deploy** — `output: standalone` build with multi-stage Docker and
  `docker-compose` (F56).
- **Styling** — Tailwind CSS v4 CSS-first `@theme` + CSS Modules + global CSS.
- **Foundation** — scaffolded Next.js 16 App Router app with `src/` layout and `@/*`
  alias; feature-driven `src/` structure; zod-validated environment variables.

### Security

- Nonce-based Content-Security-Policy enforced in `proxy.ts`, scoped to `/security/*`,
  plus a `server-only` guardrail on the BFF data helper (F25).

### Tooling & infrastructure

- Vitest + Playwright test harness (unit, component, e2e).
- Prettier (+ Tailwind plugin), Husky + lint-staged (pre-commit), commitlint
  (Conventional Commits, commit-msg), `tsc --noEmit` on pre-push, and GitHub Actions CI
  (typecheck / lint / format / test / build / e2e).

### Known 2026 docs gotchas

- **#25** — `export const runtime` (Node/Edge) is removed when `cacheComponents` is on;
  pages run on Node, Edge only in `proxy.ts`.
- **#59** — nonce-based CSP is incompatible with PPR; the strict CSP is scoped to
  `/security/*`, which opts into dynamic rendering.
- **#18** — `export const dynamicParams = false` is a build error under `cacheComponents`,
  and `notFound()` inside a streamed Suspense hole can't set a 404; locale negotiation and
  the invalid-locale 404 live in `proxy.ts`.

[Unreleased]: https://github.com/KaratayBerkay/next-js-boilerplate-/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/KaratayBerkay/next-js-boilerplate-/releases/tag/v1.0.0
