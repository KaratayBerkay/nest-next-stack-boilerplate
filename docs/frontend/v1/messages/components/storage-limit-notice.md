# StorageLimitNotice

**Source:** [`StorageLimitNotice.tsx`](../../../../../next-js-boilerplate/src/views/messages/StorageLimitNotice.tsx)
**Used in:** [ChatView](./chat-view.md) (replaces [ChatInputBar](./chat-input-bar.md) entirely when over quota)
**Mobile equivalent:** **none** — confirmed absent. Flutter's messages widget set (all 12 files
checked, see [mobile/v1/messages/screen.md](../../../../mobile/v1/messages/screen.md)) has no
storage-limit widget and [ChatInputBar (mobile)](../../../../mobile/v1/messages/widgets/chat-input-bar.md)
has no equivalent gating. Worth a look during Phase 4 (usage/billing) — either this check doesn't
exist on mobile yet, or it's enforced differently (e.g. silently, or server-side only).

## Purpose

Static warning ("storage limit reached, upgrade to send more") shown instead of the input bar. Takes
one optional `className`; no other props, no data fetching of its own.

## Data source

`ChatView` computes `storageLimitReached` from `messageUsageQueryOptions()`
(`src/api/client/usage/query.ts`, [usage module](../../../../backend/billing-usage/), Phase 4) — this
component itself is presentation-only.
