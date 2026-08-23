# SocialLoginButtons / SocialLoginButton

**Source:** [`social-login-buttons.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/social-login-buttons.tsx) ·
[`social-login-button.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/social-login-button.tsx)
**Used in:** [login page](../page.md) **and** [register page](../../register/page.md) — documented
here since login is where this vertical's page list introduces it first
**Mobile equivalent:** [social-login-buttons.md](../../../../mobile/auth/login/widgets/social-login-buttons.md)
(mobile only wires this into the login screen — see Known issues)

## Purpose

`SocialLoginButtons` renders a "continue with" divider plus one `SocialLoginButton` per provider.
`SocialLoginButton` renders one branded button (`ProviderIcon` inline SVGs + hardcoded per-provider
brand colors, applied via inline `style` — deliberately not semantic tokens or Tailwind arbitrary
values, since generated-stylesheet ordering for `bg-[#...]` isn't guaranteed to beat the `Button`
component's own variant classes, but inline `style` always wins). Both client components.

## Providers

The 6 providers are a **hardcoded array** in `social-login-buttons.tsx`
(`google`, `github`, `linkedin`, `huggingface`, `twitch`, `x`) — not fetched from the backend's
[List configured OAuth providers](../../../../backend/identity-access/auth/endpoints.md#list-configured-oauth-providers)
endpoint, which nothing in the frontend calls (see that entry's own known-issues note). If a provider
is added or removed in `oauth-providers.ts`/env config on the backend without this array being
updated to match, the two silently drift.

## Behavior notes

- **No fetch at all** — clicking a button does `window.location.href = AUTH_OAUTH_PREFIX + provider`,
  a full-page browser navigation, not an XHR/fetch call. See [api.md § OAuth](../../api.md#oauth--no-apiserver-file-at-all)
  for the full redirect chain this kicks off.
- Brand colors are intentionally NOT theme tokens (see the inline code comment) — these are external
  identities, not part of this app's palette, and must render the same in light/dark/every custom
  theme.

## Calls

Not a typed API call — a browser navigation:

```
SocialLoginButton (onClick)
  → window.location.href = "/api/auth/oauth/" + provider     (AUTH_OAUTH_PREFIX constant)
    → BFF: app/api/auth/oauth/[provider]/route.ts
      → backend: GET /auth/oauth/:provider  (302 to the real provider)
```

- Frontend BFF: [api.md § OAuth](../../api.md#oauth--no-apiserver-file-at-all)
- Backend: [Start an OAuth flow](../../../../backend/identity-access/auth/endpoints.md#start-an-oauth-flow)

## Known issues

- ⚠ Mobile's register screen has no equivalent widget at all — `SocialLoginButtons` in Flutter has
  exactly one call site in the whole app, the login screen. Web renders it on both login and
  register. Filed as [CROSS-010](../../../../issues.md#cross-010) — see
  [mobile register/screen.md § Known issues](../../../../mobile/auth/register/screen.md#known-issues)
  for the full evidence.
