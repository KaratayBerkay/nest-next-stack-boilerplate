# convert-frontend-9-flutter — Strong auth: biometric unlock, real MFA management, and 6-digit email verification

**Date:** 2026-07-28 · **Status:** ⚠️ **36/73 confirmed complete, 14 partial/misleading, 21 not completed (2 of them honestly self-reported), 2 pending.** The original "42/73 complete, no functional gaps except a sign-off" claim does not hold. Verified against `5333dfbc` (+ lint fix `e1670115`) by direct file read across all three codebases plus first-hand `pnpm build`/`pnpm test`/`flutter analyze`/`flutter test`/`pnpm typecheck`/`vitest` runs. **Nothing in this doc has been fixed yet** — this is findings + a concrete fix plan, not a changelog of applied fixes.

Read order: §1 test results (what's actually green vs red today), §2 task status (corrected, stage by stage), §3 findings + fix plan (22 items, root cause + exact fix per item), §4 suggested fix order, §5 remaining open items.

---

## 1. Test results (first-hand, 2026-07-28)

### Backend (`nest-js-boilerplate`)

**`pnpm build` — FAILS.** 3 TypeScript errors, all introduced by `5333dfbc` (confirmed via `git show --stat`, which touched both files below):

```
src/auth/auth-session.service.ts:108:11 - error TS2322: Type '{ deviceId: string; deviceToken: string;
changed: false; ip: string | null; userAgent: string | null; } | undefined' is not assignable to type
'DeviceContext | undefined'. Property 'trusted' is missing in type '...' but required in type 'DeviceContext'.

src/auth/auth.service.ts:124:17 - error TS2304: Cannot find name 'UnauthorizedException'.
src/auth/auth.service.ts:135:17 - error TS2304: Cannot find name 'UnauthorizedException'.

Found 3 error(s).
```

**`pnpm test` — 369 pass / 14 fail (4 suites), matches the doc's original claim exactly.** All 4 failing suites are pre-existing and untouched by this feature (confirmed via `git show --stat 5333dfbc`, which touched none of `devices/`, `billing/`, `messaging/`, or `token-store.(spec.)ts`): `messaging-dm.service.spec.ts`, `token-store.service.spec.ts`, `device.service.spec.ts`, `billing.service.spec.ts`.

**The critical fact these two results together establish: the test suite is green, but the backend does not build.** `ts-jest` runs with `isolatedModules` (no cross-file type-check), so `pnpm test` is structurally blind to both compile errors — one of which (`auth.service.ts`'s missing import) is also runtime-reachable, not just a type error. "369 tests passing" was never a deployability signal here; always run `pnpm build` too, especially after any change to a shared type like `DeviceContext`.

### Flutter (`flutter-boilerplate`)

**`flutter analyze` — 1 pre-existing info-level issue**, unrelated to this feature: `directives_ordering` at `lib/views/security/page_view.dart:13:1` (import ordering, not a functional issue). Matches the doc's "1 pre-existing info" claim, though the specific lint name differs slightly from what was recorded (`avoid_relative_lib_imports`).

**`flutter test` — 418 pass / 1 fail**, matches the doc's claim exactly. The one failure is `test/components/ui/card_test.dart: CardWidget supports onTap callback` — a pre-existing, unrelated flake (component-library test, nothing to do with auth). Zero new test files exist for any of this feature's Flutter code (confirmed: no `mfa*`, `enroll*`, `biometric*`, `use_biometric*`, `verify_email*`, or `security*` files under `test/` or `integration_test/`).

### Web (`next-js-boilerplate`)

**`pnpm typecheck` (`tsc --noEmit`) — clean, zero errors.** No backend-style compile break on this side.

**`pnpm test` (`vitest run`) — 307/307 pass**, all pre-existing test files. Zero new spec files touch MFA/biometric/security/email-OTP (confirmed by file search), and zero new Playwright cases were added to `e2e/auth.spec.ts` or `e2e/settings.spec.ts` — matches the doc's own T72 claim.

---

## 2. Task status — corrected

Legend: ✅ confirmed correct as originally described · ⚠️ partial — does something, but not what was claimed, with a real gap · ❌ refuted — the described thing doesn't exist or doesn't work · ⏳ honestly self-reported as incomplete in the original doc (unchanged). Every corrected mark points to the relevant finding (`F1`–`F22`) in §3 for the full root cause and fix.

### Stage 0 — Backend: fix the two MFA bugs — 4/4 confirmed, no change
- ✅ **T1** — `mfa.service.ts:54` genuinely replaced the factor lookup with a pending-factor query.
- ✅ **T2** — `mfa.service.spec.ts:121-141` is a real enroll→verify test with a genuinely toggled mock (confirmed by a working negative-path test alongside it).
- ✅ **T3** — `verify-login-mfa.input.ts:11` is `@Length(6, 10)`.
- ✅ **T4** — `auth.service.spec.ts:244-310` exercises the real backup-code path including single-use rejection.

### Stage A — Backend: shared email-OTP primitive — 3 confirmed, 2 partial, 2 refuted (was "7/7")
- ✅ **T5** — `email-otp.service.ts:28` uses real `node:crypto randomInt(100000, 999999)`.
- ❌ **T6** — the Redis key is **not** hashed, and the code is stored in **plaintext**. → **F8**.
- ✅ **T7** — 5-attempt lockout is real and correctly enforced (minor lazy-deletion timing nuance, not user-observable).
- ✅ **T8** — `'email-otp'` template genuinely registered in `render.ts`.
- ⚠️ **T9** — the *resend* mutation's 60s cooldown is real, but `login()`'s step-up trigger calls `generate()` directly, bypassing it entirely. → **F9**.
- ⚠️ **T10** — verification and rate-limiting are genuinely tested; there's no `generate()` test, no real TTL/expiry test, and single-use is inferred rather than proven. → assertion-quality note in **F9**'s section.
- ❌ **T11** — no OTP env vars exist anywhere in the repo; `MAX_OTP_ATTEMPTS`/`RESEND_COOLDOWN_SECONDS`/`EMAIL_OTP_TTL` are hardcoded module constants, `EmailOtpService` doesn't even inject `ConfigService`.

### Stage B — Backend: wire email-OTP into registration verification — 2/3 (was "3/3")
- ✅ **T12** — `verifyEmailCode(userId, code)` resolver→service chain is real.
- ✅ **T13** — registration genuinely sends both the link and triggers `emailOtp.generate(..., 'REGISTRATION')`.
- ❌ **T14** — zero tests reference `verifyEmailCode` anywhere in the repo, despite being marked e2e-tested.

### Stage C — Backend: `MfaMethod.EMAIL` + baseline step-up — 2 confirmed, 1 partial, 2 refuted (was "5/5")
- ✅ **T15** — `mfaMethod?: 'TOTP' | 'EMAIL'` genuinely on `AuthPayload` (`auth.types.ts:128-129`).
- ✅ **T16** — `verifyLoginMfa` genuinely branches to `emailOtp.verify()` for the EMAIL method — real logic, just unreachable today (see T17) and untested (see T19).
- ❌ **T17** — the "baseline step-up" doesn't exist; it's gated behind `user.mfaEnabled`, which is only ever true for already-TOTP-enrolled accounts. → **F3**. The flagged "needs Berkay sign-off" is still the right call, just on a feature that needs to be *built*, not just approved.
- ⚠️ **T18** — the mfaToken-validation logic is sound, but the method doesn't compile (`UnauthorizedException` unimported). → **F1**.
- ❌ **T19** — zero tests reference `mfaMethod`, `'EMAIL'`, or `resendLoginCode` anywhere — the entire surface is unvalidated, not merely under-tested.

### Stage D — Backend: trusted-device wiring — 2 confirmed, 1 partial, 2 refuted (was "5/5")
- ❌ **T20** — no `trustedUntil` field, migration, or any trace of it anywhere in the repo. `trustCurrentDevice` only ever sets `trusted: true` permanently, no expiry. → **F3** (device-trust has no time limit; note this doesn't block trusting devices, just means it's forever until manually revoked, which nothing currently does either).
- ❌ **T21** — `trusted` (no expiry) is read correctly in the step-up decision; `trustedUntil` is not, because it doesn't exist. Same root cause as T20.
- ✅ **T22** — `SessionInfo.trusted` genuinely populated from a real `prisma.device.findMany` lookup in `mySessions`.
- ✅ **T23** — `Device.type` genuinely derived from a real UA parser now, not hardcoded `'WEB'`.
- ⚠️ **T24** — the trust-setting test only asserts the mutation's return value, never that `prisma.device.update` was actually called; "trust-window expiry" has no test because there's nothing to test (T20); step-up-skip is tested, but only for the TOTP-enrolled path.

### Stage E — Flutter: MFA enrollment/management UI — 5 confirmed, 1 partial, 2 refuted (was "7/8")
- ✅ **T25** — typed models and mutation names genuinely match the backend field-for-field.
- ✅ **T26** — `qr_flutter` genuinely renders a real `otpauthUrl` from the server response.
- ❌ **T27** — verify step is a plain `TextField`, not `InputOtp`. → **F12**.
- ✅ **T28** — backup-codes gate is real (`disabled: !_codesSaved`).
- ✅ **T29** — disable flow genuinely wired end-to-end.
- ⚠️ **T30** — the *enrollment* verify path (`_verifyCode()`) does consume a typed response; the *login-challenge* `_verifyMfa()` still hand-parses a raw `Map<String, dynamic>`.
- ✅ **T31** — backup-code field genuinely matches the backend's widened 6–10 length.
- ❌ **T32** — (unchanged) no test files exist for this — confirmed accurate.

### Stage F — Flutter: email-OTP UI — 1 confirmed, 1 partial, 4 refuted (was "5/6")
- ❌ **T33** — plain `TextField` styled to *look* segmented, not `InputOtp`. → **F12**.
- ⚠️ **T34** — the spinner is real; the "cooldown" is not — no timer/countdown exists anywhere. → **F14**.
- ❌ **T35** — the old `TextField` (via `LabeledField`) was never retired; it's still the entire implementation of `_buildMfaState()`. → **F12**.
- ❌ **T36** — "Trust this device" doesn't exist anywhere in the Flutter app — zero references, including in the commit message that also claims it. → **F6**.
- ✅ **T37** — `mfaMethod` genuinely threaded through and genuinely branches UI copy/resend visibility.
- ❌ **T38** — (unchanged) no test files exist — confirmed accurate.

### Stage G — Flutter: biometric local authentication — 3 confirmed, 4 partial, 2 refuted (was "8/9")
- ⚠️ **T39** — `local_auth` dependency is real; `NSFaceIDUsageDescription` is **not** in `Info.plist` at all. → **F17**.
- ⚠️ **T40** — doesn't actually match the claimed `use_push_notifications.dart` pattern — logic is duplicated inline in two other files instead of centralized, and no `Fake*` class exists anywhere. → **F19**.
- ✅ **T41** — biometric flag genuinely shares `FlutterSecureStorage` with session tokens.
- ✅ **T42** — enable toggle genuinely fails closed (only sets the flag inside `if (success)`).
- ⚠️ **T43** — the resume-from-background gate is correct; cold start has a real race where authenticated content can render before the lock prompt. → **F11**.
- ❌ **T44** — no password fallback exists anywhere; a revoked biometric permanently locks the user out. → **F10**.
- ✅ **T45** — disable genuinely removes the flag from secure storage, no server call.
- ⚠️ **T46** — the toggle's own strings are genuinely localized; the lock-screen text itself ("App Locked" etc.) is hardcoded English with no ARB key at all. → **F20**.
- ❌ **T47** — (unchanged) no test files exist — confirmed accurate; also blocked on F19 (no fake to test against).

### Stage H — Flutter: resurrect the Security settings page — 3 confirmed, 1 partial, 2 refuted (was "5/6")
- ❌ **T48** — no Security tab exists in `settings_shell.dart`'s 6-entry tab list; the route is orphaned. → **F4**. **This makes all of Stage H unreachable from the app's UI regardless of the individual task statuses below.**
- ⚠️ **T49** — MFA toggle and Active Sessions link are real; Change Password is a silent no-op (`onTap: () {}`), not the "coming soon" message described.
- ✅ **T50** — biometric toggle genuinely reuses T42's exact logic (same code, not a divergent copy).
- ✅ **T51** — fake 2FA toggle genuinely and cleanly removed.
- ✅ **T52** — `SecurityFallback` genuinely deleted, no dangling references.
- ❌ **T53** — (unchanged) no reachability test exists — confirmed accurate, and its absence is exactly what let F4 ship unnoticed.

### Stage I — Web: MFA enrollment/management UI — 4 confirmed, 1 partial, 1 refuted (was "6/6")
- ✅ **T54** — BFF routes are real, call real backend mutations, not stubbed.
- ✅ **T55** — server wrappers genuinely wired into `useAuthActions()`.
- ✅ **T56** — QR genuinely built from the real `otpauthUrl` — but sends the raw TOTP secret to a third party in cleartext, undisclosed as a tradeoff. → **F16**.
- ❌ **T57** — verify/disable code fields are plain `<input>`, not `InputOTP`. → **F12**.
- ✅ **T58** — backup-codes gate is real (`disabled={!codesSaved}`).
- ⚠️ **T59** — disable flow is correctly wired, but practically unreachable because the page never knows MFA is actually enabled. → **F7**.

### Stage J — Web: email-OTP UI — 3 confirmed, 1 partial, 1 refuted (was "5/5")
- ✅ **T60** — `mfaMethod` genuinely flows end-to-end with a safe default if missing.
- ⚠️ **T61** — branching and `InputOTP` usage are real (the one genuine `InputOtp`/`InputOTP` usage anywhere in this whole feature, on either platform); the "cooldown" is a submit-guard only, no timer. → **F14**.
- ✅ **T62** — resend route genuinely calls the real `resendLoginCode` mutation (the *response contract* is the bug — see **F2** — not this task's wiring).
- ✅ **T63** — both verification flows (link + code) genuinely coexist without interference.
- ❌ **T64** — trust-device route sends neither a bearer token nor CSRF headers; the mutation always 403s, and the failure is shown to the user as a fake "Invalid MFA code". → **F5**.

### Stage K — Web: resurrect a real Security tab — 3 confirmed, 1 partial (was "4/4")
- ✅ **T65** — 7th tab genuinely added in the right position.
- ⚠️ **T66** — page/route wiring is real; the claimed "sessions link" doesn't exist, and "MFA status" is never fetched from the backend — always shows disabled. → **F7**.
- ✅ **T67** — fake `enable2FA` toggle genuinely and cleanly removed.
- ✅ **T68** — `trusted` badge genuinely flows end-to-end from GraphQL to the rendered badge.

### Stage L — i18n (both platforms) — unchanged
- ⏳ **T69** — self-reported as needing a final cleanup pass (unused `privacyTwoFactor*` keys). Confirmed accurate — those keys are indeed still present and dead. **Also newly found** (not self-reported): two Web login-MFA strings and the Flutter lock-screen text are hardcoded English despite this stage claiming full EN/TR coverage. → **F20**, **F21**.

### Stage M — Tests / verification infra — unchanged structurally, T70 gets a caveat
- ✅⚠️ **T70** — the pass/fail counts are exactly as claimed (see §1), but this doesn't mean what it was presented as meaning: the backend does not compile. → **F1**.
- ⏳ **T71** — unchanged, numbers confirmed exactly accurate (see §1).
- ❌ **T72** — unchanged, confirmed accurate (see §1).
- ❌ **T73** — unchanged, still blocked on T32/T38/T47/T53/T72.

---

## 3. Findings + fix plan

Each finding: what's wrong, why (root cause with file:line), who it affects, and the exact fix. Fixes below were worked out by reading the real current code (not just the agent summaries that first surfaced most of these) — file:line references and code sketches are from direct reads on 2026-07-28.

### Critical

#### F1 — Backend does not compile
**Root cause:** two independent gaps introduced by `5333dfbc`.
1. `src/auth/auth.service.ts` throws `UnauthorizedException` (lines 124, 135, inside `resendLoginCode`) but only imports `Inject, Injectable, Logger, forwardRef` from `@nestjs/common` (line 1) — the exception type was never added to that import.
2. `src/auth/auth-session.service.ts:108`, inside `refresh()`, builds a `DeviceContext` object literal that's missing `trusted`, which Stage D added as a required field on that interface (`devices/device.service.ts:26`).

**Fix:**
1. `auth.service.ts:1` — add `UnauthorizedException` to the existing named import.
2. `auth-session.service.ts` — fetch the device's real `trusted` value instead of omitting it (mirroring how `device.service.ts:193`'s `resolveForLogin()` already does this via `existing.trusted`):
```ts
const deviceRecord = session.deviceId
  ? await this.prisma.device.findUnique({
      where: { id: session.deviceId },
      select: { trusted: true },
    })
  : null;

const device: DeviceContext | undefined = deviceToken
  ? {
      deviceId: session.deviceId ?? '',
      deviceToken,
      changed: false,
      ip: ctx.req.ip ?? null,
      userAgent: ctx.req.headers['user-agent'] ?? null,
      trusted: deviceRecord?.trusted ?? false,
    }
  : undefined;
```
**Verify with `pnpm build`, not just `pnpm test`** — this class of bug is invisible to `ts-jest`'s `isolatedModules` mode.

---

#### F2 — Resend-code permanently dead-ends EMAIL-MFA login, identically on Flutter and Web
**Root cause:** `resendLoginCode` (`auth.service.ts:119-149`) does a Redis `GETDEL` (one-time consume) on the *old* `mfaToken` and returns a **new** token as its plain string payload — intentional, matches how the initial `mfaToken` already works. Neither frontend treats the return value as a replacement credential; both discard it and keep submitting the now-dead old token.

**Fix (Flutter)** — `lib/views/auth/login/page_content.dart:186`, inside `_resendCode()`. `actions.resendLoginCode()` already returns `Future<String>` (`lib/api/client/auth/actions.dart:83`, `lib/api/server/auth/mfa.dart:161-180`) — this is purely a call-site fix:
```dart
final newToken = await actions.resendLoginCode(_mfaToken!);
if (mounted) {
  setState(() => _mfaToken = newToken);
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(AppLocalizations.of(context).authCodeResent)),
  );
}
```

**Fix (Web)** — three touch points, since the BFF route mislabels the field as a status message today:
1. `src/app/api/auth/login/mfa/resend/route.ts:47` — `return NextResponse.json({ msg: data.resendLoginCode }, ...)` → `return NextResponse.json({ mfaToken: data.resendLoginCode }, ...)`.
2. `src/api/server/auth/mfa.ts:70-78` (`resendLoginCodeServer`) — return type `Promise<{ msg: string }>` → `Promise<{ mfaToken: string }>`.
3. `src/features/auth/ui/login-form.tsx:138-147` (`onResend`) — capture and store the new token, and surface failures instead of silently swallowing them:
```ts
const onResend = useCallback(async () => {
  if (!mfaState) return;
  setResending(true);
  try {
    const { mfaToken } = await resendLoginCodeServer(mfaState.mfaToken);
    setMfaState({ ...mfaState, mfaToken });
  } catch {
    setMfaError("Couldn't resend the code — try again");
  } finally {
    setResending(false);
  }
}, [mfaState]);
```

---

#### F3 — The "baseline step-up" this doc's Stage C was built around never fires
**Root cause:** `auth-login.service.ts:98`: `if (user.mfaEnabled && !device?.trusted)`. `mfaEnabled` defaults `false` and is only ever set `true` together with a verified TOTP factor (`mfa.service.ts:66-67`), always cleared together too — so accounts that never enrolled TOTP (the population "baseline step-up" is for) get **no challenge at all**, from any device. Corollary: since `mfaEnabled=true` implies a verified TOTP factor always exists, `mfaMethod = factor ? 'TOTP' : 'EMAIL'` (line 103) can't practically resolve to `'EMAIL'` during login either — the whole EMAIL-branch UI (Stages F/J) is currently unreachable in production.

**This is a product decision as much as a bug fix — T17 already flagged needing sign-off, and that's still the actual blocker.** The mechanical change is one line at `auth-login.service.ts:98`; which version depends on the decision:
- **Option A — step up every untrusted device, regardless of enrollment** (matches the doc's own "baseline step-up" framing): `if (!device?.trusted)`, dropping `user.mfaEnabled` entirely. Closest to how GitHub/Google "new device" verification works — every new-device login gets an EMAIL OTP (or TOTP if enrolled).
- **Option B — step-up stays TOTP-only** (today's real behavior): no code change; instead relabel Stage C/F/J in this doc as "infrastructure for a not-yet-enabled feature" and downgrade F6/F9/F14/F15 below from "user-facing today" to "latent."
- **Option C — heuristic middle ground** (step up only for verified-email accounts with zero trusted devices): more product design than a one-line change, not sketched further here.

Once decided, extend T19's tests (currently only cover `mfaEnabled: true`) to cover the real gate.

---

#### F4 — Flutter's entire Security settings page is unreachable
**Root cause:** `settings_shell.dart`'s `tabs` list (lines 58-90) has exactly 6 entries (General, Account, Privacy, Billing, API Keys, Sessions) — no Security tab. The route exists standalone at `router.dart:486-490` as `/v1/:lang/security` (breaking the `/v1/:lang/settings/security` pattern every other settings page uses, per `router.dart:346-362`), with zero navigation call sites anywhere in the app. `SecurityPageContent` also skips the `SettingsShellScaffold` wrapper every real settings page uses.

**Fix, three changes:**
1. `router.dart:486-490` — move into the settings block, rename to match convention:
```dart
GoRoute(
  path: '/v1/:lang/settings/security',
  name: 'v1SettingsSecurity',
  builder: (_, state) => SecurityPageContent(
    lang: state.pathParameters['lang'] ?? 'en',
  ),
),
```
2. `settings_shell.dart` — add a 7th `_TabData` entry after Privacy:
```dart
_TabData(
  Icons.shield_outlined,
  Icons.shield,
  t.settingsNavSecurity,
  '/v1/${widget.lang}/settings/security',
),
```
Needs a new `settingsNavSecurity` key in both `app_en.arb` (next to `settingsNavPrivacy`, line 1065; e.g. `"Security"`) and `app_tr.arb` (e.g. `"Güvenlik"`).
3. `lib/views/security/page_view.dart` — wrap `SecurityPageContent`'s return value in `SettingsShellScaffold`, matching `lib/views/settings/privacy/page_view.dart:19`.

**After fixing:** add the widget test T53 already calls for (tap through Settings → Security) — it would have caught this the first time; its absence is exactly why this shipped unnoticed.

---

#### F5 — Web's "Trust this device" checkbox 403s and disguises itself as a wrong MFA code
**Root cause:** `src/app/api/auth/trust-device/route.ts` calls `graphqlFetch(TRUST_DEVICE_MUTATION)` with **no arguments beyond the query string** — no access token, no CSRF headers — unlike its sibling `src/app/api/sessions/revoke/route.ts`, which explicitly attaches both with a comment explaining `SessionAuthGuard` requires a CSRF echo for mutations. The backend rejects every call with a 403. Compounding: `login-form.tsx:89-119`'s `handleMfaSubmit` wraps `trustDeviceServer()` in the *same* try/catch as `verifyMfa` + `router.push`, so the 403 is caught and shown to the user as `"Invalid MFA code"` — even though they're already logged in.

**Fix, two independent changes:**
1. Rewrite `trust-device/route.ts` to match `sessions/revoke/route.ts`'s exact pattern:
```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const TRUST_DEVICE_MUTATION = `
  mutation TrustCurrentDevice {
    trustCurrentDevice
  }
`;

export async function POST(req: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  // trustCurrentDevice is a mutation, so SessionAuthGuard requires a CSRF echo — same pattern as api/sessions/revoke.
  const extraHeaders = await csrfEchoHeaders();

  const { data, errors } = await graphqlFetch<{ trustCurrentDevice: boolean }>(
    TRUST_DEVICE_MUTATION,
    undefined,
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors || !data?.trustCurrentDevice) {
    const body = graphqlErrorBody(errors, "Failed to trust device");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
```
2. `login-form.tsx`'s `handleMfaSubmit` — give `trustDeviceServer()` its own try/catch so it can't be mistaken for a failed verify:
```ts
await verifyMfa(mfaState.mfaToken, mfaCode);
if (trustDevice) {
  try {
    await trustDeviceServer();
  } catch {
    // Non-fatal — login already succeeded; trusting the device is best-effort.
  }
}
router.push(`/v1/${lang}/feed`);
```
Both are needed: fixing only #1 still means a *future* trust-device failure (e.g. a real outage) would misreport as a bad code.

---

### High

#### F6 — Flutter "Trust this device" doesn't exist anywhere in the app
**Root cause:** not a bug — never built. `grep -rin "trust" flutter-boilerplate/lib/` returns zero matches. The claim is in both this doc and the `5333dfbc` commit message itself.

**Fix:**
1. New file `lib/api/server/sessions/trust_device.dart`, copying the existing `lib/api/server/sessions/revoke.dart` pattern:
```dart
import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final trustDeviceServerProvider =
    Provider((ref) => TrustDeviceServer(ref.read(dioProvider)));

const _mutation = 'mutation TrustCurrentDevice { trustCurrentDevice }';

class TrustDeviceServer {
  final Dio _dio;
  TrustDeviceServer(this._dio);

  Future<bool> call() async {
    final response = await _dio.post<dynamic>('/graphql', data: {'query': _mutation});
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(requestOptions: response.requestOptions, message: 'Failed to trust device');
    }
    return (body['data'] as Map<String, dynamic>)['trustCurrentDevice'] as bool;
  }
}
```
2. `login/page_content.dart` — add a `_trustDevice` bool + checkbox to `_buildMfaState()`, called after successful verify in its own try/catch (same non-fatal pattern as F5's Web fix):
```dart
await actions.verifyLoginMfa(_mfaToken!, code);
if (_trustDevice) {
  try {
    await ref.read(trustDeviceServerProvider).call();
  } catch (_) {
    // Non-fatal — login already succeeded.
  }
}
```
3. Add a `mfaTrustDevice` i18n key to both ARB files.

---

#### F7 — Web Security page's MFA status is never fetched from the backend
**Root cause:** `PageContent.tsx:14`: `const [mfaEnabled, setMfaEnabled] = useState(false)` — never hydrated from real data. `ME_QUERY` (`src/lib/graphql/queries.ts:5-18`) doesn't select `mfaEnabled` at all, and nothing else in the web app queries it. Compounding: even in-session, `handleVerify` (successful enrollment) never calls `setMfaEnabled(true)` — only `handleDisable`'s success path sets it `false`. Net effect: the page always shows "Two-Factor Disabled," letting an already-enrolled user re-enroll and silently invalidate their existing backup codes. T66's claimed "sessions link" also doesn't exist (zero link/href in the file).

**Fix:**
1. Confirm the backend's `User` GraphQL type exposes `mfaEnabled` (Prisma column exists per Stage 0; check `user.model.ts` for a `@Field()`, not `@HideField()`).
2. **Don't** thread this through the cached `session_user` snapshot cookie / `ME_QUERY` that `useAuth()` uses — that snapshot is written once at login and would go stale the moment a user enrolls or disables mid-session (same staleness class as F2). Instead, fetch fresh server-side on every load: in `src/app/v1/[lang]/settings/security/page.tsx` (a Server Component), query the backend directly for `me { mfaEnabled }` and pass it down: `<SecurityPageContent initialMfaEnabled={mfaEnabled} />`.
3. `PageContent.tsx` — accept that prop, seed `useState(initialMfaEnabled)`.
4. `mfa-handlers.ts`'s `handleVerify` — add a `setMfaEnabled` param, call `setMfaEnabled(true)` alongside `setStep("backup-codes")` on success (mirrors the disable path's existing `setMfaEnabled(false)`).
5. Add the sessions cross-link: `<Link href={\`/v1/${lang}/settings/sessions\`}>...</Link>`.

---

#### F8 — Email OTP codes are stored in Redis in plaintext, under a predictable key
**Root cause:** `token-store.service.ts:313-328`, `writeEmailOtp`/`consumeEmailOtp`: key is `email_otp:<purpose>:<userId>` (not hashed), value is `JSON.stringify({ code, email, attempts: 0 })` — the raw 6-digit code in cleartext. Contrast the MFA-challenge pattern 30 lines above in the same file (`mfa:challenge:${tokenHash}`, correctly sha256-hashed). `EmailOtpService` doesn't inject `CryptoService` at all today.

**Fix** — hash the stored code, same pattern already used for MFA-challenge tokens in this file:
1. `email-otp.service.ts` — inject `CryptoService` into the constructor.
2. `generate()`: `const codeHash = this.crypto.sha256(code);` — pass `codeHash` to `writeEmailOtp` instead of `code` (still send the plaintext `code` to `mail.enqueue`; only storage changes).
3. `token-store.service.ts`'s `writeEmailOtp`/`consumeEmailOtp`/`peekEmailOtp` — rename the `code` field to `codeHash` in the stored JSON and the TS return types.
4. `verify()`: `stored.code !== code` → `stored.codeHash !== this.crypto.sha256(code)`.
The key itself doesn't need to change shape — unlike the MFA-challenge token, the OTP code is what's hashed (the "secret"), not the lookup key, so `purpose:userId` remains a fine key once the value itself isn't readable in plaintext.

---

#### F9 — The 60s resend cooldown and 5-attempt lockout are both bypassable via `login()` itself
**Root cause:** `generate()` (`email-otp.service.ts`) has no cooldown check of its own — only `resend()` does. `auth-login.service.ts:117` calls `generate()` directly on every step-up trigger, and each call fully overwrites the OTP record (`writeEmailOtp`), resetting `attempts` to 0 with no cooldown gate at all. Repeatedly calling the `login` mutation with valid credentials mints unlimited fresh codes and unlimited fresh 5-guess budgets — no need to touch "resend."

**Fix** — move the cooldown check down into `generate()` so every caller shares it:
```ts
async generate(userId: string, email: string, purpose: 'REGISTRATION' | 'LOGIN'): Promise<void> {
  const cooldownKey = `otp_cooldown:${purpose}:${userId}`;
  const remaining = await this.tokenStore.getOtpResendCooldown(cooldownKey);
  if (remaining > 0) {
    throw new BadRequestException({
      exc: 'EX_AUTH_OTP_RESEND_COOLDOWN',
      msg: `Please wait ${remaining} seconds before requesting a new code`,
      key: 'auth.errors.otpResendCooldown',
    });
  }

  const code = String(randomInt(100000, 999999));
  await this.tokenStore.writeEmailOtp(purpose, userId, code, email); // codeHash once F8 lands
  await this.tokenStore.setOtpResendCooldown(cooldownKey, RESEND_COOLDOWN_SECONDS);
  await this.mail.enqueue({ /* unchanged */ });
  this.logger.debug(/* unchanged */);
}

async resend(userId: string, email: string, purpose: 'REGISTRATION' | 'LOGIN'): Promise<void> {
  // Cooldown + regeneration now live in generate(); resend() just clears any
  // still-pending OTP first so a stale code can't outlive the new one.
  const stored = await this.tokenStore.peekEmailOtp(purpose, userId);
  if (stored) await this.tokenStore.deleteEmailOtp(purpose, userId);
  await this.generate(userId, email, purpose);
}
```
**No change needed in `auth-login.service.ts`**: its existing `try { await this.emailOtp.generate(...) } catch { this.logger.warn(...) }` (lines 115-123) already swallows any thrown error and still returns `mfaRequired: true` — a rapid repeat `login()` call within the cooldown window will now correctly reuse the still-valid, not-reset OTP instead of minting a new one, with no behavior change visible to the caller. Worth tweaking the warn-log text to distinguish "cooldown active" from a genuine send failure, since operators would want to tell those apart.

---

#### F10 — Biometric app-lock has no fallback; a revoked biometric permanently locks the user out
**Root cause:** `_BiometricOverlay` (`app.dart:133-183`) has exactly one interactive control — a fingerprint retry `IconButton`. No password fallback, no sign-out escape hatch. If OS-level biometrics are revoked while the `biometric_enabled` flag stays on, `authenticate(biometricOnly: true)` just keeps failing forever.

**Fix** — add a "Sign out instead" escape hatch, reusing the app's existing (working) login flow rather than building a new in-place password prompt:
```dart
TextButton(
  onPressed: () async {
    await ref.read(authProvider.notifier).logout();
  },
  child: Text(AppLocalizations.of(context).biometricSignOutInstead),
)
```
Signing out and back in with email+password already exercises the normal auth path — functionally the same outcome T44 described as "falls back to password," just via the existing login screen instead of an in-place re-auth modal (a bigger feature, not needed here). Note `_BiometricOverlay` is a `StatelessWidget` with no `ref` today — convert to `ConsumerWidget`, or pass a `VoidCallback onSignOut` down from `_FlutterBoilerplateAppState`, which already has `ref`. Add the new `biometricSignOutInstead` string to both ARB files (see also F20 — the rest of this widget's strings need the same treatment).

---

#### F11 — Biometric lock has a cold-start race that can show real authenticated content before the lock screen
**Root cause:** `_biometricLocked` starts `false`; the check runs inside `addPostFrameCallback` (after the real, unlocked router's first frame already rendered) and only fires after `_initServices()` awaits OAuth-link-handler init and push-notification init first (`app.dart:60-87`). The router's own auth-redirect has no knowledge of biometric-lock state. There's a real window on cold start, with a valid stored session, where authenticated content is interactive before any fingerprint prompt appears. (Resume-from-background is fine — that path sets the lock flag synchronously before any repaint.)

**Fix** — gate rendering itself, not just the overlay, and check biometrics first:
```dart
bool _biometricGatePending = !kIsWeb; // add alongside _biometricLocked/_biometricChecked

Future<void> _initServices() async {
  if (kIsWeb) return;

  final biometric = ref.read(biometricProvider);
  final enabled = await biometric.isEnabled();
  if (enabled) {
    _biometricChecked = true;
    await _unlockWithBiometric(); // awaited, not fire-and-forget
  }
  if (mounted) setState(() => _biometricGatePending = false);

  _oauthLinkHandler = OAuthLinkHandler();
  await _oauthLinkHandler!.init(ref);
  // ...push notification init unchanged, now runs after the gate resolves
}
```
In `build()`, while `_biometricGatePending` is true, return a minimal blocking splash (`Container(color: colors.surface)` is enough — it's on screen for one secure-storage read) instead of `MaterialApp.router`, so the router's auth-redirect never gets a chance to paint real content before the gate resolves.

---

### Medium

#### F12 — `InputOtp`/`InputOTP` claimed in multiple screens that don't actually use it
**Root cause, corrected from this doc's own first verification pass** (F12 originally over-credited Flutter): a repo-wide grep for `InputOtp(` on Flutter turns up **zero real usage anywhere in the app** — not enrollment (T27), not login MFA (T35), not email-verify (T33). The widget exists and is exercised only in its own component-gallery demo page (`lib/views/ui/input_otp/page_content.dart`). On Web, `InputOTP` genuinely is used in exactly one real place — `login-form.tsx:211-219` — and nowhere else (`PageContent.tsx`'s enrollment/disable fields are plain `<input>`, per T57).

**Fix** — same swap in four places, using Web's `login-form.tsx:211-219` as the one working reference pattern in this feature (`<InputOTP maxLength={6} value={...} onChange={...} />`), translated to Dart via `lib/components/ui/input_otp/input_otp.dart`'s actual constructor:
- Flutter `mfa_enroll/page_content.dart:216-233` (verify step).
- Flutter `verify_email/page_content.dart:196-213` (email-verify code entry).
- Flutter `login/page_content.dart:346-462` (`_buildMfaState()` — this is also T35/F13's fix, same code).
- Web `PageContent.tsx:93-101,212-222` (verify + disable steps) — copy `login-form.tsx:211-219` directly.

---

#### F14 — No real resend-cooldown UI on either platform
**Root cause:** T34/T61 both only track an in-flight boolean that clears the instant the request resolves — no timer, no countdown, nothing reflecting the backend's real 60s cooldown. Compounds F2 (more opportunities to hit the dead-end before F2 is fixed) even though it isn't the root cause of it.

**Fix** — add a countdown after each successful resend, disabling the control for the cooldown window:
- Flutter (`login/page_content.dart`, `verify_email/page_content.dart`): `Timer.periodic` counting down from 60, `onPressed: _cooldownRemaining > 0 ? null : _resendCode`, canceled in `dispose()`.
- Web (`login-form.tsx`, `verify-email-form.tsx`): a small `useCountdown` hook or `useEffect` + `setInterval`, disabling the resend `<Button>` while `cooldownRemaining > 0`.

---

#### F15 — Backup-code toggle shown even for EMAIL-method challenges, where it's a guaranteed dead end
**Root cause:** `login/page_content.dart:407-420` shows the toggle unconditionally; the backend's EMAIL branch (`auth-login.service.ts:183-204`) never checks backup codes, only `emailOtp.verify()`.

**Fix:** wrap the toggle in `if (_mfaMethod == 'TOTP') ...`. Depends on F3's resolution for real-world impact — under Option B this stays latent since few/no accounts reach the EMAIL branch; under Option A it becomes immediately user-visible.

---

#### F16 — Web's enrollment QR sends the raw TOTP secret to a third party in cleartext
**Root cause:** `PageContent.tsx:66` builds `https://api.qrserver.com/...?data=<otpauthUrl>` — the base32 secret travels as a URL query param to goqr.me, visible in that provider's logs, any intermediate proxy, and browser history. Not disclosed as a tradeoff anywhere in the original doc.

**Fix:** render the QR locally instead, matching what Flutter's `qr_flutter` (T26) already does correctly — add a client-side QR package (e.g. `qrcode.react`) and render `enrollData.otpauthUrl` with zero network calls. If keeping the external API is a deliberate call (bundle size, etc.), document the tradeoff explicitly rather than presenting it as a plain implementation detail.

---

#### F17 — `NSFaceIDUsageDescription` missing from iOS `Info.plist`
**Fix:** add to the top-level `<dict>` in `ios/Runner/Info.plist`:
```xml
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to unlock the app.</string>
```
Check whether other permission strings in this plist are localized via per-locale `InfoPlist.strings` files first, and match that pattern if so instead of a single hardcoded string.

---

#### F18 — Enabling/disabling biometric mid-session doesn't arm/disarm the lock until next cold start
**Root cause:** the lock-arming state in `app.dart` is set once, during `_initServices()` at cold start, with no wiring back from the Settings-page toggle (`page_view.dart`).

**Fix:** promote the arming state into a shared Riverpod provider (the same one F19 introduces) that both `app.dart` and `page_view.dart` read/write, instead of `app.dart` holding it as a private `State` field. Once it's a shared provider, `didChangeAppLifecycleState` reads the live value instead of a cold-start snapshot.

---

#### F19 — `use_biometric.dart` doesn't match the claimed `use_push_notifications.dart` pattern
**Root cause:** the referenced file centralizes logic in a `NotifierProvider`; `use_biometric.dart` is 13 lines of thin `FutureProvider` wrappers, with real enable/disable logic duplicated inline in both `security/page_view.dart` and `app.dart` instead. No `Fake*` class exists anywhere (the claimed "fake/override seam" is bare Riverpod overridability, not an engineered fake).

**Fix:** centralize enable/disable into `use_biometric.dart`'s own `NotifierProvider` (mirroring `PushNotificationActionsNotifier`), with both call sites using it instead of duplicating logic. Add a `FakeBiometricAuth` implementing `lib/lib/biometric_auth.dart`'s interface, overridable via `ProviderScope(overrides: [...])` in tests — this also unblocks T47 (no tests exist, partly because there's nothing to fake against) and directly enables F18's fix.

---

#### F20 — Biometric lock-screen text is hardcoded English despite T46 claiming full localization
**Root cause:** `app.dart:157,166` — `Text('App Locked')` and `Text('Authenticate to access the app')` are literals with no ARB key on either locale, even though the *toggle's own* strings (`securityBiometric*`) genuinely are localized.

**Fix:** replace both with `AppLocalizations.of(context).securityBiometricLockedTitle` / `...LockedSubtitle` (naming consistent with the existing `securityBiometric*` keys), adding the two new keys to `app_en.arb`/`app_tr.arb`.

---

#### F21 — Two Web login-MFA strings hardcoded English
**Root cause:** `login-form.tsx:249,271` — `"Trust this device"` and `"Use a different account"` are literals, not routed through `t.form.login.*` like every other string on the same screen.

**Fix:** replace with `t.form.login.trustDevice` / `t.form.login.useDifferentAccount` (or matching names for the existing key convention), adding both to `messages/en/auth/messages.json` and `messages/tr/auth/messages.json`.

---

#### F22 — Flutter Security page's "Change Password" row is a silent no-op
**Root cause:** `page_view.dart:48`: `onTap: () {}` — no message at all, not the "coming soon" the doc described. Moot in practice until F4 makes the page reachable.

**Fix:** `onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).securityChangePasswordComingSoon)))`, adding the new key to both ARB files.

---

## 4. Suggested fix order

Dependency-ordered, not severity-ordered — fixing in this order avoids re-touching the same file twice or building on top of something still broken:

1. **F1** (backend compile) — unblocks a real, deployable build; everything else in Stages 0-D is unverifiable until this lands.
2. **F3** (baseline step-up decision) — a product call, needed before F6/F9/F14/F15 can be judged "must-fix now" vs "latent for later." Get Berkay's answer first; the code change itself is trivial once decided.
3. **F2** (resend token loss, both platforms) — the core EMAIL-OTP flow is dead-on-arrival without this, regardless of F3's answer, since it also affects registration email verification's resend path if that's ever wired to the same pattern.
4. **F4, F5, F6, F7** — make the already-shipped UI reachable and correct: Flutter's Security tab, Web's trust-device route, Flutter's missing trust checkbox, Web's real MFA status.
5. **F8, F9** — security hardening on the backend (plaintext storage, cooldown bypass) — no frontend dependency, can land anytime, but real exposure until fixed.
6. **F10, F11** — biometric safety (lockout risk, startup race).
7. **F12–F22** — consistency/polish: OTP-input component adoption, cooldown UI, i18n gaps, iOS plist key, dead-code cleanup.

Re-run this verification after fixes land — re-read every file touched, re-run all three test suites plus `pnpm build`, don't just trust `git diff` looks right.

---

## 5. Remaining open items (test/process, not covered above)

| Ref | Item | Status |
|-----|------|--------|
| T32 | Flutter MFA widget tests | Not started — write after F4/F6/F12 land, so tests target the corrected UI, not the current broken one |
| T38 | Flutter email-OTP widget tests | Not started — same reasoning, write after F2/F12/F14 land |
| T47 | Flutter biometric provider tests | Not started — blocked on F19 (needs a fake to test against) |
| T53 | Flutter Security tab reachability test | Not started — write immediately after F4, it's the regression test that would have caught F4 |
| T69 | i18n cleanup | Partial — remove dead `privacyTwoFactor*` keys; also now covers F20/F21's missing keys |
| T72 | Web vitest + Playwright | Not started |
| T73 | Assertion-quality review | Blocked on T32/T38/T47/T53/T72 existing first |
