# SecurityMfaStatus

**Source:** [`SecurityMfaStatus.tsx`](../../../../../../next-js-boilerplate/src/views/settings/security/SecurityMfaStatus.tsx)
**Types:** [`SecurityPageContent-types.ts`](../../../../../../next-js-boilerplate/src/types/views/settings/SecurityPageContent-types.ts)
**Used in:** [security page](../page.md) — rendered when `!enrolling`
**Mobile equivalent:** the security screen's own `_MfaTile` (a private `SwitchListTile`, not a
separate file — see [mobile screen.md](../../../../../mobile/v1/settings/security/screen.md))

## Purpose

The MFA status/toggle surface: a one-line enabled/disabled description, an enable button (when off) or
a two-step disable confirmation (when on, requiring a fresh TOTP code), plus a link over to the
Sessions subpage. Pure presentational component — no state of its own, no direct API calls.

## Props (`SecurityMfaStatusProps`)

| Prop | Purpose |
|---|---|
| `mfaEnabled` | which of the two branches to render |
| `confirmingDisable` | second sub-branch within the "enabled" case — shows the OTP input only after the user clicks "Disable" once |
| `disableCode` / `onDisableCodeChange` | controlled OTP input value |
| `error` | inline error string from a failed enroll/verify/disable, rendered here or in `SecurityMfaWizard` depending on which is mounted |
| `onEnable` / `onConfirmDisable` / `onDisable` | callbacks up to `PageContent`'s inline handlers — see below |
| `lang` | used only to build the hardcoded `/v1/${lang}/settings/sessions` link at the bottom |

## Behavior notes

- The disable flow requires a **minimum 6-digit** code before the destructive button enables
  (`disableCode.length < 6`) — client-side gate only, the real validation is server-side (see
  [mfa/endpoints.md#disable-mfa](../../../../../backend/identity-access/mfa/endpoints.md#disable-mfa)).
- The "Manage your sessions" link at the bottom is a plain `<a href>`, not a Next.js `<Link>` — a full
  page navigation rather than a client-side transition. Minor, but inconsistent with how this codebase
  otherwise navigates within `v1/[lang]/*` (worth a look if anyone's auditing navigation performance
  in this vertical, not severe enough for its own issues.md row on its own).

## Calls (indirect — no direct API calls from this component)

`onEnable` → `PageContent`'s inline `handleEnroll` → `enrollMfaServer()` — see
[api.md § Enroll in MFA](../api.md#one-file-two-owners) and backend
[mfa/endpoints.md#enroll-in-mfa](../../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa).
`onDisable` → `handleDisable` → `disableMfaServer(code)` — backend
[mfa/endpoints.md#disable-mfa](../../../../../backend/identity-access/mfa/endpoints.md#disable-mfa).
