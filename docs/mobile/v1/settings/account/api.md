# Account — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/profile/`](../../../../../flutter-boilerplate/lib/api/client/profile/) · Server:
[`lib/api/server/profile/`](../../../../../flutter-boilerplate/lib/api/server/profile/)

Shared across all three profile settings screens — the same four files
[general/api.md](../general/api.md) and [privacy/api.md](../privacy/api.md) call. Documented once
here since this screen exercises all four.

## Shape per file

All direct GraphQL to the backend (`_dio.post('/graphql', ...)`), no BFF hop — confirmed per
[conventions.md §9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

| File | Operation | Backend endpoint |
|---|---|---|
| [`profile/get.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/get.dart) | `query MyProfile` | [social-content/profile/endpoints.md#get-my-profile](../../../../backend/social-content/profile/endpoints.md#get-my-profile) |
| [`profile/update.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/update.dart) | `mutation UpdateProfile` | [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile) |
| [`profile/username_available.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/username_available.dart) | `query IsUsernameAvailable` | [social-content/profile/endpoints.md#check-username-availability](../../../../backend/social-content/profile/endpoints.md#check-username-availability) |
| [`profile/upload_avatar.dart`](../../../../../flutter-boilerplate/lib/api/server/profile/upload_avatar.dart) | `POST /upload/single` (REST, multipart) | [Upload a single image](../../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) — direct to backend, unlike web's BFF-routed `/api/upload` (see [frontend account/api.md § Upload avatar](../../../../frontend/v1/settings/account/api.md#upload-avatar)) |

`update.dart`'s `ProfileUpdateServer.call()` is worth reading directly: it maps an empty-string
`chatNickname` to explicit `null` before sending
(`data['chatNickname'] = chatNickname.isEmpty ? null : chatNickname`), with an inline comment
explaining the backend rejects blank values — the same rule web's BFF enforces client-side, here
enforced in the mobile client instead since there's no BFF layer to do it. See
[profile backend endpoints.md](../../../../backend/social-content/profile/endpoints.md#update-profile).

## Client layer

| Provider | Purpose |
|---|---|
| `profileGetServerProvider` (`lib/api/server/profile/get.dart`) | wrapped by a bare `_profileProvider`/`userProfileProvider` `FutureProvider` in each screen |
| `profileActionsProvider` (`lib/api/client/profile/actions.dart`) | `ProfileActions.update(...)` (all fields optional, only non-null ones sent), `.uploadAvatar(path)`, `.checkUsername(username)` |

## Calls

- [Account screen](./screen.md) → `profileGetServerProvider`, `profileActionsProvider.update()` (name/
  bio/username), `.checkUsername()`, `.uploadAvatar()` — all four files above
