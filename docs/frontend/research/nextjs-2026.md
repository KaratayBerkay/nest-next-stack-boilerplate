# Next.js Boilerplate — 2026 Research Notes

> Collected June 2026. These are local-only notes (the `docs/` folder is gitignored).
> Goal: a Next.js starter that exercises SSR, CSR, Route Handler APIs, SSE and
> WebSockets, talking to a separate **NestJS** backend, with first-class **SSR vs CSR
> cookie** testing.

## Confirmed project decisions

- **Package manager:** pnpm
- **WebSocket:** consumed FROM the NestJS backend (NestJS WS Gateways). Next.js keeps
  its standard server (no custom `server.js`) so we retain Turbopack, RSC streaming and
  serverless-friendliness. Next.js ships only a client-side WS hook.
- **Backend comms:** BFF proxy — the browser only talks to Next.js Route Handlers, which
  forward to NestJS and own the `httpOnly` cookies. Cleanest way to test SSR + CSR cookie
  flows.

## Target stack (verified June 2026)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.x** (App Router) | Current stable line is 16.2.x (May 2026). Turbopack is the **default** bundler (~10x faster HMR). React 19.2. `middleware.ts` is renamed to **`proxy.ts`** in v16. Async `params`/`searchParams`. Cache Components. |
| UI runtime | **React 19.2** | RSC by default. New: `useActionState`, `useFormStatus`, `useEffectEvent`, View Transitions, Activity. |
| Styling | **Tailwind CSS v4** | CSS-first: `@import "tailwindcss";` + `@theme { … }`. No `tailwind.config.js`, no `@tailwind base/components/utilities`. Automatic content detection. Oxide engine (Rust) + Lightning CSS (dropped PostCSS dep). ~70% smaller prod CSS than v3. Needs Node 20+ (22 LTS recommended), pnpm 9+. |
| Language | **TypeScript** (strict) | `src/` directory layout, `@/*` import alias. |
| Client data | **TanStack Query** (or SWR) | CSR fetching/caching against the BFF. |
| Server data | native `fetch` + `React.cache` | Request dedup + caching inside RSC. |
| Lint/format | ESLint (flat config) + Prettier | + `prettier-plugin-tailwindcss` for class sorting. |
| Tests (optional) | Vitest + Playwright | Unit + e2e for cookie/SSR/CSR flows. |

## App Router best practices (2026)

- Every file under `app/` is a **React Server Component** by default. Opt into the client
  with `"use client"`. Server components ship **no JS** to the browser → smaller bundles.
- **Stream with `<Suspense>`**: render fast parts immediately, stream slow data-fetching
  parts in the background.
- **Prefer static over dynamic**: static pages are cached by default; only reach for
  `export const dynamic = "force-dynamic"` when the page genuinely needs per-request data.
- **`React.cache`** to dedupe identical fetches across components in one render.
- **Server Actions** (stable) replace many `POST /api/*` form routes; integrate with
  `useActionState` / `useFormStatus` for pending/error UI.
- **`app/` is for routing only** — push business logic into `features/` (feature-driven /
  domain-driven architecture). Each feature is self-contained with a barrel `index.ts`
  defining its public API.

## Recommended folder structure (feature-driven, `src/`)

```
src/
  app/            # routing ONLY (RSC by default)
    api/          # BFF Route Handlers
    (demos)/      # demo routes: ssr-cookies, csr-cookies, sse, ws
    layout.tsx
    globals.css   # @import "tailwindcss"; + @theme
  features/       # domain modules (auth, realtime, …); each has index.ts barrel
  shared/         # cross-feature UI + helpers
  hooks/          # custom React hooks (useApi, useSSE, useWebSocket, useAuth)
  lib/            # backend client (cookie forwarding), env validation, cn()
  types/
proxy.ts          # Next 16 middleware replacement (route guards / cookie checks)
```

Dependency rules: features → may import shared/lib/entities. shared → must NOT import
features. lib → must NOT depend on UI.

## Scaffold command

```bash
pnpm dlx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm
```

## Sources

- Next.js 16 release: https://nextjs.org/blog/next-16
- Upgrade to v16 guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- App Router docs: https://nextjs.org/docs/app
- Project structure: https://nextjs.org/docs/app/getting-started/project-structure
- CSS / Tailwind in Next.js: https://nextjs.org/docs/app/getting-started/css
- Tailwind v4 + Next.js guide: https://tailwindcss.com/docs/guides/nextjs
- Tailwind v4.0 announcement: https://tailwindcss.com/blog/tailwindcss-v4
- Next.js project structure 2026: https://www.groovyweb.co/blog/nextjs-project-structure-full-stack
