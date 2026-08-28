# rtc_chat_panel (widget)

**Source:** [`rtc_chat_panel.dart`](../../../../../flutter-boilerplate/lib/components/rtc/rtc_chat_panel.dart)
**Used in:** [meeting room](../meetings/room/screen.md), [live viewer](../live/viewer/screen.md),
[go-live](../live/go-live/screen.md)
**Web equivalents:** the meeting room's chat sidebar + [StreamChatPanel](../../../../frontend/v1/rtc/components/stream-chat-panel.md)

Presentational chat column shared by meetings and streams: message list (sender + text), input +
send. State comes from the caller's `meetingChatProvider` / stream chat notifier
([api.md](../api.md)) — history seed, live `rtc:chat-message` frames, and channel join/leave
(including the re-join after a WS reconnect) all live in those notifiers, not here.

Report dialog sibling: [`rtc_report_dialog.dart`](../../../../../flutter-boilerplate/lib/components/rtc/rtc_report_dialog.dart)
(reason radio + details, the Dart mirror of web's
[RtcReportDialog](../../../../frontend/v1/rtc/components/rtc-report-dialog.md)) — folded into this
doc rather than its own file.
