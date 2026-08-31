# Users — API

Pages: [list/page.md](./list/page.md), [detail/page.md](./detail/page.md)

## Zero backend calls

Neither page under this vertical calls any API, BFF route, or backend endpoint. Both
[`views/users/list/FreePageView.tsx`](../../../../next-js-boilerplate/src/views/users/list/FreePageView.tsx)
and
[`views/users/detail/[uuid]/FreePageView.tsx`](../../../../next-js-boilerplate/src/views/users/detail/[uuid]/FreePageView.tsx)
render entirely from a hardcoded, in-file array/`Record` — no `fetch`, no `apiFetch`, no React Query
hook, no `import` from any `src/api/**` path at all. Confirmed by reading both files directly (they
are 39 and 81 lines respectively — short enough to fully rule out an API call by inspection, not
sampling).

This file exists, despite having nothing to document in the usual sense, so that the convention of
"every vertical gets an api.md" still gives a reader a place to *confirm* the absence rather than
wonder whether it was simply skipped. See [../../../conventions.md §2](../../../conventions.md#2-file-naming).

## Compare: `search.ts` — a real, similarly-named file that is *not* used here

[`src/api/client/users/search.ts`](../../../../next-js-boilerplate/src/api/client/users/search.ts) and
[`src/api/server/users/search.ts`](../../../../next-js-boilerplate/src/api/server/users/search.ts) are
real, working, documented files — see
[find-friends/api.md § User search](../find-friends/api.md#user-search) — but they're consumed by
[find-friends](../find-friends/page.md), **not** by either page in this folder, despite living in a
directory named `api/*/users/`. Worth flagging explicitly since the naming makes the opposite
assumption easy to make.

## Known issues

- `CROSS-016` (resolved) — full writeup of the static-content finding and its mobile
  contrast.
