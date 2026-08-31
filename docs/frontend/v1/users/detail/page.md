# User Detail (page)

**Route:** `/v1/[lang]/users/detail/[uuid]` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/users/detail/[uuid]/page.tsx)
**Mobile equivalent:** [users/detail screen](../../../../mobile/v1/users/detail/screen.md) — **not a
parity match**, see [../README.md](../README.md)
**Index:** [../README.md](../README.md)

## What renders here

Same shape as [../list/page.md](../list/page.md) — one
[`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/users/detail/[uuid]/FreePageView.tsx),
no tier branching, no client hooks, async Server Component. Looks the `uuid` path param up in a
hardcoded `Record`:

```ts
const USERS: Record<string, { name: string; email: string; role: string }> = {
  a1b2c3: { name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  d4e5f6: { name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  g7h8i9: { name: "Charlie Brown", email: "charli@example.com", role: "Viewer" },
};
```

Any `uuid` not in that table (i.e. every real user id in the actual database) renders a "user not
found" message with a link back to [../list/page.md](../list/page.md) — there is no fallback that
attempts a real lookup. Note `g7h8i9`'s email (`charli@example.com`) doesn't even match the list
page's version of the same fake user (`charlie@example.com`, see [../list/page.md](../list/page.md))
— a small, harmless inconsistency inside the fixture data itself, not worth its own issue row given
the whole page is acknowledged demo content (see [../README.md](../README.md)), but noted here in
case a future reader wonders whether it's meaningful.

## Hooks & API

None — see [../README.md](../README.md) and [../api.md](../api.md).

## Known issues

- `CROSS-016` (resolved) — this whole vertical is static demo content on web.
- `MOB-003` (resolved) — the *mobile* equivalent of this specific page (a real
  screen, unlike this one) has a confirmed bug where it always shows the caller's own profile
  regardless of which user was tapped. Not reachable on web (there's no real lookup here to have the
  bug in) — cross-referenced because a reader diffing "detail page" behavior across platforms should
  know the comparison itself doesn't really apply.
