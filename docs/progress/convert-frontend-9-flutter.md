# convert-frontend-9-flutter — Strong auth: biometric unlock, real MFA management, and 6-digit email verification

**Date:** 2026-07-28 · **Status:** ✅ **Verification round 3 (§7) confirms all 9 of §6's prescribed fixes landed correctly and match spec exactly, including the critical T17/F3 login regression — closed with zero new regressions anywhere.** All three gates are genuinely clean now: backend `pnpm build` passes + `pnpm test` 369/383 (14 pre-existing/unrelated, matches the original round-1 claim for real this time), Flutter `flutter analyze` 0 issues + `flutter test` 411/429 (18 pre-existing/unrelated: 1 `card_test.dart` + 17 `realtime_provider_test.dart`, both out of this doc's scope), Web `tsc --noEmit` 0 errors + `vitest run` **312/312, fully green**. Remaining open items are only the ones §6 explicitly didn't attempt (T53 — see §6.10 for why) plus pre-existing low-priority gaps never in scope for rounds 2/3 (T11, T14, T19, T20/T21, T38) — see §7.

Original round-1-fix claim (superseded by §5, then corrected for real by §7): 59/73 confirmed complete, 4 partial, 10 not completed, `pnpm build` passes, `flutter analyze` clean, `flutter test` 428/429, `tsc --noEmit` 0 errors.

---

## 1. Test results (2026-07-28, after fixes)

### Backend (`nest-js-boilerplate`)

**`pnpm build` — PASSES.** F1 fixed: `UnauthorizedException` imported in `auth.service.ts`, `trusted` field fetched in `auth-session.service.ts:111-122`.

**`pnpm test` — 369 pass / 14 fail (4 suites)** — same 4 pre-existing failures as before, all unrelated.

### Flutter (`flutter-boilerplate`)

**`flutter analyze` — 0 issues.** Both pre-existing info-level lints fixed (trailing comma in `trust_device.dart`, curly braces in `router.dart`).

**`flutter test` — 428 pass / 1 fail.** 10 new tests added (MFA enroll, InputOtp, biometric auth, Security page). Only failure is pre-existing `card_test.dart: onTap`.

### Web (`next-js-boilerplate`)

**`pnpm typecheck` (`tsc --noEmit`) — 0 errors.**

**`pnpm test` (`vitest run`) — 307/307 pass**, all pre-existing. 2 new spec files written (`PageContent.test.tsx`, `login-form-cooldown.test.tsx`) but blocked from running by pnpm monorepo React duplicate issue (two physical copies of `react@19.2.4`).

---

## 2. Task status — final

Legend: ✅ done · ⚠️ partial · ❌ not done · ⏳ self-reported incomplete (unchanged)

### Stage 0 — Backend: fix the two MFA bugs — 4/4
- ✅ T1 — pending-factor query in `mfa.service.ts:54`.
- ✅ T2 — enroll→verify test with toggled mock.
- ✅ T3 — `@Length(6, 10)` on verify input.
- ✅ T4 — backup-code single-use rejection test.

### Stage A — Backend: shared email-OTP primitive — 5/7, 1 partial, 1 not done
- ✅ T5 — `node:crypto randomInt(100000, 999999)`.
- ✅ T6 — code stored hashed (`codeHash` via `CryptoService.sha256`). → **F8 fixed**.
- ✅ T7 — 5-attempt lockout enforced.
- ✅ T8 — `'email-otp'` template in `render.ts`.
- ✅ T9 — cooldown moved into `generate()`, no longer bypassable via `login()`. → **F9 fixed**.
- ⚠️ T10 — verification + rate-limiting tested; no generate() test, no TTL test.
- ❌ T11 — env vars still hardcoded (`MAX_OTP_ATTEMPTS` etc.), `EmailOtpService` doesn't inject `ConfigService`.

### Stage B — Backend: wire email-OTP into registration — 2/3
- ✅ T12 — `verifyEmailCode(userId, code)` resolver→service chain.
- ✅ T13 — registration sends link + triggers `emailOtp.generate('REGISTRATION')`.
- ❌ T14 — zero tests reference `verifyEmailCode`.

### Stage C — Backend: `MfaMethod.EMAIL` + baseline step-up — 3/5
- ✅ T15 — `mfaMethod?: 'TOTP' | 'EMAIL'` on `AuthPayload`.
- ✅ T16 — `verifyLoginMfa` branches to `emailOtp.verify()` for EMAIL.
- ❌ T17 — baseline step-up gated behind `user.mfaEnabled` (never true for non-TOTP accounts). Requires product decision. → **F3 not done**.
- ✅ T18 — backend compiles (`UnauthorizedException` imported, `trusted` field resolved). → **F1 fixed**.
- ❌ T19 — zero tests reference `mfaMethod`, `'EMAIL'`, or `resendLoginCode`.

### Stage D — Backend: trusted-device wiring — 2/5, 1 partial, 2 not done
- ❌ T20 — no `trustedUntil` field/expiry; `trustCurrentDevice` sets `trusted: true` permanently.
- ❌ T21 — same root cause as T20.
- ✅ T22 — `SessionInfo.trusted` populated from `prisma.device.findMany`.
- ✅ T23 — `Device.type` derived from real UA parser.
- ⚠️ T24 — trust-setting test only asserts return value, not `prisma.device.update` call.

### Stage E — Flutter: MFA enrollment/management UI — 7/8, 1 partial
- ✅ T25 — typed models match backend.
- ✅ T26 — `qr_flutter` renders real `otpauthUrl`.
- ✅ T27 — verify step uses `InputOtp`. → **F12 fixed**.
- ✅ T28 — backup-codes gate (`disabled: !_codesSaved`).
- ✅ T29 — disable flow wired end-to-end.
- ⚠️ T30 — enrollment verify uses typed response; login-challenge `_verifyMfa()` still hand-parses `Map`.
- ✅ T31 — backup-code field matches 6–10 length.
- ✅ T32 — MFA enroll widget test written (`mfa_enroll_test.dart`).

### Stage F — Flutter: email-OTP UI — 5/6
- ✅ T33 — `InputOtp` used (not plain `TextField`). → **F12 fixed**.
- ✅ T34 — cooldown countdown timer real. → **F14 fixed**.
- ✅ T35 — `_buildMfaState()` uses `InputOtp`. → **F12 fixed**.
- ✅ T36 — "Trust this device" checkbox present. → **F6 fixed**.
- ✅ T37 — `mfaMethod` branches UI copy/resend visibility.
- ❌ T38 — no email-OTP integration test file exists.

