# Live viewer (page)

**Route:** `/v1/[lang]/rtc/live/[slug]` (doc folder `viewer/` stands in for the dynamic segment) ·
**Page:** [`app/v1/[lang]/rtc/live/[slug]/page.tsx`](../../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/live/[slug]/page.tsx) ·
**View:** [`RtcLiveViewerView.tsx`](../../../../../../next-js-boilerplate/src/views/rtc/RtcLiveViewerView.tsx)
**Vertical index:** [../../README.md](../../README.md) ·
**Mobile equivalent:** [mobile live viewer screen.md](../../../../../mobile/v1/rtc/live/viewer/screen.md)

## Purpose

Watch a stream: the broadcaster's video ([StreamPlayer](../../components/stream-chat-panel.md#streamplayer))
with the live chat panel beside it. Joins as viewer on mount, leaves on unmount.

## Phase machine

`joining → active`, `ended` (join failed non-404, or a live `rtc:stream-ended` frame arrives),
`not-found` (404), and `own-stream` — the broadcaster opening their own viewer URL gets a notice with a button to
their broadcast surface ([go-live](../go-live/page.md)) instead of being counted as their own
audience (the backend also guards this server-side — see
[backend § Live streams](../../../../../backend/messaging-realtime/rtc/endpoints.md#live-streams)).

## Calls & realtime

| Concern | Path |
|---|---|
| Join / leave | [`streams/join.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/streams/join.ts) / [`leave.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/streams/leave.ts) → `joinStreamAsViewer` / `leaveStreamAsViewer` |
| Video | [`useLiveKitStreamRoom`](../../hooks.md#livekit-room-hooks-srchooksrtc) with the join token (subscribe-only) |
| Viewer count | [`useStreamViewerCount`](../../hooks.md#livekit-room-hooks-srchooksrtc) seeded from the join response |
| Viewer list | [`useStreamViewers`](../../hooks.md#livekit-room-hooks-srchooksrtc) (enabled once `active`) → `StreamViewerList` stacked above the chat in the sidebar |
| Chat | [`useRoomChat`](../../hooks.md#livekit-room-hooks-srchooksrtc) + history via [`streams/chat.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/streams/chat.ts) (gated until joined) → [StreamChatPanel](../../components/stream-chat-panel.md) |
| End signal | `rtc:stream-ended` frame → `ended` screen |
| Report | [RtcReportDialog](../../components/rtc-report-dialog.md) → `reportStream` |
