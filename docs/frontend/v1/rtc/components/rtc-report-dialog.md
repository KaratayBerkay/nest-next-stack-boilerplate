# RtcReportDialog (+ RtcRecordingControl)

Two small cross-product controls used on calls, meetings, and streams.

## RtcReportDialog

**Source:** [`RtcReportDialog.tsx`](../../../../../next-js-boilerplate/src/components/rtc/RtcReportDialog.tsx) ·
**Used in:** [calls](../calls/page.md) rows, [meeting room](../meetings/room/page.md) control bar,
[live viewer](../live/viewer/page.md)

Abuse report modal: a custom radio-card group for the reason
(`HARASSMENT | SPAM | INAPPROPRIATE_CONTENT | OTHER` — mirrors the backend enum), an optional
details textarea, and a success state. `onSubmit(reason, details)` is caller-provided, resolving to
the matching `reportCall`/`reportMeeting`/`reportStream` mutation
([backend § Reports](../../../../backend/messaging-realtime/rtc/endpoints.md#reports)). Render-prop
trigger (`children(open)`), like every dialog in this vertical.

## RtcRecordingControl

**Source:** [`RtcRecordingControl.tsx`](../../../../../next-js-boilerplate/src/components/rtc/RtcRecordingControl.tsx) ·
**Used in:** [meeting room](../meetings/room/page.md) (host), [go-live](../live/go-live/page.md)
(broadcaster)

Start/stop-recording button with a recording dot and — while "recording" — a **"coming soon" pill**:
the backend persists intent only, no real egress runs
([backend § Recordings](../../../../backend/messaging-realtime/rtc/endpoints.md#recordings)). Keep
that pill until LiveKit Egress is actually wired.
