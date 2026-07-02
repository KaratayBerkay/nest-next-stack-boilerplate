# Stack roadmap — what's next for the boilerplate

> Created 2026-07-02 after getting the full root `docker-compose.yml` stack (14 services)
> building and running healthy end-to-end. Both apps are individually mature
> ("implement-the-whole-docs" projects with 100+ proof tests each); the gaps are almost
> all in the **glue**: monorepo integration, cross-stack testing, ops, and docs drift
> from the pre-monorepo layout.

**Priorities:** `P0` = blocks calling this a complete stack · `P1` = high-value next ·
`P2` = nice to have. **Effort:** S (<½ day) · M (1–2 days) · L (multi-day).

| File | Scope |
| --- | --- |
| [01-stack-integration.md](01-stack-integration.md) | Monorepo glue: cross-stack e2e, missing compose services, root README/.env, dev mode, root CI |
| [02-backend.md](02-backend.md) | NestJS: auth providers, RBAC, observability, known warnings, resilience |
| [03-frontend.md](03-frontend.md) | Next.js: web push, messaging UI, error reporting, a11y/perf budgets |
| [04-devops.md](04-devops.md) | Compose hardening, frontend k8s, image publishing, backups, log lifecycle |
| [05-docs-maintenance.md](05-docs-maintenance.md) | Existing docs that are stale or broken after the monorepo merge |

## Top 5 (do these first)

1. **Cross-stack e2e suite** — the headline reason the two apps live together, and the
   frontend TODO's only unchecked items. Now unblocked: the compose stack runs. → [01](01-stack-integration.md)
2. **Root README + `.env.example`** — README is one line; nothing documents the compose
   profiles, ports, or required secrets. → [01](01-stack-integration.md)
3. **Messaging/WS servers into compose** — `NEXT_PUBLIC_MSG_WS_URL=ws://localhost:3003`
   points at a server no compose service runs; the feature is dead in Docker. → [01](01-stack-integration.md)
4. **Root CI with a compose smoke test** — per-app `ci.yml`s exist, but nothing at the
   repo root builds the images or boots the stack, so today's class of breakage
   (compose/Dockerfile drift) goes uncaught. → [01](01-stack-integration.md)
5. **Docs link repair** — most cross-references still use pre-monorepo paths
   (`../../nest-js`) and several referenced files don't exist here. → [05](05-docs-maintenance.md)
