# Sessions (page)

**Route:** `/v1/[lang]/settings/sessions` · **Source:**
[`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/sessions/page.tsx)
**Mobile equivalent:** [sessions screen](../../../../mobile/v1/settings/sessions/screen.md)

## What renders here

Server component, following the same `getTierView()` tier-branch convention as
[messages](../../messages/page.md): resolves the session user, then renders one of four tier-branch
view files.

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

`BasicPageView`/`MediumPageView`/`PremiumPageView` are each a one-line re-export
(`export const BasicPageView = FreePageView;`) — confirmed by diffing all four files, byte-identical
apart from that line. Exactly like messaging, nothing about session management is actually tier-gated;
the four-file split exists only for the `getTierView` routing convention this codebase applies
uniformly, not because this page has tier-specific behavior.

| Tier | View file |
|---|---|
| Free | [`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/sessions/FreePageView.tsx) (the real implementation) |
| Basic / Medium / Premium | re-exports of `FreePageView` |

## Client component tree

`FreePageView` owns all state directly (no dedicated page-level hook, same pattern as
[security](../security/page.md) — `useState` for `sessions`/`loadingSessions`/`sessionsError`, plus
`useSessionActions()` for the two mutations) and renders:

```
FreePageView
├─ (loading)      SessionSkeleton
├─ (error)        inline retry button
├─ (empty)        EmptySessions
└─ (data)         SessionCard × N
```

`SessionSkeleton` and `EmptySessions` are trivial presentational leaves (10 lines each) folded into
this page's description per [conventions.md](../../../../conventions.md) rather than given their own
doc files — only `SessionCard` is documented standalone.

## Components

1 significant component in
[`src/views/settings/sessions/`](../../../../../next-js-boilerplate/src/views/settings/sessions/):

[session-card.md](./components/session-card.md)

## Hooks & API

No vertical-specific hook file — `useSessionActions()` (from `api/client/sessions/actions.ts`) and a
lazy-imported `listSessionsServer()` (from `api/server/sessions/list.ts`) are called directly from
`FreePageView`. See [api.md](./api.md) for the full client/BFF/backend chain.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List sessions | [sessions/endpoints.md#list-my-sessions](../../../../backend/identity-access/sessions/endpoints.md#list-my-sessions) |
| Revoke one session | [sessions/endpoints.md#revoke-a-session](../../../../backend/identity-access/sessions/endpoints.md#revoke-a-session) |
| Revoke all other sessions | [sessions/endpoints.md#revoke-all-other-sessions](../../../../backend/identity-access/sessions/endpoints.md#revoke-all-other-sessions) |

`trustCurrentDevice` ([sessions/endpoints.md#trust-the-current-device](../../../../backend/identity-access/sessions/endpoints.md#trust-the-current-device))
is implemented by the same backend module but is **not** called from this page — see
[sessions/README.md](../../../../backend/identity-access/sessions/README.md#trustcurrentdevice--a-sessions-module-mutation-with-an-auth-flow-only-caller)
for where it's actually used (the login MFA challenge).

## Known issues

None specific to this page.
