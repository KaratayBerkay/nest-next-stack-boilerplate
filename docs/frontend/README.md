# Docs

Documentation for the Next.js "implement-the-whole-docs" boilerplate. Kept the same
way as the sibling
[`nest-js-boilerplate`](../../nest-js-boilerplate/docs) project.

- **[STATUS.md](STATUS.md)** — ⭐ start here: one-page snapshot of where the project is, what's done, what's left.
- **[TODO.md](TODO.md)** — backlog: BFF proxy + httpOnly cookie auth, SSR/CSR cookie demos, SSE, WebSocket-from-NestJS, tests.
- **[progress/](progress/README.md)** — the build plan, phases, decisions log, and changelog.
  - **[progress/nextjs-feature-checklist.md](progress/nextjs-feature-checklist.md)** — the **mapping**: full Next.js feature → where-it-lives → proof-test matrix.
- **[research/nextjs-2026.md](research/nextjs-2026.md)** — 2026 stack (Next 16 + Turbopack, React 19.2, Tailwind v4), App Router best practices, folder structure, scaffold command.
- **[research/realtime-ssr-csr-cookies.md](research/realtime-ssr-csr-cookies.md)** — BFF proxy, SSR vs CSR cookies, SSE via `ReadableStream`, consuming NestJS WebSockets.
- **[git-workflow.md](git-workflow.md)** — branching, Conventional Commits, hooks, command cheatsheet.

This project pairs with the **NestJS backend** at [`../../nest-js-boilerplate`](../../nest-js-boilerplate) — the
Next.js app talks to it via a BFF proxy and consumes its WebSocket gateway.
