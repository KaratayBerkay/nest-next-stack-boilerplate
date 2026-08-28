# rtc_call_overlay (widget)

**Source:** [`rtc_call_overlay.dart`](../../../../../flutter-boilerplate/lib/components/rtc/rtc_call_overlay.dart)
**Mounted:** once at the app root (`app.dart`, same level as the biometric-lock overlay — see
[mobile app-shell.md](../../../app-shell.md)), rendering whenever
[`rtc_call_provider.dart`](../../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart)'s
phase isn't idle.
**Web equivalent:** [RtcCallOverlay](../../../../frontend/v1/rtc/components/rtc-call-overlay.md)

Two faces, mirroring web:

- `_IncomingCallSheet` — the ring UI (caller, audio/video accept, decline).
- `_ActiveCallScreen` — outgoing-ring/connecting/connected: LiveKit video (remote + self PiP),
  mic/camera/speaker/hangup controls, and the same **status ladder** as web ending in the
  `elapsed / limit` timer — `formatCallTimer(elapsedSeconds, maxDurationMinutes)` (top-level, the
  mirror of web's export; tested in
  [`rtc_call_overlay_test.dart`](../../../../../flutter-boilerplate/test/components/rtc/rtc_call_overlay_test.dart)).
  `callErrorMessage` maps the backend's stable `rtc:error` reason codes to localized copy.

Wake lock is held while a call is active; the provider (not this widget) owns all signaling and the
active-call snapshot recovery ([api.md](../api.md)).
