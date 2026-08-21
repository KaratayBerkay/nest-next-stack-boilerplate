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
- [issues.md](./issues.md) — bugs, dead code, and doc/reality mismatches found while writing these docs

## Status

This documentation set is being built incrementally, one feature vertical at a time, across
backend + frontend + mobile together. Only verticals explicitly listed in a root README's index
table are done — an app's README always states what's covered so far and what's still pending.

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
