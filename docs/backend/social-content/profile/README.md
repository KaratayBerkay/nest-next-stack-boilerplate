# Profile (backend)

**Source:** [`nest-js-boilerplate/src/profile/`](../../../../nest-js-boilerplate/src/profile/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## Read this before trusting the module name — `profile/` vs `users/`

This is the **real** user/account module — display name, username, bio, avatar, locale, timezone,
chat nickname, avatar-hide privacy toggle. `nest-js-boilerplate/src/users/` is a **different, unrelated
demo module** ("demo CRUD module — leaks passwordHash; must not run in production", per its own source
comment, gated behind `DEMO_MODULES`) that happens to sit right next to this one with a confusable
name. See [BE-002](../../../issues.md#be-002) and [backend/README.md](../../README.md)'s own warning
at the top. If you're looking for the module behind account settings, this is it; if a `users/` import
shows up in a call chain you're tracing, stop and check which one before assuming.

The frontend/mobile `users/` **pages** are also unrelated to *either* backend module — see
[frontend/v1/users/README.md](../../../frontend/v1/users/README.md) and
`CROSS-016` (resolved): the web pages are hardcoded demo content with zero backend calls,
and mobile's are a real feature that calls this module (`myProfile`, indirectly) plus the messaging
module's friends list/search, not a dedicated "look up another user's profile" endpoint (there isn't
one — see [Known issues](#known-issues)).

## What this module owns

One GraphQL resolver, three operations, all scoped to the caller (`@CurrentUser()`) — there is no
query anywhere in this module (or the schema at large) to fetch *another* user's profile by id. See
[`profile.resolver.ts`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts):

| Operation | Kind | Purpose |
|---|---|---|
| `myProfile` | Query | the caller's own full profile row, cached 60s (`cache:profile:{userId}`) |
| `isUsernameAvailable` | Query | live availability check while typing (also self-excluding — your own current username always reads "available") |
| `updateProfile` | Mutation | partial update — **one mutation backs every field** account/general/privacy settings edit on both platforms |

`updateProfile`'s partial-update shape (`UpdateProfileInput`, all fields `@IsOptional()`) is the reason
three visually distinct settings pages — [account](../../../frontend/v1/settings/account/page.md),
[general](../../../frontend/v1/settings/general/page.md),
[privacy](../../../frontend/v1/settings/privacy/page.md) — all call the *same* mutation with different
field subsets rather than each having its own endpoint:

| Field | Written by | Notes |
|---|---|---|
| `name`, `username`, `bio`, `avatarUrl` | Account | `username` also drives `isUsernameAvailable` |
| `locale`, `timezone` | General | see [CROSS-019](../../../issues.md#cross-019) — both persist correctly, but neither is actually *read back* by the web client to affect rendering (mobile's `locale` save does drive the live UI language; `timezone` doesn't, on either platform) |
| `chatNickname`, `useNickname`, `hideAvatar` | Privacy | `chatNickname` update is preserve-on-disable by contract (see the field's own doc comment in [`update-profile.input.ts`](../../../../nest-js-boilerplate/src/profile/dto/update-profile.input.ts)) — toggling `useNickname` off must not erase a saved nickname; only an explicit empty-string submission does (mapped to `null` client-side, see both platforms' `api.md`) |

`avatarUrl` itself is set via this mutation but the actual file bytes go through the separate
[`upload/` module § Upload a single image](../../messaging-realtime/upload/endpoints.md#upload-a-single-image) — see [endpoints.md](./endpoints.md#update-profile) for the exact two-step
flow.

## Side effects worth knowing about

`updateProfile` ([`profile.service.ts#L29-80`](../../../../nest-js-boilerplate/src/profile/profile.service.ts))
does three things per call, not just the Prisma write:

1. `prisma.user.update(...)` — the actual persisted change.
2. `cache.invalidate('cache:profile:{userId}')` — so the next `myProfile` read isn't stale (best-effort;
   `CacheAsideService` swallows its own failures).
3. `tokenStore.rewriteFieldsForUser(userId, redisFields)` — mirrors a subset of the changed fields
   (`name`, `chatNickname`, `useNickname`, `username`, `avatarUrl`, `hideAvatar`, `locale`, `timezone`)
   into the Redis-backed session/token store, **only for fields that were actually part of this call**.
   This is what keeps the session snapshot (`/api/auth/me`, the `session_user` cookie on web) in sync
   without a full re-login — both platforms additionally re-fetch the session user client-side after a
   successful save (`refreshUser()` on web, a `meServerProvider` call on mobile) as a second layer,
   not purely trusting this Redis mirror to propagate on its own.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| GraphQL resolver | [`profile.resolver.ts`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts) | [endpoints.md § GraphQL](./endpoints.md#graphql) |

No REST controller, no WS gateway. (Both platforms' `settings/account` reach this over REST anyway —
via their own BFF/proxy layer, not a native backend REST route — see each platform's `api.md`.)

## Depends on

`AuthModule` (`TokenStoreService`, for the Redis mirror above), `CacheAsideService`, `PrismaService`.

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [settings/account](../../../frontend/v1/settings/account/page.md) · [settings/general](../../../frontend/v1/settings/general/page.md) · [settings/privacy](../../../frontend/v1/settings/privacy/page.md) |
| Mobile | [settings/account](../../../mobile/v1/settings/account/screen.md) · [settings/general](../../../mobile/v1/settings/general/screen.md) · [settings/privacy](../../../mobile/v1/settings/privacy/screen.md) |

`users/list` and `users/detail` on **web** do **not** call this module (or any backend) — see
`CROSS-016` (resolved). `users/list`/`users/detail`/the bare `users` route on **mobile**
call `myProfile` (via the same `GET`-shaped `ProfileGetServer`/`profileGetServerProvider` the settings
screens use) but only ever for the *caller's own* profile — see
`MOB-003` (resolved) and [Known issues](#known-issues) below.

## Known issues

- `MOB-003` (resolved) — there is no backend query to fetch another user's profile by
  id. Mobile's user-detail screen calls `myProfile` (self-scoped) regardless of which user's card was
  tapped, so it always renders the caller's own data — not a gap in this module's contract by itself,
  but this module is the reason a correct fix needs either a new query here or a different data source
  entirely (the friend-list/search rows already carry enough to render the card without a second
  fetch). See [mobile/v1/users/detail/screen.md](../../../mobile/v1/users/detail/screen.md#known-issues).
- [CROSS-019](../../../issues.md#cross-019) — `locale`/`timezone` persist correctly through this module but
  aren't consistently consumed by either client afterward. See
  [frontend/v1/settings/general/page.md](../../../frontend/v1/settings/general/page.md#known-issues).
