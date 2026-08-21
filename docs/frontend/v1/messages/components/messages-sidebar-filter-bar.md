# MessagesSidebarFilterBar

**Source:** [`MessagesSidebarFilterBar.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebarFilterBar.tsx)
**Types:** [`MessagesSidebarFilterBar-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebarFilterBar-types.ts)
**Used in:** [MessagesSidebar](./messages-sidebar.md)
**Mobile equivalent:** **none** — see [CROSS-001](../../../../issues.md#cross-001).

## Purpose

The All / Unread / Favorites / Groups filter-pill row, plus a "new message" popover for starting a
conversation with a friend who has no thread yet.

## Props (`MessagesSidebarFilterBarProps`)

`filter`/`setFilter`, `lang` (for the "no friends yet" empty-state link), `friends`,
`openConversation`.

## Behavior notes

- The new-chat popover (`NewChatPicker`) shows every friend, clicking one calls `openConversation`
  and closes the popover (`usePopover()`'s `close`). With zero friends, it instead links to
  [find-friends](../../find-friends/page.md) (Phase 2) — built as `` `/v1/${lang}${FIND_FRIENDS_PATH}` ``.
  This confirmed [`FIND_FRIENDS_PATH`](../../../../../next-js-boilerplate/src/constants/routes.ts) is
  used correctly as a route *segment*, not a full path — see
  [FE-001](../../../../issues.md#fe-001) (closed, not a bug — found while documenting this exact
  component).
- **This is the one place the favorites/groups feature actually lives** on web with no Flutter
  counterpart at all — see [CROSS-001](../../../../issues.md#cross-001). If porting this component
  to mobile, this file (plus [MessagesSidebar](./messages-sidebar.md)'s `filter`/`friendsWithoutConvo`
  logic and [MessagesSidebarRooms](./messages-sidebar-rooms.md) for the "Groups" branch) is the
  complete web-side reference.
