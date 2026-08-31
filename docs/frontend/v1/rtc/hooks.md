# RTC — Web hooks & call provider

Vertical: [README.md](./README.md) · Source:
[`src/hooks/rtc/`](../../../../next-js-boilerplate/src/hooks/rtc/) +
[`src/lib/rtc/`](../../../../next-js-boilerplate/src/lib/rtc/)

## `RtcCallProvider` — the 1:1 call state machine

[`lib/rtc/RtcCallProvider.tsx`](../../../../next-js-boilerplate/src/lib/rtc/RtcCallProvider.tsx),
mounted once in the app shell ([app-shell.md](../../app-shell.md)). A reducer over call phases
(`idle` → `outgoing-ringing`/`incoming-ringing` → `connected` → back to `idle`) driven by two
inputs:

1. **WS frames** (`rtc:ringing`/`rtc:accepted`/`rtc:rejected`/…) subscribed through the realtime
   coordination layer — so signaling works from follower tabs too (frames are relayed over the
   `BroadcastChannel`, sends are forwarded to the leader tab's socket; see
   [app-shell.md § Realtime](../../app-shell.md)).
2. **The active-call snapshot** (`GET /api/rtc/calls/active` via
   [`active-call.ts`](../../../../next-js-boilerplate/src/api/server/rtc/active-call.ts)) pulled on
   mount and on WS reconnect — a refreshed/late tab recovers a ringing or connected call it never
   saw the push for. The snapshot carries `maxDurationMinutes` for the in-call
   `elapsed / limit` timer.

Exposes `startCall(peer, hasVideo)` / `accept` / `reject` / `cancel` / `hangup` (each sends the
matching [client→server frame](../../../backend/messaging-realtime/rtc/endpoints.md#websocket-events-clientserver))
plus `state` for [`RtcCallOverlay`](./components/rtc-call-overlay.md). Calls are refused client-side
with a toast when realtime status isn't `open` (`realtime_unavailable`).

## LiveKit room hooks (`src/hooks/rtc/`)

| Hook | For | Notes |
|---|---|---|
| [`useLiveKitRoom.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useLiveKitRoom.ts) | 1:1 calls | Connects with the `rtc:accepted` token; attaches remote audio/video to the overlay's elements; tracks `remoteConnected` and `remoteCameraLive` ([`lib/rtc/remote-camera.ts`](../../../../next-js-boilerplate/src/lib/rtc/remote-camera.ts) — an unmuted camera *track* gate, so a muted/withdrawn camera shows the avatar placeholder instead of a frozen frame); mic/camera/speaker toggles; typed `livekitError` (`connection`/`microphone`/`camera`) |
| [`useLiveKitMeetingRoom.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useLiveKitMeetingRoom.ts) | Meetings | Full participant roster (`MeetingParticipantView[]`: tracks, mic/camera state, `isSpeaking`, screen share), local toggles incl. screen share, and `duplicateKicked` — LiveKit allows one connection per identity per room, so the superseded tab shows "opened elsewhere" and must **not** send `leaveMeeting` on unmount |
| [`useLiveKitStreamRoom.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useLiveKitStreamRoom.ts) | Streams | Broadcaster-side publish (go-live preview + live) and viewer-side subscribe |
| [`useTrackAttach.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useTrackAttach.ts) | Tiles | Attach/detach a LiveKit track to a media element ref |
| [`useRoomChat.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useRoomChat.ts) | Meetings + streams | Sends `rtc:join-room-chat` on activation / `rtc:leave-room-chat` on teardown, merges the paginated history query with live `rtc:chat-message` frames, re-joins the channel after a WS reconnect |
| [`useStreamViewerCount.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useStreamViewerCount.ts) | Streams | Live count off `rtc:stream-viewer-joined`/`-left` frames; ignores frames without a numeric `viewerCount` |
| [`useStreamViewers.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useStreamViewers.ts) | Streams | Live watcher list off the `streams/[slug]/viewers` BFF query, refetched on every joined/`-left` frame and on WS reopen (frames carry the count but not avatars); feeds `StreamViewerList` in both stream sidebars |
| [`useWakeLock.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useWakeLock.ts) | Calls/meetings | `navigator.wakeLock` while connected (re-acquired on visibility change) — keeps the screen on during a call |
| [`useMediaSessionActive.ts`](../../../../next-js-boilerplate/src/hooks/rtc/useMediaSessionActive.ts) | Calls | Media Session registration so the browser treats the call as active playback (prevents tab throttling from freezing call UI timers) |

## Supporting lib files

- [`lib/rtc/participant-color.ts`](../../../../next-js-boilerplate/src/lib/rtc/participant-color.ts) —
  `participantPalette(identity)` (stable oklch identity color: fill/ring/halo/tints) +
  `participantInitials(name)`. Works because LiveKit identities are the id-codec-encrypted user ids
  the client already has (see
  [backend § Identity encryption](../../../backend/messaging-realtime/rtc/README.md#identity--room-name-encryption)).
- [`lib/rtc/rtc-telemetry.ts`](../../../../next-js-boilerplate/src/lib/rtc/rtc-telemetry.ts) —
  `logRtcEvent` client telemetry.
