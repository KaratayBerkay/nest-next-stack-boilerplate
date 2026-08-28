# Live discovery (page)

**Route:** `/v1/[lang]/rtc/live` ·
**Page:** [`app/v1/[lang]/rtc/live/page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/live/page.tsx) ·
**View:** [`RtcLiveDiscoveryView.tsx`](../../../../../next-js-boilerplate/src/views/rtc/RtcLiveDiscoveryView.tsx)
**Vertical index:** [../README.md](../README.md) ·
**Mobile equivalent:** [mobile live screen.md](../../../../mobile/v1/rtc/live/screen.md)

Grid of currently-live streams — each card an identity-color-washed thumbnail with a pulsing LIVE
badge, viewer count, title, and broadcaster — linking into
[the viewer page](./viewer/page.md). A "Go live" button links to [go-live](./go-live/page.md)
(the *button* is always visible; the gating happens on that page / server-side — watching is free
for every tier, broadcasting is `MEDIUM`+, see
[backend § Tier limits](../../../../backend/messaging-realtime/rtc/README.md#tier-limits)).

**Calls:** [`liveStreamsQueryOptions`](../../../../../next-js-boilerplate/src/api/client/rtc/streams-query.ts)
→ [`streams/list.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/streams/list.ts) →
`liveStreams` ([backend § Live streams](../../../../backend/messaging-realtime/rtc/endpoints.md#live-streams)).
