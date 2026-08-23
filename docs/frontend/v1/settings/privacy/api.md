# Privacy — API

Page: [page.md](./page.md)

Same single shared mutation as [account](../account/api.md)/[general](../general/api.md) — full BFF
route internals documented once in [account/api.md § Update profile](../account/api.md#update-profile).
This page only ever sends `{chatNickname, useNickname, hideAvatar}`.

## Calls

- [Privacy page](./page.md) → `useProfileActions().updateProfile({chatNickname, useNickname,
  hideAvatar})` →
  [`update.ts`](../../../../../next-js-boilerplate/src/api/server/profile/update.ts) → `POST
  /api/profile/update` →
  [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile).
  A cleared nickname field is sent as `chatNickname: null`, never `""` — see
  [page.md](./page.md#the-preserve-on-disable-behavior-is-deliberate-and-load-bearing-state-sync-logic-backs-it)
  and [profile backend endpoints.md](../../../../backend/social-content/profile/endpoints.md#update-profile)
  for why an empty string would fail backend validation instead.
