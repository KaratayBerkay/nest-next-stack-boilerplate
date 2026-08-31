# tanstack-boilerplate — agent notes

TanStack Start clone of `../next-js-boilerplate` (same views/components/lib,
same NestJS backend, same BFF contract). Read `README.md` first — it has the
full Next.js → TanStack mapping table.

## Commands

- `pnpm dev` — Vite dev server on :3001
- `pnpm typecheck` / `pnpm lint` / `pnpm test` — all three must stay green
- `pnpm build` — Vite + Nitro → `.output/`; `pnpm start` runs it
- `pnpm generate-i18n-types` — regenerate `src/generated/i18n-messages*`
  after editing `messages/`

## Ground rules

- **Routes** live in `src/routes/` (TanStack file conventions: `$param`,
  `_pathless`, `route.tsx` layouts, `index.tsx` pages, `-`-prefixed files
  ignored). `src/routeTree.gen.ts` is generated — never edit it.
- **The `next/*` imports everywhere are intentional** — they resolve to the
  compat layer in `src/compat/next/` via Vite/tsconfig aliases (mirrored in
  `vitest.config.ts`). Don't "fix" them; new code should use
  `@tanstack/react-router` / `@tanstack/react-start` APIs directly.
- **BFF**: `src/bff/**` holds the original Next.js route handlers, served by
  the catch-all `src/routes/api/$.ts` through `src/bff/dispatch.ts`. New API
  endpoints can be either a new `src/bff/**/route.ts` (picked up
  automatically by the glob) or a native Start server route.
- **Server-only code** (fs, kafka, vault, `@/lib/backend`) must only be
  reached through `createServerFn().handler()` bodies using dynamic
  `import()` — a static import chain from a route/component file will leak
  it into the client bundle and break `vite build`.
- **/v1/$lang pages**: `user` + `messages` come from
  `getRouteApi("/v1/$lang").useLoaderData()`; localized titles via
  `v1PageHead(matches, ns, titleKey, descKey)` from
  `src/lib/i18n/route-head.ts`.
- Theming/component conventions are unchanged from the original app —
  semantic tokens only, `globals.css` is the design system
  (see `CSS-THEME-SYSTEM.md` and `components.md`).
