# Admin Audit Logs (page)

**Route:** `/v1/[lang]/admin/audit-logs` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/admin/audit-logs/page.tsx)
**Mobile equivalent:** [admin/audit-logs screen](../../../../mobile/v1/admin/audit-logs/screen.md)
**Index:** [../README.md](../README.md)

## What renders here

Same shape as [../page.md](../page.md): a trivial `page.tsx` wraps
[`views/admin/audit-logs/PageContent.tsx`](../../../../../next-js-boilerplate/src/views/admin/audit-logs/PageContent.tsx)
(`"use client"`). Composes:

- [`AuditLogsFilters`](../../../../../next-js-boilerplate/src/views/admin/audit-logs/AuditLogsFilters.tsx) —
  action/level dropdowns + a free-text entity-type field, all reset `page` to 0 on change.
- [`AuditLogsTable`](../../../../../next-js-boilerplate/src/views/admin/audit-logs/AuditLogsTable.tsx) —
  paginated (50/page) list of `AuditLog` rows; clicking a row sets `expandedId`.
- [`AuditLogsDiffView`](../../../../../next-js-boilerplate/src/views/admin/audit-logs/AuditLogsDiffView.tsx) —
  renders the expanded row's `before`/`after` JSON snapshots side by side, only shown when a row is
  expanded.

These three are folded into this page doc rather than split into a `components/` folder — each is a
single-purpose piece of this one page's UI, not reused elsewhere (per
[conventions.md §2](../../../../conventions.md#2-file-naming)'s "fold trivial presentational leaves"
guidance).

## The admin-role gate

Identical mechanism and identical caveat to [../page.md § The admin-role gate](../page.md#the-admin-role-gate-is-enforced-correctly-but-is-client-side-only-at-the-page-level):
`isAdmin` is computed client-side inside `PageContent` from `useAuth()`, with no server-side role check
in `page.tsx` or the shared `v1/[lang]/layout.tsx`. Here it does double duty — it also gates the React
Query fetch itself (`enabled: isAdmin` on `auditLogsQueryOptions(...)`), so a non-admin's browser never
even issues the `auditLogs` request. See [CROSS-039](../../../../issues.md#cross-039).

**The backend read is correctly gated independently of the above.** `GET /api/admin/audit-logs`
([`route.ts`](../../../../../next-js-boilerplate/src/app/api/admin/audit-logs/route.ts)) does **not**
re-check role itself — unlike the sibling `set-tier` route — it just forwards the access token and
relays whatever the backend returns (`graphqlErrorBody` translates a GraphQL error into the matching
HTTP status). The real enforcement is entirely the backend's `auditLogs`/`auditLogCount`
`@Roles(ADMIN, SUPERADMIN)` guard (see
[authorization/endpoints.md § List audit logs](../../../../backend/identity-access/authorization/endpoints.md#list-audit-logs)) —
a non-admin caller gets a rejected GraphQL response, not data, so there's no leak, just an
architectural inconsistency with `set-tier`'s belt-and-suspenders style (worth noting, not a bug).

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List audit logs | [authorization/endpoints.md#list-audit-logs](../../../../backend/identity-access/authorization/endpoints.md#list-audit-logs) |
| Count audit logs | [authorization/endpoints.md#count-audit-logs](../../../../backend/identity-access/authorization/endpoints.md#count-audit-logs) |

## Known issues affecting this page

- [CROSS-039](../../../../issues.md#cross-039) — see [../page.md § Known issues](../page.md#known-issues-affecting-this-page).
