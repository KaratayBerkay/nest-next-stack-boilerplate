# RTC — Web API layer

Vertical: [README.md](./README.md) · Backend contract:
[backend rtc endpoints.md](../../../backend/messaging-realtime/rtc/endpoints.md)

All browser calls go through the Next.js BFF (per
[conventions.md § 8](../../../conventions.md#8-rest-vs-graphql-vs-ws--which-app-doc-owns-a-call-web)):
`src/api/server/rtc/**` functions hit same-origin `app/api/rtc/**` route handlers, which forward to
the backend (GraphQL for lifecycle ops, REST for the two call reads). Call *signaling* is not here
at all — it's WS frames sent by [`RtcCallProvider`](./hooks.md) through the realtime socket.

## BFF route handlers (`src/app/api/rtc/**`)

| Route | Forwards to |
|---|---|
| [`[...path]/route.ts`](../../../../next-js-boilerplate/src/app/api/rtc/[...path]/route.ts) | Catch-all proxy for the REST reads: `GET /api/rtc/calls`, `GET /api/rtc/calls/active` → [backend REST](../../../backend/messaging-realtime/rtc/endpoints.md#rest) |
| [`meetings/route.ts`](../../../../next-js-boilerplate/src/app/api/rtc/meetings/route.ts) + [`meetings/[slug]/*`](../../../../next-js-boilerplate/src/app/api/rtc/meetings/) | `myMeetings`/`createMeeting`/`meetingBySlug`/`joinMeeting`/`leaveMeeting`/`endMeeting`/`inviteToMeeting`/host controls/chat/recording/report → [backend § Meetings](../../../backend/messaging-realtime/rtc/endpoints.md#meetings) |
| [`streams/route.ts`](../../../../next-js-boilerplate/src/app/api/rtc/streams/route.ts) + [`streams/[slug]/*`](../../../../next-js-boilerplate/src/app/api/rtc/streams/) | `liveStreams`/`goLive`/`streamBySlug`/`joinStreamAsViewer`/`leaveStreamAsViewer`/`endStream`/chat/recording/report → [backend § Live streams](../../../backend/messaging-realtime/rtc/endpoints.md#live-streams) |
| [`calls/[callId]/report/route.ts`](../../../../next-js-boilerplate/src/app/api/rtc/calls/[callId]/report/route.ts) | `reportCall` → [backend § Reports](../../../backend/messaging-realtime/rtc/endpoints.md#reports) |

## `src/api/server/rtc/**` (typed BFF wrappers)

| File | Functions → backend operation |
|---|---|
| [`call-history.ts`](../../../../next-js-boilerplate/src/api/server/rtc/call-history.ts) | `getCallHistoryServer` → [Get call history](../../../backend/messaging-realtime/rtc/endpoints.md#get-call-history) |
| [`active-call.ts`](../../../../next-js-boilerplate/src/api/server/rtc/active-call.ts) | `getActiveCallServer` → [Get active call snapshot](../../../backend/messaging-realtime/rtc/endpoints.md#get-active-call-snapshot) |
| [`calls/report.ts`](../../../../next-js-boilerplate/src/api/server/rtc/calls/report.ts) | `reportCallServer` → `reportCall` |
| [`meetings/*.ts`](../../../../next-js-boilerplate/src/api/server/rtc/meetings/) | One file per op (`create`/`get`/`list`/`join`/`leave`/`end`/`invite`/`participants`/`chat`/`recording`/`report`); [`types.ts`](../../../../next-js-boilerplate/src/api/server/rtc/meetings/types.ts) holds `MeetingView`/`MeetingAttendee`/`JoinMeetingResult` |
| [`streams/*.ts`](../../../../next-js-boilerplate/src/api/server/rtc/streams/) | Same pattern for streams (`go-live`/`get`/`list`/`join`/`leave`/`end`/`chat`/`recording`/`report` + `types.ts`) |
| [`shared-types.ts`](../../../../next-js-boilerplate/src/api/server/rtc/shared-types.ts) | Cross-product shapes (recording, report reason) |

## `src/api/client/rtc/**` (React Query layer)

| File | Exports |
|---|---|
| [`query.ts`](../../../../next-js-boilerplate/src/api/client/rtc/query.ts) | `callHistoryQueryOptions`, `rtcTierLimits` options |
| [`calls-actions.ts`](../../../../next-js-boilerplate/src/api/client/rtc/calls-actions.ts) | `useCallActions` — `reportCall` (signaling itself lives in the provider, not here) |
| [`meetings-query.ts`](../../../../next-js-boilerplate/src/api/client/rtc/meetings-query.ts) | `myMeetingsQueryOptions`, `meetingBySlugQueryOptions`, `meetingChatQueryOptions` (disabled until joined — the history endpoint 403s pre-join), `meetingRecordingQueryOptions` |
| [`meetings-actions.ts`](../../../../next-js-boilerplate/src/api/client/rtc/meetings-actions.ts) | `useMeetingActions` — create/join/leave/end/invite/mute/remove/report/recording |
| [`streams-query.ts`](../../../../next-js-boilerplate/src/api/client/rtc/streams-query.ts) / [`streams-actions.ts`](../../../../next-js-boilerplate/src/api/client/rtc/streams-actions.ts) | Same split for streams |
