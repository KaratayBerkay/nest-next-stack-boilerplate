# Admin

**Routes:** `/v1/[lang]/admin` + `/v1/[lang]/admin/audit-logs` · **Mobile equivalent:**
[admin](../../../mobile/v1/admin/README.md)

Real, working admin tooling — unlike [users/](../users/README.md) (same-looking "admin-ish" naming,
but that vertical is 100% hardcoded demo content). Both pages here are gated to `ADMIN`/`SUPERADMIN`
only, though the gate is enforced at different strengths depending on the layer — see each page's own
"admin-role gate" section and `CROSS-039` (resolved — fixed 2026-09-03: web now checks the admin role server-side too (Next `admin/layout.tsx`, TanStack route loader data) and denies before rendering; the in-component check stays as defense in depth).

## Pages

| Route | Doc |
|---|---|
| `/v1/[lang]/admin` | [page.md](./page.md) — user search + tier management |
| `/v1/[lang]/admin/audit-logs` | [audit-logs/page.md](./audit-logs/page.md) — audit log browser |

## Backend

Both pages are driven by the `authorization` module's `AdminResolver`/`AuditLogResolver` — see
[backend/identity-access/authorization/README.md](../../../backend/identity-access/authorization/README.md),
which documents this vertical as its real (if previously undocumented) consumer, and
[endpoints.md](../../../backend/identity-access/authorization/endpoints.md) for the full operation
list, including `whoAmI`/`adminStats` (pipeline demos with no UI consumer on either platform — expected,
not a bug) and `setUserStatus`/`resetMfa` (real, role-gated mutations with **no** UI consumer on either
platform — see `BE-007` (resolved)). Neither of the latter two is reachable from this
page today.

## Known issues affecting this vertical

- `CROSS-039` (resolved) — the admin-role gate is client-side-only in both pages' own
  component trees on web; see [page.md](./page.md#the-admin-role-gate-is-enforced-correctly-but-is-client-side-only-at-the-page-level).
  The actual privileged mutations/queries are correctly backend-gated regardless.
- `MOB-025` (resolved) — mobile's equivalent of this vertical's search feature is
  completely broken (dead network call, always fails); see
  [mobile/v1/admin/screen.md](../../../mobile/v1/admin/screen.md).
