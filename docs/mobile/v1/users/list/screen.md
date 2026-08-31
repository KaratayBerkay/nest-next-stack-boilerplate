# Users List (screen)

**Route:** `/v1/:lang/users/list` (GoRouter name `v1UsersList`)
**Router registration:** [`router.dart#L520-528`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`redirect: (_, state) => requireAdmin(...)` before `builder`; see
[../README.md](../README.md#read-this-before-assuming-parity-with-web).
**Entry widget:** `UsersListPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/users/list/page_view.dart)
**Web equivalent:** [users/list page](../../../../frontend/v1/users/list/page.md) — **not a parity
match**, see [../README.md](../README.md)

## What renders here

A `ConsumerStatefulWidget`, no tier gating (only the router-level admin role gate). A search field at
the top; below it, one of two live lists depending on whether `_query` is empty:

- **Empty query** — `friendsListProvider` ([messages](../../messages/api.md)'s shared provider,
  reused): every accepted friend, with a live online/offline dot + label. Tapping a row navigates to
  `/v1/{lang}/users/{friend.id}` (the legacy redirect route, which forwards to
  `/users/detail/{friend.id}`).
- **Non-empty query** — `searchUsersProvider(_query)` (shared with
  [find-friends](../../find-friends/screen.md), see [../api.md](../api.md)): live search results, same
  navigation-on-tap behavior.

Both branches use `ref.watch(...)` unconditionally on every build — including the search provider,
which therefore fires a `users(search: '')` request on first paint even when `_query` is still empty
and its result isn't rendered. Minor, not filed as its own issue (no functional impact beyond one
wasted round trip per page visit), but worth knowing if this file is touched again.

## Known issues

- `CROSS-016` (resolved) — this screen is real and admin-gated; web's same-named page
  is static demo content open to any authenticated user. See [../README.md](../README.md).
