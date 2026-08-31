# Privacy (page)

**Route:** `/v1/[lang]/settings/privacy` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/privacy/page.tsx)
**Mobile equivalent:** [settings/privacy screen](../../../../mobile/v1/settings/privacy/screen.md)
**Settings index:** [../README.md](../README.md)

## What renders here

`getTierView()`, all four tiers identical. [`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/privacy/FreePageView.tsx)
renders two toggle rows (`PrivacyToggleRow`, a trivial presentational leaf — label + description +
`Switch`, not documented separately) plus a conditional nickname text input:

- **Hide profile picture** (`hideAvatar`) — when on, `avatarUrl` is withheld from every
  other-user-facing surface (see
  [profile backend README](../../../../backend/social-content/profile/README.md)).
- **Use a nickname in chat rooms** (`useNickname`) — when on, reveals a text input for
  `chatNickname`, used in place of the real name in chat-room presence lists and messages only (not
  DMs). Toggling this off does **not** clear the saved nickname text — see below.

### The preserve-on-disable behavior is deliberate, and load-bearing state-sync logic backs it

The page's own inline comments describe two things this implementation exists specifically to avoid
regressing:

1. **Toggling `useNickname` off then back on must not lose the saved nickname.** `handleSave` only
   sends `chatNickname: null` (erasing it) when the text field itself was explicitly cleared —
   `nickname.trim() ? nickname.trim() : null` — never merely because the toggle is off.
2. **`user` can populate *after* this component's first render** (SSR hydration timing, or a
   `refreshUser()` triggered elsewhere) — three parallel `seededX`/`setSeededX` state pairs re-sync
   `hideProfilePicture`/`useNickname`/`nickname` from `user` **during render** (not a `useEffect`, per
   an inline comment citing this codebase's lint rule against `useState`-in-effect for this pattern)
   whenever `user`'s corresponding field differs from what was last seeded. Both behaviors are called
   out in the source as fixes for regressions this page previously shipped — worth preserving if this
   file is ever refactored.

A "Manage sessions" link at the bottom points to [settings/sessions](../sessions/page.md) (Phase 1b,
not detailed here).

## Hooks & API

No vertical-specific `hooks.md` — state lives directly in `FreePageView`.
[`useProfileActions()`](../account/api.md) is shared with
[account](../account/page.md)/[general](../general/page.md) — see [api.md](./api.md).

Cross-cutting: `useAuth` (imported from `@/features/auth/hooks/useAuth` here rather than the
`@/hooks/useAuth` re-export path other pages in this vertical use — both resolve to the identical
context/provider, confirmed by reading both files; not a duplicate-implementation trap like
`MOB-002` (resolved), just two import paths to the same singleton), `useToast`,
`useMessages`.

- [api.md](./api.md)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Save nickname/useNickname/hideAvatar | [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile) |
