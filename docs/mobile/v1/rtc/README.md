# `/v1/:lang/rtc` — calls, meetings, live (mobile)

Mirrors [frontend v1/rtc](../../../frontend/v1/rtc/README.md) — same slugs, same backend
([backend rtc](../../../backend/messaging-realtime/rtc/README.md)). All routes registered in
[`router.dart#L332-L377`](../../../../flutter-boilerplate/lib/app/router.dart). Views live in
[`lib/views/rtc/`](../../../../flutter-boilerplate/lib/views/rtc/).

| Route | GoRouter name | View | Docs |
|---|---|---|---|
| `v1/:lang/rtc` | `v1Rtc` | `RtcPageContent` ([`page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/page_view.dart)) | [screen.md](./screen.md) |
| `v1/:lang/rtc/calls` | `v1RtcCalls` | [`calls_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/calls_page_view.dart) | [calls/screen.md](./calls/screen.md) |
| `v1/:lang/rtc/meetings` | `v1RtcMeetings` | [`meetings_list_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/meetings_list_page_view.dart) | [meetings/screen.md](./meetings/screen.md) |
| `v1/:lang/rtc/meetings/:slug` | `v1RtcMeetingRoom` | [`meeting_room_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/meeting_room_page_view.dart) | [meetings/room/screen.md](./meetings/room/screen.md) |
| `v1/:lang/rtc/live` | `v1RtcLive` | [`live_discovery_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/live_discovery_page_view.dart) | [live/screen.md](./live/screen.md) |
| `v1/:lang/rtc/live/go-live` | `v1RtcGoLive` | [`go_live_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/go_live_page_view.dart) | [live/go-live/screen.md](./live/go-live/screen.md) |
| `v1/:lang/rtc/live/:slug` | `v1RtcLiveViewer` | [`live_viewer_page_view.dart`](../../../../flutter-boilerplate/lib/views/rtc/live_viewer_page_view.dart) | [live/viewer/screen.md](./live/viewer/screen.md) |

(`room/`/`viewer/` are the doc-tree names for the `:slug` segments — same substitution the frontend
rtc docs use.)

- [api.md](./api.md) — call shapes per `lib/api/server/rtc/**` file (mixed: direct GraphQL for
  lifecycle, direct REST for the two call reads)
- Widgets: [rtc-call-overlay.md](./widgets/rtc-call-overlay.md) ·
  [rtc-chat-panel.md](./widgets/rtc-chat-panel.md)

## Cross-screen machinery

- **[`rtc_call_provider.dart`](../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart)**
  (+ [`rtc_call_state.dart`](../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_state.dart)) —
  the 1:1 call state machine, the Dart port of web's `RtcCallProvider`: WS frames in/out via
  [`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart),
  active-call snapshot recovery on connect, `maxDurationMinutes` for the `elapsed / limit` timer.
  Its overlay ([widgets/rtc-call-overlay.md](./widgets/rtc-call-overlay.md)) is mounted at the app
  root ([mobile app-shell.md](../../app-shell.md)), so calls ring on any screen.
- **[`meeting_signal.dart`](../../../../flutter-boilerplate/lib/lib/rtc/meeting_signal.dart) /
  [`stream_signal.dart`](../../../../flutter-boilerplate/lib/lib/rtc/stream_signal.dart)** —
  seq-numbered notifiers for the room-lifecycle frames (ended/removed/force-muted/limit-warning,
  stream-ended/viewer-count), kept separate from the accumulating chat notifiers so a WS reconnect
  can't replay stale lifecycle events into a live room.
- **LiveKit:** `livekit_client` connects directly with backend-minted tokens; wake lock via
  `wakelock_plus` while in a call/meeting.

## Parity notes vs web

- No chat **link cards** on mobile yet (web-only — see
  [frontend chat-link-card.md](../../../frontend/v1/messages/components/chat-link-card.md)).
- No identity-color palette yet — mobile tiles/avatars use the standard theme colors.
- Everything else (phases, tier caps surfacing, duplicate-join handling, join-failure vs
  meeting-ended split, recording "coming soon") mirrors the web behavior 1:1.
