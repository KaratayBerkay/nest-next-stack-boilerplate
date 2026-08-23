# RoomAttachmentGallerySheet

**Source:** [`RoomAttachmentGallerySheet.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/RoomAttachmentGallerySheet.tsx) ·
utils: [`RoomAttachmentGallerySheet-utils.ts`](../../../../../next-js-boilerplate/src/views/chat-room/RoomAttachmentGallerySheet-utils.ts)
**Types:** [`RoomAttachmentGallerySheet-types.ts`](../../../../../next-js-boilerplate/src/types/chat-room/RoomAttachmentGallerySheet-types.ts)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md) (opened from
[ChatRoomMainContent](./chat-room-main-content.md)'s folder icon)
**Web sibling:** [AttachmentGallerySheet](../../messages/components/attachment-gallery-sheet.md) (the
DM equivalent — a near-exact structural mirror, documented separately per
[conventions.md §2](../../../../conventions.md#2-file-naming) since they're two distinct files with
two distinct backend endpoints)
**Mobile equivalent:** none — see [screen.md § Confirmed gaps vs. web](../../../../mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen),
[CROSS-028](../../../../issues.md#cross-028).

## Purpose

"All uploads" side sheet for the active room: every file ever posted in the room, day-grouped in a
collapsible accordion, with search + date-range filtering and infinite scroll. Functionally identical
to messages' `AttachmentGallerySheet`, reimplemented against the room-scoped query instead of a
per-peer one.

## Props (`RoomAttachmentGallerySheetProps`)

`open`, `onOpenChange`, `room`.

## Behavior notes

- Same day-grouping/search-debounce/default-open-today-only pattern as
  [AttachmentGallerySheet](../../messages/components/attachment-gallery-sheet.md#behavior-notes) —
  `groupRoomAttachmentsByDay` (in the co-located `-utils.ts`) is a near-duplicate of that component's
  `groupAttachmentsByDay`, one file each, not a shared util.
- **Pages are flattened in fetch order, never reversed** — same reasoning as the DM gallery: the
  backend already returns each page newest-first (see
  [messaging/endpoints.md § List / read / write chat rooms](../../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms),
  the `GET /api/rooms/:roomId/attachments` response), so this is a flat newest-first gallery, not a
  bottom-anchored chat scroll.

## Calls

`roomAttachmentsQueryOptions(room, {search, from, to})` — from `api/client/messages/query.ts` (see
[api.md](../api.md), this vertical has no API layer of its own) → backend
[List / read / write chat rooms](../../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms)
(`GET /api/rooms/:roomId/attachments`).
