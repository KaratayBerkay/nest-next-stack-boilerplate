# Calls (screen)

**Route:** `/v1/:lang/rtc/calls` (`v1RtcCalls`) ·
**View:** [`calls_page_view.dart`](../../../../../flutter-boilerplate/lib/views/rtc/calls_page_view.dart)
**Vertical index:** [../README.md](../README.md) ·
**Web equivalent:** [frontend calls page.md](../../../../frontend/v1/rtc/calls/page.md)

Call history list (peer, direction, state, relative time) with call-back and report actions —
the in-call/ringing UI is the global [rtc_call_overlay](../widgets/rtc-call-overlay.md), not this
screen.

**Calls:** `callHistoryProvider` ([api.md](../api.md)) →
[`call_history.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/call_history.dart)
(direct REST → [Get call history](../../../../backend/messaging-realtime/rtc/endpoints.md#get-call-history));
starting a call goes through
[`rtc_call_provider.dart`](../../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart)
(WS `rtc:invite`); report via
[`calls_report.dart`](../../../../../flutter-boilerplate/lib/api/server/rtc/calls_report.dart)
using [`rtc_report_dialog.dart`](../../../../../flutter-boilerplate/lib/components/rtc/rtc_report_dialog.dart).
