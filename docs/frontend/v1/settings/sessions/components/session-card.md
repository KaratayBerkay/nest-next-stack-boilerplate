# SessionCard

**Source:** [`SessionCard.tsx`](../../../../../../next-js-boilerplate/src/views/settings/sessions/SessionCard.tsx)
**Types:** [`SessionCard-types.ts`](../../../../../../next-js-boilerplate/src/types/settings/SessionCard-types.ts)
**Used in:** [sessions page](../page.md)
**Mobile equivalent:** the sessions screen's inline `Card`/`ListTile` row (no separate widget file on
mobile — see [mobile sessions/screen.md](../../../../../mobile/v1/settings/sessions/screen.md))

## Purpose

Renders one session row: device-type icon, a friendly device label, current/trusted badges, IP +
started-at, an expandable "More device info" details block, and a Revoke action (hidden for the
current session). Pure presentational component — no state, no direct API calls.

## Props (`SessionCardProps`)

| Prop | Purpose |
|---|---|
| `session` | one `SessionInfo` row — see [sessions/endpoints.md#list-my-sessions](../../../../../backend/identity-access/sessions/endpoints.md#list-my-sessions) for the exact shape |
| `isCurrent` | `session.sessionId === user.sessionId` — flips styling (brand-tinted border/icon, "Current" badge) and hides the Revoke button entirely (there is no self-revoke path from this row; that's what "Log out all other sessions" is for) |
| `dateDisplay` | pre-resolved date-format preference, passed to `formatDateTimeByPreference` |
| `onRevoke(sessionId)` | callback — see **Calls** below |

## Behavior notes

- **Device-type inference is two-layered**: prefers the backend-provided `session.deviceType`
  (`MOBILE_IOS`/`MOBILE_ANDROID`/etc., from the `Device` Postgres row) but falls back to sniffing
  `userAgent` for `mobile`/`android`/`iphone` substrings when `deviceType` is absent — matching the
  mobile screen's own independent `_friendlyDeviceLabel` sniffing logic (two separately-implemented
  heuristics arriving at similar labels, not a shared utility — see
  [mobile sessions/screen.md](../../../../../mobile/v1/settings/sessions/screen.md)).
- **"Trusted" badge** reflects `Device.trusted`, which this page can display but has **no way to set**
  — the only mutation that flips it (`trustCurrentDevice`) is called exclusively from the login MFA
  challenge, not from anywhere on this page. See
  [sessions/README.md](../../../../../backend/identity-access/sessions/README.md#trustcurrentdevice--a-sessions-module-mutation-with-an-auth-flow-only-caller).
- The device-ID/user-agent detail block uses a native `<details>`/`<summary>` element rather than a
  custom disclosure component — no JS state for the expand/collapse.

## Calls (indirect — this component never calls `fetch`/a hook's mutation directly)

`onDelete` is supplied by `FreePageView` and resolves to:

```
SessionCard (onRevoke prop)
  → FreePageView.handleRevokeSession → useSessionActions().revokeSession()  — src/api/client/sessions/actions.ts
    → revokeSessionServer()                                                — src/api/server/sessions/revoke.ts
      → backend: POST-shaped BFF → GraphQL revokeSession(sessionId)
```

- Frontend BFF route: [api.md § Revoke a session](../api.md#revoke-a-session-bff-route)
- Backend endpoint: [sessions/endpoints.md#revoke-a-session](../../../../../backend/identity-access/sessions/endpoints.md#revoke-a-session)
