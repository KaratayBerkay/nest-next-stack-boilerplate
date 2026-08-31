# TanStack Boilerplate — Frontend

A full TanStack Start clone of `../next-js-boilerplate`: the same app —
auth + MFA, tiered feature gating, feed/posts/friends/messaging, E2EE chat,
RTC (calls/meetings/streams via LiveKit), billing (Stripe), settings, a
~70-component UI gallery, and ~40 showcase pages — running on TanStack Start
instead of Next.js, against the same NestJS backend.

## Stack

- **TanStack Start** (Vite, file-based routing via TanStack Router, server
  functions, server route handlers, request middleware)
- **NestJS 11** backend (separate app in `../nest-js-boilerplate`)
- **Tailwind CSS v4** (CSS-first config, multi-theme token system),
  **TanStack Query/Form/Table**
- **GraphQL** + REST BFF routes (the original Next.js route handlers, served
  through a catch-all Start server route)
- **WebSocket** realtime, **Stripe** billing, **Playwright** e2e, **Vitest**

## Getting Started

```bash
cp .env.example .env.local
pnpm install
pnpm dev            # http://localhost:3001
```

Quality gates:

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest (jsdom)
pnpm build          # vite build → .output/ (Nitro, node server)
pnpm start          # node .output/server/index.mjs
```

## How the port maps Next.js to TanStack Start

| Next.js                                        | Here                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `src/app/**/page.tsx`                          | `src/routes/**/index.tsx` (`createFileRoute`)                        |
| `src/app/**/layout.tsx`                        | `src/routes/**/route.tsx` layout routes                              |
| `(group)/layout.tsx`                           | pathless `_group/route.tsx`                                          |
| `[param]` / `[...all]`                         | `$param` / `$`                                                       |
| `loading.tsx` / `error.tsx` / `not-found.tsx`  | `pendingComponent` / `errorComponent` / `notFoundComponent`          |
| `metadata` / `generateMetadata`                | `head()` via `src/lib/head.ts` (`metadataToHead`)                    |
| async server components fetching data          | route `loader` + `createServerFn`                                    |
| `src/app/api/**/route.ts` (BFF)                | copied verbatim to `src/bff/**`, dispatched by `src/routes/api/$.ts` |
| `proxy.ts` (middleware)                        | global request middleware in `src/start.ts`                          |
| `instrumentation.ts`                           | `register()` called from the custom `src/server.ts` entry            |
| `robots.ts` / `sitemap.ts`                     | `robots[.]txt.ts` / `sitemap[.]xml.ts` server routes                 |
| parallel routes (`@team`, `@analytics`)        | composed directly in the dashboard layout route                      |
| intercepting routes (gallery `@modal/(.)[id]`) | navigation-state-aware rendering in `gallery/$id`                    |
| `next/font/google`                             | self-hosted `@fontsource-variable/geist` (`src/styles/fonts.css`)    |

### The `next/*` compat layer

`src/compat/next/` re-implements the Next.js module surface on top of
TanStack Start, and Vite/tsconfig aliases map the bare specifiers onto it:
`next/image`, `next/link`, `next/navigation`, `next/headers`, `next/server`,
`next/dynamic`, `next/script`, `next/cache`, `next/web-vitals`,
`server-only`, and the `Metadata` types from `next`. This is what lets the
~2,400 files under `components/`, `views/`, `lib/`, `hooks/`, and the whole
BFF compile unchanged. `@tanstack/react-form-nextjs` is aliased to
`@tanstack/react-form-start`.

If you are writing **new** code, prefer the native APIs
(`@tanstack/react-router` Link/hooks, server functions) — the compat layer
exists to keep the ported surface stable, not as a recommendation.

### Things that intentionally changed

- **Session hydration**: `SessionBridge` was an async server component; the
  session now rides the root route's loader.
- **`/v1/$lang` layout**: authenticates in its loader (redirects to login on
  a dead session) and ships the locale's full message tree; child routes read
  `user`/`messages` via `getRouteApi("/v1/$lang").useLoaderData()`, and page
  titles resolve from those messages in `head()`
  (`src/lib/i18n/route-head.ts`) with no extra server round-trip.
- **Next-concept demos** (`/caching`, `/static`, `/request-memoization`,
  `/server-actions`, `/ppr`…) demonstrate the closest TanStack Start
  equivalent (loader caching + `router.invalidate()`, server-boot constants,
  loader-scoped dedupe, server functions) with the same UI and test ids.
- **`use server` actions** became `createServerFn` calls with the same
  `(prev, formData)` signatures, still driven by `useActionState`.

## Environment

Same contract as the Next.js app: `NEXT_PUBLIC_*` vars are inlined into the
client bundle at build time (via Vite `define`), server vars
(`APP_URL`, `SESSION_COOKIE_SECRET`, `COOKIE_*`, Vault settings…) are read
from `process.env` — loaded from `.env`/`.env.local` in dev, from the
environment (or Vault via `src/instrumentation.ts`) in production.

## Layout

```
src/
  routes/        file-based routes (pages, layouts, server routes)
  bff/           the original Next.js BFF route handlers + dispatcher
  compat/next/   the next/* compat layer
  components/    shared + design-system components (unchanged)
  views/         page content components (unchanged)
  lib/ hooks/ features/ constants/ types/ validators/ …  (unchanged)
  start.ts       request middleware (the old proxy.ts)
  server.ts      custom server entry (instrumentation boot)
  router.tsx     router factory + global defaults
messages/        i18n dictionaries (en, tr)
```
