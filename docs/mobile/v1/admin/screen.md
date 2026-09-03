# Admin (screen)

**Route:** `/v1/:lang/admin` · **Router registration:**
[`router.dart#L493-500`](../../../../flutter-boilerplate/lib/app/router.dart) —
`redirect: (_, state) => requireAdmin(state.pathParameters['lang'] ?? 'en')`
**Entry widget:** `AdminPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/admin/page_view.dart)
**Web equivalent:** [admin page](../../../frontend/v1/admin/page.md)
**Index:** [README.md](./README.md)

## What renders here

A single `Card` with a debounced (300ms) user-search field, search results as `_UserTierRow` items
(avatar, name, email, a tier `DropdownButton` seeded from `widget.user.tier`, a "Set" button), and —
unlike web, which splits audit logs into its own page — the **first 10 audit log entries inline below
the search card** on this same screen. `AdminAuditLogsPageContent` (a separate, fuller browser with
filters/pagination) is a distinct screen at its own route; see [audit-logs/screen.md](./audit-logs/screen.md).

## The admin-role gate

Gated one layer earlier than web: `requireAdmin()`, a `GoRouter` `redirect:` callback evaluated
**before** `AdminPageContent` builds at all, reads the locally-cached `authState.asData?.value?.role`
and redirects anyone without `ADMIN`/`SUPERADMIN` to `/v1/{lang}/feed`
([`router.dart#L161-170`](../../../../flutter-boilerplate/lib/app/router.dart)). The router file's own
comment is explicit about what this is and isn't: *"Backend RBAC already protects the underlying
admin/user-management data; this is a client-side defense-in-depth gate... Mirrors web's
`user?.role === "ADMIN" || user?.role === "SUPERADMIN"` check."*

**`AdminPageContent` itself has no redundant role check of its own** — no `isAdmin` branch, no
access-denied fallback — it unconditionally builds the search UI and audit-log list the moment it's
reached. Contrast web's `PageContent.tsx`, which re-checks role a second time *inside* the component
and substitutes `AccessDeniedPage` for a non-admin even though the route itself already rendered.
Mobile actually has a ready-made equivalent widget for this
(`UnauthorizedPage`/`AccessDeniedPage`-style fallbacks) sitting unused in
[`lib/features/statics/`](../../../mobile/flutter-only-infra.md#libfeaturesstatics) — it just isn't
wired in here. Since the router-level gate fails closed (a `null`/non-admin role always redirects, it
never fails open), this is a defense-in-depth/consistency observation, not a demonstrated data leak —
see `CROSS-039` (resolved — fixed 2026-09-03: web now checks the admin role server-side too (Next `admin/layout.tsx`, TanStack route loader data) and denies before rendering; the in-component check stays as defense in depth).

**The real mutation is correctly backend-gated.** `_setTier()` calls `adminActionsProvider.setTier()` →
[`set_tier.dart`](../../../../flutter-boilerplate/lib/api/server/admin/set_tier.dart) — **direct
GraphQL** (`POST /graphql`, `mutation SetUserTier`), no BFF hop (mobile never touches the Next.js app
for this vertical). This hits the backend's `setUserTier`, `@Roles(ADMIN, SUPERADMIN)`-guarded exactly
as for web — see
[authorization/endpoints.md#set-a-users-tier](../../../backend/identity-access/authorization/endpoints.md#set-a-users-tier).
Unlike web's `/api/admin/set-tier` BFF route, there is no independent client-app-side role re-check
before this call fires — the backend guard is the *only* enforcement layer on mobile's write path
(still correct and safe, just one fewer layer than web's belt-and-suspenders style).

## ⚠ The user-search feature is completely broken

[`search_users.dart`](../../../../flutter-boilerplate/lib/api/server/admin/search_users.dart)'s
`AdminSearchUsersServer.call()` issues `GET '${Urls.adminAuditLogs}/users'` —
i.e. `GET /api/admin/audit-logs/users` — against the backend directly (this vertical's shared `Dio`
instance uses `AppConfig.apiBaseUrl`, confirmed backend-pointed since the sibling `set_tier.dart`/
`audit_logs.dart` files in this same folder post straight to `/graphql`). **No such route exists
anywhere**: the backend's `authorization` module is GraphQL-only (confirmed —
`grep -rn "@Controller(" nest-js-boilerplate/src` has no `admin`-prefixed controller at all, and
`authorization/endpoints.md` itself states "No REST controller"), and the Next.js BFF only defines
`GET /api/admin/audit-logs` and `POST /api/admin/set-tier` — no `/users` sub-route. Every search of 2+
characters throws a `DioException` that `adminSearchUsersProvider` doesn't catch, surfacing as a
visible `Error: ...` message in the results area — this isn't a latent/unreachable bug, it fires on the
very first keystroke past the 2-character minimum. See `MOB-025` (resolved).

This is the same class of bug the sibling `audit_logs.dart` file in this exact folder documents fixing
in its own header comment: *"there is no and never was a REST `/api/admin/audit-logs` route on the
backend; the previous implementation here 404'd on every call"* — `search_users.dart` looks like that
bug's still-broken twin, never given the same fix.

## Backend endpoints this screen depends on

| Action | Backend doc |
|---|---|
| Set a user's tier | [authorization/endpoints.md#set-a-users-tier](../../../backend/identity-access/authorization/endpoints.md#set-a-users-tier) |
| List audit logs (first 10, inline) | [authorization/endpoints.md#list-audit-logs](../../../backend/identity-access/authorization/endpoints.md#list-audit-logs) |
| Search for a user | **broken — see above**, no real endpoint reached |

## Known issues affecting this screen

- `MOB-025` (resolved) — user search is completely broken (dead URL, every call errors).
- `CROSS-039` (resolved) — the admin-role gate has no in-widget redundancy here, unlike web.
