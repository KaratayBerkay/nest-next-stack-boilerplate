# convert-frontend-7-flutter — Fix Flutter's realtime WebSocket auth (properly, not just the symptom)

**Date:** 2026-07-25 · **Verified against:** HEAD (`9aa1c9d`) ·
**Status:** 📋 **PLANNING ONLY** — nothing below has been implemented. This doc
was written after finding, via a live Kibana/ES check, that the realtime
WebSocket never once reaches `RealtimeStatus.open` for the whole session —
518 identical `ws.auth_fail (reason: invalid_jwt)` cycles in `backend-logs`,
repeating every 2-3 seconds, never recovering.

> Berkay asked to check why the WebSocket isn't connecting, from logs. The
> logs gave a clean, unambiguous answer (§3.A) — but tracing *why the client
> never recovers* from that answer led somewhere much bigger than "fix one
> field name." **This is not one bug. It's an 8-link broken chain**, and the
> WebSocket-specific bug (§3.G/H) is only the *last* link — every link before
> it is broken too, so fixing only the WebSocket-specific piece would not
> actually fix anything: the chain would just fail one step earlier instead.
> Token refresh is completely non-functional on Flutter today, for both REST
> and WebSocket, and has been since this app's auth flows were written — not
> something this doc's own investigation caused.

---

## 1. How to use this doc

§3 is reference material — read once, cited `file:line`, ordered to match the
actual request flow (login → storage → refresh attempt → backend → back to
the realtime client) rather than by discovery order. §4 is the actual design;
read it before touching code, since D2/D4/D7 change the shape of multiple
files at once. §6 is the stage-ordered task list — **Stage A must land before
Stage B**, and Stage B before Stage C, because each stage's fix is invisible
until the one before it works. §7 is the phase gate.

## 2. Executive summary

Four real, independent-but-compounding problems, each one hiding the next:

1. **Every mobile auth entry point (login/register/OAuth/MFA-verify) already
   receives a `refreshToken` from the backend but never asks for it, and
   never stores it even where a storage method already exists for it** (§3.A,
   §3.B). Four files, same mechanical gap, same mechanical fix (Stage A).
2. **Even with a stored refresh token, nothing could actually use it** — the
   Flutter code that calls the refresh mutation doesn't send the token it's
   given (§3.C, a literally-dead parameter), and the backend endpoint that
   would receive it only accepts it via a cookie, with no header fallback
   unlike the other three session tokens (§3.D) — and Flutter's HTTP client
   has no cookie jar at all. Two sides of the same gap; fixing only one side
   does nothing (Stage B).
3. **Even with a working refresh call, the refreshed token never gets saved**
   — the REST-side 401 handler that already exists uses a freshly-refreshed
   token to retry exactly one request, then throws it away (§3.E) (Stage C).
4. **The realtime client's own recovery path has two separate bugs of its
   own**, on top of everything above: it checks the wrong JSON field name to
   even notice an auth failure happened (§3.F — the bug the log-reading
   session originally found), and even if that's fixed, its cache-bust hook
   is typed as synchronous when a real refresh is inherently async, so the
   timing wouldn't work either (§3.G) — and the one place that constructs the
   realtime client never wires that hook up at all regardless (§3.H)
   (Stage D).

**Bonus, found along the way, not fixed here:** `token.dart`'s `TokenServer`
class is a complete, unused, parallel duplicate of `refresh_token.dart`'s
`RefreshTokenServer` — zero callers, confirmed by grep. Same "dead
scaffolding next to the real thing" shape this project has found repeatedly
elsewhere (the old `hooks/use_event_logger.dart` trio in convert-frontend-6,
for one). Flagged in §6/Stage A as a cleanup item, not a blocker.

## 3. Current state — the broken chain, in request order

All citations verified directly against HEAD `9aa1c9d` by direct file read,
not assumed from memory of earlier sessions.

### 3.A — Login/register/OAuth/MFA-verify never request `refreshToken`

