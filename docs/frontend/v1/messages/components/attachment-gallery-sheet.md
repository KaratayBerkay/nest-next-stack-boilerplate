# AttachmentGallerySheet

**Source:** [`AttachmentGallerySheet.tsx`](../../../../../next-js-boilerplate/src/views/messages/AttachmentGallerySheet.tsx) ·
utils: [`AttachmentGallerySheet-utils.ts`](../../../../../next-js-boilerplate/src/views/messages/AttachmentGallerySheet-utils.ts)
**Types:** [`AttachmentGallerySheet-types.ts`](../../../../../next-js-boilerplate/src/types/messages/AttachmentGallerySheet-types.ts)
**Used in:** [ChatView](./chat-view.md) (opened from [ChatViewHeader](./chat-view-header.md)'s folder icon)
**Mobile equivalent:** none confirmed in the mobile widget list for `messages` — verify during Phase 3.

## Purpose

"All uploads" side sheet: every file ever exchanged with the open peer, day-grouped in a collapsible
accordion, with search + date-range filtering and infinite scroll.

## Props (`AttachmentGallerySheetProps`)

`open`, `onOpenChange`, `peerId`.

## Behavior notes

- Search is debounced 300ms (`useDebounce`) before hitting the query — the raw input updates
  instantly, the query key updates on the debounced value.
- **Pages are flattened in fetch order, never reversed** — unlike the main message list, this is a
  flat newest-first gallery, not a bottom-anchored chat scroll; the backend already returns each page
  newest-first (see
  [messaging/endpoints.md#list-conversation-attachments](../../../../backend/messaging-realtime/messaging/endpoints.md#list-conversation-attachments)).
  The infinite-query's next-page cursor is therefore the *last* (oldest) item of the current page.
- The accordion's default-open groups are computed once per sheet-open (`useMemo` over `dayGroups`,
  re-derived fresh every time since `Sheet` unmounts its content on close) — only "today"'s group
  starts expanded.
- `groupAttachmentsByDay` (in the co-located `-utils.ts`) does the day-bucketing + "is this today"
  tagging.

## Calls

`conversationAttachmentsQueryOptions(peerId, {search, from, to})` — see
[api.md](../api.md) → backend
[List conversation attachments](../../../../backend/messaging-realtime/messaging/endpoints.md#list-conversation-attachments).
