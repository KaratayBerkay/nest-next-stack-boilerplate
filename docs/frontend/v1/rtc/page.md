# RTC hub (page)

**Route:** `/v1/[lang]/rtc` ·
**Page:** [`app/v1/[lang]/rtc/page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/page.tsx) ·
**View:** [`RtcHubView.tsx`](../../../../next-js-boilerplate/src/views/rtc/RtcHubView.tsx)
**Vertical index:** [README.md](./README.md) ·
**Mobile equivalent:** [mobile rtc screen.md](../../../mobile/v1/rtc/screen.md)

Pure navigation: three accent-colored cards — **Calls** (brand), **Meetings** (info), **Live**
(broadcast red) — each linking to its sub-route. No data fetching, no backend calls. The shared
`error.tsx`/`loading.tsx` for the whole `/rtc` segment live beside this page in
[`app/v1/[lang]/rtc/`](../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/).
