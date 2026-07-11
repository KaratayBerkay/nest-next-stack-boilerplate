# Docs

Documentation for the NestJS "implement-the-whole-docs" boilerplate.

- **[AUTH.md](AUTH.md)** — Redis-backed session auth: the three-token compound key, instant revocation, subscription-tier RBAC, fail-closed policy.
- **[progress/nestjs-feature-checklist.md](progress/nestjs-feature-checklist.md)** — the full ~121-page feature test matrix.
- **[research/logger.md](research/logger.md)** — application logging options (Pino/Winston/OTel) and destinations (Kafka, Loki, ELK), with a recommendation. Built-in `Logger` rejected.
- **[research/build-and-docker.md](research/build-and-docker.md)** — how the app is compiled (`nest build`/tsc, SWC alt) and packaged (multi-stage prod/dev Dockerfiles), with the build & image gotchas.
