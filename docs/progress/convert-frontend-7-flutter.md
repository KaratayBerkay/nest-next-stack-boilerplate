# convert-frontend-7-flutter — Fix Flutter's realtime WebSocket auth (properly, not just the symptom)

**Date:** 2026-07-25 · **Verified against:** HEAD (`9aa1c9d`) at planning time,
`cc1553d` at verification round 1, F1 fixed 2026-07-26, round 2 opened
2026-07-26 against the same working tree (F1's fix still uncommitted) ·
**Status:** ⚠️ **AUTH CHAIN + FRAME-DELIVERY CHAIN BOTH IMPLEMENTED, NEITHER
LIVE-VERIFIED, TESTS OPEN FOR BOTH ROUNDS** —
T1-T11 (Stages A-D, the auth/reconnect chain) are all implemented and
verified correct, including F1 (§8): `login.dart`'s regular-login path
and `register.dart` now both read `refreshToken` out of the parsed JSON into
their response objects, matching what `fromJson` already did for the
MFA-verify and OAuth paths. All four auth entry points now actually store a
refresh token. `flutter analyze`/`dart format` clean on the changed files;
`test/views/auth` + `test/hooks/auth_test.dart` still pass, no regression.
**T12/T13 (tests, §8 F2) are still not implemented.**
**§9-§11 (new, 2026-07-26): the socket reaches `RealtimeStatus.open`
(confirmed live — see the logcat Berkay pasted, quoted in §9), but that only
proves the auth handshake (Stage A-D) succeeded — a second, larger,
independent problem was found immediately after: almost nothing built on top
of the connection ever received a frame, for reasons that have nothing to do
with auth.** Root cause: `claimPage()` — the one client call that drives the
server's feed/post topic-watching, chat-room joining, and messages/
notifications/friend-request page-scoped delivery — was never called
anywhere in the Flutter app. **T14-T20 (Stages F-I) are now implemented**
— route-driven page claims, a corrected `renew`/`type`-aware frame
dispatcher, and the three chat-room-specific fixes (§11) — and
`flutter analyze`/`dart format`/`flutter test` are all clean (339/340, same
pre-existing unrelated failure as round 1). **Not yet done: T21-T23 (new
tests for this round) and every item in §12's live verify loop** — nothing
in this round has been exercised against a running app with a second
session yet, only verified by direct code read and the static gates. See §9
for the full chain, §10 for decisions, §11 for tasks, §12 for what's still
unverified live.
This doc was originally written after finding, via a live Kibana/ES check, that the realtime
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

- [x] **T1 (S) — Add `refreshToken` to all four GraphQL selection sets**:
  `login.dart`, `register.dart`, `oauth.dart`, `mfa.dart` (D1). Mark it
  nullable in each query per the backend's own `AuthPayload.refreshToken?`
  typing. **Verified done** — all four mutations select it.
- [x] **T2 (S) — Add `refreshToken` field to `LoginResponse` and
  `RegisterResponse`** in `auth_request_types.dart` (and whatever response
  types `oauth.dart`/`mfa.dart` parse into — confirm exact type names at
  implementation time), parsed from the same JSON key. **Verified done** —
  `LoginResponse`, `RegisterResponse` (`auth_request_types.dart`), and
  `OAuthLoginResponse` (`oauth_types.dart`) all carry `String? refreshToken`
  with a `fromJson` that reads it.
- [x] **T3 (S) — Call `setRefreshToken()` at all four `setSession()` call
  sites**: `login/page_content.dart` (both the regular-login and
  MFA-verify branches), `register/page_content.dart`,
  `social_login_buttons.dart` (D1). **Fixed 2026-07-26 — see §8 F1.** All
  four call sites call `setRefreshToken()` guarded by `if (rt != null)`; `rt`
  (`response.refreshToken`) was always `null` for the regular-login
  (`login.dart:75-85`) and register (`register.dart:63-71`) paths because
  those two files hand-construct their response object from the parsed JSON
  and never read `result['refreshToken']` into it. Both now do
  (`refreshToken: result['refreshToken'] as String?,` added to each
  construction). All four entry points verified correct.
- [x] **T4 (S) — Delete `api/server/auth/token.dart`** (`TokenServer`,
  confirmed zero callers) as a cleanup pass while in this area (§3.C bonus
  finding). **Verified done** — file no longer exists, zero remaining
  `TokenServer(` references.

### Stage B — Backend + Flutter: make the refresh call actually work end-to-end

- [x] **T5 (S) — Backend: `extractRefreshToken` → `extractCookieOrHeader`**
  with a new `x-refresh-token` header (D4), in
  `nest-js-boilerplate/src/auth/auth-token.service.ts:125-127`. **Verified
  done** — matches `extractRbacToken`/`extractDeviceToken`/`extractUserToken`'s
  existing pattern exactly.
- [x] **T6 (S) — Flutter: `RefreshTokenServer.call()` sends the refresh
  token as `x-refresh-token`** (D3) — either via `_dio.options.headers` for
  that one call or an explicit `Options(headers: {...})` argument, whichever
  matches this file's existing conventions at implementation time. **Verified
  done** — sent via `Options(headers: {'x-refresh-token': refreshToken})`.

### Stage C — Flutter: persist the refresh, share the logic

- [x] **T7 (M) — Add `AuthNotifier.refreshAccessToken()` and
  `updateAccessToken()`** (D2) to `use_auth.dart`. **Verified done.**
- [x] **T8 (S) — `AuthInterceptor.onError` calls `refreshAccessToken()`**
  (D5) instead of constructing its own `RefreshTokenServer` call inline,
  in `api_client.dart`. **Verified done**, including re-fetching and
  re-applying all four headers before retrying the failed request.

### Stage D — Flutter: fix the realtime client's own two bugs

- [x] **T9 (S) — Fix `data['message']` → `data['msg']`** in
  `realtime_client.dart:97,99` (D6). **Verified done.**
- [x] **T10 (S) — Change `onBustTokenCache`'s type to `Future<void>
  Function()?` and `await` it in `_refreshAndFetchTokens()`** (D7).
  **Verified done.**
- [x] **T11 (S) — Wire `realtime_provider.dart`'s `onBustTokenCache`** to
  the new shared `refreshAccessToken()` (D8). **Verified done.**

### Stage E — Tests

- [ ] **T12 (S) — Update/add tests for `AuthNotifier`** covering
  `setRefreshToken`/`getRefreshToken`/`refreshAccessToken`/`updateAccessToken`,
  following this app's existing hook-test convention (bare
  `ProviderContainer()`, see `test/hooks/auth_test.dart`). **Not done** —
  `auth_test.dart` still only has the original 4 pre-existing tests.
- [ ] **T13 (S) — Add a test for `RealtimeClient`'s auth-fail detection**
  specifically (feed it a `{"type":"error","msg":"auth failed"}` frame,
  assert `_pendingAuthFail`/reconnect behavior) — `test/hooks/realtime_test.dart`
  already exists as the template; confirm it doesn't already cover this
  path before assuming a gap. **Not done** — `realtime_test.dart` still only
  has the original 3 provider-default tests, no frame-handling coverage.

## 7. Verify loop (phase gate)

- [ ] **Live JWT-expiry test**: log in, wait past `JWT_ACCESS_TTL` (15 min
  default — confirm actual configured value first), confirm the *next* WS
  reconnect attempt succeeds (`RealtimeStatus.open`) without a fresh login,
  and confirm via `backend-logs` (per this session's new source-based
  routing) that the `ws.auth_fail` cycle stops and a subsequent `ws.connect`
  has no matching `ws.auth_fail` before authentication succeeds.
  Not achievable without waiting out a real token expiry or lowering
  `JWT_ACCESS_TTL` temporarily in a test environment — plan for whichever is
  less disruptive at implementation time. **Still open** — not run this
  round; also moot for the regular-login/register paths until F1 (§8) is
  fixed, since they'd never have a refresh token to test with.
- [ ] **REST-side regression check**: confirm `AuthInterceptor`'s existing
  "no refresh token → logout" path still fires correctly for a genuinely
  logged-out/never-refreshed-token user (shouldn't regress from T7/T8).
  **Still open** — not exercised live this round.
- [x] **`flutter analyze` / `dart format --set-exit-if-changed` / `flutter
  test`** clean, matching this project's established gate. **`analyze` and
  `format` are clean.** `flutter test`: 329/330 pass; the one failure
  (`card_test.dart: CardWidget supports onTap callback`) is pre-existing and
  unrelated — reproduces on an untouched file regardless of this doc's
  changes, nothing to do with auth or realtime.
- [ ] **Backend**: confirm `x-refresh-token` header path (T5) doesn't
  accidentally weaken the cookie path for the web app — `extractCookieOrHeader`
  already checks cookie first, header second, matching the other three
  tokens' existing (working) behavior, so this should be additive only; spot
  check a web login → refresh cycle still works via cookie alone, no header
  sent. **Code-verified only** (the cookie-first/header-second order is
  confirmed unchanged in `auth-token.service.ts`) — no live web login cycle
  run this round.
- [ ] **No regression**: confirm a *fresh* login (no prior refresh token
  stored, e.g. right after this ships for an existing installed user) still
  behaves reasonably — falls through to `AuthInterceptor`'s existing
  logout-on-401 path rather than throwing, until that user's next real login
  populates a refresh token going forward. **Still open** — not exercised
  live this round.

## 8. Verification round 1 findings (2026-07-25, against `cc1553d`)

All citations re-verified directly against `cc1553d` by direct file read.

### F1 (Flutter, high) — regular login and register never actually store a refresh token — FIXED 2026-07-26

T1 and T2 (§6) both landed correctly: all four mutations request
`refreshToken`, and all three response types (`LoginResponse`,
`RegisterResponse`, `OAuthLoginResponse`) have a `String? refreshToken`
field with a working `fromJson`. But two of the four call sites don't use
`fromJson` at all — they hand-build the response object field-by-field from
the parsed `result` map, and whoever wired T1/T2 together didn't add the new
field to that hand-built construction:

- `login.dart:75-85` (the regular, non-MFA login path) builds
  `LoginResponse(accessToken: ..., rbacToken: ..., deviceToken: ...,
  userToken: ..., user: ...)` — no `refreshToken:` key. Confirmed by grep:
  `refreshToken` appears exactly once in the whole file, in the GraphQL
  query string itself (`:15`).
- `register.dart:63-71` — identical shape, identical gap. Same grep result.

Contrast with the two paths that *do* work:
- `login/page_content.dart:150`'s MFA-verify branch calls
  `LoginResponse.fromJson(data)` on the raw map `mfa.dart` returns —
  `fromJson` does read `json['refreshToken']`, so this path is correct.
- `oauth.dart:77` returns `OAuthLoginResponse.fromJson(result)` — same
  factory, same correctness.

Net effect: `response.refreshToken` is always `null` after a normal
email/password login or a fresh registration, so the `if (rt != null)
setRefreshToken(rt)` guard at `login/page_content.dart:97-99` and
`register/page_content.dart:97-99` never fires for those two flows. Every
downstream piece this doc built (Stage B/C/D, all independently verified
correct) is simply unreachable for a user who only ever logs in or registers
normally — which is most users. The original problem this doc set out to fix
(WebSocket auth never recovering) **still reproduces for that population**,
even though the doc's own executive summary framed this exact mechanical gap
(§3.A/§2 item 1) as the fix's starting point.

**Fix applied 2026-07-26:** added
`refreshToken: result['refreshToken'] as String?,` to the `LoginResponse(...)`
construction in `login.dart` and the `RegisterResponse(...)` construction in
`register.dart` — two one-line additions, no design change, same shape D1
already described. Also decided explicitly in this session: mobile keeps the
existing header + `flutter_secure_storage` transport for all tokens
(including `refreshToken`) rather than adding a cookie jar to Dio — the
backend already serves both cookie and header per token via the shared
`extractCookieOrHeader` helper (identical for rbac/device/user/refresh), so
this isn't two auth systems to maintain, just two transports for the one
existing helper. `httpOnly` has no equivalent protection to offer in a
native app (no JS/XSS surface), and a cookie jar would mean building and
securing persistence Android doesn't provide out of the box — Keystore-backed
secure storage already gives the equivalent guarantee. Verified after the
fix: `flutter analyze` and `dart format` clean on both changed files;
`test/views/auth` and `test/hooks/auth_test.dart` (11 + 4 tests) still pass,
no regression.

### F2 (Flutter, low) — Stage E tests were never added

T12 and T13 (§6) are unchecked and genuinely absent, not just mis-tracked:
`test/hooks/auth_test.dart` has only the same 4 tests it had before this doc
(`starts with null user`, `isAuthenticatedProvider`, `currentUserProvider`,
`userTierProvider`) — nothing exercises `setRefreshToken`, `getRefreshToken`,
`refreshAccessToken`, or `updateAccessToken`. `test/hooks/realtime_test.dart`
likewise still only has its original 3 provider-default tests — nothing
feeds `RealtimeClient` a message frame to exercise the `data['msg']`
auth-fail path (D6) or the `onBustTokenCache` sequencing (D7). Lower severity
than F1 since the underlying code is otherwise correct (D6/D7/D8 all
verified by direct read), but it means there's no regression net under any
of Stage D if it's touched again later.

## 9. Round 2 (2026-07-26) — the socket opens, but almost nothing built on it works

Berkay ran the app after Stage A-D landed and pasted the live logcat:

```
I/flutter ( 4114): [Realtime] status -> RealtimeStatus.authenticating
I/flutter ( 4114): [Realtime] status -> RealtimeStatus.open
```

This is real and correct — Stage A-D's fix works. But `open` only proves the
15-second auth handshake succeeded (§3.F-H). It says nothing about whether
any page that *uses* the connection afterward ever receives a frame it can
act on. Following "check each page the websocket is used on" (Berkay's
request) turned up a second, independent, much larger problem sitting
directly downstream of the part that got fixed: **almost every realtime
feature in the app — feed, post detail, chat rooms, messages, friend
requests — is silently starved of live updates, for reasons that have
nothing to do with authentication.** Notifications and direct messages were
specifically called out by Berkay as needing to be solid, not just chat
rooms — both are covered below (§9.4, §9.5) with the same rigor as chat
rooms and feed.

All citations in this section are direct reads against HEAD, cross-checked
against the backend (`nest-js-boilerplate/src/realtime/*`,
`nest-js-boilerplate/src/messaging/*`) and, where Flutter has no equivalent,
against the web app's own working implementation
(`next-js-boilerplate/src/lib/realtime/*`) as ground truth for what the wire
protocol actually is.

### 9.1 — Root cause: `claimPage()` is never called anywhere in the app

`RealtimeClient.claimPage(page, params, tabId)`
(`flutter-boilerplate/lib/lib/realtime/realtime_client.dart:151-155`) sends
`{'type': 'page', 'page': page, 'params': params, 'tabId': id}` — it's
implemented correctly and matches the wire format exactly. **Confirmed by
grep: zero call sites anywhere in `lib/`.** `unclaimPage` (`:157-160`): same,
zero call sites.

This isn't a cosmetic gap. Server-side, `handlePage()`
(`nest-js-boilerplate/src/realtime/realtime-page.manager.ts:98-175`) is the
*sole* mechanism that:
- auto-adds the socket to the `feed` topic watch when page `'feed'` is
  claimed, and to `post:$id` when page `'post'`/`{id}` is claimed
  (`:165-168`) — the only way `emitToTopic` ever reaches a client;
- invokes the chat-room join/leave callback when page `'chat-room'`/`{room}`
  is claimed/unclaimed (`:169-171`, `:137-140`), which is the *only* place
  `ws.room` ever gets set (`messaging-ws.gateway.ts:220-264`
  `handleClaimJoinRoom`/`handleClaimLeaveRoom`) — the property
  `broadcastToRoom` (`realtime.gateway.ts:643-658`) keys off;
- registers the claim in `pageClaims`, keyed by
  `page:pageKey:userId:tabId` (`:160-162`), which `emitToPage()`
  (`:217-235`) uses for messages and friend-request delivery.

The web app drives this automatically: `useRealtimeCoordination.ts:236-250`
runs a `usePathname()+useSearchParams()` effect on *every* route change,
computes `{page, params}` via `routeToPageClaim()`
(`next-js-boilerplate/src/lib/realtime/route-mapping.ts`), and calls
`claimPage()`. **Flutter has no equivalent anywhere** — confirmed no analog
exists in `app/router.dart`, `app/app.dart`, or any hook. The one existing
`NavigatorObserver` in this app (`ActivityRouteObserver`,
`flutter-boilerplate/lib/lib/route_observer.dart`) only logs page-view
duration for `ActivityLogger` — it doesn't touch realtime at all.

Net effect: every page below is fully wired on the *read* side (real,
watched Riverpod providers) and fully wired on the *backend push* side (real
`emitToTopic`/`emitToPage`/`emitToService` calls on real domain events) —
the only missing link, for four of the five features, is this one call that
was never made.

### 9.2 — Feed and post detail: dead on arrival, and mis-typed even if fixed

`post.service.ts`, `comment.service.ts`, `reactions.service.ts`, and
`notification.processor.ts` all push new-post/comment/reaction/friend-post
events via `this.realtime.emitToTopic('feed', {renew: 'Feed', type: 'New'|'Post', ...})`
and `emitToTopic(\`post:${id}\`, {renew: 'Feed', type: 'Post', id, ...})`.
`views/feed/feed_base_view.dart` genuinely watches `feedProvider` (confirmed
by grep) — a real, live page. But since nothing ever claims page `'feed'`
(§9.1), the `feed` topic is never watched, so these frames never reach any
Flutter client, ever, regardless of connection state. `PostDetailPageContent`
(routed at `/v1/:lang/posts/:uuid`, `app/router.dart:389-395`) has the same
gap for `post:$id`.

Even setting §9.1 aside, `realtime_provider.dart:24-41`'s `onFrame` switch
checks a flat `case 'feed_update':` — **a type the backend never sends.**
Every real feed frame is wrapped as `{renew: 'Feed', type: ...}`; there is no
bare `'feed_update'` anywhere in the backend. This is a second, independent
reason this case has never fired even once — confirmed by grep across
`nest-js-boilerplate/src` for the literal string `feed_update` (zero
matches outside `realtime_provider.dart` itself).

### 9.3 — Chat rooms: three compounding bugs on top of §9.1

`chat_room_base_view.dart` (`views/chat_room/`) has its own independent
problems, layered on top of never claiming `'chat-room'`:

1. **`_setupRealtime()`'s `client.watch('room:$room')` (`:72`) is dead on
   arrival.** `RealtimeClient`'s own topic allowlist
   (`realtime_client.dart:36-37`,
   `RegExp(r'^(feed|post:[a-z0-9]+|conversation:[a-z0-9]+)$')`) has no
   `room:` prefix, so `watch()` (`:135-139`) returns before sending
   anything. This line has never once sent a frame to the server.
2. **Even if it did, `watch()` was the wrong verb for this job.** Chat-room
   membership is driven exclusively by the page-claim callback path (§9.1)
   — the raw `watch`/topic mechanism was never wired to rooms on the
   backend at all. The server *also* exposes an explicit
   `'join-room'`/`'leave-room'` message pair
   (`messaging-ws.gateway.ts:54-59`, `:119-162`) as an alternative to the
   page-claim path, but Flutter sends neither of those either — the only
   room-related messages Flutter ever sends are `'get-room-counts'` and
   `'room-message'` (`chat_room_base_view.dart:73`, `:94-98`), both via
   plain `send()` (no allowlist gate, so these *do* reach the server) but
   neither one joins the room. Result: `ws.room` is never set for any
   Flutter client, so `broadcastToRoom` (used by `user-joined`,
   `user-left`, and — critically — the room chat messages themselves,
   `messaging-ws.gateway.ts:193-206` `handleRoomMessage`) never matches this
   socket. **A message sent from the chat room screen is saved to the
   database but never delivered back to anyone over the socket, including
   the sender**, because the sender was never a recognized room member.
3. **Even with 1-2 fixed, `_roomCounts`/`_roomMembers`
   (`chat_room_base_view.dart:35-36`) have no code path that ever updates
   them.** They're initialized empty and never touched again — no
   `setState` call anywhere references them beyond their declaration and
   being passed down as props. Flutter's `onFrame` is one hardcoded switch,
   centrally wired in `realtime_provider.dart` at provider-construction
   time, with no per-widget subscribe mechanism — unlike the web app, whose
   `RealtimeContextValue.subscribe(type, handler)`
   (`RealtimeProvider.tsx:13`) lets any component register its own
   frame-type listener (`useChatRoomRealtime.ts:21-37` does exactly this
   for `'room-counts'`/`'user-joined'`/`'user-left'`). There is currently no
   mechanism, even in principle, for a `room-counts` frame to ever reach
   this widget's state.

**Separately, found while checking the message list itself:**
`chat_room_base_view.dart:119` reads `conversationMessagesProvider(_room)`
— a 1:1-direct-message-shaped query family
(`api/client/messages/query.dart:12-16`) — for what is actually a public
named chat room (`_room` is `'general'`, a VIP room name, etc. from
`ChatConstants.chatRooms`, not a conversation ID). The *correct* client
already exists: `RoomMessagesServer`
(`flutter-boilerplate/lib/api/server/messages/room_messages.dart`, hits
`GET /api/rooms/$room/messages`) — but it has **zero Riverpod provider
wrapping it and zero callers anywhere in the app**, confirmed by grep for
`roomMessages`/`RoomMessages` (only match: an unrelated, differently-pathed
URL constant at `constants/api/urls.dart:32`,
`'/api/messages/room'` — a second, inconsistent path for the same concept
that nothing uses either). Same "written, never wired" shape this project
keeps finding (`token.dart` in §3.C of this doc; the `use_event_logger.dart`
trio in convert-frontend-6).

### 9.4 — Messages/DMs (flagged explicitly by Berkay): two-headed bug, plus a real blocker

The backend fires **three** channels for every direct message
(`messaging-dm.service.ts:201-228`, `handleDeliverDirectMessage`):

```ts
this.realtime.emitToService(recipientId, 'MESSAGE', {renew: 'Messages', type: 'Conversation', conversation: {...}});
this.realtime.emitToService(recipientId, 'NOTIFICATION', {renew: 'Notifications', type: 'DmCount', value: totalDmUnread});
this.realtime.emitToPage(recipientId, 'messages', {type: 'direct-message', message});
this.realtime.emitToPage(senderId, 'messages', {type: 'direct-message', message});
```

Flutter's `onFrame` (`realtime_provider.dart:26-32`) already has a *correct*
handler body for `'direct-message'` — it invalidates `conversationsProvider`
and `conversationMessagesProvider(conversationId)`, which is exactly right.
But it's unreachable from **both** directions:

- The `emitToPage(..., 'messages', ...)` channel (the one sending the
  `'direct-message'` type Flutter actually recognizes) requires page
  `'messages'` to be claimed — never happens (§9.1).
- The `emitToService(..., 'MESSAGE'/'NOTIFICATION', ...)` channel (the one
  Flutter's registered services *do* actually receive, since `'MESSAGE'` and
  `'NOTIFICATION'` are correctly registered — see §9.6) delivers frames
  shaped `{renew: 'Messages', type: 'Conversation'}` /
  `{renew: 'Notifications', type: 'DmCount'}` — a shape `onFrame`'s flat
  switch has no case for at all. This channel's frames arrive at the
  socket successfully and are silently dropped by `_handleMessage`'s
  `catch (_) {}` — no, more precisely: they fall through the switch with no
  match (confirmed: the switch has no `default` and Dart 3's switch
  statement exits cleanly with no match — not an exception, just silently
  ignored).

Net effect verified against `messages_sidebar_conversations.dart` (confirmed
by grep to `ref.watch(conversationsProvider)` — a real, rendered sidebar):
**a new DM never updates the conversation list live; the user has to leave
and re-enter the Messages page to see it**, forcing a fresh `FutureProvider`
fetch.

**A real, separate blocker found while verifying this further:** the actual
open-conversation-thread widget, `ChatView`
(`flutter-boilerplate/lib/views/messages/chat_view.dart`), has **zero
references anywhere outside its own file** — confirmed by grep. Read all
four tier variants in full
(`free_page_view.dart`, `basic_page_view.dart`, `medium_page_view.dart`,
`premium_page_view.dart`, 23-42 lines each): every one renders
`MessagesSidebar` plus either a static "select a conversation" placeholder
(Free) or static tier-upsell description text (Basic/Medium/Premium) — none
of them opens an actual conversation thread or tracks which peer is
selected. `dmUnreadCountProvider`
(`api/client/messages/query.dart:18`) and a second, independently-built
`dmUnreadNotificationsProvider`
(`api/client/notifications/query.dart:17`, note: **two parallel
implementations of the same DM-count concept**,
`api/server/messages/dm_unread_count.dart` and
`api/server/notifications/dm_unread_count.dart`) both have **zero
consumers anywhere**, confirmed by grep.

This means: the conversation-*list* (sidebar) half of Messages is a real,
fixable websocket bug (§9.1 + §9.4's onFrame rewrite). The
conversation-*thread* half (opening a specific peer's messages, marking
read, per-message delivery receipts) has no UI to attach a
`claimPage('messages', {peer})` call to yet — that's a pre-existing,
separate UI-completion gap this doc did not create and a realtime fix alone
can't finish. Scoped accordingly in §10/§11: fix what's real (sidebar), wire
the per-peer frame handling correctly in `onFrame` so it activates the
moment `ChatView` gets connected to real navigation state, and call out the
blocker explicitly rather than quietly skipping it.

### 9.5 — Notifications (flagged explicitly by Berkay): cleanest of the five, one bug, no page-claim needed

Good news first: notifications need **no page-claim at all**. Every
notification frame (`notification.service.ts:80-167`) goes exclusively
through `emitToService(userId, 'NOTIFICATION', {renew: 'Notifications', type: 'Count'|'DmCount'|'Item'|'Read', ...})`
— confirmed by grep, **zero** `emitToPage(..., 'notification', ...)` call
sites exist anywhere in the backend (the `notification` entry in
`PAGE_ALLOWLIST`, `realtime-page.manager.ts:14`, is currently unused by any
emitter). `RealtimeLifecycle._connect()`
(`hooks/use_realtime.dart:36-38`) *does* correctly register `'NOTIFICATION'`
(uppercase, matches the backend's case-sensitive allowed set) — so **this
channel's frames genuinely arrive at every Flutter client today.**

The sole, isolated bug: `onFrame`'s flat `case 'notification':`
(`realtime_provider.dart:33-35`) checks a shape
(`{type: 'notification'}`) that the backend never sends — every real
notification frame is `renew`-wrapped, exactly like Feed and Messages
above. Confirmed reachable, real page:
`views/notification/free_page_view.dart` watches both
`notificationsProvider` and `notificationsUnreadCountProvider` (grep
confirmed). Fixing the dispatcher alone (§10 D10, no other change needed)
makes notifications fully live — this is the cleanest of the five features
to fix and should be the first one verified once the rewrite lands.

### 9.6 — `registerServices` sends names the backend can't use

`RealtimeLifecycle._connect()` (`hooks/use_realtime.dart:36-38`) calls:

```dart
client.registerServices(['MESSAGE', 'NOTIFICATION', 'chat', 'notifications', 'feed']);
```

The backend's allowlist (`realtime.gateway.ts:464`,
`const allowed = new Set(['MESSAGE', 'NOTIFICATION', 'CHAT'])`) is
case-sensitive. `'chat'`, `'notifications'`, `'feed'` all fail the check
silently (`handleRegister`'s `if (!allowed.has(svc)) continue;`,
`:465-467`) — three of the five entries are pure noise. Even correctly
cased, `'CHAT'` has **zero** `emitToService(..., 'CHAT', ...)` call sites
anywhere in the backend (confirmed by grep) — it's a registered-but-never-
emitted-to service tag, vestigial regardless of casing. The web app's own
registration (`useRealtimeCoordination.ts:89`, `:217`) is exactly
`['MESSAGE', 'NOTIFICATION']`. Not itself a functional bug (the two real
entries do register correctly), but worth matching web exactly — it's
noise that could mislead the next person reading this code into thinking
`'CHAT'`/feed/notifications service-scoped delivery is a real, used path.

### 9.7 — Out of scope, noted so it isn't re-discovered as new

- **`views/demos/ws_page.dart`** connects directly to a hardcoded
  `ws://localhost:3001/ws`, bypassing `RealtimeClient`/auth entirely. It is
  routed (`app/router.dart:33`) and localized (`demoWsPageTitle`, "WebSocket
  Demo") — a labeled protocol demo, not a product feature. Not touched
  here.
- **Friend requests** (`emitToPage(..., 'friend-request', {renew: 'Friends', type: 'PendingList'})`,
  `messaging.controller.ts:90-133`) has the exact same §9.1 shape as
  feed/post — real, watched provider (`friendRequestsProvider`,
  `views/find_friends/requests_page.dart:34`, confirmed), just needs the
  route-claim wiring. Included in §11's task list (same mechanism, no new
  design needed) but not given its own subsection since Berkay didn't flag
  it and it's mechanically identical to feed/post.
- **`dmUnreadCountProvider` / `dmUnreadNotificationsProvider`** having zero
  consumers (§9.4) is a pre-existing dead-code/duplication finding, not a
  websocket bug — flagged, not fixed here.
- Per-message delivery receipts (`'message-delivered'`) and read receipts
  (`'message-read'`) exist as frame types the web app handles
  (`event-dispatch.ts:79-121`) with fine-grained cache patches; Flutter has
  no per-message UI state to patch today (no `ChatView` wiring, §9.4). The
  `onFrame` rewrite (§10 D10) adds these cases so they're correct and ready,
  but there's nothing on-screen for them to visibly affect yet.

## 10. Decisions (round 2)

- **D9 — Add a route-driven page-claim coordinator**, mirroring
  `useRealtimeCoordination.ts`'s route effect: a new pure function
  `routeToPageClaim(location)` (new file,
  `lib/lib/realtime/route_claim.dart`) ports `route-mapping.ts`'s table
  (feed/post/messages/notification/find-friends/chat-room →
  `{page, params}`), and a new coordinator (folded into
  `RealtimeLifecycle` in `use_realtime.dart` rather than a third parallel
  class, since it already owns connect/disconnect lifecycle) attaches a
  listener to the router (`GoRouterDelegate` is a `RouterDelegate`, which
  is `Listenable` per the Flutter SDK contract — not a go_router-version-
  specific detail; read `router.routerDelegate.currentConfiguration.uri`
  for the full path+query on every change, matching how `chat-room`'s own
  route already reads `state.uri.queryParameters['conversation']` at
  `router.dart:426`) and calls `claimPage()` on every navigation. Chosen
  over a `NavigatorObserver`
  (like the existing `ActivityRouteObserver`) because query-param-only
  changes (e.g. switching the `?conversation=` param without a path change)
  don't reliably fire `didPush`, but do notify a `GoRouter` listener —
  and this doc's own chat-room fix (D11) depends on exactly that case
  working for in-page room switches. Note Flutter's own `chat-room` route
  uses query param `conversation`, not `room` like the web app
  (`router.dart:426` vs. `route-mapping.ts:30`) — the Dart mapping function
  must follow Flutter's own router, not copy the web constant name.
- **D10 — Rewrite `onFrame`'s dispatcher to a two-level `renew`/`type`
  switch**, matching every real backend frame shape: check `frame['renew']`
  first (`'Notifications'` → `Count`/`DmCount`/`Item`/`Read`; `'Messages'`
  → `Conversation`; `'Feed'` → `New`/`Post`; `'Friends'` →
  `PendingList`), each invalidating the matching Riverpod provider
  (`notificationsUnreadCountProvider`, `dmUnreadCountProvider`/`dmUnreadNotificationsProvider`
  — pick one as canonical per §9.4/§9.7, `notificationsProvider`,
  `conversationsProvider`, `feedProvider`, `friendRequestsProvider` —
  confirm exact post-detail provider name for the `Post` sub-case at
  implementation time), *plus* keep and correctly gate the existing flat
  (non-`renew`) event cases — `direct-message` (already-correct body,
  just needs to also be reachable, no change to its logic), `message-read`,
  `message-delivered` (new), `tier-changed` (new — should refresh whatever
  drives `userTierProvider` in `use_auth.dart`), `room-message` (new, feeds
  D12). Chosen over porting the web app's generic `subscribe(type, handler)`
  API (`RealtimeProvider.tsx:13`) as a new capability: Riverpod's
  provider-invalidation model already *is* an app-wide reactive pub/sub —
  any widget can `ref.watch()` any provider this switch invalidates.
  Building a parallel React-style local-subscribe mechanism on top would
  duplicate a capability Riverpod already provides, for no benefit specific
  to this codebase.
- **D11 — `chat_room_base_view.dart`: delete the dead
  `client.watch('room:$room')` call (`:72`)**; rely on D9's route-level
  `claimPage('chat-room', {'room': room})` for the initial join. Add a
  **direct** `claimPage('chat-room', {'room': r})` call inside
  `_selectRoom` (`:76-84`) for in-page room switches — confirmed
  `_selectRoom` only does local `setState`, no `context.go`/URL change, so
  D9's router-level listener alone won't see a room switch; the widget must
  re-claim itself, exactly the pattern the web app's own `claimPage` being
  independently callable (not just router-driven) already supports
  (`useRealtimeCoordination.ts:326-341`).
- **D12 — Add `roomCountsProvider` (`StateProvider<Map<String, int>>`) and
  `roomMembersProvider` (`StateProvider.family<List<...>, String>` keyed by
  room)**, updated by D10's `onFrame` switch on `'room-counts'`/
  `'user-joined'`/`'user-left'` frames (all three are flat, non-`renew`
  events — add alongside `room-message`). `chat_room_base_view.dart` reads
  these via `ref.watch(...)` instead of its current dead local
  `_roomCounts`/`_roomMembers` fields (`:35-36`). Same idiom already used
  for `conversationsProvider`/`notificationsProvider` — not a new pattern
  for this codebase, and avoids needing web's per-widget `subscribe()`
  (consistent with D10's reasoning).
- **D13 — Wrap `RoomMessagesServer` in a real provider**
  (`roomMessagesProvider = FutureProvider.family<List<RoomMessage>, String>`
  in `api/client/messages/query.dart`, matching the existing file's
  pattern) and switch `chat_room_base_view.dart:119` from
  `conversationMessagesProvider(_room)` to it. Invalidate it (instead of/
  alongside `conversationMessagesProvider`) on the new `'room-message'`
  `onFrame` case (D10/D12).
- **D14 — Fix `RealtimeLifecycle._connect()`'s `registerServices` call to
  `['MESSAGE', 'NOTIFICATION']`**, dropping `'chat'`/`'notifications'`/
  `'feed'`, matching the backend's real allowed set and the web app's own
  registration exactly (§9.6). Pure hygiene — no functional change, since
  the dropped entries were already no-ops.
- **D15 — Add feed/post/notification/find-friends/chat-room to D9's route
  map; do *not* add a `messages`→`{peer}` claim**, since there is currently
  no peer-selection state anywhere in the Messages page to source a peer
  id from (§9.4/§9.7) — claim page `'messages'` with no params on that
  route (covers the sidebar, which is the only live part of that page
  today); leave a comment at the claim site noting the peer-scoped claim
  belongs there once `ChatView` is wired to real state, so the next person
  touching this doesn't have to re-derive §9.4's finding from scratch.

## 11. Tasks (round 2)

### Stage F — Route-driven page claims (unlocks feed, post, friend-requests, messages-sidebar, chat-room join)

- [x] **T14 (M) — Add `routeToPageClaim()`** (new file
  `lib/lib/realtime/route_claim.dart`) per D9's table (feed, post/:uuid,
  messages, notification, find-friends, chat-room). Pure function, easy to
  unit test in isolation (feeds T19 below). **Done** — also covers the
  legacy `/v1/:lang/chat/:conversationId` alias route
  (`router.dart:429-436`), mapped to the same `chat-room` claim.
- [x] **T15 (M) — Wire it into `RealtimeLifecycle`** (`use_realtime.dart`):
  attach a `GoRouter` listener reading the current location, call
  `claimPage()` on change, per D9. Only active once authenticated/connected
  (mirror the existing `_connect`/`_disconnect` gating already in this
  class). **Done** — listener attached/removed symmetrically with
  `client.connect()`/`disconnect()`; claims once immediately on connect
  (not just on the next navigation) so the currently-open route is claimed
  even if the app was already sitting on it when auth completed.

### Stage G — Fix frame dispatch (unlocks notifications, messages-sidebar, feed, friend-requests on top of Stage F)

- [x] **T16 (M) — Rewrite `onFrame` in `realtime_provider.dart`** per D10:
  two-level `renew`/`type` switch plus the flat event cases
  (`direct-message`, `message-read`, `message-delivered`, `room-message`,
  `room-counts`, `user-joined`, `user-left`). **Done**, with one correction
  found while implementing: the pre-existing `direct-message` handler body
  wasn't actually fully correct as documented in §9.4 — it read
  `frame['conversationId']`, a field that doesn't exist in the backend's
  payload (confirmed by direct read of `messaging-dm.service.ts`/
  `messaging-ws.gateway.ts` — the payload is `{message: {senderId,
  recipientId, ...}}`, no top-level `conversationId`). Fixed by deriving
  the peer id from `senderId`/`recipientId` vs. the current user's own id
  (`_peerIdFromMessage`), matching the web app's own `dispatchEvent`
  logic exactly. **`tier-changed` deliberately not wired** —
  `AuthenticatedUser` has no `copyWith` and `AuthNotifier` has no partial-
  update method to patch just the tier (confirmed by direct read of
  `types/auth/user.dart`); adding that machinery is a small feature of its
  own, not a websocket-delivery fix, and wasn't part of what Berkay flagged
  (notifications/messages). Left unwired rather than guessed at. Canonical
  DM-count choice (§9.7): invalidates **both**
  `dmUnreadCountProvider`/`dmUnreadNotificationsProvider` on `DmCount` —
  cheap, and correct regardless of which one (if either) eventually gets a
  consumer.
- [x] Post-detail invalidation confirmed against real providers:
  `postProvider(id)`/`postCommentsProvider(id)`
  (`api/client/posts/query.dart`), both exist and are now invalidated
  alongside `feedProvider` for `{renew: 'Feed', type: 'Post'}`.

### Stage H — Chat-room specific fixes

- [x] **T17 (S) — `chat_room_base_view.dart`**: delete the dead `watch('room:$room')`
  call; add the direct `claimPage()` call in `_selectRoom` (D11). **Done.**
  The route-level claim (T15) handles the initial room join on entering
  the page; `_selectRoom` re-claims directly since switching rooms is
  local `setState`, no route change.
- [x] **T18 (M) — Add `roomCountsProvider`/`roomMembersProvider`**
  (D12); switch `chat_room_base_view.dart` to `ref.watch()` them instead of
  the dead local fields. **Done** — both defined in `realtime_provider.dart`
  alongside the frame handling that populates them, matching where
  `realtimeStatusProvider` already lives.
- [x] **T19 (S) — Wrap `RoomMessagesServer` in `roomMessagesProvider`**
  (D13); switch `chat_room_base_view.dart:119` off
  `conversationMessagesProvider(_room)`. **Done**, with one adjustment found
  during implementation: `RoomMessagesServer` returns `List<RoomMessage>`,
  a different (incompatible) model from the `List<ChatMessage>`
  `ChatRoomMainContent` expects (confirmed by direct read of both
  classes) — mapped `RoomMessage` → `ChatMessage` inline at the call site
  (`id`/`senderId`/`senderName` carry over, `avatar`→`senderAvatarUrl`,
  `body`→`content`, `isRead: true` since room broadcasts have no
  per-user read-receipt concept) rather than changing
  `ChatRoomMainContent`'s shared type signature — keeps the fix contained
  to this one file instead of cascading into
  `chat_room_message_list.dart`/`chat_room_sub_components.dart`.

### Stage I — Hygiene

- [x] **T20 (S) — Fix `registerServices(['MESSAGE', 'NOTIFICATION', 'chat', 'notifications', 'feed'])`
  → `registerServices(['MESSAGE', 'NOTIFICATION'])`** (D14). **Done.**

### Stage J — Tests (still open, same shape as Stage E/§8 F2)

- [ ] **T21 (S) — Unit-test `routeToPageClaim`**: one case per route
  (feed/post/messages/notification/find-friends/chat-room/legacy-chat-alias/
  unknown→null), including the `posts/create` edge case (mirrors web's own
  `routeToPageClaim`, which also doesn't special-case it — claims
  `{page:'post', params:{id:'create'}}`, a harmless no-op since nothing
  publishes to `post:create`). **Not done.**
- [ ] **T22 (S) — Test `realtime_provider.dart`'s `_handleRenewFrame`/
  `_handleEventFrame`** (or the public `onFrame` callback end-to-end via
  `RealtimeClient`): feed one frame per renew/type and flat-event
  combination, assert the right provider gets invalidated/updated.
  **Not done** — these are private top-level functions today, so a direct
  unit test would need either restructuring for testability or driving
  them through `RealtimeClient._handleMessage` like T13 (§8 F2, also still
  open) already needed to. Same gap, larger surface now.
- [ ] **T23 (S) — Widget-test `chat_room_base_view.dart`'s `_selectRoom`**
  re-claim behavior and the `RoomMessage`→`ChatMessage` mapping.
  **Not done.**

Net: round 2 is implemented and gate-clean (`flutter analyze`: 0 issues;
`dart format --set-exit-if-changed`: clean; `flutter test`: 339/340, the
one failure being the same pre-existing, unrelated `card_test.dart` case
noted in §7) but has **zero new test coverage**, same shape as the
still-open T12/T13 from round 1 — this doc now has two rounds of
untested-but-analyze/format-clean realtime code stacked on each other.

## 12. Verify loop, round 2

- [ ] **Notifications** (should be the cleanest signal Stage G worked):
  trigger a notification from a second session/account while the app is
  open on the notifications page; confirm the badge/list updates without a
  manual refresh.
- [ ] **Feed**: create a post from a second session; confirm the feed page
  updates live.
- [ ] **Messages sidebar**: send a DM from a second session; confirm the
  conversations list (last message, unread count, ordering) updates live
  without leaving/re-entering the Messages page.
- [ ] **Chat room**: open a room from two sessions; confirm both see
  `user-joined`, room counts populate, and a sent message appears for
  *both* participants including the sender.
- [ ] **Friend requests**: send a friend request from a second session
  while the requests page is open; confirm the pending list updates live.
- [x] `flutter analyze` / `dart format --set-exit-if-changed` / `flutter
  test` clean, matching this project's established gate. **Verified
  2026-07-26**: `analyze` 0 issues, `format` clean, `test` 339/340 (same
  pre-existing unrelated `card_test.dart` failure as round 1, no new
  regressions).
