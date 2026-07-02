# Docs

Documentation for the NestJS "implement-the-whole-docs" boilerplate.

- **[DESIGN_GUIDE.md](DESIGN_GUIDE.md)** — architecture decisions, folder structure, patterns.
- **[progress/nestjs-feature-checklist.md](progress/nestjs-feature-checklist.md)** — the full ~121-page feature test matrix.
- **[research/logger.md](research/logger.md)** — application logging options (Pino/Winston/OTel) and destinations (Kafka, Loki, ELK), with a recommendation. Built-in `Logger` rejected.
- **[research/build-and-docker.md](research/build-and-docker.md)** — how the app is compiled (`nest build`/tsc, SWC alt) and packaged (multi-stage prod/dev Dockerfiles), with the build & image gotchas.
