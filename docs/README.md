# Documentation

This monorepo ships three applications that share one backend contract: a NestJS API
([`nest-js-boilerplate`](../nest-js-boilerplate/)), a Next.js web app
([`next-js-boilerplate`](../next-js-boilerplate/)), and a Flutter mobile app
([`flutter-boilerplate`](../flutter-boilerplate/)). Each real page/screen has its own doc,
cross-linked to the backend endpoint(s) it calls and to the exact source file being described —
click through from any doc straight to the code.

| App | Start here |
|---|---|
| Backend (NestJS) | [backend/README.md](./backend/README.md) |
| Frontend (Next.js) | [frontend/README.md](./frontend/README.md) |
| Mobile (Flutter) | [mobile/README.md](./mobile/README.md) |

- [conventions.md](./conventions.md) — how these docs are organized, link rules, templates
- [architecture.md](./architecture.md) — cross-cutting system design (auth, BFF, outbox, tiers, monorepo layout)
- [schema.md](./schema.md) — reverse index from product component to required Prisma tables/columns
- [issues.md](./issues.md) — bugs, dead code, and doc/reality mismatches found while writing these docs

## Status

Complete, including the post-docs additions. Every real page/screen/module across all three apps has
a doc — see each root README's index table (all rows ✅, none left `⬜`) and
[issues.md](./issues.md) for the full bug/gap log (108+ entries, all triaged). A 2026-08-29 sync
pass added the RTC suite (backend module + web + mobile verticals + LiveKit architecture section),
`common/scanner-filter`, the chat link cards, the web realtime multi-tab protocol, and updated every
doc whose source files were moved/deleted by the late-August dedup/dead-code commits
(`aa04a418`/`b98fac8a`) — deletions are recorded as resolution notes on the issues that flagged
them. Demo/showcase galleries are deliberately excluded and catalogued once
each in `_reference/showcase-index.md` rather than documented individually — see
[frontend/README.md § Scope of this documentation](./frontend/README.md#scope-of-this-documentation).

## Workspace layout

```
nest-next-stack-boilerplate/
├── nest-js-boilerplate/   # NestJS backend — GraphQL API (see backend/README.md)
├── next-js-boilerplate/   # Next.js web app — BFF + browser UI (see frontend/README.md)
├── flutter-boilerplate/   # Flutter mobile app (see mobile/README.md)
├── docker-compose.yml     # Root service orchestration (Postgres, Redis, etc.)
└── docs/                  # You are here
```

Each app retains its own `package.json`/`pubspec.yaml` and can be developed independently; the
root `pnpm-workspace.yaml` ties the two Node apps together for shared installs and CI.
