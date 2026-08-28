# Live viewer (screen)

**Route:** `/v1/:lang/rtc/live/:slug` (`v1RtcLiveViewer`; doc folder `viewer/` stands in for the
segment) ·
**View:** [`live_viewer_page_view.dart`](../../../../../../flutter-boilerplate/lib/views/rtc/live_viewer_page_view.dart)
**Vertical index:** [../../README.md](../../README.md) ·
**Web equivalent:** [frontend live viewer page.md](../../../../../frontend/v1/rtc/live/viewer/page.md)

Watch a stream: broadcaster video + [rtc_chat_panel](../../widgets/rtc-chat-panel.md), viewer count
off the `rtc:stream-viewer-joined`/`-left` frames, `rtc:stream-ended` → ended screen (via
[`stream_signal.dart`](../../../../../../flutter-boilerplate/lib/lib/rtc/stream_signal.dart)).
Joins as viewer on entry, leaves on dispose; the broadcaster's own slug short-circuits to their
broadcast surface like web.

**Calls:** [`streams_join.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_join.dart) /
[`streams_leave.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_leave.dart) /
[`streams_chat.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_chat.dart) +
[`streams_report.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_report.dart)
(direct GraphQL → [backend § Live streams](../../../../../backend/messaging-realtime/rtc/endpoints.md#live-streams)).
