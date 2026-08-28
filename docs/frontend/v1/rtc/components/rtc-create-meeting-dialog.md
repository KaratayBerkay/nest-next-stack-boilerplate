# RtcCreateMeetingDialog (+ FriendPickList, RtcInviteDialog)

Three components covering "pick friends and get them into a meeting" — documented together because
the two dialogs share the same pick-list.

## RtcCreateMeetingDialog

**Source:** [`RtcCreateMeetingDialog.tsx`](../../../../../next-js-boilerplate/src/components/rtc/RtcCreateMeetingDialog.tsx) ·
**Used in:** [meetings list](../meetings/page.md) ("New meeting")

Google-Meet-style create modal: a large borderless title input, a guests section (selected-friend
chips with remove + the pick-list below), Cancel / **Create & join**. `onSubmit(title, inviteeIds)`
is caller-provided — the meetings list creates, invites, and navigates
([meetings/page.md § What renders](../meetings/page.md#what-renders)); a thrown create error keeps
the dialog open for retry. Friends are fetched lazily (`enabled: open`).

## FriendPickList

**Source:** [`FriendPickList.tsx`](../../../../../next-js-boilerplate/src/components/rtc/FriendPickList.tsx)

The shared searchable friend list (avatar, name, email per row; case-insensitive name/email
filter; loading/empty/no-match states). Row behavior is caller-shaped: `trailing(friend)` renders
the right edge (invite button, selected check), `onRowClick` optionally makes whole rows toggle
buttons (create dialog) vs. static rows with a trailing action (invite dialog).

## RtcInviteDialog

**Source:** [`RtcInviteDialog.tsx`](../../../../../next-js-boilerplate/src/components/rtc/RtcInviteDialog.tsx) ·
**Used in:** [meeting room](../meetings/room/page.md)'s control bar

Mid-meeting invites: the same pick-list with a per-row Invite button that flips to a disabled
"Invited" after `onInvite(userId)` resolves. Backend side: `inviteToMeeting` → in-app notification
+ [invite email](../../../../backend/messaging-realtime/rtc/endpoints.md#meetings).
