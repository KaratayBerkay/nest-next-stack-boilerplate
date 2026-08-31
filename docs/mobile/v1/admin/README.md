# Admin

**Routes:** `/v1/:lang/admin` + `/v1/:lang/admin/audit-logs` · **Web equivalent:**
[admin](../../../frontend/v1/admin/README.md)

Real, working admin tooling on both platforms — gated to `ADMIN`/`SUPERADMIN` via a `GoRouter`
`redirect:` (`requireAdmin()`,
[`router.dart#L161-170`](../../../../flutter-boilerplate/lib/app/router.dart)) applied to every route
in this family. Unlike web, tier management and a 10-entry audit-log preview share one screen
([screen.md](./screen.md)); the fuller filterable/paginated audit-log browser is a second, separate
screen ([audit-logs/screen.md](./audit-logs/screen.md)).

## Screens

| Route | Doc |
|---|---|
| `/v1/:lang/admin` | [screen.md](./screen.md) — user search + tier management + 10-entry audit log preview |
| `/v1/:lang/admin/audit-logs` | [audit-logs/screen.md](./audit-logs/screen.md) — full filterable/paginated audit log browser |

## Backend

Same `authorization` module as web — see
[backend/identity-access/authorization/README.md](../../../backend/identity-access/authorization/README.md)
and [endpoints.md](../../../backend/identity-access/authorization/endpoints.md).

## Known issues affecting this vertical

- `MOB-025` (resolved) — [screen.md](./screen.md)'s user-search feature is completely
  broken: every search call hits a URL with no matching backend route or BFF route, and throws visibly.
  The tier-set action itself works correctly once a `userId` is known by some other means.
- [CROSS-039](../../../issues.md#cross-039) — neither screen in this vertical has an in-widget role-check
  fallback; both rely entirely on the router-level redirect. Contrast
  [web](../../../frontend/v1/admin/README.md), whose page components re-check role a second time and
  render `AccessDeniedPage`. Not a demonstrated data leak on either platform — the real
  mutations/queries are correctly backend-gated regardless — but mobile has a ready-built, unused
  equivalent widget sitting in [`lib/features/statics/`](../../../mobile/flutter-only-infra.md) that
  could close this gap.
