# Progress Tracker — Next.js "implement-the-whole-docs" Boilerplate

> **Mission:** Implement *every relevant feature in the [Next.js docs](https://nextjs.org/docs)*,
> prove each one works with a test, log anything that doesn't work as written, and ship the
> result as our reusable frontend boilerplate — wired to the NestJS backend for SSR/CSR
> cookie testing. Same methodology as the sibling [`nest-js-boilerplate`](../../../nest-js-boilerplate) project.

## How this is tracked
- **[`nextjs-feature-checklist.md`](nextjs-feature-checklist.md)** — the full **mapping**/test matrix. Source of truth for coverage.
- **This file** — phases, methodology, and the decisions log.
- **[`../research/`](../research/nextjs-2026.md)** — the 2026 stack research the plan is built on.

## Verification protocol (the point of the project)
For each docs feature:
1. **Read the live docs page** for that feature.
2. **Implement** it as a real route/module under `src/` (no toy snippets pasted blindly).
3. **Prove it** with an automated test (Playwright e2e, or Vitest unit/component). "It builds" is not "it works."
4. **Update the checklist**: ✅ implemented → 🧪 verified once the test is green.
5. **If it didn't work as written**, log it in the checklist's *Docs issues log* (⚠️): what the docs say vs. what actually happened vs. the fix.

## Phases
| Phase | What | Status |
| --- | --- | --- |
| 0 | Research 2026 stack + docs scaffolding (this tree) | ✅ Done (2026-06-28) |
| 1 | Scaffold the app, Tailwind v4, tooling, CI, base test harness | ✅ Done — F1–F6 (`2adb7c4`→`23e1ea4`), all pushed |
| 2 | **Routing** (layouts/pages → route handlers, `proxy.ts`) | ⬜ |
| 3 | **Rendering** (SSR, CSR, static, dynamic, streaming, PPR, RSC) | ⬜ |
| 4 | **Data fetching & caching** (server fetch, `React.cache`, Server Actions, ISR) | ⬜ |
| 5 | **BFF proxy + httpOnly cookie auth** (the core) | ⬜ |
| 6 | **SSR vs CSR cookie demos** (the headline) | ⬜ |
| 7 | **Real-time** (SSE Route Handler; WebSocket consumed from NestJS) | ⬜ |
| 8 | **Optimizing & techniques** (images/fonts/metadata, env, TS, ESLint) | ⬜ |
| 9 | **Testing, git hooks, Docker/CI**, final boilerplate polish | ⬜ |

Order is grouped so foundational features land first and later features build on them.

## Decisions log
> These shape the whole boilerplate. Confirmed with the user 2026-06-28.

| Decision | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) | Turbopack default; React 19.2; `middleware.ts` → **`proxy.ts`** rename; async `params`/`searchParams`. |
| Package manager | **pnpm** | Matches the NestJS sibling. |
| Styling | **Tailwind CSS v4** | CSS-first `@theme`, `@import "tailwindcss";`, no `tailwind.config.js`. |
| Language | **TypeScript** (strict) | `src/` layout, `@/*` alias. |
| Architecture | **Feature-driven `src/`** | `app/` = routing only; logic in `features/`. |
| Backend comms | **BFF proxy** | Browser → Next.js Route Handlers → NestJS; Next.js owns the httpOnly cookies. |
| WebSocket | **Consumed from NestJS** | NestJS WS gateway; Next.js keeps its standard server (no custom `server.js`), only a client hook. |
| Client data | **TanStack Query** | For CSR; server uses native `fetch` + `React.cache`. |
| Test runners | **Vitest** (unit/component) + **Playwright** (e2e) | e2e is the real proof, esp. for cookie/SSR/CSR. |
| Deploy target | **Self-hostable Node** (not Vercel-locked) | Keeps SSE long-lived connections + custom infra viable. |

## Status snapshot
- Verified features: **10 / ~60** (Stage 0 / Foundation complete).
- Automated tests: **8** (7 Vitest + 1 Playwright e2e).
- Docs issues found: **0** logged (watch list: pnpm 11 build-gate, Lightning CSS oklab, dev port collision handled in e2e).
- Infra: Next 16 app scaffolded; GitHub Actions CI added.
- Last updated: 2026-06-28.
- Current blocker: none — proceeding to Stage 1 (Routing).

