# RtcCallOverlay

**Source:** [`RtcCallOverlay.tsx`](../../../../../next-js-boilerplate/src/components/rtc/RtcCallOverlay.tsx) ·
**Types:** [`RtcCallOverlay-types.ts`](../../../../../next-js-boilerplate/src/types/rtc/RtcCallOverlay-types.ts)
**Mounted:** once, in the app shell ([app-shell.md](../../../app-shell.md)) — renders on **any**
`/v1` page whenever [`RtcCallProvider`](../hooks.md#rtccallprovider--the-11-call-state-machine)'s
phase isn't `idle`.
**Mobile equivalent:** [rtc-call-overlay.md (widget)](../../../../mobile/v1/rtc/widgets/rtc-call-overlay.md)

## The three faces

| Phase | UI |
|---|---|
| `incoming-ringing` | Full-screen ring card: pulsing avatar in the caller's [identity color](../hooks.md#supporting-lib-files), accept (audio/video per `hasVideo`) / decline |
| `outgoing-ringing` / `connected` audio | Identity-color-washed screen, avatar, status ladder (below), mic/speaker/hangup controls |
| `connected` video | Meet-style **contained stage tile** (`object-contain` — the full camera frame, not a crop), header row with name + timer pill, self-view PiP (own avatar while own camera is off), full control row |

## Status ladder (single readout, in order)

cancelling → "Calling {name}" → connecting → "Waiting for {name}" → the running timer. When
connected, the timer reads **`elapsed / limit`** (e.g. `2:17 / 10:00`) — `formatCallTimer`
(exported for tests) with the `maxDurationMinutes` the backend sent on `rtc:accepted`
([tier caps](../../../../backend/messaging-realtime/rtc/README.md#tier-limits)). Media errors
(mic/camera denied) render as their own banner and deliberately never occupy the status slot — a
denied camera must not hide the call timer. A `rtc:call-limit-warning` frame surfaces the remaining
seconds; `rtc:error` reasons map to localized copy via a stable snake_case code table.

## Media behavior

Video/audio comes from [`useLiveKitRoom`](../hooks.md#livekit-room-hooks-srchooksrtc):

- The remote `<video>` stays mounted but is hidden (`opacity-0`) unless `remoteCameraLive` — a
  muted/withdrawn peer camera shows the avatar placeholder instead of a frozen/black frame.
- The self-view PiP mirrors the same trick for the local camera (`cameraEnabled`), overlaying the
  user's own avatar when off.
- Wake lock + Media Session are held while connected (see [hooks.md](../hooks.md)) so the OS/browser
  doesn't throttle or sleep mid-call.
