# Account (page)

**Route:** `/v1/[lang]/settings/account` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/account/page.tsx)
**Mobile equivalent:** [settings/account screen](../../../../mobile/v1/settings/account/screen.md)
**Settings index:** [../README.md](../README.md) (owned by Phase 1b — this row was added there, not
edited by this doc)

## What renders here

`getTierView()`, same as every settings subpage, but all four tier files resolve to the same content
(`BasicPageView`/`MediumPageView`/`PremiumPageView` all `export { FreePageView as default }`) — no
real tier differentiation.
[`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/account/FreePageView.tsx)
owns all state directly (no page-level hook object) — `name`/`username`/`bio`/`avatarUrl` local state,
seeded once from a direct `getProfileServer()` call in a `useEffect` guarded by a `profileLoadedRef`
(not from the session-wide `useAuth().user`, which is missing `bio` — see
[api.md](./api.md#get-profile)), plus username-availability state (`idle`/`checking`/`available`/
`taken`) debounced 300ms via `checkUsername`.

Renders two presentational sections (documented here, not as standalone component docs — both are
pure prop-driven leaves with no state or hooks of their own):

- **`AccountAvatarSection`** — avatar preview + a hidden `<input type="file">` triggered by a "Change"
  link button. File validation (type allow-list: jpeg/png/webp/gif; size cap, `MAX_UPLOAD_SIZE`) and
  the actual upload call happen in [`profile-actions.ts`](#hooks--api)'s `uploadAvatarFile`, not in the
  component itself.
- **`AccountFormFields`** — name / username / bio inputs. The username field lowercases and strips
  invalid characters on every keystroke (`.replace(/[^a-z0-9_]/g, "")`) client-side, ahead of the
  debounced availability check.

A single "Save" button (disabled while saving, or while a username check is in flight/failed) calls
`profile-actions.ts`'s `handleSaveProfile`.

## Hooks & API

No vertical-specific `hooks.md` — state lives directly in `FreePageView` (see above), same pattern as
[settings/security](../security/page.md#hooks--api). Two page-local helper files, not hooks:

- [`profile-actions.ts`](../../../../../next-js-boilerplate/src/views/settings/account/profile-actions.ts) —
  `uploadAvatarFile` (validate + upload + `setAvatarUrl`) and `handleSaveProfile` (calls
  `updateProfile`, toasts, then `refreshUser()` to re-sync the session snapshot — see
  [profile backend README § Side effects](../../../../backend/social-content/profile/README.md#side-effects-worth-knowing-about)
  for why the client also re-fetches instead of trusting the mutation response alone).
- [`useProfileActions()`](../../../../../next-js-boilerplate/src/api/client/profile/actions.ts) — the
  actual API-calling hook (`updateProfile`/`uploadAvatar`/`checkUsername`); shared verbatim by
  [general](../general/page.md) and [privacy](../privacy/page.md), see [api.md](./api.md).

Cross-cutting: `useAuth` (for `user`/`refreshUser`), `useToast`, `useMessages`.

- [api.md](./api.md) — the 4 `api/server/profile/*.ts` files this page (and its siblings) call

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Load current profile | [social-content/profile/endpoints.md#get-my-profile](../../../../backend/social-content/profile/endpoints.md#get-my-profile) |
| Check username availability | [social-content/profile/endpoints.md#check-username-availability](../../../../backend/social-content/profile/endpoints.md#check-username-availability) |
| Save name/username/bio/avatar | [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile) |
| Upload avatar file | [`POST /upload/single`](../../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) — see [api.md](./api.md#upload-avatar) |
