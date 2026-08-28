# Meetings list (page)

**Route:** `/v1/[lang]/rtc/meetings` ·
**Page:** [`app/v1/[lang]/rtc/meetings/page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/rtc/meetings/page.tsx) ·
**View:** [`RtcMeetingsListView.tsx`](../../../../../next-js-boilerplate/src/views/rtc/RtcMeetingsListView.tsx)
**Vertical index:** [../README.md](../README.md) ·
**Mobile equivalent:** [mobile meetings screen.md](../../../../mobile/v1/rtc/meetings/screen.md)

## Purpose

Everything you hosted **or attended** (the backend's `myMeetings` covers both), split into two
sections, plus the Meet-style create flow.

## What renders

- **Active now:** green live-dot cards — title, host line ("Hosted by you"/by name), started-ago,
  overlapping attendee-avatar stack of who's currently in (`leftAt === null`), copy-link, Join.
- **History:** an accordion (`AccordionItemComplex`) — header shows title + absolute start stamp
  (identically-titled meetings stay tellable apart), host, ended-ago, total duration, attendee
  stack; expanding reveals per-attendee rows (join time + time-in-meeting, host badge).
- **New meeting** opens [RtcCreateMeetingDialog](../components/rtc-create-meeting-dialog.md); on
  submit the view creates the meeting, fires all selected invites (`Promise.allSettled` — invite
  failures toast but never strand the host outside their own room), then navigates into the room.

## Calls

| Action | Path |
|---|---|
| List | [`myMeetingsQueryOptions`](../../../../../next-js-boilerplate/src/api/client/rtc/meetings-query.ts) → [`meetings/list.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/meetings/list.ts) → `myMeetings` ([backend § Meetings](../../../../backend/messaging-realtime/rtc/endpoints.md#meetings)) — the query selects the `participants` summary field that powers both attendee stacks |
| Create | [`useMeetingActions.createMeeting`](../../../../../next-js-boilerplate/src/api/client/rtc/meetings-actions.ts) → [`meetings/create.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/meetings/create.ts) → `createMeeting` |
| Invite at create | `useMeetingActions.inviteToMeeting` → [`meetings/invite.ts`](../../../../../next-js-boilerplate/src/api/server/rtc/meetings/invite.ts) → `inviteToMeeting` (the backend explicitly allows the host pre-join — see [backend § Meetings](../../../../backend/messaging-realtime/rtc/endpoints.md#meetings)) |
