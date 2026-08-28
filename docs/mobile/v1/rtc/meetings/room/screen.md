# Meeting room (screen)

**Route:** `/v1/:lang/rtc/meetings/:slug` (`v1RtcMeetingRoom`; doc folder `room/` stands in for the
segment) ·
**View:** [`meeting_room_page_view.dart`](../../../../../../flutter-boilerplate/lib/views/rtc/meeting_room_page_view.dart)
**Vertical index:** [../../README.md](../../README.md) ·
**Web equivalent:** [frontend meeting room page.md](../../../../../frontend/v1/rtc/meetings/room/page.md)

The in-meeting screen: participant grid (livekit_client tracks), control bar (mic/camera/screen
share, invite, chat via [rtc_chat_panel](../../widgets/rtc-chat-panel.md), report, end/leave),
wake lock held while active.

## Phase machine (`RoomPhase`)

`joining → active`, terminal `ended` / `removed` / `notFound` (404 only) / `joinFailed` — the same
split as web: **only a 404 means the meeting is gone**; any other join failure shows a retryable
join-failed screen, never the misleading "meeting has ended" copy
(`roomPhaseForJoinFailure`/`roomPhaseMessage`, unit-tested in
[`meeting_room_page_view_test.dart`](../../../../../../flutter-boilerplate/test/views/rtc/meeting_room_page_view_test.dart)).

## Realtime

Room lifecycle arrives via
[`meeting_signal.dart`](../../../../../../flutter-boilerplate/lib/lib/rtc/meeting_signal.dart)
(seq-guarded so a WS reconnect can't replay stale events): `ended`/`removed` tear the LiveKit room
down immediately (including the local camera/mic — not just on dispose) and release the wake lock;
`forceMuted` drops the local mic; chat re-joins its channel after a reconnect. Chat state:
`meetingChatProvider` ([api.md](../../api.md)).

**Calls:** [`meetings_join.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_join.dart) /
[`meetings_leave.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_leave.dart) /
[`meetings_chat.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_chat.dart) +
host controls — direct GraphQL
([backend § Meetings](../../../../../backend/messaging-realtime/rtc/endpoints.md#meetings)).
