# Users List (page)

**Route:** `/v1/[lang]/users/list` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/users/list/page.tsx)
**Mobile equivalent:** [users/list screen](../../../../mobile/v1/users/list/screen.md) — **not a
parity match**, see [../README.md](../README.md)
**Index:** [../README.md](../README.md)

## What renders here

No tier branching (no `getTierView()`, no `Basic`/`Medium`/`Premium` view files — just one
[`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/users/list/FreePageView.tsx)) and no
`"use client"`/hooks — an `async` Server Component reading `t`/`lang` from `params` and rendering a
literal, hardcoded array:

```ts
const USERS = [
  { uuid: "a1b2c3", name: "Alice Johnson", email: "alice@example.com" },
  { uuid: "d4e5f6", name: "Bob Smith", email: "bob@example.com" },
  { uuid: "g7h8i9", name: "Charlie Brown", email: "charlie@example.com" },
];
```

Each row is a plain `<Link href="/v1/{lang}/users/detail/{uuid}">` — real Next.js routing, just to a
page that looks the id up in an equally-hardcoded table (see [../detail/page.md](../detail/page.md)).
See [../README.md](../README.md) for why this is static demo content, not an unfinished real feature.

## Hooks & API

None — see [../README.md](../README.md) and [../api.md](../api.md).

## Known issues

- [CROSS-016](../../../../issues.md#cross-016) — this whole vertical is static demo content on web; mobile's
  same-named screen is a real, live feature. See [../README.md](../README.md) for the full comparison.