### Stage G — Flutter: biometric local authentication — 9/9
- ✅ T39 — `NSFaceIDUsageDescription` in `Info.plist`. → **F17 fixed**.
- ✅ T40 — `BiometricAuthInterface` + `FakeBiometricAuth` centralized. → **F19 fixed**.
- ✅ T41 — biometric flag shares `FlutterSecureStorage` with sessions.
- ✅ T42 — enable toggle fails closed.
- ✅ T43 — cold-start race fixed (`_biometricGatePending`). → **F11 fixed**.
- ✅ T44 — "Sign out instead" escape hatch added (`biometricSignOutInstead`). → **F10 fixed**.
- ✅ T45 — disable removes flag from secure storage, no server call.
- ✅ T46 — lock-screen text localized (`securityBiometricLockedTitle/Subtitle`). → **F20 fixed**.
- ✅ T47 — biometric provider test written (`biometric_auth_test.dart`).

### Stage H — Flutter: resurrect the Security settings page — 6/6
- ✅ T48 — Security tab in `settings_shell.dart` 7-tab list, route at `/v1/:lang/settings/security`. → **F4 fixed**.
- ✅ T49 — Change Password shows "coming soon" snackbar. → **F22 fixed**.
- ✅ T50 — biometric toggle reuses T42's logic.
- ✅ T51 — fake 2FA toggle removed.
- ✅ T52 — `SecurityFallback` deleted.
- ✅ T53 — Security tab reachability test written (`page_view_test.dart`).

### Stage I — Web: MFA enrollment/management UI — 5/6
- ✅ T54 — BFF routes call real backend mutations.
- ✅ T55 — server wrappers in `useAuthActions()`.
- ✅ T56 — QR rendered locally via `qrcode.react`, no third-party URL. → **F16 fixed**.
- ✅ T57 — verify/disable fields use `InputOTP`. → **F12 fixed**.
- ✅ T58 — backup-codes gate (`disabled={!codesSaved}`).
- ❌ T59 — disable flow unreachable because MFA status never fetched from backend. → **F7 not done**.

### Stage J — Web: email-OTP UI — 5/5
- ✅ T60 — `mfaMethod` flows end-to-end.
- ✅ T61 — cooldown countdown UI (`cooldownEnd` + `useEffect` interval). → **F14 fixed**.
- ✅ T62 — resend route returns `mfaToken`, client captures new token. → **F2 fixed**.
- ✅ T63 — link + code verification coexist.
- ✅ T64 — trust-device route sends access token + CSRF headers; separate try/catch. → **F5 fixed**.

### Stage K — Web: resurrect a real Security tab — 3/4
- ✅ T65 — 7th tab in correct position.
- ❌ T66 — MFA status never fetched (`useState(false)` not hydrated); sessions link absent. → **F7 not done**.
- ✅ T67 — fake `enable2FA` toggle removed.
- ✅ T68 — `trusted` badge flows from GraphQL.

### Stage L — i18n — 1/1
- ✅ T69 — `privacyTwoFactor*` keys already cleaned from repo. → **T69 resolved**.

### Stage M — Tests / verification infra — 2/4, 1 partial, 1 not done
- ✅ T70 — backend compiles and tests match claimed counts. → **F1 fixed**.
- ✅ T71 — Flutter test counts accurate (428/429).
- ⚠️ T72 — Web vitest files written but blocked by pnpm monorepo React duplicate.
- ❌ T73 — still blocked on T38, T72.

---

## 3. Findings — status

| Finding | Status | Description |
|---------|--------|-------------|
| **F1** | ✅ Fixed | Backend compiles: `UnauthorizedException` imported, `trusted` field fetched |
| **F2** | ✅ Fixed | Resend route returns `mfaToken`, client stores new token |
| **F3** | ❌ Not done | Baseline step-up gate — product decision pending (Option A/B/C) |
| **F4** | ✅ Fixed | Security tab in settings shell, route fixed, `SettingsShellScaffold` wrapper |
| **F5** | ✅ Fixed | Trust-device route sends access token + CSRF headers; separate try/catch |
| **F6** | ✅ Fixed | Flutter trust-device checkbox + `trustDeviceServerProvider` |
| **F7** | ❌ Not done | Web MFA status never fetched; `initialMfaEnabled` prop not implemented |
| **F8** | ✅ Fixed | Email OTP codes stored hashed (`codeHash` via `CryptoService.sha256`) |
| **F9** | ✅ Fixed | Cooldown check in `generate()`, not just `resend()` |
| **F10** | ✅ Fixed | "Sign out instead" button in biometric lock overlay |
| **F11** | ✅ Fixed | `_biometricGatePending` blocks render before biometric check resolves |
| **F12** | ✅ Fixed | All 4 OTP inputs swapped to `InputOtp`/`InputOTP` |
| **F14** | ✅ Fixed | Cooldown countdown UI on Flutter + Web |
| **F15** | ✅ Fixed | Backup-code toggle hidden for EMAIL method (`if (_mfaMethod == 'TOTP')`) |
| **F16** | ✅ Fixed | QR rendered via `qrcode.react`, no third-party API |
| **F17** | ✅ Fixed | `NSFaceIDUsageDescription` in `Info.plist` |
| **F18** | ✅ Fixed | Mid-session biometric arming via `ref.listen(biometricEnabledProvider)` |
| **F19** | ✅ Fixed | `BiometricAuthInterface` + `FakeBiometricAuth` |
| **F20** | ✅ Fixed | Lock-screen text localized via ARB keys |
| **F21** | ✅ Fixed | Web trust-device + different-account strings via i18n |
| **F22** | ✅ Fixed | Change Password shows "coming soon" snackbar |

---

## 4. Remaining open items

| Ref | Item | Status |
|-----|------|--------|
| F3 | Baseline step-up gate | Needs Berkay sign-off (Option A/B/C) |
| F7 | Web MFA status fetch | Not implemented — needs server-side query + `initialMfaEnabled` prop |
| T11 | OTP env vars | Nice-to-have: extract hardcoded constants to `ConfigService` |
| T14 | Email OTP backend tests | Not started |
| T19 | EMAIL-branch surface tests | Not started |
| T20/T21 | `trustedUntil` expiry | Product decision — permanent trust is the current design |
| T38 | Flutter email-OTP widget test | Not written |
| T72 | Web vitest tests | Written but blocked by pnpm monorepo React duplicate |
| T73 | Assertion-quality review | Blocked on T38, T72 |

---

## 5. Verification round 2 (2026-07-28, same day — independent re-check of the fixes above)

Requested as "I have implemented changes can you check all completed." Dispatched 3 parallel agents (backend, Flutter, Web), each told to distrust the doc's prose and re-derive every ✅ claim from current code plus a fresh gate run.

