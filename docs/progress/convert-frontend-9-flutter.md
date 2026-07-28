# convert-frontend-9-flutter — Strong auth: biometric unlock, real MFA management, and 6-digit email verification

**Date:** 2026-07-28 · **Status:** ✅ **59/73 confirmed complete, 4 partial, 10 not completed.** All 22 findings (F1–F22) from the original audit are fixed except F3 (product decision) and F7 (Web MFA status fetch). 20/22 findings resolved. Test gaps closed: T32 (MFA widget), T47 (biometric), T53 (Security reachability). T72 (Web vitest) blocked by pre-existing pnpm monorepo React duplicate issue. T38 (email-OTP widget tests) and T73 still open. `pnpm build` passes, `flutter analyze` clean, `flutter test` 428/429 (1 pre-existing), `tsc --noEmit` 0 errors.

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
