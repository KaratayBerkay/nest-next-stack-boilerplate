# RTC — Mobile API layer

Vertical: [README.md](./README.md) · Backend contract:
[backend rtc endpoints.md](../../../backend/messaging-realtime/rtc/endpoints.md) ·
Web counterpart: [frontend rtc api.md](../../../frontend/v1/rtc/api.md)

## Call shape per file (conventions § 9)

Two shapes in this vertical, **neither via the Next.js BFF**:

| File(s) | Shape | Evidence | Target doc |
|---|---|---|---|
| [`meetings_*.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/) (`create`/`get`/`list`/`join`/`leave`/`end`/`invite`/`participants`/`chat`/`recording`/`report`), [`streams_*.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/) (same set + `go_live`), [`calls_report.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/calls_report.dart) | **Direct to backend, GraphQL** | every file `_dio.post('/graphql', …)` with the matching operation string; shared field fragments in [`meeting_fields.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/meeting_fields.dart) / [`stream_fields.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/stream_fields.dart) | [backend § GraphQL](../../../backend/messaging-realtime/rtc/endpoints.md#graphql) |
| [`call_history.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/call_history.dart), [`active_call.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/active_call.dart) | **Direct to backend, REST** | `_dio.get(Urls.rtcCalls / Urls.rtcActiveCall)` = `/api/rtc/calls[,/active]`, which are the **backend controller's own native routes** (`@Controller('api/rtc')`), not a frontend BFF namespace | [backend § REST](../../../backend/messaging-realtime/rtc/endpoints.md#rest) |

Call *signaling* (`rtc:invite`/`accept`/…) is WS frames sent by
[`rtc_call_provider.dart`](../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart)
through [`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart) —
see [backend § WS events](../../../backend/messaging-realtime/rtc/endpoints.md#websocket-events-clientserver).

## Client layer (`lib/api/client/rtc/`)

| File | Provides |
|---|---|
| [`query.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/query.dart) | `activeCallProvider` (snapshot recovery), `callHistoryProvider` (paginated notifier), tier-limits |
| [`calls_actions.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/calls_actions.dart) | report-call action |
| [`meetings_query.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/meetings_query.dart) / [`meetings_actions.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/meetings_actions.dart) | list/get providers + create/join/leave/end/invite/host-control/recording actions |
| [`meetings_chat_live.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/meetings_chat_live.dart) | `meetingChatProvider` — history seed + live `rtc:chat-message` accumulation + send (the Dart `useRoomChat`) |
| [`streams_query.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/streams_query.dart) / [`streams_actions.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/streams_actions.dart) / [`streams_chat_live.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/streams_chat_live.dart) | Same split for streams |

Types in [`lib/types/rtc/`](../../../../flutter-boilerplate/lib/types/rtc/)
(`meeting.dart`, `stream.dart`, `call_history_entry.dart`, `active_call_snapshot.dart`,
`recording.dart`).
