# Account — API

Page: [page.md](./page.md) · Client: [`src/api/client/profile/`](../../../../../next-js-boilerplate/src/api/client/profile/) ·
Server (BFF): [`src/api/server/profile/`](../../../../../next-js-boilerplate/src/api/server/profile/)

**Shared across all three profile settings pages.** `useProfileActions()` and every file below are the
same ones [general/api.md](../general/api.md) and [privacy/api.md](../privacy/api.md) call — documented
once here, referenced from both siblings, since this page (Account) is the one that actually exercises
all four.

## Client — `useProfileActions()`

[`src/api/client/profile/actions.ts`](../../../../../next-js-boilerplate/src/api/client/profile/actions.ts) —
three thin lazy-import wrappers, no state, no caching:

| Export | Wraps | Used by |
|---|---|---|
| `updateProfile(data)` | `updateProfileServer` | Account (name/username/bio/avatarUrl), [General](../general/api.md) (locale/timezone), [Privacy](../privacy/api.md) (chatNickname/useNickname/hideAvatar) |
| `uploadAvatar(file)` | `uploadAvatarServer` | Account only |
| `checkUsername(username)` | `checkUsernameAvailableServer` | Account only |

## Server / BFF routes (`src/api/server/profile/`)

### Get profile

**Source:** [`get.ts`](../../../../../next-js-boilerplate/src/api/server/profile/get.ts) · `GET
PROFILE_URL` (`/api/profile`) → route
[`src/app/api/profile/route.ts`](../../../../../next-js-boilerplate/src/app/api/profile/route.ts) →
backend [`myProfile`](../../../../backend/social-content/profile/endpoints.md#get-my-profile).
Declared return type (`ProfileData.user`) is narrower than what the route actually requests
(`locale`/`timezone` are fetched by the route's own GraphQL query but not in the TS interface) — not
filed as its own issue since it's cosmetic (the extra fields are simply untyped, not silently dropped;
[General](../general/page.md) reads them off `useAuth().user` instead of this call anyway).

### Update profile

**Source:** [`update.ts`](../../../../../next-js-boilerplate/src/api/server/profile/update.ts) · `POST
PROFILE_UPDATE_URL` (`/api/profile/update`) → route
[`src/app/api/profile/update/route.ts`](../../../../../next-js-boilerplate/src/app/api/profile/update/route.ts) →
backend [`updateProfile`](../../../../backend/social-content/profile/endpoints.md#update-profile).
**Worth reading the route directly**: past the mutation call, it also re-encodes and re-sets the
`session_user` cookie by merging the mutation's response into the currently-decoded cookie value — a
deliberate fix (per its own inline comment) for a bug where a saved profile change looked successful
but kept serving pre-edit data from `/api/auth/me`'s fast path / SSR's `getSessionUser()` until the
next full refresh. `hideAvatar` specifically is special-cased in that merge (`if (typeof
input.hideAvatar === "boolean")`) because it isn't queryable on the mutation's own GraphQL selection
set — it's withheld from every non-`myProfile` `User` field on purpose (see
[profile backend README](../../../../backend/social-content/profile/README.md)), so the route trusts
"the mutation succeeded" as proof the requested value is now persisted, rather than reading it back.

### Check username availability

**Source:** [`username-available.ts`](../../../../../next-js-boilerplate/src/api/server/profile/username-available.ts) ·
`GET PROFILE_USERNAME_AVAILABLE_PREFIX?u=` (`/api/profile/username-available`) → route
[`src/app/api/profile/username-available/route.ts`](../../../../../next-js-boilerplate/src/app/api/profile/username-available/route.ts) →
backend [`isUsernameAvailable`](../../../../backend/social-content/profile/endpoints.md#check-username-availability).

### Upload avatar

**Source:** [`upload-avatar.ts`](../../../../../next-js-boilerplate/src/api/server/profile/upload-avatar.ts) ·
`POST UPLOAD_URL` (`/api/upload`, multipart) → route
[`src/app/api/upload/route.ts`](../../../../../next-js-boilerplate/src/app/api/upload/route.ts) —
validates MIME type + size again server-side (defense in depth against the client check in
[page.md](./page.md)'s `uploadAvatarFile`) — → backend [`POST /upload/single`](../../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image)
not detailed here). The returned URL is then passed to `updateProfile({avatarUrl})` as a *second*,
separate call — uploading a file never itself updates the profile row.

## Calls

- [Account page](./page.md) → `getProfileServer()`, `updateProfileServer()` (name/username/bio/
  avatarUrl), `checkUsernameAvailableServer()`, `uploadAvatarServer()` — all four files above
