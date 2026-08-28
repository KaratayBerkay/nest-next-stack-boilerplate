# Meetings list (screen)

**Route:** `/v1/:lang/rtc/meetings` (`v1RtcMeetings`) ·
**View:** [`meetings_list_page_view.dart`](../../../../../flutter-boilerplate/lib/views/rtc/meetings_list_page_view.dart)
**Vertical index:** [../README.md](../README.md) ·
**Web equivalent:** [frontend meetings page.md](../../../../frontend/v1/rtc/meetings/page.md)

Hosted-or-attended meetings (`myMeetings`) with a create flow, mirroring web's list semantics.
⚠ The Meet-style split (active cards + history accordion with attendee stacks) shipped on web
first — check this view against
[frontend meetings page.md § What renders](../../../../frontend/v1/rtc/meetings/page.md#what-renders)
when porting UI changes (see [README.md § Parity notes](../README.md#parity-notes-vs-web)).

**Calls:** `meetingsListProvider`/actions ([api.md](../api.md)) →
[`meetings_list.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_list.dart) /
[`meetings_create.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_create.dart) /
[`meetings_invite.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/meetings_invite.dart)
(direct GraphQL → [backend § Meetings](../../../../backend/messaging-realtime/rtc/endpoints.md#meetings)).
