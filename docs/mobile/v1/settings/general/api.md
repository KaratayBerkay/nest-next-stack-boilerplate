# General — API

Screen: [screen.md](./screen.md)

Same shared `profile.updateProfile` mutation as [account/api.md](../account/api.md) — full file
breakdown documented there. This screen only ever sends `{locale, timezone}`.

## Calls

- [General screen](./screen.md) → `profileActionsProvider.update(locale:, timezone:)` →
  [`profile/update.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/update.dart) →
  direct GraphQL →
  [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile)

Currency and Date display never call the backend — pure local `shared_preferences` writes via
`currencyProvider`/`dateDisplayProvider` (see [screen.md](./screen.md)), same as web's cookie-only
mechanism.

## Known issues

- [CROSS-019](../../../../issues.md#cross-019) — see [screen.md § Known issues](./screen.md#known-issues).
