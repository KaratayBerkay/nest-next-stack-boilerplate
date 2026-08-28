# Meeting room (page)

**Route:** `/v1/[lang]/rtc/meetings/[slug]` (doc folder `room/` stands in for the dynamic segment) ·
**Page:** [`app/v1/[lang]/rtc/meetings/[slug]/page.tsx`](../../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/meetings/[slug]/page.tsx) ·
**View:** [`RtcMeetingRoomView.tsx`](../../../../../../next-js-boilerplate/src/views/rtc/RtcMeetingRoomView.tsx)
**Vertical index:** [../../README.md](../../README.md) ·
**Mobile equivalent:** [mobile meeting room screen.md](../../../../../mobile/v1/rtc/meetings/room/screen.md)

## Purpose

The in-meeting experience: video grid, control bar, chat + people sidebars, tier timer, host
controls. Joins on mount, leaves on unmount.

## Phase machine

`joining → active`, with terminal screens for `ended` (meeting over), `removed` (host removed you —
the unmount cleanup still runs but you're already out), `not-found` (404 only), `join-failed`
(**any non-404 failure** — deliberately not "the meeting has ended", which used to mask real server
errors and made every retryable failure look final), and `elsewhere` — LiveKit kicked this
connection because the same user joined again from another tab/device
(`duplicateKicked` from [`useLiveKitMeetingRoom`](../../hooks.md#livekit-room-hooks-srchooksrtc)).
The superseded tab must **not** send `leaveMeeting` on unmount (the newest join owns the
participant row).

## What renders (active)

- **Grid** of [MeetingParticipantTile](../../components/meeting-participant-tile.md)s (camera,
  screen share, identity-colored camera-off avatars, speaking indicators).
- **Timer chip** (top-left): `elapsed / limit` against `room.startedAt` +
  `meeting.maxDurationMinutes` — the same server clock the
  [backend sweep](../../../../../backend/messaging-realtime/rtc/README.md#file-map) enforces; turns
  warning ≤5 min, error ≤1 min.
- **Control bar:** mic/camera/screen-share toggles, invite
  ([RtcInviteDialog](../../components/rtc-create-meeting-dialog.md#rtcinvitedialog)), copy meeting
  link, [report](../../components/rtc-report-dialog.md), chat/people sidebar toggles,
  [recording control](../../components/rtc-report-dialog.md#rtcrecordingcontrol) (host), and
  End (host, confirm-gated) / Leave.
- **Chat sidebar:** bubble-style room chat with [link cards](../../../messages/components/chat-link-card.md)
  and per-message timestamps; **People sidebar:** roster with mic state, host badge, and host-only
  mute/remove (remove is confirm-gated).

## Realtime & data flow

| Concern | Path |
|---|---|
| Join | [`meetings/join.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/meetings/join.ts) → `joinMeeting` → LiveKit token → [`useLiveKitMeetingRoom`](../../hooks.md) connects |
| Live signals | `rtc:meeting-ended` / `-removed` / `-force-muted` / `-limit-warning` / participant joined/left frames ([backend § WS server→client](../../../../../backend/messaging-realtime/rtc/endpoints.md#websocket-events-serverclient)) |
| Chat | [`useRoomChat`](../../hooks.md) (`rtc:join-room-chat` + history via [`meetings/chat.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/meetings/chat.ts), gated until the join lands — the endpoint 403s pre-join) |
| Host controls | `useMeetingActions.muteParticipant`/`removeParticipant`/`endMeeting` → BFF → GraphQL |
| Leave | Unmount cleanup → [`meetings/leave.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/meetings/leave.ts) (skipped when superseded) |
