# Admin (page)

**Route:** `/v1/[lang]/admin` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/admin/page.tsx)
**Mobile equivalent:** [admin screen](../../../mobile/v1/admin/screen.md)
**Index:** [README.md](./README.md)

## What renders here

`page.tsx` is a trivial Server Component (`generateMetadata` + `return <PageContent />`) — all real
logic lives in
[`views/admin/PageContent.tsx`](../../../../next-js-boilerplate/src/views/admin/PageContent.tsx), a
`"use client"` component. It composes a debounced user-search box, a result list of
[`UserTierRow`](../../../../next-js-boilerplate/src/views/admin/UserTierRow.tsx) items (avatar, name,
email, a tier `<select>`, a "Set tier" button), and inline success/error status text after a set-tier
call. `UserTierRow` starts every row's local tier state at `"FREE"` regardless of the user's actual
current tier (it's a write-only control, not a reflection of current state) — the row's `onSetTier`
callback is the only thing wired to the backend.

## The admin-role gate is enforced correctly, but is client-side-only at the page level

`isAdmin` (`user?.role === "ADMIN" || user?.role === "SUPERADMIN"`) is computed inside `PageContent`
itself, from `useAuth()`'s already-loaded session — not in `page.tsx`, and not in the shared
[`v1/[lang]/layout.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/layout.tsx), which only
checks that *some* session exists (`getSessionUser()` → redirect to login if `null`) with no role
condition. A non-admin authenticated user's browser genuinely renders this route; `PageContent` then
substitutes [`AccessDeniedPage`](../../../../next-js-boilerplate/src/features/statics/) for the search
UI once `useAuth()` resolves. No sensitive data is fetched before that check — the search box (and
therefore any network call) simply isn't rendered for a non-admin.
[`AccessDeniedPage`](../../../../next-js-boilerplate/src/features/statics/access-denied/AccessDeniedPage.tsx)
is a real, shared static-page component (see
[flutter-only-infra.md](../../../mobile/flutter-only-infra.md) for why its Flutter counterpart is worth
a cross-reference). See `CROSS-039` (resolved — fixed 2026-09-03: web now checks the admin role server-side too (Next `admin/layout.tsx`, TanStack route loader data) and denies before rendering; the in-component check stays as defense in depth) for how this compares to mobile's
equivalent gate.

**The two real write/read actions this page triggers are correctly gated end-to-end**, independent of
the client-side check above:

- **Set a user's tier** — `POST /api/admin/set-tier`
  ([`route.ts`](../../../../next-js-boilerplate/src/app/api/admin/set-tier/route.ts)) explicitly
  re-fetches `me { role }` server-side and 403s any non-`ADMIN`/`SUPERADMIN` caller *before* forwarding
  to the backend mutation — a genuine second, independent server-side check, not just a relay. The
  backend's `setUserTier` itself is also `@Roles(ADMIN, SUPERADMIN)`-guarded (see
  [authorization/endpoints.md § Set a user's tier](../../../backend/identity-access/authorization/endpoints.md#set-a-users-tier)),
  so this is belt-and-suspenders even if the BFF check were ever removed.
- **Search for a user** — the search box calls
  [`searchAdminUsersServer()`](../../../../next-js-boilerplate/src/api/server/admin/search-users.ts),
  which hits `GET /api/users/search` — **the same, non-admin-specific BFF route and backend query that
  [find-friends](../find-friends/page.md) uses** (see
  [find-friends/api.md § User search](../find-friends/api.md#user-search)). That route only requires a
  valid session (no role check at all — the underlying GraphQL `users(search: String)` query, served by
  `MessagingResolver`, carries `SessionAuthGuard` only). This isn't a new leak introduced by this page:
  any authenticated user can already reach the identical name/email search via find-friends. It does
  mean the search step contributes **no privilege boundary of its own** — the only thing standing
  between "any logged-in user" and "can see a name+email list" is this page's own (client-side-only)
  render gate, while the actual privileged action (changing a tier) is the part that's properly
  double-gated above.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Set a user's tier | [authorization/endpoints.md#set-a-users-tier](../../../backend/identity-access/authorization/endpoints.md#set-a-users-tier) |
| Search for a user | [find-friends/api.md#user-search](../find-friends/api.md#user-search) (shared file, not admin-specific) |

## Known issues affecting this page

- `CROSS-039` (resolved) — the admin-role gate is client-side-only in this page's own
  component tree (contrast [mobile's screen](../../../mobile/v1/admin/screen.md), which gates one layer
  earlier — a router redirect — but has *no* redundant in-widget check at all, unlike this page's
  `AccessDeniedPage` fallback). Not a data-exposure bug on either platform — both platforms' real
  mutation/query enforcement is correctly backend-side.
