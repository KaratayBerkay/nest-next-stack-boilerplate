# Admin Audit Logs (screen)

**Route:** `/v1/:lang/admin/audit-logs` · **Router registration:**
[`router.dart#L502-509`](../../../../../flutter-boilerplate/lib/app/router.dart) — same
`requireAdmin(lang)` redirect guard as [../screen.md](../screen.md).
**Entry widget:** `AdminAuditLogsPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/admin/audit_logs/page_view.dart) —
note the real source folder is `audit_logs` (snake_case); this doc folder is `audit-logs` to match the
shared web route segment, per
[conventions.md §1](../../../../conventions.md#1-folder-structure-rule).
**Web equivalent:** [admin/audit-logs page](../../../../frontend/v1/admin/audit-logs/page.md)
**Index:** [../README.md](../README.md)

## What renders here

A fuller browser than [../screen.md](../screen.md)'s inline 10-entry preview: action/level filter
dropdowns, an entity-type text filter (all three reset to page 0 on change), a paginated
(50/page) list of `_AuditLogRow` items, and a tap-to-expand `_AuditLogDetail` panel per row showing
actor/summary/ip/requestId/details plus a before/after JSON diff when present — functionally
equivalent to web's `AuditLogsFilters`/`AuditLogsTable`/`AuditLogsDiffView` trio, implemented as
private widgets inside this one file instead of split into siblings.

## The admin-role gate

Same mechanism as [../screen.md § The admin-role gate](../screen.md#the-admin-role-gate): the
`requireAdmin()` router redirect is the only gate. `AdminAuditLogsPageContent` itself has no in-widget
role check either, same as the parent admin screen. See [CROSS-039](../../../../issues.md#cross-039).

## API

[`audit_logs.dart`](../../../../../flutter-boilerplate/lib/api/server/admin/audit_logs.dart) — direct
GraphQL (`POST /graphql`, `query AuditLogs`), no BFF hop. This file's own header comment documents a
real, already-fixed bug worth recording here since it's directly relevant to this screen's history:
*"Mirrors next-js-boilerplate's `app/api/admin/audit-logs/route.ts`. The backend only ever exposed
this via GraphQL... there is no and never was a REST `/api/admin/audit-logs` route on the backend; the
previous implementation here 404'd on every call."* Hits the backend's `auditLogs`/`auditLogCount`,
`@Roles(ADMIN, SUPERADMIN)`-guarded — see
[authorization/endpoints.md#list-audit-logs](../../../../backend/identity-access/authorization/endpoints.md#list-audit-logs).
No independent client-side role re-check before the call (same as [../screen.md](../screen.md)'s
`set_tier.dart` — the backend guard is the only enforcement layer on this vertical, on mobile).

The sibling file in the same folder,
[`search_users.dart`](../../../../../flutter-boilerplate/lib/api/server/admin/search_users.dart), was
**not** given the same fix — see [../screen.md § the user-search feature is completely broken](../screen.md#-the-user-search-feature-is-completely-broken)
and `MOB-025` (resolved).

## Backend endpoints this screen depends on

| Action | Backend doc |
|---|---|
| List audit logs | [authorization/endpoints.md#list-audit-logs](../../../../backend/identity-access/authorization/endpoints.md#list-audit-logs) |
| Count audit logs | [authorization/endpoints.md#count-audit-logs](../../../../backend/identity-access/authorization/endpoints.md#count-audit-logs) |

## Known issues affecting this screen

- [CROSS-039](../../../../issues.md#cross-039) — no in-widget role-gate redundancy, same as the parent screen.
