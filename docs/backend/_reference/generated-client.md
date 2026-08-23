# Generated client (`@generated/`)

**Source:** [`nest-js-boilerplate/src/@generated/`](../../../nest-js-boilerplate/src/@generated/)

Prisma client output — specifically, `prisma-nestjs-graphql`'s generated NestJS/GraphQL model classes,
inputs, and args types (one subdirectory per Prisma model: `user/`, `post/`, `message/`, etc. — 41
subdirectories as of this writing). Excluded from per-file documentation because it's a **build
artifact**, not hand-written source — documenting its individual files would describe generated
output that's regenerated from `prisma/schema.prisma` on every build and immediately stale the moment
the schema changes again.

## Evidence it's a build artifact, not source

- **Gitignored**: both the repo root [`.gitignore`](../../../.gitignore) (`src/@generated`) and
  [`nest-js-boilerplate/.gitignore`](../../../nest-js-boilerplate/.gitignore) (`/src/@generated`,
  under a "Prisma generated artifacts" comment) exclude this directory — it's never committed.
- **Regenerated automatically**: [`package.json`](../../../nest-js-boilerplate/package.json) wires
  `prisma generate` into three separate lifecycle scripts — `"generate": "prisma generate"`,
  `"postinstall": "prisma generate"` (runs after every `pnpm install`), and
  `"prebuild": "prisma generate && pnpm fallow-check"` (runs before every production build) — so a
  fresh checkout or a schema change always regenerates this directory before the app can build or run.
- **Confirmed by other modules' own comments**: [`common/id-codec/uuid-fields.ts`](../platform-core/common/id-codec/README.md#how-the-app-knows-which-fields-are-ids)
  explicitly parses `prisma/schema.prisma`'s text directly instead of using this generated output,
  specifically because "@generated is fully regenerated (and any hand edit wiped) on every `prisma
  generate`, so that was never an option anyway" (from
  [`id-codec-schema.transformer.ts`](../../../nest-js-boilerplate/src/common/id-codec/id-codec-schema.transformer.ts)'s
  own comment).

## What actually consumes it

Every hand-written resolver/service that returns a Prisma model type imports its shape from here
(e.g. `import type { User } from '../../@generated/user/user.model'`, as seen in
[`common/dataloader`](../platform-core/common/dataloader/README.md)) — this is the normal, intended use
of generated output: consumed widely, edited never. [`common/id-codec`](../platform-core/common/id-codec/README.md)'s
schema transformer is the one notable place in the app that deliberately works around it rather than
through it, for the reason quoted above.
