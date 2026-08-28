# `/v1/[lang]/rtc` — calls, meetings, live (web)

The RTC vertical: five routed pages plus the app-shell-level 1:1 call machinery that works on
*every* page. Backend counterpart: [backend rtc](../../../backend/messaging-realtime/rtc/README.md).
Mobile mirror: [mobile/v1/rtc](../../../mobile/v1/rtc/README.md).

Every routed page below renders a single view component from
[`src/views/rtc/`](../../../../next-js-boilerplate/src/views/rtc/) — no per-tier
`FreePageView`-style variants in this vertical (tier differences are enforced backend-side and
surfaced as limits/errors, not as different page layouts).

## Pages

| Route | View | Docs |
|---|---|---|
| `v1/[lang]/rtc` | `RtcHubView` | [page.md](./page.md) |
| `v1/[lang]/rtc/calls` | `RtcCallHistoryView` | [calls/page.md](./calls/page.md) |
| `v1/[lang]/rtc/meetings` | `RtcMeetingsListView` | [meetings/page.md](./meetings/page.md) |
| `v1/[lang]/rtc/meetings/[slug]` | `RtcMeetingRoomView` | [meetings/room/page.md](./meetings/room/page.md) |
| `v1/[lang]/rtc/live` | `RtcLiveDiscoveryView` | [live/page.md](./live/page.md) |
| `v1/[lang]/rtc/live/[slug]` | `RtcLiveViewerView` | [live/viewer/page.md](./live/viewer/page.md) |
| `v1/[lang]/rtc/live/go-live` | `RtcGoLiveView` | [live/go-live/page.md](./live/go-live/page.md) |

(`room/` and `viewer/` are doc-tree names for the `[slug]` dynamic segments, per
[conventions.md § Folder structure](../../../conventions.md#1-folder-structure-rule).)

## Vertical-wide docs

- [api.md](./api.md) — every `src/api/{server,client}/rtc/**` file → backend endpoint mapping
- [hooks.md](./hooks.md) — the LiveKit room hooks, room chat, wake lock, and
  [`RtcCallProvider`](../../../../next-js-boilerplate/src/lib/rtc/RtcCallProvider.tsx)
- Components: [rtc-call-overlay.md](./components/rtc-call-overlay.md) ·
  [meeting-participant-tile.md](./components/meeting-participant-tile.md) ·
  [rtc-create-meeting-dialog.md](./components/rtc-create-meeting-dialog.md) ·
  [stream-chat-panel.md](./components/stream-chat-panel.md) ·
  [rtc-report-dialog.md](./components/rtc-report-dialog.md)

## Cross-page machinery (not tied to any route here)

- **[`RtcCallProvider`](../../../../next-js-boilerplate/src/lib/rtc/RtcCallProvider.tsx) +
  [`RtcCallOverlay`](../../../../next-js-boilerplate/src/components/rtc/RtcCallOverlay.tsx)** are
  mounted once in the app shell (see [app-shell.md](../../app-shell.md)) so an incoming call rings —
  and an active call keeps running — on any `/v1` page, not just under `/rtc`. Signaling rides the
  shared realtime WebSocket (leader-tab coordinated — see
  [app-shell.md § Realtime](../../app-shell.md)); on mount/reconnect the provider re-pulls
  `GET /api/rtc/calls/active` so a refreshed tab recovers a live call.
- **Identity colors** ([`lib/rtc/participant-color.ts`](../../../../next-js-boilerplate/src/lib/rtc/participant-color.ts)):
  a stable oklch palette hashed from the LiveKit identity — used by meeting tiles, call overlay
  avatars, call history, and stream cards, so a given user is the same color everywhere.
- **Telemetry** ([`lib/rtc/rtc-telemetry.ts`](../../../../next-js-boilerplate/src/lib/rtc/rtc-telemetry.ts)):
  `logRtcEvent` — client-side RTC lifecycle/error events shipped to the web log pipeline.

## LiveKit client connection

Media is browser ↔ LiveKit directly (`livekit-client`), never through Next.js: the backend mints a
token (delivered via `rtc:accepted` for calls, or the join/goLive mutation responses for
meetings/streams) and the hooks in [hooks.md](./hooks.md) connect to `NEXT_PUBLIC_LIVEKIT_URL`
with it.
