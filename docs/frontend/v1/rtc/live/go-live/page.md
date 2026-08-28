# Go live (page)

**Route:** `/v1/[lang]/rtc/live/go-live` ·
**Page:** [`app/v1/[lang]/rtc/live/go-live/page.tsx`](../../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/live/go-live/page.tsx) ·
**View:** [`RtcGoLiveView.tsx`](../../../../../../next-js-boilerplate/src/views/rtc/RtcGoLiveView.tsx)
**Vertical index:** [../../README.md](../../README.md) ·
**Mobile equivalent:** [mobile go-live screen.md](../../../../../mobile/v1/rtc/live/go-live/screen.md)

## Purpose

The broadcaster surface: a title form + camera preview before going live; once live, the publishing
stage with mic/camera/screen-share toggles, the same chat panel viewers see, viewer count,
[recording control](../../components/rtc-report-dialog.md#rtcrecordingcontrol), and a confirm-gated
End stream.

Going live is tier-gated **server-side** (`goLive` rejects below `MEDIUM` — see
[backend § Tier limits](../../../../../backend/messaging-realtime/rtc/README.md#tier-limits)); the
page surfaces the rejection as an error state with upgrade copy rather than pre-hiding the form.

## Calls & realtime

| Concern | Path |
|---|---|
| Go live | [`useStreamActions.goLive`](../../../../../../next-js-boilerplate/src/api/client/rtc/streams-actions.ts) → [`streams/go-live.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/streams/go-live.ts) → `goLive` (returns the publish token) |
| Publish | [`useLiveKitStreamRoom`](../../hooks.md#livekit-room-hooks-srchooksrtc) (camera/mic/screen publish) |
| Chat / count | [`useRoomChat`](../../hooks.md#livekit-room-hooks-srchooksrtc) + [`useStreamViewerCount`](../../hooks.md#livekit-room-hooks-srchooksrtc) — the backend never counts the broadcaster as a viewer |
| End | `useStreamActions.endStream` → [`streams/end.ts`](../../../../../../next-js-boilerplate/src/api/server/rtc/streams/end.ts) → `endStream` (idempotent server-side) |