The backend's `AuthPayload` GraphQL type already has a `refreshToken` field
(`nest-js-boilerplate/src/auth/auth.types.ts` — `@Field(() => String,
{ nullable: true }) refreshToken?: string;`, documented inline as "delivered
as both a body field and an httpOnly cookie"). Flutter's auth mutations never
select it. Confirmed identical gap in all four entry points:

- `flutter-boilerplate/lib/api/server/auth/login.dart:11-30` — `_loginMutation`
  selects `accessToken, rbacToken, deviceToken, userToken, mfaRequired,
  mfaToken, user {...}` — no `refreshToken`.
- `flutter-boilerplate/lib/api/server/auth/register.dart` — same shape, same
  gap.
- `flutter-boilerplate/lib/api/server/auth/oauth.dart` — same shape, same gap
  (`loginWithOAuth` mutation).
- `flutter-boilerplate/lib/api/server/auth/mfa.dart` — same shape, same gap
  (`verifyLoginMfa` mutation).

The response types these files parse into —
`flutter-boilerplate/lib/types/auth/auth_request_types.dart`'s
`LoginResponse` (`:30-48`) and `RegisterResponse` (`:74-92`) — have no
`refreshToken` field to receive it even if the query asked.

### 3.B — The storage methods for it already exist, but are dead

`flutter-boilerplate/lib/hooks/use_auth.dart`:

- `AuthNotifier.setRefreshToken(String token)` (`:86-88`) — writes to secure
  storage under `_refreshTokenKey`. **Zero call sites** anywhere in
  `lib/api/` or the four view files that call `setSession()` — confirmed by
  grep. Written, never wired.
- `AuthNotifier.getRefreshToken()` (`:90-92`) — reads it back. Since nothing
  ever writes it (§3.A + this), it **always returns `null`** in practice.
- `AuthNotifier.getAuthTokens()` (`:67-84`) — the method the realtime client
  actually calls every reconnect (via `realtime_provider.dart`, §3.H) — is a
  pure, unconditional read of whatever's currently in secure storage. No
  expiry check, no refresh attempt, nothing. The only way the stored
  `access_token` value ever changes is a fresh call to `setSession()` (i.e.,
  logging in again) — there is no code path today that updates it via a
  refresh exchange.

### 3.C — The refresh call itself doesn't send the refresh token — and there are two competing implementations

`flutter-boilerplate/lib/api/server/auth/refresh_token.dart` — `RefreshTokenServer.call(String refreshToken)`:

```dart
Future<String> call(String refreshToken) async {
  final response = await _dio.post<dynamic>(
    '/graphql',
    data: {'query': _mutation},   // _mutation is a static string, no variables
  );
  ...
}
```

The `refreshToken` parameter is **never referenced inside the method body** —
confirmed by direct read, not a guess. It's accepted, then dropped. This is
the one `AuthInterceptor.onError` (`flutter-boilerplate/lib/lib/api_client.dart`,
§3.E) actually calls.

Separately, `flutter-boilerplate/lib/api/server/auth/token.dart` defines a
**second, parallel class doing the same thing** — `TokenServer.call()` — with
no arguments at all (matching the backend's actual context-only signature,
§3.D) and graceful `null`-on-failure error handling. **Zero callers anywhere
in the app** — confirmed by grep for `TokenServer(`. Complete dead code, not
referenced by `AuthInterceptor` or anything else. Not the cause of any bug by
itself (nothing calls it), but worth deleting when this area gets touched —
same "scaffolding nobody calls" pattern this project has hit before.

### 3.D — The backend only accepts the refresh token via cookie, unlike every other session token

`nest-js-boilerplate/src/auth/auth.resolver.ts:51-53`:

```ts
@Mutation(() => AuthPayload)
refresh(@Context() ctx: { req: Request }): Promise<AuthPayload> {
  return this.auth.refresh({ req: ctx.req });
}
```

No explicit argument — relies entirely on `ctx.req`. Traced into
`auth-session.service.ts:63` → `auth-token.service.ts:125-127`:

```ts
extractRefreshToken(ctx: RequestContext): string | null {
  return this.extractCookie(ctx, refreshCookieName(this.config));
}
```

Compare to `extractUserToken` two methods above it (`:117-123`), which uses
`extractCookieOrHeader(ctx, userCookieName(this.config), 'x-user-token')` —
cookie **or** a header fallback. `extractRefreshToken` is the *only* one of
the four session tokens that doesn't have this fallback — it's
cookie-exclusive. Meanwhile Flutter's `dioProvider`
(`flutter-boilerplate/lib/lib/api_client.dart:9-30`) has **no cookie jar
interceptor at all** — confirmed, only `AuthInterceptor` and a dev-only
`LogInterceptor` are attached. So even a fully-fixed Flutter client sending
the refresh token as a header would still be rejected server-side today,
independent of anything else in this chain.

### 3.E — The one working piece of REST-side refresh logic doesn't persist its result

`flutter-boilerplate/lib/lib/api_client.dart`'s `AuthInterceptor.onError`:

```dart
final newToken = await refreshServer.call(refreshToken);
err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
final response = await Dio().fetch<dynamic>(err.requestOptions);
handler.resolve(response);
```

`newToken` is used to retry the *one* failed request and then discarded —
never written back to secure storage. Even in a hypothetical world where
§3.A-D were all already fixed and this refresh call actually succeeded, the
*next* request (or the next WS reconnect) would still read the stale token
out of storage via `getAuthTokens()`/`getRefreshToken()`, because nothing
here calls anything equivalent to `setSession()` to persist the new value.

### 3.F — Realtime auth-failure detection checks the wrong field name

The bug the original log-reading session found, restated with the exact
comparison: `realtime.gateway.ts:722-731`'s `sendWsError` sends
`{"type":"error","exc":..., "msg": "...", "key": "..."}` — the message is
under **`msg`**. `flutter-boilerplate/lib/lib/realtime/realtime_client.dart:96-99`
checks:

```dart
if (data['type'] == 'error' &&
    (data['message'] as String?)?.toLowerCase().contains('auth') == true) {
```

`data['message']` is `null` for every server error (the key doesn't exist),
so this condition is **always false**. `_pendingAuthFail` never gets set;
`_refreshAndFetchTokens()` never runs. Confirmed via the 518-document log
pattern in §0 above: the client just resends the same token forever.

### 3.G — Even fixed, the cache-bust hook's type can't support an async refresh

`realtime_client.dart:18` declares the hook; `:204-207` is where it's used:

```dart
final VoidCallback? onBustTokenCache;   // :18
...
Future<Map<String, String>?> _refreshAndFetchTokens() async {   // :204-207
  onBustTokenCache?.call();
  return getTokens();
}
```

`VoidCallback` is `void Function()` — synchronous, no return value to await.
Even after fixing §3.F so this code path actually runs, and even after
wiring a real refresh into `onBustTokenCache` (§4/D8), `onBustTokenCache?.call()`
returns immediately; `getTokens()` runs right after with no guarantee the
refresh has finished, let alone persisted anything to storage yet. The type
itself has to change for the two to be sequenced correctly.

### 3.H — The one place `RealtimeClient` gets constructed never passes the hook at all

`flutter-boilerplate/lib/lib/realtime/realtime_provider.dart:15-41` — the
`realtimeProvider` that builds the actual `RealtimeClient` instance used
app-wide passes `url`, `getTokens`, `onStatusChange`, `onFrame` — **no
`onBustTokenCache`**. It's an optional constructor parameter
(`this.onBustTokenCache` with no `required`), so this compiles fine and fails
silently: even with §3.F and §3.G both fixed, `onBustTokenCache` is `null`
here today, so `onBustTokenCache?.call()` is a no-op regardless.

## 4. Decisions

- **D1 — Add `refreshToken` to all four auth mutations' selection sets and
  response types, and call `setRefreshToken()` right alongside every existing
  `setSession()` call.** Mechanical, same shape four times (§3.A's four
  files + `auth_request_types.dart` + the four call sites in
  `login/page_content.dart` ×2, `register/page_content.dart`,
  `social_login_buttons.dart`). No design choice here — the field already
  exists server-side and the storage method already exists client-side, they
  were just never connected.
- **D2 — Give `AuthNotifier` one shared `Future<bool> refreshAccessToken()`
  method**, rather than leaving refresh logic duplicated/ad hoc across
  `AuthInterceptor.onError` and (after D8) `realtime_provider.dart`. It should:
  read the stored refresh token, call the (fixed, §D3) refresh mutation,
  persist the new access token via a new lightweight `updateAccessToken(String)`
  method (deliberately **not** reusing `setSession()`, which requires a full
  user object plus all four tokens — a refresh only ever rotates the access
  token, per `token.dart`'s existing `_mutation` shape returning only
  `accessToken`), and return whether it succeeded. Both `AuthInterceptor` and
  the realtime provider call this same method instead of each having their
  own copy of the logic.
- **D3 — Fix `RefreshTokenServer` to actually send the refresh token, as a
  header, not a cookie.** Delete the dead, parallel `TokenServer`/`token.dart`
  (§3.C) rather than reconciling two implementations — `RefreshTokenServer`
  is the one with real callers and the header fix belongs there.
- **D4 — Backend: make `extractRefreshToken` use `extractCookieOrHeader`,
  matching `extractUserToken`/`extractRbacToken`/`extractDeviceToken`'s
  existing pattern exactly**, adding an `x-refresh-token` header option
  (`auth-token.service.ts:125-127`). Chosen over adding a cookie jar to
  Flutter's Dio client: smaller, lower-risk change (one method, mirroring
  three sibling methods that already work this way) versus introducing new
  cookie-jar dependency/config to the mobile HTTP client for a single
  mutation, and keeps the security model consistent — mobile already
  authenticates rbac/device/user via headers for the exact same
  cookie-vs-native-app reason.
- **D5 — `AuthInterceptor.onError` calls the new shared `refreshAccessToken()`**
  (D2) instead of its current ad hoc `RefreshTokenServer` call, so the
  refreshed token actually gets persisted this time (§3.E), not just used for
  one retry.
- **D6 — Fix the field name**: `realtime_client.dart:97,99`'s `data['message']`
  → `data['msg']`, matching the server's actual payload shape (§3.F).
- **D7 — Change `onBustTokenCache`'s type from `VoidCallback?` to
  `Future<void> Function()?`, and `await` it in `_refreshAndFetchTokens()`**
  before calling `getTokens()` (§3.G), so the sequencing is actually
  guaranteed rather than hoped-for.
- **D8 — Wire `realtime_provider.dart`'s `onBustTokenCache` to
  `() => ref.read(authProvider.notifier).refreshAccessToken()`** (§3.H),
  using the same shared method from D2 rather than a third copy of refresh
  logic.

## 5. Scope

**In scope:** the eight links in §3, all of which sit between "access token
expires" and "realtime connection recovers or doesn't." This is genuinely
one connected fix — landing D6 alone (the originally-found bug) without D1-D5
would make the client correctly *detect* the auth failure and correctly
*attempt* a refresh, and that refresh would still fail, for three independent
reasons (§3.B, §3.C, §3.D) stacked on top of each other.

**Out of scope, deliberately:**
- Whether the *initial* JWT expiry (15 minutes, `JWT_ACCESS_TTL` default) is
  the right TTL for a mobile app that might reasonably stay backgrounded
  longer than a browser tab — a real product question, not a bug, not
  addressed here.
- Any change to the REST-side happy path when a refresh token genuinely is
  absent (e.g., a user who registered before this fix ships and has no
  stored refresh token) — `AuthInterceptor`'s existing "no refresh token →
  logout" fallback (§3.E's surrounding code) is still the correct behavior
  for that case and isn't being changed.
- The web app's own refresh flow (Next.js) — not investigated here; this doc
  is scoped to what's broken in `flutter-boilerplate` specifically, per
  Berkay's own framing of the ask (check the *Flutter* websocket).

## 6. Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day. **Stage A blocks Stage B blocks Stage C blocks
Stage D** — each stage's fix is unreachable/untestable until the previous one
actually works, matching §3's chain order.

### Stage A — Backend + Flutter: actually obtain and store a refresh token

- [ ] **T1 (S) — Add `refreshToken` to all four GraphQL selection sets**:
  `login.dart`, `register.dart`, `oauth.dart`, `mfa.dart` (D1). Mark it
  nullable in each query per the backend's own `AuthPayload.refreshToken?`
  typing.
- [ ] **T2 (S) — Add `refreshToken` field to `LoginResponse` and
  `RegisterResponse`** in `auth_request_types.dart` (and whatever response
  types `oauth.dart`/`mfa.dart` parse into — confirm exact type names at
  implementation time), parsed from the same JSON key.
- [ ] **T3 (S) — Call `setRefreshToken()` at all four `setSession()` call
  sites**: `login/page_content.dart` (both the regular-login and
  MFA-verify branches), `register/page_content.dart`,
  `social_login_buttons.dart` (D1).
- [ ] **T4 (S) — Delete `api/server/auth/token.dart`** (`TokenServer`,
  confirmed zero callers) as a cleanup pass while in this area (§3.C bonus
  finding).

### Stage B — Backend + Flutter: make the refresh call actually work end-to-end

- [ ] **T5 (S) — Backend: `extractRefreshToken` → `extractCookieOrHeader`**
  with a new `x-refresh-token` header (D4), in
  `nest-js-boilerplate/src/auth/auth-token.service.ts:125-127`.
- [ ] **T6 (S) — Flutter: `RefreshTokenServer.call()` sends the refresh
  token as `x-refresh-token`** (D3) — either via `_dio.options.headers` for
  that one call or an explicit `Options(headers: {...})` argument, whichever
  matches this file's existing conventions at implementation time.

### Stage C — Flutter: persist the refresh, share the logic

- [ ] **T7 (M) — Add `AuthNotifier.refreshAccessToken()` and
  `updateAccessToken()`** (D2) to `use_auth.dart`.
- [ ] **T8 (S) — `AuthInterceptor.onError` calls `refreshAccessToken()`**
  (D5) instead of constructing its own `RefreshTokenServer` call inline,
  in `api_client.dart`.

### Stage D — Flutter: fix the realtime client's own two bugs

- [ ] **T9 (S) — Fix `data['message']` → `data['msg']`** in
  `realtime_client.dart:97,99` (D6).
- [ ] **T10 (S) — Change `onBustTokenCache`'s type to `Future<void>
  Function()?` and `await` it in `_refreshAndFetchTokens()`** (D7).
- [ ] **T11 (S) — Wire `realtime_provider.dart`'s `onBustTokenCache`** to
  the new shared `refreshAccessToken()` (D8).

### Stage E — Tests

- [ ] **T12 (S) — Update/add tests for `AuthNotifier`** covering
  `setRefreshToken`/`getRefreshToken`/`refreshAccessToken`/`updateAccessToken`,
  following this app's existing hook-test convention (bare
  `ProviderContainer()`, see `test/hooks/auth_test.dart`).
- [ ] **T13 (S) — Add a test for `RealtimeClient`'s auth-fail detection**
  specifically (feed it a `{"type":"error","msg":"auth failed"}` frame,
  assert `_pendingAuthFail`/reconnect behavior) — `test/hooks/realtime_test.dart`
  already exists as the template; confirm it doesn't already cover this
  path before assuming a gap.

## 7. Verify loop (phase gate)

- [ ] **Live JWT-expiry test**: log in, wait past `JWT_ACCESS_TTL` (15 min
  default — confirm actual configured value first), confirm the *next* WS
  reconnect attempt succeeds (`RealtimeStatus.open`) without a fresh login,
  and confirm via `backend-logs` (per this session's new source-based
  routing) that the `ws.auth_fail` cycle stops and a subsequent `ws.connect`
  has no matching `ws.auth_fail` before authentication succeeds.
  Not achievable without waiting out a real token expiry or lowering
  `JWT_ACCESS_TTL` temporarily in a test environment — plan for whichever is
  less disruptive at implementation time.
- [ ] **REST-side regression check**: confirm `AuthInterceptor`'s existing
  "no refresh token → logout" path still fires correctly for a genuinely
  logged-out/never-refreshed-token user (shouldn't regress from T7/T8).
- [ ] **`flutter analyze` / `dart format --set-exit-if-changed` / `flutter
  test`** clean, matching this project's established gate.
- [ ] **Backend**: confirm `x-refresh-token` header path (T5) doesn't
  accidentally weaken the cookie path for the web app — `extractCookieOrHeader`
  already checks cookie first, header second, matching the other three
  tokens' existing (working) behavior, so this should be additive only; spot
  check a web login → refresh cycle still works via cookie alone, no header
  sent.
- [ ] **No regression**: confirm a *fresh* login (no prior refresh token
  stored, e.g. right after this ships for an existing installed user) still
  behaves reasonably — falls through to `AuthInterceptor`'s existing
  logout-on-401 path rather than throwing, until that user's next real login
  populates a refresh token going forward.
