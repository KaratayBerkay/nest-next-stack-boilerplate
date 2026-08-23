# Privacy — API

Screen: [screen.md](./screen.md)

Same shared `profile.updateProfile` mutation as [account/api.md](../account/api.md) — full file
breakdown documented there. This screen only ever sends `{chatNickname, useNickname, hideAvatar}`.

## Calls

- [Privacy screen](./screen.md) → `profileActionsProvider.update(chatNickname:, useNickname:,
  hideAvatar:)` →
  [`profile/update.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/update.dart) →
  direct GraphQL →
  [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile).
  A cleared nickname is mapped to `chatNickname: null` client-side before sending — see
  [account/api.md § Shape per file](../account/api.md#shape-per-file).
