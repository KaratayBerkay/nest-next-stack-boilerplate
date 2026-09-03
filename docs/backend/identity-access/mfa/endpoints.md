# MFA — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/mfa/`](../../../../nest-js-boilerplate/src/mfa/)

No REST controller — this module is GraphQL-only.

## GraphQL

Resolver: [`mfa.resolver.ts`](../../../../nest-js-boilerplate/src/mfa/mfa.resolver.ts) · **Auth:**
`SessionAuthGuard` on the whole resolver class (see [identity-access/auth](../auth/README.md)); every
entry acts on `@CurrentUser()`'s own MFA state. A 401 (guard rejection) applies to all three and isn't
repeated per entry.

### Enroll in MFA

**Kind:** GraphQL Mutation · **`enrollMfa(currentCode: String): MfaEnrollPayload!`**
**Source:** [`mfa.resolver.ts#L14-17`](../../../../nest-js-boilerplate/src/mfa/mfa.resolver.ts),
service [`mfa.service.ts#L25-50`](../../../../nest-js-boilerplate/src/mfa/mfa.service.ts), payload
[`mfa.types.ts`](../../../../nest-js-boilerplate/src/mfa/mfa.types.ts)
**Response (`MfaEnrollPayload`):** `{ otpauthUrl, secret }` — `secret` (Base32) is shown once for
manual entry; `otpauthUrl` is rendered as a QR code client-side. Calling this again before verifying
silently replaces the pending factor (no error).
**Step-up (`BE-030`, resolved 2026-09-03):** when MFA is *already enabled*, this is a rotation of
the authenticator and requires `currentCode` — a valid TOTP from the current factor or one unused
backup code (which is burned) — otherwise `403 EX_AUTH_MFA_STEP_UP_REQUIRED`
(`auth.errors.mfaStepUpRequired`; a missing and a wrong code are indistinguishable). Without this,
any authenticated session could install its own second factor and, via `verifyMfa`, wipe the owner's
backup codes. First-time enrollment needs no code, so neither client changed (neither offers a
re-enroll UI while MFA is on). The completed rotation's `verifyMfa` also deletes the previous
verified factor in the same transaction, so login never has two live authenticators to pick between.
**Used by:** Frontend [settings/security](../../../frontend/v1/settings/security/page.md) via
[api.md § One file, two owners](../../../frontend/v1/settings/security/api.md#one-file-two-owners); Mobile
[security screen](../../../mobile/v1/settings/security/screen.md)'s
[`mfa_enroll` sub-screen](../../../mobile/v1/settings/security/widgets/mfa-enroll.md).

### Verify MFA enrollment

**Kind:** GraphQL Mutation · **`verifyMfa(code: String!): MfaVerifyPayload!`**
**Source:** [`mfa.resolver.ts#L19-25`](../../../../nest-js-boilerplate/src/mfa/mfa.resolver.ts),
service [`mfa.service.ts#L53-87`](../../../../nest-js-boilerplate/src/mfa/mfa.service.ts)
**Response (`MfaVerifyPayload`):** `{ enabled: true, backupCodes: string[] }` — 10 plaintext one-time
codes, returned **exactly once**; only SHA-256 hashes are persisted (`MfaBackupCode.codeHash`).
**Errors:** `404` (no pending factor — `enrollMfa` was never called, or the pending factor expired by
being replaced) · `400 EX_VALIDATION_FORM` (`mfa.errors.invalidTotp` — wrong/expired code).
**Used by:** same as [Enroll in MFA](#enroll-in-mfa) above.

### Disable MFA

**Kind:** GraphQL Mutation · **`disableMfa(code: String!): Boolean!`**
**Source:** [`mfa.resolver.ts#L27-33`](../../../../nest-js-boilerplate/src/mfa/mfa.resolver.ts),
service [`mfa.service.ts#L90-126`](../../../../nest-js-boilerplate/src/mfa/mfa.service.ts)
**Behavior:** self-service only — requires a valid current TOTP code, proving live possession of the
authenticator. Contrast with the admin-only
[`resetMfa`](../authorization/endpoints.md#reset-a-users-mfa), which needs no code.
**Errors:** `400 EX_AUTH_MFA_NOT_ENABLED` (`auth.errors.mfaNotEnabled` — MFA isn't on) · `404` (no
verified factor — shouldn't normally happen if `mfaEnabled` is true, but the two aren't atomically
linked at the read layer) · `400 EX_VALIDATION_FORM` (`mfa.errors.invalidTotp`).
**Used by:** Frontend [settings/security](../../../frontend/v1/settings/security/page.md) via
[api.md § One file, two owners](../../../frontend/v1/settings/security/api.md#one-file-two-owners); Mobile
[security screen](../../../mobile/v1/settings/security/screen.md)'s own MFA toggle (disable dialog,
not the `mfa_enroll` sub-screen).
