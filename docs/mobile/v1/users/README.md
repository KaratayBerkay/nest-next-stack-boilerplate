# Users

**Routes:** `/v1/:lang/users` (name `v1Users`) + `/v1/:lang/users/list` (name `v1UsersList`) +
`/v1/:lang/users/detail/:uuid` (name `v1UserDetail`) + `/v1/:lang/users/:userId` (name
`v1UserDetailLegacy`, a redirect) · **Web equivalent:** [users](../../../frontend/v1/users/README.md)
— **not a parity match**, see below.

## Read this before assuming parity with web

Web's `users/list`/`users/detail` are hardcoded static demo content, reachable by any authenticated
user, calling no backend at all — see
[frontend/v1/users/README.md](../../../frontend/v1/users/README.md) and
[CROSS-016](../../../issues.md#cross-016). **Mobile's same-named screens are the opposite in every
dimension**: a real, live-data feature (friends list + live user search, both backed by real GraphQL
calls) that is **gated to `ADMIN`/`SUPERADMIN` role only** — every route in this family carries a
`redirect: (_, state) => requireAdmin(...)` guard
([`router.dart#L511-547`](../../../../flutter-boilerplate/lib/app/router.dart)) that bounces
non-admins to `/feed` before the screen ever builds. Web has no role or tier gate on these pages at
all. See [CROSS-016](../../../issues.md#cross-016) for the full comparison.

## Four routes, not two

| Route | Name | Widget | Real / dead |
|---|---|---|---|
| `/v1/:lang/users` | `v1Users` | [`UsersPageContent`](../../../../flutter-boilerplate/lib/views/users/page_view.dart) | Registered and admin-gated, but has **zero navigational callers anywhere in the app** and its list rows have no `onTap` — see [Known issues](#known-issues-affecting-this-vertical). Not documented as its own screen (no web equivalent, unreachable in practice); mentioned here for completeness. |
| `/v1/:lang/users/list` | `v1UsersList` | see [list/screen.md](./list/screen.md) | Real, reachable via admin nav |
| `/v1/:lang/users/detail/:uuid` | `v1UserDetail` | see [detail/screen.md](./detail/screen.md) | Real, reachable — but see [MOB-003](../../../issues.md#mob-003) |
| `/v1/:lang/users/:userId` | `v1UserDetailLegacy` | (redirect only, no widget) | Rewrites to `/users/detail/:userId` — a plain path alias, not a separate screen |

## Pages

| Route | Doc |
|---|---|
| `/v1/:lang/users/list` | [list/screen.md](./list/screen.md) |
| `/v1/:lang/users/detail/:uuid` | [detail/screen.md](./detail/screen.md) |

## API

[api.md](./api.md)

## Known issues affecting this vertical

- [CROSS-016](../../../issues.md#cross-016) — web is static demo content with no access gate; mobile is a
  real feature gated to admins only. Two platforms, one route name, unrelated implementations.
- [MOB-003](../../../issues.md#mob-003) — [detail/screen.md](./detail/screen.md) always shows the
  caller's own profile, regardless of which user was tapped.
- [MOB-004](../../../issues.md#mob-004) — the bare `/v1/:lang/users` route/widget
  (`UsersPageContent`/`v1Users`) is unreachable in practice: no navigational caller anywhere in the
  app (`grep -rn "'v1Users'" flutter-boilerplate/lib`, outside `router.dart` itself, returns nothing;
  neither does a literal `/users'` path), and its own `ListTile` rows have no `onTap` handler even if
  reached by direct URL entry. No web route exists at this exact path either (web has no bare `users/`
  page, only `users/list` and `users/detail/[uuid]`).
