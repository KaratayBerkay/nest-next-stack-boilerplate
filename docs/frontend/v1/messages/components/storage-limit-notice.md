# StorageLimitNotice

**Source:** [`StorageLimitNotice.tsx`](../../../../../next-js-boilerplate/src/views/messages/StorageLimitNotice.tsx)
**Used in:** [ChatView](./chat-view.md) (replaces [ChatInputBar](./chat-input-bar.md) entirely when over quota)
**Mobile equivalent:** **none** — confirmed absent. Flutter's messages widget set (all 12 files
checked, see [mobile/v1/messages/screen.md](../../../../mobile/v1/messages/screen.md)) has no
storage-limit widget and [ChatInputBar (mobile)](../../../../mobile/v1/messages/widgets/chat-input-bar.md)
has no equivalent gating.
>
> **Resolved by Phase 4b:** the underlying limit **is** enforced server-side, identically on both
> platforms (`UsageService.assertCanSendMessage`, called from both `MessagingDmService` and
> `MessagingRoomService` — see [usage backend README](../../../../backend/billing-usage/usage/README.md#enforcement-one-real-guard-one-dead-one)).
> Mobile's `messageUsageProvider`/`storageUsageProvider` (see
> [usage backend README § Used by](../../../../backend/billing-usage/usage/README.md#used-by)) are only
> ever read by the two settings/usage cards — nothing in mobile's chat composer reads them. So a
> mobile user who hits the cap gets a real, hard send failure with no advance warning, rather than
> this component's graceful pre-emptive block — see ⚠
> `CROSS-033` (resolved).

## Purpose

Static warning ("storage limit reached, upgrade to send more") shown instead of the input bar. Takes
one optional `className`; no other props, no data fetching of its own.

## Data source

`ChatView` computes `storageLimitReached` from `messageUsageQueryOptions()`
(`src/api/client/usage/query.ts`, [usage module](../../../../backend/billing-usage/usage/README.md),
Phase 4b) — this component itself is presentation-only.
