# ADR 005: Monorepo structure and workspace layout

**Status:** Accepted (enhancements4)

## Context

The project contains two independent full-stack applications (NestJS backend, Next.js
frontend) that share:
- Infrastructure configuration (Docker Compose, K8s)
- Environment variable conventions
- TypeScript types (GraphQL schema, Kafka events)
- Dev tooling (ESLint, Prettier, TypeScript config)

Previously each app was developed in its own repository. They were merged into a single
monorepo to enable cross-stack integration testing, shared CI, and unified developer
experience.

## Decision

Organize the monorepo as a **pnpm workspace** with this layout:

```
boilers/
├── pnpm-workspace.yaml    # Root workspace config
├── package.json            # Unified scripts (dev, build, test, lint)
├── packages/               # Shared libraries
│   └── contracts/          # Shared types, Zod schemas, GraphQL codegen output
├── nest-js-boilerplate/    # NestJS backend (independent workspace)
├── next-js-boilerplate/    # Next.js frontend (independent workspace)
├── prod/                   # Production deployment configs
│   ├── docker/             # Dockerfiles
│   ├── services/           # Per-service env files
│   └── k8s/                # Kubernetes manifests
├── scripts/                # Root-level automation scripts
├── docs/                   # Shared documentation
└── docker-compose.yml      # Root service orchestration
```

Key rules:
- Each sub-package retains its own `package.json` and can be developed independently
- Shared configs (TypeScript, ESLint, Prettier) live in `packages/config-*`
- Docker Compose at the root orchestrates all services
- The Makefile handles Docker operations; pnpm scripts handle dev/build/test

## Consequences

- **Positive:** Single `pnpm install` installs everything
- **Positive:** Shared CI pipeline with path-based filtering
- **Positive:** Cross-stack types can be shared via `packages/contracts`
- **Positive:** Easy to add a mobile app or additional microservice
- **Negative:** pnpm workspace resolution can be slower for very large repos
- **Negative:** Circular dependencies between packages must be avoided
- **Negative:** Not suitable if teams need independent versioning (use separate repos)

## When to deviate

- If the frontend and backend grow independent release cycles, split into separate repos
- If the repo exceeds ~50 packages, consider Nx for better dependency graph management
