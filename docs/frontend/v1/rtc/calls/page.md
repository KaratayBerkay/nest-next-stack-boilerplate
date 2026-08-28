# Calls (page)

**Route:** `/v1/[lang]/rtc/calls` ·
**Page:** [`app/v1/[lang]/rtc/calls/page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/calls/page.tsx) ·
**View:** [`RtcCallHistoryView.tsx`](../../../../../next-js-boilerplate/src/views/rtc/RtcCallHistoryView.tsx)
**Vertical index:** [../README.md](../README.md) ·
**Mobile equivalent:** [mobile calls screen.md](../../../../mobile/v1/rtc/calls/screen.md)

## Purpose

1:1 call history + the place to start a new call. The actual ringing/in-call UI is **not** on this
page — it's the global [RtcCallOverlay](../components/rtc-call-overlay.md), which works from any
page; this page only lists past calls and triggers `startCall`.

## What renders

Rows of `CallHistoryEntry` (peer avatar in their [identity color](../hooks.md#supporting-lib-files),
direction icon, state — ended/missed/rejected/cancelled, with missed-incoming in error color —
talked duration for ended calls, relative time) with three per-row actions: report
([RtcReportDialog](../components/rtc-report-dialog.md)), audio call, video call. Call buttons
disable while a call is already active (`state.phase !== "idle"`).

## Calls

| Action | Path |
|---|---|
| History list | [`callHistoryQueryOptions`](../../../../../next-js-boilerplate/src/api/client/rtc/query.ts) → [`call-history.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/call-history.ts) → [Get call history](../../../../backend/messaging-realtime/rtc/endpoints.md#get-call-history) |
| Start call | `startCall(peer, hasVideo)` from [`useRtcCall`](../hooks.md#rtccallprovider--the-11-call-state-machine) → WS `rtc:invite` |
| Report | [`useCallActions`](../../../../../next-js-boilerplate/src/api/client/rtc/calls-actions.ts) → [`calls/report.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/calls/report.ts) → `reportCall` |
