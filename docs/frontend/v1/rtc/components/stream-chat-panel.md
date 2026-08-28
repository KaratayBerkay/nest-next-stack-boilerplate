# StreamChatPanel (+ StreamPlayer)

The two live-stream surface components, used by both the [viewer page](../live/viewer/page.md) and
the broadcaster's [go-live page](../live/go-live/page.md).

## StreamChatPanel

**Source:** [`StreamChatPanel.tsx`](../../../../../next-js-boilerplate/src/components/rtc/StreamChatPanel.tsx)

Twitch-style dark chat column: `sender: message` lines (no bubbles), auto-scroll pinned to newest
via [`useAutoScroll`](../../../../../next-js-boilerplate/src/hooks/useAutoScroll.ts), an input +
send. URLs in messages get [ChatLinkCard](../../messages/components/chat-link-card.md)s under the
line (same click-safety policy as DMs). Data comes from the caller's
[`useRoomChat`](../hooks.md#livekit-room-hooks-srchooksrtc) instance — the panel is presentational.

## StreamPlayer

**Source:** [`StreamPlayer.tsx`](../../../../../next-js-boilerplate/src/components/rtc/StreamPlayer.tsx)

The video stage: attaches the broadcaster's tracks (camera or screen share) from
[`useLiveKitStreamRoom`](../hooks.md#livekit-room-hooks-srchooksrtc), with a no-video placeholder
and an optional no-audio indicator (suppressed on the broadcaster's own preview, where local audio
is intentionally muted).
