# Docs

Documentation for the NestJS "implement-the-whole-docs" boilerplate.

- **[STATUS.md](STATUS.md)** — ⭐ start here: one-page snapshot of where the project is, what's done, and what's left.
- **[TODO.md](TODO.md)** — backlog: social auth providers, layered tokens + RBAC in Redis, secure-by-env SSR cookies, load testing.
- **[progress/](progress/README.md)** — the build plan, phases, and decisions log.
  - **[progress/nestjs-feature-checklist.md](progress/nestjs-feature-checklist.md)** — the full ~121-page feature test matrix.
- **[research/claude-code-ecosystem-2026.md](research/claude-code-ecosystem-2026.md)** — how 2026 Claude Code agents/hooks/skills/plugins are published, and the tooling we set up locally.
- **[research/logger.md](research/logger.md)** — application logging options (Pino/Winston/OTel) and destinations (Kafka, Loki, ELK), with a recommendation. Built-in `Logger` rejected.
- **[research/nestjs-stack-2026-gotchas.md](research/nestjs-stack-2026-gotchas.md)** — 2026 version-compatibility issues hit on a fresh install, with fixes.
- **[research/build-and-docker.md](research/build-and-docker.md)** — how the app is compiled (`nest build`/tsc, SWC alt) and packaged (multi-stage prod/dev Dockerfiles), with the build & image gotchas.

The local agents, skill, and hooks that drive this work live in [`../.claude/`](../.claude/),
with project context in [`../CLAUDE.md`](../CLAUDE.md).
