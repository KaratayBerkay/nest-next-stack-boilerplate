# ChatLinkCard (+ link-preview policy)

**Source:** [`ChatLinkCard.tsx`](../../../../../next-js-boilerplate/src/components/ChatLinkCard.tsx) ·
policy: [`lib/chat/link-preview.ts`](../../../../../next-js-boilerplate/src/lib/chat/link-preview.ts) ·
**Types:** [`ChatLinkCard-types.ts`](../../../../../next-js-boilerplate/src/types/components/ChatLinkCard-types.ts)
**Used in:** all four web chat surfaces —
[ChatMessageBubble](./chat-message-bubble.md) (DMs),
[chat-room message list](../../chat-room/components/chat-room-message-list.md),
the [meeting room chat](../../rtc/meetings/room/page.md), and
[StreamChatPanel](../../rtc/components/stream-chat-panel.md).
**Mobile equivalent:** none — link cards are web-only so far.

## What it does

For each URL found in a message body (`extractLinks`, max 3 per message, dedup'd, trailing
punctuation/unbalanced closers trimmed), renders a card under the bubble: hostname, full URL, and a
**copy button — always**. Whether the card is also *clickable* is decided by a strict allow-policy.

## The click policy (`isSafeExternalUrl`)

Allow-list, not block-list — a URL is clickable **only if all** hold:

- `https:` (never `http:`)
- no embedded credentials (`https://trusted.com@evil.io` is the classic phish shape)
- no explicit port (dev/internal services)
- hostname is a plausible public domain: not an IPv4/IPv6 literal, has ≥2 non-empty labels, TLD is
  alphabetic (or `xn--` punycode) and not on the non-public list
  (`local`/`internal`/`test`/`onion`/`corp`/…)

Everything else renders as a **non-clickable** card with a "link blocked" hint — the recipient can
still copy the text deliberately, but can't be one-click phished into an internal or spoofed
target. Clickable links open `target="_blank"` with `rel="noopener noreferrer"`.

Policy unit tests: [`link-preview.test.ts`](../../../../../next-js-boilerplate/src/lib/chat/link-preview.test.ts).
