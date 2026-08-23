# Profile — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/profile/`](../../../../nest-js-boilerplate/src/profile/)

## GraphQL

Resolver: [`profile.resolver.ts`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. No tier gate on anything in this module.

### Get my profile

**Kind:** GraphQL Query · **`myProfile: User!`**
**Source:** [`profile.resolver.ts#L21-28`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts)
**Behavior:** `cache.getOrFetch('cache:profile:{userId}', ..., 60)` — a 60s cache-aside read of
`prisma.user.findUniqueOrThrow`. Returns the full generated `User` model (Prisma-backed GraphQL type),
not a narrowed DTO — every column on `User` is technically reachable through this query's selection
set, including ones a public/other-facing query would withhold (e.g. `hideAvatar` doesn't hide
anything *here*, since the caller is asking about themselves).
**Used by:** Frontend `settings/account`/`settings/general`/`settings/privacy` (via the frontend BFF's
`GET /api/profile`, see [frontend api.md](../../../frontend/v1/settings/account/api.md)); Mobile
`settings/account`/`settings/general`/`settings/privacy` and `users/list`/`users/detail`/the bare
`users` route (direct GraphQL, always self-scoped — see
[MOB-003](../../../issues.md#mob-003) for the user-detail-screen consequence of that).

### Check username availability

**Kind:** GraphQL Query · **`isUsernameAvailable(username: String!): Boolean!`**
**Source:** [`profile.resolver.ts#L30-36`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts),
logic in [`profile.service.ts#L16-27`](../../../../nest-js-boilerplate/src/profile/profile.service.ts)
**Behavior:** lower-cases the input, rejects (returns `false`, doesn't throw) anything outside 3-30
chars or `/^[a-z0-9_]+$/`, then a `prisma.user.findUnique({where: {username}})` — available if no row
exists *or* the existing row is the caller's own (so re-submitting your own current username always
reads available, rather than falsely flagging it taken).
**Used by:** Frontend [settings/account](../../../frontend/v1/settings/account/page.md) (live check
while typing, debounced 300ms); Mobile [settings/account](../../../mobile/v1/settings/account/screen.md)
(same debounce interval, independently implemented).

### Update profile

**Kind:** GraphQL Mutation · **`updateProfile(input: UpdateProfileInput!): User!`**
**Source:** [`profile.resolver.ts#L38-44`](../../../../nest-js-boilerplate/src/profile/profile.resolver.ts),
logic in [`profile.service.ts#L29-80`](../../../../nest-js-boilerplate/src/profile/profile.service.ts),
input [`update-profile.input.ts`](../../../../nest-js-boilerplate/src/profile/dto/update-profile.input.ts)
**Input** (every field `@IsOptional()` — a true partial update, only supplied keys are touched):

```graphql
input UpdateProfileInput {
  name: String          # 1-80 chars
  username: String      # 3-30 chars, /^[a-z0-9_]+$/, case-folded to lowercase server-side
  bio: String            # ≤280 chars
  chatNickname: String   # 1-30 chars; null explicitly clears it (see Behavior)
  useNickname: Boolean   # independent of chatNickname's text — toggling off must not erase it
  avatarUrl: String      # must already exist (see the two-step avatar flow below); IsUrl, require_tld: false
  hideAvatar: Boolean    # withholds avatarUrl from every OTHER-user-facing query/field (not myProfile)
  locale: String         # "en" | "tr" only (IsIn)
  timezone: String       # free-form string, no validation beyond @IsOptional
}
```

**Errors:** `409` (`EX_PROFILE_USERNAME_TAKEN`) if `username` collides with a different user's row —
thrown from the service, not a DB constraint violation surfacing raw.
**Behavior — the avatar upload is a separate step:** this mutation only ever *sets* `avatarUrl` to a
URL the caller already obtained; it does not accept file bytes itself. The real sequence both
platforms follow: upload the file first (frontend: `POST /api/upload` BFF → backend
[`POST /upload/single`](../../messaging-realtime/upload/endpoints.md#upload-a-single-image); mobile:
same backend route directly, no BFF hop), then call this mutation with the returned URL as
`avatarUrl`.
**Behavior — `chatNickname` null vs. omitted vs. empty:** `input.chatNickname !== undefined` is the
service's write condition, so an explicit `null` **does** overwrite the stored value to null (erasing
it) — both platforms' client code maps a blanked-out nickname text field to `null` before sending, for
exactly this reason (never send a literal empty string; `@MinLength(1)` would reject it as invalid,
since `@IsOptional()` only skips validation for `null`/`undefined`, not `""`).
**Side effects:** cache invalidation + a partial Redis session-store mirror — see
[README.md § Side effects worth knowing about](./README.md#side-effects-worth-knowing-about).
**Used by:** Frontend [settings/account](../../../frontend/v1/settings/account/api.md) ·
[settings/general](../../../frontend/v1/settings/general/api.md) ·
[settings/privacy](../../../frontend/v1/settings/privacy/api.md); Mobile
[settings/account](../../../mobile/v1/settings/account/api.md) ·
[settings/general](../../../mobile/v1/settings/general/api.md) ·
[settings/privacy](../../../mobile/v1/settings/privacy/api.md).

## Known issues

- [CROSS-019](../../../issues.md#cross-019) — `locale`/`timezone` round-trip through this mutation/query
  correctly, but neither is read back anywhere to actually change rendered behavior on web (mobile's
  `locale` is the exception — see the issue for the full breakdown by field and platform).
