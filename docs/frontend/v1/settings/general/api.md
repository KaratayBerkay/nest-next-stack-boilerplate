# General — API

Page: [page.md](./page.md)

This page calls exactly one backend-reaching action — everything else is a client-only cookie write.
The full BFF/backend file breakdown for `updateProfile` (route internals, cookie re-sync, etc.) is
documented once in [account/api.md](../account/api.md#update-profile) since Account exercises the same
file more heavily; this page only ever sends `{locale, timezone}` as its `updateProfile` payload.

## Calls

- [General page](./page.md) → `useProfileActions().updateProfile({locale, timezone})` →
  [`update.ts`](../../../../../next-js-boilerplate/src/api/server/profile/update.ts) → `POST
  /api/profile/update` →
  [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile)
  — see [account/api.md § Update profile](../account/api.md#update-profile) for the route's full
  behavior, including the `session_user` cookie re-sync this page also relies on (via `refreshUser()`
  after save).

Currency and Date display (`setCurrency`/`setDateDisplay`,
[`lib/settings/handlers.ts`](../../../../../next-js-boilerplate/src/lib/settings/handlers.ts)) call no
API at all — see [page.md](./page.md) for the cookie-only mechanism.

## Known issues

- [CROSS-019](../../../../issues.md#cross-019) — see [page.md § Known issues](./page.md#known-issues).
