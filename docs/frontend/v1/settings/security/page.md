# Security (page)

**Route:** `/v1/[lang]/settings/security` · **Source:**
[`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/security/page.tsx)
**Mobile equivalent:** [security screen](../../../../mobile/v1/settings/security/screen.md)

## What renders here

Server component — **no tier-branch split**, unlike most pages in this codebase (there's no
`FreePageView`/`BasicPageView`/etc. here, nor a `getTierView()` call). Nothing about this page is
tier-gated: it fetches the session user's `mfaEnabled` flag directly with a raw
`graphqlFetch(SECURITY_ME_QUERY, ...)` call against the access-token cookie (not through
`backendFetch` + a REST path the way [messages](../../messages/page.md) seeds its initial friends
list), swallows any fetch error to `initialMfaEnabled = false`, and hands off to
`SecurityPageContent`.

## Client component tree

```
SecurityPageContent                    (all state: mfaEnabled, enrolling, step, backupCodes, ...)
├─ SecurityChangePassword               (always rendered)
└─ enrolling ? SecurityMfaWizard : SecurityMfaStatus
```

Unlike [messages](../../messages/page.md)'s `useMessagesPage`, there's no dedicated page-level
hook — `SecurityPageContent` itself owns all ten pieces of `useState` directly (`mfaEnabled`,
`enrolling`, `step`, `enrollData`, `verifyCode`, `error`, `backupCodes`, `codesSaved`, `disableCode`,
`confirmingDisable`) and defines its own `handleEnroll`/`handleVerify`/`handleDisable` closures inline
at module scope. See [Known issues](#known-issues) — a *second*, unused implementation of these same
three handlers exists in a sibling file.

## Components

3 significant components in
[`src/views/settings/security/`](../../../../../next-js-boilerplate/src/views/settings/security/):

[security-change-password.md](./components/security-change-password.md) ·
[security-mfa-status.md](./components/security-mfa-status.md) ·
[security-mfa-wizard.md](./components/security-mfa-wizard.md)

## Hooks & API

No vertical-specific hooks — state lives directly in `SecurityPageContent` (see above) and the API
layer (see [api.md](./api.md)) is called straight from the page-level handlers, not through an
intermediate `hooks/` file the way [messages](../../messages/hooks.md) composes
`useMessagesData`/`useSessionCrypto`/etc. Cross-cutting hooks used here:
[`useAuthActions`](../../../../../next-js-boilerplate/src/api/client/auth/actions.ts) (for
change-password — [identity-access/auth](../../../../backend/identity-access/auth/README.md)
territory, not detailed in this doc) and `useMessages`/`useToast`, both defined outside this vertical.

- [api.md](./api.md) — `mfa.ts` (this page's real API surface — 3 of its 5 exports are this page's,
  the other 2 back the login MFA challenge) plus the change-password cross-reference.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Enroll in MFA | [mfa/endpoints.md#enroll-in-mfa](../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa) |
| Verify MFA enrollment | [mfa/endpoints.md#verify-mfa-enrollment](../../../../backend/identity-access/mfa/endpoints.md#verify-mfa-enrollment) |
| Disable MFA | [mfa/endpoints.md#disable-mfa](../../../../backend/identity-access/mfa/endpoints.md#disable-mfa) |
| Change password | [auth/endpoints.md#change-password](../../../../backend/identity-access/auth/endpoints.md#change-password) — identity-access/auth's endpoint, not detailed here |

## Mobile-only addition, not a web gap

Mobile's security screen also has a **biometric unlock toggle** ([security screen
§ Behavior notes](../../../../mobile/v1/settings/security/screen.md)) with no web counterpart. This
isn't a parity gap in the usual direction (web ahead of mobile) — it's a mobile-only convenience
feature that calls no backend endpoint at all (purely local device authentication), so there's nothing
for web to be "missing" against. Noted here for anyone diffing the two doc trees who'd otherwise wonder
why mobile's screen doc mentions a fourth section this page doesn't have.

## Known issues

- `FE-007` (resolved) — `security/mfa-handlers.ts` is dead code: a complete,
  unused second implementation of `handleEnroll`/`handleVerify`/`handleDisable`, superseded by the
  inline versions in `PageContent.tsx`. See
  [components/security-mfa-wizard.md](./components/security-mfa-wizard.md#known-issues).
