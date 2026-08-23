# common/dataloader (backend)

**Source:** [`nest-js-boilerplate/src/common/dataloader/`](../../../../../nest-js-boilerplate/src/common/dataloader/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

Per-GraphQL-request batching for the classic N+1 problem, via Facebook's `dataloader` library.
`DataloaderService` is `Scope.REQUEST` (a fresh instance per request, not a singleton — batching must
never leak across unrelated requests) and `@Global()`-exported via
[`dataloader.module.ts`](../../../../../nest-js-boilerplate/src/common/dataloader/dataloader.module.ts).
Wired into [`app.module.ts`](../../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES`
directly.

Two loaders are provided today, both lazily constructed on first use within a request:
`getUserLoader()` (batches `User` lookups by id into one `prisma.user.findMany({where: {id: {in:
[...ids]}}})`) and `getPostLoader()` (same shape for `Post`). Each returns results in the same order
the ids were requested, with `null` for any id that didn't resolve — the contract `DataLoader` itself
requires.

## Interfaces

None. Internal-only.

## Depends on

[`prisma`](../../prisma/README.md).

## Used by (who imports this, and why)

Exactly one real call site today: `post/post.resolver.ts` injects `DataloaderService` and calls
`getUserLoader().load(post.authorId)` to resolve `Post.author` without N+1-querying `User` once per
post in a feed page. `getPostLoader()` has no caller anywhere — see [Known issues](#known-issues).

## Known issues

- [BE-024](../../../../issues.md#be-024) (LOW) — `DataloaderService.getPostLoader()` is fully
  implemented but has zero callers anywhere in `src/` (confirmed: `grep -rn "getPostLoader"` matches
  only its own definition). `getUserLoader()`, defined right next to it and following the identical
  pattern, is genuinely used by `post/post.resolver.ts`.
