# Live discovery (screen)

**Route:** `/v1/:lang/rtc/live` (`v1RtcLive`) ·
**View:** [`live_discovery_page_view.dart`](../../../../../flutter-boilerplate/lib/views/rtc/live_discovery_page_view.dart)
**Vertical index:** [../README.md](../README.md) ·
**Web equivalent:** [frontend live page.md](../../../../frontend/v1/rtc/live/page.md)

Currently-live stream cards (title, broadcaster, viewer count) → [viewer](./viewer/screen.md), plus
the entry point to [go-live](./go-live/screen.md).

**Calls:** streams list provider ([api.md](../api.md)) →
[`streams_list.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/streams_list.dart)
(direct GraphQL → [backend § Live streams](../../../../backend/messaging-realtime/rtc/endpoints.md#live-streams)).
