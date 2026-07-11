# Next.js Boilerplate — Frontend

A battle-tested Next.js 16 frontend with a companion NestJS backend.

## Stack

- **Next.js 16** (App Router, Turbopack, PPR)
- **NestJS 11** backend (separate app in `../nest-js-boilerplate`)
- **Tailwind CSS v4**, **TanStack Query**, **Prisma**, **Redis**, **BullMQ**
- **GraphQL** (Apollo) + REST BFF routes
- **WebSocket** realtime (ws, Redis-backed presence)
- **Stripe** billing (test mode)
- **Playwright** e2e + **Vitest** unit tests

## Prerequisites

- Node.js 22+
- pnpm 9+
- Running NestJS backend at `http://localhost:3001` (or set `APP_URL`)
- Redis at `localhost:6379`

## Getting Started

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Environment Variables

See `.env.example` for all variables with defaults.

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_URL` | Backend NestJS URL | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_REALTIME_WS_URL` | WebSocket endpoint | `ws://localhost:3000/ws` |
| `COOKIE_DOMAIN` | Cookie domain (set for custom domains) | — |
| `KAFKA_BROKER` | Kafka broker for event streaming | `localhost:9092` |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack, port 3001) |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:coverage` | Run tests with V8 coverage |
| `pnpm test:e2e` | Run Playwright e2e (chromium/firefox/webkit) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm format:check` | Prettier format check |

## Architecture

```
src/
├── app/                    # Next.js App Router routes
│   ├── v1/[lang]/          # Versioned + localized app surface
│   ├── api/                # BFF (Backend-for-Frontend) route handlers
│   └── auth/               # Auth pages (login, register, etc.)
├── views/                  # Client components for each route tier
├── components/             # Shared UI components
├── lib/                    # Utilities (auth, API client, i18n, etc.)
├── hooks/                  # Custom React hooks
├── fallbacks/              # Suspense/loading fallbacks
├── constants/              # API constants, routes, i18n
└── types/                  # Extracted prop types
```

### Tier-based views

Routes with multiple subscription tiers (Free, Basic, Medium, Premium) use the `getTierView()` pattern:

- `page.tsx` (server) calls `getTierView(user.tier, VIEWS)`
- Each tier renders its own `FreePageView`/`BasicPageView`/`MediumPageView`/`PremiumPageView`

## Testing

- **Unit**: `pnpm test` (Vitest + jsdom)
- **E2E**: `pnpm test:e2e` (Playwright, starts Next dev server on port 3100)
- **Coverage**: `pnpm test:coverage` (V8 provider)

## Deployment

Set `output: "standalone"` in `next.config.ts` (already configured). Build with `pnpm build`, then run `node .next/standalone/server.js`.
