# MessagesSidebarSearch

**Source:** [`MessagesSidebarSearch.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebarSearch.tsx)
**Types:** [`MessagesSidebarSearch-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebarSearch-types.ts)
**Used in:** [MessagesSidebar](./messages-sidebar.md)
**Mobile equivalent:** [MessagesSidebarSearch widget](../../../../mobile/v1/messages/widgets/messages-sidebar-search.md)

## Purpose

A single controlled search input (`search`/`setSearch` props, both owned by
[MessagesSidebar](./messages-sidebar.md)) — no debouncing here (unlike
[AttachmentGallerySheet](./attachment-gallery-sheet.md)'s search), since filtering happens
client-side over an already-loaded list rather than triggering a new query per keystroke.