## Changelog
- **2026-06-28** — **F18 i18n** (#18): internationalization, previously out of scope. A locale-scoped `/i18n/[lang]` segment (like `/security`) — `src/lib/i18n/{config,dictionaries}.ts` with `matchLocale` `Accept-Language` negotiation + server-only en/tr/de dictionaries; `generateStaticParams` prerenders each locale as a static PPR page; a `<Link>`-based `LocaleSwitcher`; bare `/i18n` 307-redirects to the negotiated locale and `/i18n/{unsupported}` 404s — both in `proxy.ts`. 5 e2e + 5 unit tests. _2026 gotchas (#18):_ `export const dynamicParams = false` is a **build error** under `cacheComponents`, and `notFound()` inside a streamed Suspense hole can't set a 404 (static shell already flushed 200) — so locale gating moved into the proxy, mirroring the #59 CSP lesson.
- **2026-06-28** — **F6 tooling** (`23e1ea4`, pushed): Prettier (+tailwind plugin) + eslint-config-prettier; Husky hooks (pre-commit lint-staged, commit-msg commitlint, pre-push typecheck — proven live on this commit); lint-staged + format scripts; GitHub Actions CI (typecheck/lint/format/test/build/e2e); pinned packageManager + engines. _Fixed_ an `import/no-anonymous-default-export` lint warning in commitlint config. **Stage 0 complete.**
- **2026-06-28** — **F5 test harness** (`1c7f774`, pushed): Vitest (jsdom + RTL, native tsconfig paths) — 7 unit/component tests (cn, env schemas, Badge); Playwright e2e for the home page. _2026 gotcha:_ another app occupies :3000, so the e2e is pinned to port 3100 (`reuseExistingServer` had latched onto the stray server). Backfilled the deferred F1/F3 render proofs.
- **2026-06-28** — **F4 env** (`0c94790`, pushed): `src/lib/env.ts` zod schemas (server BACKEND_URL/NODE_ENV; client NEXT_PUBLIC_*) — client parsed+inlined with defaults, server via lazy server-only accessor; `.env.example` tracked. _2026 note:_ zod 4 `z.url()`.
- **2026-06-28** — **F3 styling** (`46ae083`, pushed): demonstrated Tailwind v4 CSS-first `@theme` brand token, a CSS Module (`shared/ui/Badge`), and a global `.surface` rule; new landing page via `@/shared`. Verified in compiled CSS output. _2026 note:_ Lightning CSS rewrites hex `@theme` colors to oklab.
- **2026-06-28** — **F2 structure** (`50ade6d`, pushed): feature-driven `src/{lib,shared,hooks,features,types}` with barrels + `src/README.md` documenting import direction. `shared/site.ts` imports `@/lib` to prove cross-layer alias resolution. build+lint+tsc green.
- **2026-06-28** — **F1 scaffold** (`2adb7c4`, pushed): create-next-app → Next 16.2.9, React 19.2, TS strict, Tailwind v4, ESLint, `src/` + `@/*`. Approved pnpm 11 native build scripts (sharp, unrs-resolver) via `pnpm-workspace.yaml`. Re-merged `docs/` + `.env.example` rules into the generated `.gitignore`. `pnpm build` + `pnpm lint` green. _2026 note:_ pnpm 11.7 gates build scripts behind an `allowBuilds`/`onlyBuiltDependencies` approval — same gate the NestJS sibling hit.
- **2026-06-28** — Phase 0 complete: 2026-stack research captured (`research/nextjs-2026.md`, `research/realtime-ssr-csr-cookies.md`), git-workflow notes, and this docs tree (STATUS / TODO / progress / checklist) created — mirroring the NestJS sibling. `.gitignore` created (ignores `docs/`, `.env*` except `.env.example`, build output). Decisions locked: pnpm, BFF proxy, WebSocket-from-NestJS.
