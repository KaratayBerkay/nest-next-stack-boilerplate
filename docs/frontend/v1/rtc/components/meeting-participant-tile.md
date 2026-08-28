# MeetingParticipantTile

**Source:** [`MeetingParticipantTile.tsx`](../../../../../next-js-boilerplate/src/components/rtc/MeetingParticipantTile.tsx) ·
**Types:** [`MeetingParticipantTile-types.ts`](../../../../../next-js-boilerplate/src/types/rtc/MeetingParticipantTile-types.ts)
**Used in:** [meeting room](../meetings/room/page.md)'s video grid — one per
`MeetingParticipantView` from [`useLiveKitMeetingRoom`](../hooks.md#livekit-room-hooks-srchooksrtc).

One grid cell, Meet-style:

- **Video** when a camera track is live; **screen share renders regardless of camera state**
  (`object-contain` on a dark ground, vs. `object-cover` for camera) — an active share must never
  hide behind the avatar just because the sharer's camera is off.
- **Camera-off:** an identity-colored radial wash + initials circle
  ([`participantPalette`](../../../../../next-js-boilerplate/src/lib/rtc/participant-color.ts)) —
  every camera-off tile is visually distinct instead of a uniform black rectangle. Container-query
  (`cqmin`) sizing keeps the avatar proportional at any grid density.
- **Speaking:** animated glow ring on video tiles / staggered breathing ripples around the avatar
  (keyframes `speaking-glow` / `speaking-ripple` / `sound-bar` in
  [`globals.css`](../../../../../next-js-boilerplate/src/app/globals.css), colors from per-tile
  `--speak-ring`/`--speak-halo` CSS vars), plus equalizer bars next to the name chip.
- **Chips:** name pill (bottom-left, "You" for local, screen-share icon) and a mic-muted badge
  (top-right).

Track attachment via [`useTrackAttach`](../hooks.md#livekit-room-hooks-srchooksrtc); local tiles
mute their own audio element.