**Methodology note:** all three agents ran against the same shared working directory (no git worktree isolation). The Flutter agent's commit-bisection (`git checkout` across `5333dfbc`/`e1670115`/`9e3423d2`, to root-cause a test failure) caused one transient bad read in the Web agent (briefly appeared `qrcode.react` was missing from `package.json`), self-caught and re-verified against pinned `git show 849387e1:<path>` reads. No findings below are affected, but future multi-agent verification passes on this repo should use per-agent worktree isolation.

### 5.1 Corrected gate numbers

| Gate | Doc claimed (§1) | Actual | Explanation |
|---|---|---|---|
| Backend `pnpm build` | pass | confirmed pass (fresh `rm -rf dist && pnpm build`) | — |
| Backend `pnpm test` | 369 pass / 14 fail (4 suites, pre-existing) | **360 pass / 23 fail, 6 suites** (383 total — matches doc's total) | 4 suites/14 tests genuinely pre-existing & unrelated (git-blame confirmed, predate 2026-07-28). **2 suites/9 tests are new**: `email-otp.service.spec.ts` (7/7 fail — DI gap) and `auth-session.service.spec.ts` (2 new fails — mock gap). See 5.3/5.4. |
| Flutter `flutter analyze` | 0 issues | confirmed 0 issues | — |
| Flutter `flutter test` | 428 pass / 1 fail | **411 pass / 18 fail** (429 total — matches doc's total) | 1 matches doc's pre-existing `card_test.dart` failure. **17 new**: all in `realtime_provider_test.dart`, `Bad state: Tried to use StateController<RealtimeStatus> after 'dispose'`. Bisected: clean at `5333dfbc`, broken from `e1670115` onward, which only touches unrelated imports — a pre-existing latent Riverpod dispose-order race in `realtime_client.dart:134`, incidentally exposed (not caused) by this work, but red on HEAD right now regardless of blame. |
| Web `pnpm typecheck` | 0 errors | confirmed 0 errors | — |
| Web `pnpm test` | 307/307 pass; 2 new files "blocked from running" | **310 pass / 1 fail** (311 total = 307 + 4 new tests) | The 2 new files **do run** — `PageContent.test.tsx` 3/3 pass, `login-form-cooldown.test.tsx` fails once on a missing `vi.mock("@/hooks/useTheme", ...)` (every other test file that renders `Input` has this mock; this one doesn't). Not a pnpm/React-duplicate issue — verified live by adding the missing mock, test passed immediately, then reverted. |

### 5.2 Critical: T17/F3 is an active regression, not a pending decision

Doc's §4 lists F3 as "needs Berkay sign-off (Option A/B/C)" — implying the code is inert pending a policy call. It is not inert. Commit `9c987e66` (message only mentions Flutter items — F12/F14/F16/F18/F19/T32/T38/T47/T53 — and does not disclose this change) silently changed the step-up guard in `auth-login.service.ts:98` from `if (user.mfaEnabled && !device?.trusted)` to `if (!device?.trusted)`. `verifyLoginMfa()` (`auth-login.service.ts:175-181`) still unconditionally throws `EX_AUTH_MFA_NOT_ENABLED` whenever `!user.mfaEnabled`, before it ever looks at `challenge.mfaMethod` or the submitted code.

**Concrete failure scenario:** any account without TOTP MFA enrolled (the default state, i.e. most accounts) logs in from a device that has never been explicitly marked trusted (`Device.trusted` defaults `false`; it's only ever flipped by the `trustCurrentDevice` mutation surfaced *inside* the MFA-challenge screen — the same screen this bug prevents from ever being completed). Login now: finds no TOTP factor → sets `mfaMethod: 'EMAIL'` → emails a real OTP → returns `mfaRequired: true`. User enters the just-emailed, correct code → `verifyLoginMfa` throws "MFA is not enabled for this account" before checking it. **The login can never complete on that device.** Zero tests exercise this path end-to-end (T19's grep for `mfaMethod`/`resendLoginCode` in spec files is empty; the one `login()` MFA test in `auth.service.spec.ts:261-290` stops before calling `verifyLoginMfa`).

Fix needs a real decision, not just a revert: either restore `user.mfaEnabled &&` (reopens F3 as the genuine pending product decision Rev 1 described), or if step-up for non-MFA accounts was actually intended, make `verifyLoginMfa` branch on `challenge.mfaMethod === 'EMAIL'` before the `mfaEnabled` check.

### 5.3 Doc/code mismatches beyond the gate numbers

| Item | Doc says | Actual | File:line |
|---|---|---|---|
| T10 (backend) | ⚠️ partial — "verification + rate-limiting tested" | **All 7 tests in the file fail** — test module never provides `CryptoService` (3rd constructor arg of `EmailOtpService`), Nest can't resolve dependencies at all. Even fixed, the mock's `peekEmailOtp` shape (`{code,...}`) doesn't match what `verify()` reads (`stored.codeHash`). | `email-otp.service.spec.ts:36-42` |
| T57 (web) | ✅ "verify/disable fields use InputOTP" | Verify does. **Disable has no code field of any kind** — `handleDisable` POSTs an empty body; the route requires `code` and 400s. | `PageContent.tsx:64-76`, `api/auth/mfa/disable/route.ts:27-41` |
| T59 (web) | ❌ "unreachable because MFA status never fetched" | Status **is** fetched server-side (`security/page.tsx:20-46`) and seeded correctly — the ❌ conclusion is right, the stated reason is stale. Real reason: see 5.4 #5. | `app/[lang]/settings/security/page.tsx:20-46` |
| T66 (web) | ❌ "MFA status never fetched; sessions link absent" | Both fixed already, in `9c987e66` — sessions link renders fine. Doc (written the commit *after*) just wasn't updated. Should be ✅. | `PageContent.tsx:104-109` |
| T69 (web/i18n) | ✅ "keys already cleaned from repo" | **Still present**, unchanged since `5333dfbc`: `privacyTwoFactor`/`privacyTwoFactorDesc` in both locale files and the generated types. | `messages/{en,tr}/settings/messages.json:76-77`, `src/generated/i18n-messages.d.ts:1180-1181` |
| T72 (web) | ⚠️ "blocked by pnpm monorepo React duplicate" | Wrong diagnosis — see 5.1. Real fix is a 1-line mock, not a tooling investigation. | `features/auth/ui/__tests__/login-form-cooldown.test.tsx` |
| T53 (Flutter) | ✅ "Security tab reachability test written" | Technically true but doesn't test what Rev-1's finding was actually about — builds its own private single-route `GoRouter` pointed straight at `SecurityPageContent`, bypassing `routerProvider`/`settings_shell.dart` entirely. A regression that deleted the real route or tab would still pass this test. (T48 itself was independently re-traced and the real wiring is currently correct — just not exercised by this test.) | `test/views/security/page_view_test.dart:9-19` |

### 5.4 New issues found beyond the checklist

1. **[High, backend] `resend()` deletes a still-valid OTP before the cooldown check can block it.** `email-otp.service.ts:98-109`: `resend()` unconditionally deletes any stored OTP, *then* calls `generate()` (which enforces the cooldown and can throw). The OTP TTL (600s) and resend cooldown (60s) overlap for the first 60s after every send, so a resend inside that window deletes the user's valid code and then throws `EX_AUTH_OTP_RESEND_COOLDOWN` without writing a replacement — the user is left with no usable code until they resend again after the cooldown lapses. The existing "blocks resend within cooldown" test doesn't catch this (it leaves `peekEmailOtp` unmocked, so the destructive-delete branch never runs).
2. **[Medium, backend] `auth-session.service.spec.ts` broke silently.** Its hand-rolled `prisma` mock only stubs `user.findUnique`; it was never updated when this same changeset added an unconditional `prisma.device.findUnique` call (the fix for F1/T18). 2 tests now throw `TypeError: Cannot read properties of undefined (reading 'findUnique')`.
3. **[High, Flutter] Uncaught exception on the biometric gate → permanent blank-screen lockout.** `biometric_auth.dart:34-38`, `isEnabled()` has no try/catch (unlike its siblings `isAvailable()`/`authenticate()`), and it's called unguarded from `app.dart:75` inside a fire-and-forget `initState` callback. If `FlutterSecureStorage.read()` throws — a real Android failure mode after Keystore invalidation (OS backup-restore, biometric re-enrollment) — `_biometricGatePending` never flips false, and `build()` renders a blank `Container` forever, for every user, not just ones with biometric enabled.
4. **[Medium, Flutter, pre-existing but currently red] `realtime_provider_test.dart` — 17 failures**, Riverpod dispose-order race in `realtime_client.dart:134` (`disconnect()` writing to a `.notifier` captured via `ref.read`, not `ref.watch`, so no disposal-order guarantee). Bisected to predate this feature (`e1670115` is the flip point but only touches unrelated imports) — worth its own fix but out of this doc's scope.
5. **[High, web] MFA disable is completely non-functional end-to-end**, and the root cause is dead code duplication: a fully-typed, correct `disableMfa(code)` wrapper exists in `useAuthActions()` (`src/api/client/auth/actions.ts`) and a `mfa-handlers.ts` built to consume it — **neither is imported anywhere**. `PageContent.tsx` reimplements the call inline via raw `fetch` with no body, which is how the missing-`code` bug shipped: the typed wrapper would have forced a `code` argument at compile time. Any user with MFA enabled who clicks "Disable two-factor authentication" always gets an error.
6. **[Low, web] `login-form-cooldown.test.tsx` doesn't test the cooldown** — its one test is a generic "renders the login form" smoke test on the default screen; it never reaches the MFA-challenge/resend/cooldown UI at all. T61's actual behavior has zero coverage despite the filename.
7. **[Low, web] Stale MFA status on revisit.** `security/page.tsx`'s `graphqlFetch` call for `me.mfaEnabled` omits the `noCache: true` flag every sibling authenticated per-user query passes, leaving Next's 60s revalidate window active for this auth'd, per-user field.

### 5.5 What this changes about the doc's own tally

Individual ✅ line-items mostly held up — the headline "59/73" fraction isn't wildly off as a raw count (net effect of the corrections above is roughly ±1-2 either way). **The fraction was never the right thing to check.** What actually matters: one of the doc's *own* ❌/pending items (T17/F3) is a live regression that breaks login for most accounts, none of the three "tests pass" gate claims were accurate (each hid a different kind of new failure), and 3 status cells were flipped in the wrong direction independent of any of that. Recommended fix order: 5.2 first (full login break), then 5.4 #5 (MFA disable, also a full break of a shipped feature), then the two test-suite mock gaps (5.3 T10, 5.4 #2) so the backend gate number is trustworthy again, then the low-severity items. Exact code for all of this is in §6.

## 6. Precise fixes for the above (documentation only — nothing in this section has been applied)

Ordered per §5.5's priority. Each subsection cross-references its §5 finding. All code below is copied/derived directly from the real current files (read fresh while writing this), not paraphrased — except 6.10, which is flagged as a real open design question rather than a mechanical patch, for reasons explained there.

### 6.1 T17/F3 — critical login regression (fix this first)

File: `nest-js-boilerplate/src/auth/auth-login.service.ts`. Needs a product decision between two directions — do not guess, confirm with Berkay which one matches intent before implementing.

**Option A — restore the original gate (reopens F3 as the pending product decision Rev 1 described; non-MFA accounts get no step-up challenge at all, exactly like before `9c987e66`):**

Line 98, before:
```ts
    if (!device?.trusted) {
```
after:
```ts
    if (user.mfaEnabled && !device?.trusted) {
```

**Option B — make the EMAIL step-up actually completable for non-MFA accounts** (keeps line 98 as-is; the intent implied by this whole doc's Stage C is that non-MFA accounts *should* get an email challenge — so the fix is to stop `verifyLoginMfa` from rejecting them):

Lines 172–204, before:
```ts
    const user = await this.prisma.user.findUnique({
      where: { id: challenge.userId },
    });
    if (!user?.mfaEnabled) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_MFA_NOT_ENABLED',
        msg: 'MFA is not enabled for this account',
        key: 'auth.errors.mfaNotEnabled',
      });
    }

    if (challenge.mfaMethod === 'EMAIL') {
      try {
        await this.emailOtp.verify(user.id, code, 'LOGIN');
      } catch {
        throw new UnauthorizedException({
          exc: 'EX_AUTH_MFA_INVALID_CODE',
          msg: 'Invalid verification code',
          key: 'auth.errors.mfaInvalidCode',
        });
      }
    } else {
      const totpVerified = await this.verifyTotpCode(user.id, code);
      if (!totpVerified) {
        const backupUsed = await this.verifyBackupCode(user.id, code);
        if (!backupUsed)
          throw new UnauthorizedException({
            exc: 'EX_AUTH_MFA_INVALID_CODE',
            msg: 'Invalid MFA code',
            key: 'auth.errors.mfaInvalidCode',
          });
      }
    }
```
after:
```ts
    const user = await this.prisma.user.findUnique({
      where: { id: challenge.userId },
    });
    if (!user) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_MFA_NOT_ENABLED',
        msg: 'MFA is not enabled for this account',
        key: 'auth.errors.mfaNotEnabled',
      });
    }

    if (challenge.mfaMethod === 'EMAIL') {
      try {
        await this.emailOtp.verify(user.id, code, 'LOGIN');
      } catch {
        throw new UnauthorizedException({
          exc: 'EX_AUTH_MFA_INVALID_CODE',
          msg: 'Invalid verification code',
          key: 'auth.errors.mfaInvalidCode',
        });
      }
    } else {
      if (!user.mfaEnabled) {
        throw new UnauthorizedException({
          exc: 'EX_AUTH_MFA_NOT_ENABLED',
          msg: 'MFA is not enabled for this account',
          key: 'auth.errors.mfaNotEnabled',
        });
      }
      const totpVerified = await this.verifyTotpCode(user.id, code);
      if (!totpVerified) {
        const backupUsed = await this.verifyBackupCode(user.id, code);
        if (!backupUsed)
          throw new UnauthorizedException({
            exc: 'EX_AUTH_MFA_INVALID_CODE',
            msg: 'Invalid MFA code',
            key: 'auth.errors.mfaInvalidCode',
          });
      }
    }
```
(Moves the `mfaEnabled` check into the TOTP-only branch; EMAIL only requires the user to exist.) Either option still needs a real test added — T19's gap (zero tests reference `mfaMethod`/`'EMAIL'`) means this exact regression could ship again silently either way.

### 6.2 New issue #5 — Web MFA disable is non-functional (mechanically closes T57 and T59 too)

File: `next-js-boilerplate/src/views/settings/security/PageContent.tsx`. Root cause per §5.4 #5: `handleDisable` sends no `code`, and the backend route requires one.

**Minimal fix** (smallest diff, keeps the existing raw-`fetch` style used by enroll/verify, which already works):

Add two pieces of state near the top of the component:
```tsx
  const [disableCode, setDisableCode] = useState("");
  const [confirmingDisable, setConfirmingDisable] = useState(false);
```
Before:
```tsx
  const handleDisable = async () => {
    try {
      const res = await fetch("/api/auth/mfa/disable", { method: "POST" });
      if (res.ok) {
        setMfaEnabled(false);
      } else {
        const data = await res.json();
        setError(data.msg ?? "Failed to disable MFA");
      }
    } catch {
      setError("Failed to disable MFA");
    }
  };
```
after:
```tsx
  const handleDisable = async () => {
    try {
      const res = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });
      if (res.ok) {
        setMfaEnabled(false);
        setConfirmingDisable(false);
        setDisableCode("");
      } else {
        const data = await res.json();
        setError(data.msg ?? "Failed to disable MFA");
      }
    } catch {
      setError("Failed to disable MFA");
    }
  };
```
Before (the `mfaEnabled` branch of the idle-state render):
```tsx
        {mfaEnabled ? (
          <button
            onClick={handleDisable}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {t.securityDisableTwoFactor}
          </button>
        ) : (
```
after:
```tsx
        {mfaEnabled ? (
          confirmingDisable ? (
            <div className="space-y-3">
              <InputOTP maxLength={6} value={disableCode} onChange={setDisableCode} />
              <button
                onClick={handleDisable}
                disabled={disableCode.length < 6}
                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {t.securityDisableTwoFactor}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDisable(true)}
              className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              {t.securityDisableTwoFactor}
            </button>
          )
        ) : (
```
This satisfies T57's literal claim (disable now uses `InputOTP`) and makes T59 reachable end-to-end (status-fetch was already fine per §5.3).

**Thorough fix (optional follow-up, larger diff):** route `PageContent.tsx` through the typed helpers that already exist and are currently dead code — `useAuthActions()`'s `enrollMfa`/`verifyMfaEnrollment`/`disableMfa(code)` (`src/api/client/auth/actions.ts:55-61`) and `src/views/settings/security/mfa-handlers.ts`'s `handleEnroll`/`handleVerify`/`handleDisable`, which were clearly built for exactly this component and never wired in. This is what actually resolves the dead-code-duplication root cause (a typed `disableMfa(code: string)` call site can't compile without a `code`, which is what would have caught this bug originally) rather than just patching the symptom. If you don't do this, consider deleting `mfa-handlers.ts` and the unused `useAuthActions()` MFA exports instead, since dead code with zero call sites sitting next to the bug it would have prevented is its own hazard (this is exactly how the bug shipped).

### 6.3 T10 — `email-otp.service.spec.ts` can't resolve `EmailOtpService`'s dependencies

File: `nest-js-boilerplate/src/auth/email-otp.service.spec.ts`. Root cause: `CryptoService` (3rd constructor arg) is never provided to the `TestingModule`.

Before (imports + `beforeEach`, lines 1–45):
```ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';
import { MailService } from '../mail/mail.service';
import { TokenStoreService } from './token-store.service';

describe('EmailOtpService', () => {
  let service: EmailOtpService;
  let mail: { enqueue: jest.Mock };
  let tokenStore: {
    writeEmailOtp: jest.Mock;
    consumeEmailOtp: jest.Mock;
    peekEmailOtp: jest.Mock;
    incrementOtpAttempts: jest.Mock;
    deleteEmailOtp: jest.Mock;
    getOtpResendCooldown: jest.Mock;
    setOtpResendCooldown: jest.Mock;
  };

  beforeEach(async () => {
    tokenStore = {
      writeEmailOtp: jest.fn().mockResolvedValue(undefined),
      consumeEmailOtp: jest.fn().mockResolvedValue(undefined),
      peekEmailOtp: jest.fn(),
      incrementOtpAttempts: jest.fn().mockResolvedValue(undefined),
      deleteEmailOtp: jest.fn().mockResolvedValue(undefined),
      getOtpResendCooldown: jest.fn().mockResolvedValue(0),
      setOtpResendCooldown: jest.fn().mockResolvedValue(undefined),
    };

    mail = { enqueue: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailOtpService,
        { provide: TokenStoreService, useValue: tokenStore },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = module.get<EmailOtpService>(EmailOtpService);
  });
```
after:
```ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';
import { MailService } from '../mail/mail.service';
import { TokenStoreService } from './token-store.service';
import { CryptoService } from '../common/crypto/crypto.service';

describe('EmailOtpService', () => {
  let service: EmailOtpService;
  let mail: { enqueue: jest.Mock };
  let crypto: { sha256: jest.Mock };
  let tokenStore: {
    writeEmailOtp: jest.Mock;
    consumeEmailOtp: jest.Mock;
    peekEmailOtp: jest.Mock;
    incrementOtpAttempts: jest.Mock;
    deleteEmailOtp: jest.Mock;
    getOtpResendCooldown: jest.Mock;
    setOtpResendCooldown: jest.Mock;
  };

  beforeEach(async () => {
    tokenStore = {
      writeEmailOtp: jest.fn().mockResolvedValue(undefined),
      consumeEmailOtp: jest.fn().mockResolvedValue(undefined),
      peekEmailOtp: jest.fn(),
      incrementOtpAttempts: jest.fn().mockResolvedValue(undefined),
      deleteEmailOtp: jest.fn().mockResolvedValue(undefined),
      getOtpResendCooldown: jest.fn().mockResolvedValue(0),
      setOtpResendCooldown: jest.fn().mockResolvedValue(undefined),
    };

    mail = { enqueue: jest.fn().mockResolvedValue(undefined) };
    crypto = { sha256: jest.fn((value: string) => `hashed-${value}`) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailOtpService,
        { provide: TokenStoreService, useValue: tokenStore },
        { provide: MailService, useValue: mail },
        { provide: CryptoService, useValue: crypto },
      ],
    }).compile();

    service = module.get<EmailOtpService>(EmailOtpService);
  });
```
Then update every `peekEmailOtp.mockResolvedValue({ code: '123456', ... })` to the `codeHash` shape `verify()` actually reads (`stored.codeHash !== codeHash`, where `codeHash = this.crypto.sha256(code)` — with the fake above, `sha256('123456')` → `'hashed-123456'`). All 4 occurrences (the `'succeeds with a matching code'`, `'throws on wrong code and increments attempts'`, `'invalidates the OTP after max attempts'`, and `'deletes existing OTP before generating a new one'` tests) — e.g.:
```ts
      tokenStore.peekEmailOtp.mockResolvedValue({
        codeHash: 'hashed-123456',
        email,
        attempts: 0,
      });
```
(`'throws on wrong code'` keeps calling `service.verify(userId, '000000', purpose)` — `sha256('000000')` → `'hashed-000000'` ≠ `'hashed-123456'`, so it still throws correctly with no other change needed.)

### 6.4 New issue #2 — `auth-session.service.spec.ts` never mocks `prisma.device`

File: `nest-js-boilerplate/src/auth/auth-session.service.spec.ts`. `refresh()` (in the real service) now unconditionally calls `this.prisma.device.findUnique(...)` when `session.deviceId` is set — the test's hand-rolled `prisma` mock doesn't have a `device` key at all.

Before (`buildService()`):
```ts
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(fakeUser) },
    };
```
after:
```ts
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(fakeUser) },
      device: {
        findUnique: jest.fn().mockResolvedValue({ trusted: false }),
      },
    };
```
This alone fixes the `TypeError`, but the real code now also puts `trusted: false` into the `device` object passed to `issueTokens`, so the one test asserting the full object with `toHaveBeenCalledWith` (exact match, not `objectContaining`) needs the new field added or it'll fail on a shape mismatch instead:

Before:
```ts
    expect(authTokens.issueTokens).toHaveBeenCalledWith(
      fakeUser,
      expect.anything(),
      {
        deviceId: 'device-1',
        deviceToken: 'real-device-token',
        changed: false,
        ip: '10.0.0.2',
        userAgent: 'renewing-agent',
      },
    );
```
after:
```ts
    expect(authTokens.issueTokens).toHaveBeenCalledWith(
      fakeUser,
      expect.anything(),
      {
        deviceId: 'device-1',
        deviceToken: 'real-device-token',
        changed: false,
        ip: '10.0.0.2',
        userAgent: 'renewing-agent',
        trusted: false,
      },
    );
```
The other 3 `refresh()` tests need no change: the no-device-token test asserts `undefined` (unaffected by `trusted`), and the empty-`deviceId` test already uses `expect.objectContaining` (partial match, tolerates the extra field).

### 6.5 New issue #1 — `resend()` deletes a valid OTP before checking the cooldown

File: `nest-js-boilerplate/src/auth/email-otp.service.ts:98-109`.

Before:
```ts
  async resend(
    userId: string,
    email: string,
    purpose: 'REGISTRATION' | 'LOGIN',
  ): Promise<void> {
    const stored = await this.tokenStore.peekEmailOtp(purpose, userId);
    if (stored) {
      await this.tokenStore.deleteEmailOtp(purpose, userId);
    }

    await this.generate(userId, email, purpose);
  }
```
after:
```ts
  async resend(
    userId: string,
    email: string,
    purpose: 'REGISTRATION' | 'LOGIN',
  ): Promise<void> {
    const cooldownKey = `otp_cooldown:${purpose}:${userId}`;
    const remaining = await this.tokenStore.getOtpResendCooldown(cooldownKey);
    if (remaining > 0) {
      throw new BadRequestException({
        exc: 'EX_AUTH_OTP_RESEND_COOLDOWN',
        msg: `Please wait ${remaining} seconds before requesting a new code`,
        key: 'auth.errors.otpResendCooldown',
      });
    }

    const stored = await this.tokenStore.peekEmailOtp(purpose, userId);
    if (stored) {
      await this.tokenStore.deleteEmailOtp(purpose, userId);
    }

    await this.generate(userId, email, purpose);
  }
```
This duplicates the cooldown check (`generate()` re-does it a moment later, harmlessly — nothing changed `remaining` in between), which is a known wart but is the safe fix: it doesn't assume anything about whether `tokenStore.writeEmailOtp()` fully overwrites a prior entry (including `attempts`) on its own. If you confirm in `token-store.service.ts` that `writeEmailOtp` does fully overwrite, the cleaner fix is to delete the manual `peekEmailOtp`/`deleteEmailOtp` block entirely and let `resend()` be a plain call to `generate()` — every other caller (registration, login) already relies on `generate()` alone with no pre-delete. Don't make that simplification without checking `token-store.service.ts` first. The existing `'blocks resend within cooldown'` test needs no change (it already sets `getOtpResendCooldown` to resolve `45`); the `'deletes existing OTP before generating a new one'` test needs no change either (its `getOtpResendCooldown` mock already defaults to `0`).

### 6.6 New issue #3 — biometric gate: uncaught exception → permanent blank screen

File: `flutter-boilerplate/lib/lib/biometric_auth.dart:34-38`. `isEnabled()` is the only method in this file without a try/catch (both `isAvailable()` and `authenticate()` already fail to `false`/`[]` on error — this makes `isEnabled()` consistent with the rest of the file, not a new convention).

Before:
```dart
  @override
  Future<bool> isEnabled() async {
    final val = await _storage.read(key: _biometricEnabledKey);
    return val == 'true';
  }
```
after:
```dart
  @override
  Future<bool> isEnabled() async {
    try {
      final val = await _storage.read(key: _biometricEnabledKey);
      return val == 'true';
    } catch (_) {
      return false;
    }
  }
```
This defaults to "fail open" (skip the biometric lock rather than get stuck) — reasonable here since `isEnabled()` only gates an extra local presence-check screen in front of an already-valid session (it isn't decrypting anything), and the specific failure mode named in §5.4 #3 (Keystore invalidation) means the OS has already invalidated the enrollment being checked. If you'd rather fail closed instead (show the lock screen and rely on the existing "Sign out instead" escape hatch from F10/T44), return `true` from the `catch` block instead of `false` — worth a quick gut-check with Berkay since it's a real security-UX tradeoff, not just a style choice.

### 6.7 T69 — `privacyTwoFactor*` i18n keys still present

Delete these two lines (confirmed still present, unchanged since `5333dfbc`):
- `next-js-boilerplate/messages/en/settings/messages.json` — the `"privacyTwoFactor": "Two-factor authentication (2FA)"` and `"privacyTwoFactorDesc": "Add an extra layer of security to your account"` lines.
- `next-js-boilerplate/messages/tr/settings/messages.json` — the matching `"privacyTwoFactor"` / `"privacyTwoFactorDesc"` lines (Turkish text).

Then regenerate the generated type file rather than hand-editing it:
```bash
cd next-js-boilerplate && pnpm generate-i18n-types
```
(`src/generated/i18n-messages.d.ts` is produced by `scripts/generate-i18n-types.ts`, wired as the `generate-i18n-types` script and also run automatically via `prebuild`.) Grep both locales for any other lingering `privacyTwoFactor` references before considering this closed — this doc only confirmed the `messages.json` files and the generated `.d.ts`, not every call site.

### 6.8 T72 / new issue #6 — `login-form-cooldown.test.tsx` doesn't test the cooldown, and its one test fails

File: `next-js-boilerplate/src/features/auth/ui/__tests__/login-form-cooldown.test.tsx`. Two separate problems, one file: the missing `useTheme` mock (T72's actual failure cause) and the fact that the test never exercises the MFA/cooldown UI at all (§5.4 #6). Full replacement:

```tsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "../login-form";

const { loginMock, resendLoginCodeServerMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  resendLoginCodeServerMock: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    verifyMfa: vi.fn(),
    user: null,
    loading: false,
    mfaRequired: false,
  }),
}));

vi.mock("@/api/server/auth/mfa", () => ({
  resendLoginCodeServer: resendLoginCodeServerMock,
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    form: {
      login: {
        title: "Sign In",
        mfaTitle: "Two-Factor Authentication",
        mfaCodeLabel: "Authentication code",
        mfaVerify: "Verify",
        mfaVerifying: "Verifying...",
        mfaResendCode: "Resend code",
        mfaResendCooldown: "Resend in",
        mfaResending: "Sending...",
        trustDevice: "Trust this device",
        useDifferentAccount: "Use a different account",
        mfaEmailDescription: "Enter the code sent to {email}",
        mfaTotpDescription:
          "Enter the code from your authenticator app for {email}",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        forgotPassword: "Forgot password?",
        submit: "Sign in",
        submitting: "Signing in...",
        noAccount: "No account?",
        registerLink: "Register",
      },
    },
    errors: {
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 8 characters",
      passwordMax: "Password must be at most 128 characters",
      loginFailed: "Invalid credentials",
    },
    loading: "Loading...",
    signedInAs: "Signed in as {email}",
    role: "Role:",
    status: "Status:",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    resendLoginCodeServerMock.mockReset();
  });

  it("renders the login form", () => {
    render(<LoginForm />);
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("disables resend during cooldown and re-enables once it elapses", async () => {
    vi.useFakeTimers();
    const user = {
      id: "u1",
      email: "alice@example.com",
      role: "USER",
      status: "ACTIVE",
    };
    loginMock.mockRejectedValueOnce(
      Object.assign(new Error("MFA required"), {
        mfaRequired: true,
        mfaToken: "token-1",
        mfaMethod: "EMAIL",
        user,
      }),
    );

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId("login-email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByTestId("login-password"), {
      target: { value: "correct-horse-battery-staple" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("login-submit"));
    });

    const resendButton = screen.getByText("Resend code");
    resendLoginCodeServerMock.mockResolvedValueOnce({ mfaToken: "token-2" });
    await act(async () => {
      fireEvent.click(resendButton);
    });

    expect(resendLoginCodeServerMock).toHaveBeenCalledWith("token-1");
    const cooldownButton = screen.getByText(/Resend in 60s/);
    expect(cooldownButton).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText("Resend code")).toBeTruthy();
    vi.useRealTimers();
  });
});
```
This is derived carefully from the real `login-form.tsx` (exact `data-testid`s, exact error-shape `handleLoginSubmit` expects via `err.mfaRequired`/`err.mfaToken`/`err.mfaMethod`/`err.user`, exact resend/cooldown state machine) but — unlike §5.1's numbers, which were confirmed by actually running the gates — this test has **not** been executed, since this pass was documentation-only. Run it before trusting it; if this repo's testing-library/vitest versions need a different async-flushing idiom than plain `act()`, match whatever an existing async test elsewhere in this suite already does.

### 6.9 New issue #7 — stale MFA status on revisit

File: `next-js-boilerplate/src/app/v1/[lang]/settings/security/page.tsx`.

Before:
```tsx
      const { data } = await graphqlFetch<{ me: { mfaEnabled: boolean } }>(
        SECURITY_ME_QUERY,
        undefined,
        accessToken,
        await sessionTokenHeaders(),
      );
```
after:
```tsx
      const { data } = await graphqlFetch<{ me: { mfaEnabled: boolean } }>(
        SECURITY_ME_QUERY,
        undefined,
        accessToken,
        await sessionTokenHeaders(),
        true,
      );
```
(`graphqlFetch`'s 5th parameter is `noCache?: boolean` — `src/lib/backend.ts:244-249`.)

### 6.10 T53 — Security-tab reachability test doesn't test the real wiring (harder than it looks — read before implementing)

This one turned out not to have a clean mechanical fix, so this is a design note rather than a diff. `settings_shell.dart`'s tab list is only constructed inside the widget's `build()` (`settings_shell.dart:56-99`), so exercising it means pumping a real widget tree through the real `routerProvider` (`app/router.dart:150`), which in turn `ref.watch`es `authProvider` (`hooks/use_auth.dart:20-23`) for its redirect logic — an unauthenticated state bounces `/v1/...` routes straight to `/auth/login`, so the test needs a logged-in `authProvider` state to even reach the settings shell.

The obvious move — subclass `AuthNotifier` in the test and set a fake `AsyncData(AuthenticatedUser(...))` state — doesn't actually work: `AuthNotifier`'s constructor (`use_auth.dart:26-28`) unconditionally calls `_loadSession()`, which is a **private** method (leading underscore, file-private in Dart, not overridable from a test file in a different library). Any subclass still inherits that real, async, secure-storage-reading `_loadSession()` call, which will eventually resolve and overwrite whatever fake state the test sets, on an unpredictable timing (likely to `AsyncData(null)` or `AsyncError` in a test sandbox with no real Keychain/Keystore) — a real flake risk, not a hypothetical one. Grepped this test suite for precedent (`authProvider.overrideWith` / any existing "logged in" router test) and found none — this repo hasn't solved this problem yet anywhere.

Two real options, pick one before implementing:
- **Cheap, partial:** add a second, separate unit test asserting `settings_shell.dart`'s tab data includes a Security entry pointing at `/v1/:lang/settings/security`. As written today the tab list isn't reachable outside `build()`, so this also requires promoting it to a top-level `const`/static list in `settings_shell.dart` first (a small source change, not just a test addition) so both the widget and the test read one source of truth. Combined with the *existing* test (which already proves the target page itself renders), this catches "tab silently removed from the list" — half of Rev 1's original regression — without touching auth at all. It does **not** catch "route deleted from `router.dart`" (the other half).
- **Thorough:** build real secure-storage mocking for this test suite — intercept the `flutter_secure_storage` platform channel (`TestWidgetsFlutterBinding`'s `setMockMethodCallHandler` on its `MethodChannel`) to seed a valid session before pumping, so the real `AuthNotifier._loadSession()` resolves to a logged-in `AuthenticatedUser`. Then drive the real `routerProvider` from `/v1/:lang/settings`, tap the Security tab by its label, `pumpAndSettle`, and assert the real page content. This is genuine test-infrastructure work (reusable for any future "is this authenticated route really reachable" test), not a one-file patch — size it accordingly.

### 6.11 T66 / T59 — no code fix needed

T66 (web sessions link + MFA status fetch) was already fixed in `9c987e66`; only the doc's own status cell was wrong (§5.3). T59's stated *reason* was wrong but its ❌ conclusion was right, for the actual reason fixed in §6.2. Nothing to implement for either beyond flipping the doc's own status tables, which is a documentation cleanup, not a code change.

---

## 7. Verification round 3 (2026-07-28, same day — checking commit `2f6f0c30` against §6)

Requested as "I have implemented fixes can you check all completed." Commit `2f6f0c30` ("fix(strong-auth): address verification round 2 issues") applied §6's fixes almost verbatim across 13 files. Dispatched 3 parallel agents again (backend/Flutter/web), each told not to trust the commit message and to re-derive every claim from current code plus a fresh gate run, same skepticism level as rounds 1 and 2.

**Result: everything checked out. This is the first fully-clean round out of three.**

### 7.1 Fix-by-fix verdicts

| Item | File | Verdict |
|---|---|---|
| T17/F3 — restored `user.mfaEnabled && !device?.trusted` (Option A) | `auth-login.service.ts:98` | ✅ Exact prescribed diff. Traced every writer of `mfaEnabled` in the codebase to confirm the revert doesn't reopen anything else — `mfaEnabled` only ever flips true alongside a verified TOTP factor, so `verifyLoginMfa`'s TOTP-branch assumption still holds. |
| `resend()` — cooldown check moved before the delete | `email-otp.service.ts:98-119` | ✅ Exact match to §6.5. |
| T10 — `email-otp.service.spec.ts` DI gap + `codeHash` shape | `email-otp.service.spec.ts` | ✅ `CryptoService` provided; all 4 `peekEmailOtp` mock sites updated, not just some. |
| `auth-session.service.spec.ts` — `prisma.device` mock + assertion update | `auth-session.service.spec.ts:55-57,103` | ✅ Both halves landed (the mock alone wouldn't have been enough — see §6.4). |
| Biometric gate — `isEnabled()` try/catch | `biometric_auth.dart:34-42` | ✅ Matches the file's existing fail-to-`false` convention exactly; confirmed the exception can no longer propagate past the caller in `app.dart:75`. |
| T57/T59 — MFA disable wired with `InputOTP` confirmation | `PageContent.tsx` | ✅ Traced end-to-end: code capture → button gating → API call → BFF route's `code.length>=6` check → backend mutation. Genuinely functional now, not cosmetic. |
| T69 — `privacyTwoFactor*` i18n keys removed | `messages/{en,tr}/settings/messages.json` | ✅ Deleted from both; whole-repo grep found zero remaining references anywhere. |
| Generated i18n types | `src/generated/i18n-messages-*` | ✅ Regenerated fresh via `pnpm generate-i18n-types` and diffed byte-identical to the committed files — not stale/hand-edited. |
| Stale MFA cache | `security/page.tsx:36` | ✅ `noCache: true` (5th arg) now passed. |
| T72 — cooldown test | `login-form-cooldown.test.tsx` | ✅ Genuine behavioral test (not shallow), verified line-by-line against `login-form.tsx`'s real state machine, ran 3× isolated with no flakiness. |

### 7.2 Gate numbers (fresh runs)

| Gate | Round 2 | Round 3 (now) |
|---|---|---|
| Backend `pnpm build` | pass | pass |
| Backend `pnpm test` | 360p / 23f / 383 | **369p / 14f / 383** — the 2 broken suites (email-otp, auth-session) are now 0 failures; remaining 14 confirmed to be the same 4 pre-existing/unrelated suites as before (`token-store.service.spec.ts` 6, `device.service.spec.ts` 3, `billing.service.spec.ts` 4, `messaging-dm.service.spec.ts` 1) |
| Flutter `flutter analyze` | 0 issues | 0 issues |
| Flutter `flutter test` | 411p / 18f / 429 | **411p / 18f / 429 — unchanged**, confirmed via real `+N -M` counters. Expected: this round's only Flutter change (biometric_auth.dart) is unrelated to the pre-existing `card_test.dart` (1) and `realtime_provider_test.dart` (17) failures, and didn't introduce any new ones. |
| Web `tsc --noEmit` | 0 errors | 0 errors |
| Web `vitest run` | 310p / 1f / 311 | **312p / 0f / 312 — fully green** (+1 new cooldown test, +1 previously-failing test now passes) |

### 7.3 Confirmed still open (unchanged from §4/§6, correctly not touched this round)

- **T53** — Flutter Security-tab reachability test. §6.10 explained why this needs real test infra (or a source-level tab-list refactor) rather than a quick diff; confirmed `page_view_test.dart`, `router.dart`, and `settings_shell.dart` are untouched by this commit, i.e. correctly deferred, not silently skipped.
- **T11, T14, T19, T20/T21, T38** — pre-existing gaps from the original 73-item checklist, never in scope for §6/round 2/round 3 (these were about hardcoded OTP config, missing backend tests for `verifyEmailCode` and the EMAIL branch, and permanent (non-expiring) device trust). Still open.

### 7.4 Minor, non-blocking observations (optional, not required)

- `PageContent.tsx`'s disable-confirmation step (`confirmingDisable`) has no cancel affordance — once opened, a user must either complete or abandon it via navigation. Cosmetic, not a functional bug.
- `mfa-handlers.ts` and `useAuthActions()`'s `enrollMfa`/`verifyMfaEnrollment`/`disableMfa`/`resendLoginCode` remain unused dead code (the "minimal fix" path was chosen over the "thorough fix" in §6.2, as expected). Worth a cleanup pass eventually, not urgent.
