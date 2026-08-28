# Go live (screen)

**Route:** `/v1/:lang/rtc/live/go-live` (`v1RtcGoLive`) ·
**View:** [`go_live_page_view.dart`](../../../../../../flutter-boilerplate/lib/views/rtc/go_live_page_view.dart)
**Vertical index:** [../../README.md](../../README.md) ·
**Web equivalent:** [frontend go-live page.md](../../../../../frontend/v1/rtc/live/go-live/page.md)

Broadcaster surface: title + camera preview, then the live stage with publish toggles, chat, viewer
count, and end-stream. Tier gating is server-side (`goLive` rejects below `MEDIUM` — surfaced as an
upgrade prompt), matching web.

**Calls:** [`streams_go_live.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_go_live.dart) /
[`streams_end.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_end.dart) /
[`streams_recording.dart`](../../../../../../flutter-boilerplate/lib/api/server/rtc/streams_recording.dart)
(direct GraphQL → [backend § Live streams](../../../../../backend/messaging-realtime/rtc/endpoints.md#live-streams)).
