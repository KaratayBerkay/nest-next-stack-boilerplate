# MessagesSidebarTabBar (widget)

**Source:** [`messages_sidebar_tab_bar.dart`](../../../../../flutter-boilerplate/lib/views/messages/messages_sidebar_tab_bar.dart)
**Used in:** [MessagesSidebar](./messages-sidebar.md)
**Web equivalent:** **none directly** — this is mobile's own navigation model, not a port of
[MessagesSidebarFilterBar](../../../../frontend/v1/messages/components/messages-sidebar-filter-bar.md).
See [CROSS-001](../../../../issues.md#cross-001) and
[MessagesSidebar § Structural differences](./messages-sidebar.md#structural-differences-from-web-found-while-documenting-this-widget).

## Purpose

Stateless 2-tab switcher (Chats / Friends) — a plain `StatelessWidget`, `activeTab` (`int`) +
`onTabChanged` callback, no data fetching or Riverpod dependency of its own. Underline-style active
indicator, matches the visual language of web's pill bar without the same functional scope (4
filters + popover vs. 2 tabs).
