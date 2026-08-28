# SecurityMfaWizard

**Source:** [`SecurityMfaWizard.tsx`](../../../../../../next-js-boilerplate/src/views/settings/security/SecurityMfaWizard.tsx)
**Types:** [`SecurityPageContent-types.ts`](../../../../../../next-js-boilerplate/src/types/views/settings/SecurityPageContent-types.ts)
**Used in:** [security page](../page.md) — rendered when `enrolling`
**Mobile equivalent:** [MfaEnrollPageContent](../../../../../mobile/v1/settings/security/widgets/mfa-enroll.md)
(a pushed sub-screen, same 3-step flow)

## Purpose

The 3-step MFA enrollment wizard, one component with an internal `step` switch (`"qr-code" | "verify"
| "backup-codes"`) rather than three separate components or a route-based wizard. Client component.

## Props (`SecurityMfaWizardProps`)

| Prop | Purpose |
|---|---|
| `step` | which of the 3 blocks renders |
| `enrollData` | `{ otpauthUrl, secret }` from `enrollMfa` — feeds the QR code + manual-entry key |
| `verifyCode` / `onVerifyCodeChange` | controlled OTP input for step 2 |
| `backupCodes` | the 10 one-time codes from `verifyMfa` — **the only time they're ever available**, per [mfa/README.md](../../../../../backend/identity-access/mfa/README.md#enrollment-flow) |
| `codesSaved` / `onCodesSavedChange` | a confirmation checkbox gating the final "Done" button — purely a UI nudge, nothing server-side enforces this was actually saved |
| `onContinueToVerify` / `onVerify` / `onRegenerateQr` / `onDone` | step-transition callbacks, all resolved by `PageContent`'s inline handlers |

## Behavior notes

- **Step 1 (QR code)**: renders `enrollData.otpauthUrl` via the `qrcode.react` package's `QRCodeSVG`,
  plus the raw secret in a `<code>` block for manual entry. "Continue" just advances local `step` state
  — no network call happens between steps 1 and 2.
- **Step 2 (verify)**: a 6-digit `InputOTP`. "Regenerate QR" calls `onRegenerateQr`, which re-invokes
  the *enroll* handler (not a dedicated regenerate endpoint — see
  [mfa/README.md § Enrollment flow](../../../../../backend/identity-access/mfa/README.md#enrollment-flow):
  calling `enrollMfa` again silently replaces the pending factor).
- **Step 3 (backup codes)**: lists all 10 codes plaintext, requires the `codesSaved` checkbox before
  "Done" (which just calls `onDone`, closing the wizard back to `SecurityMfaStatus` — no further API
  call, `mfaEnabled` was already flipped to `true` by `handleVerify` in step 2).

## Calls (indirect — no direct API calls from this component)

- `onContinueToVerify` → local state only, no call.
- `onVerify` → `PageContent`'s `handleVerify` → `verifyMfaEnrollmentServer(verifyCode)` — backend
  [mfa/endpoints.md#verify-mfa-enrollment](../../../../../backend/identity-access/mfa/endpoints.md#verify-mfa-enrollment).
- `onRegenerateQr` → `handleEnroll` → `enrollMfaServer()` — backend
  [mfa/endpoints.md#enroll-in-mfa](../../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa).
- `onDone` → local state only, no call.

## Known issues

- [FE-007](../../../../../issues.md#fe-007) — **resolved by deletion** (dedup pass, commit
  `aa04a418`): a second, unused implementation of the handlers this component's callbacks resolve to
  (`views/settings/security/mfa-handlers.ts`) existed but was never imported. Its `handleVerify`
  even had a signature mismatch from the real one
  (an optional `setMfaEnabled` callback the real inline handler always provides) — a sign it drifted
  from the live code path rather than being a recent, in-sync alternative. See
  [api.md § Known issues](../api.md#known-issues).
