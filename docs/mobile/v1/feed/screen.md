# Feed (screen)

**Route:** `/v1/:lang/feed` (GoRouter name `v1Feed`)
**Router registration:** [`router.dart#L306-L310`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => FeedPageContent(lang: ...)`.
**Entry widget:** `FeedPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/feed/page_view.dart)
**Web equivalent:** [feed page](../../../frontend/v1/feed/page.md)

## What renders here

Same 4-tier `TierGate` composition pattern as web, one file per tier:

| Tier | File | Differs from Free by |
|---|---|---|
| Free | [`free_page_view.dart`](../../../../flutter-boilerplate/lib/views/feed/free_page_view.dart) | — |
| Basic | [`basic_page_view.dart`](../../../../flutter-boilerplate/lib/views/feed/basic_page_view.dart) | nothing — `build()` just returns `FreeFeedPage(lang: lang)` |
| Medium | [`medium_page_view.dart`](../../../../flutter-boilerplate/lib/views/feed/medium_page_view.dart) | `showSidebar: true` |
| Premium | [`premium_page_view.dart`](../../../../flutter-boilerplate/lib/views/feed/premium_page_view.dart) | `showSidebar: true`, `showPageInfo: true`, plus an `isOwnPost` callback that badges the viewer's own posts |

All four pass their flags into one shared
[`FeedBaseView`](../../../../flutter-boilerplate/lib/views/feed/feed_base_view.dart) rather than each
maintaining their own list-rendering logic. **This is architecturally cleaner than web's equivalent**
— web has 3 separate list-component files for the same 4 tiers, two of which
([`FreeFeedList.tsx`](../../../frontend/v1/feed/page.md#what-renders-here) and `MediumFeedList.tsx`)
are byte-for-byte duplicates of each other (see
[frontend/v1/feed/page.md § Known issues](../../../frontend/v1/feed/page.md#known-issues-affecting-this-page));
mobile's single parameterized `FeedBaseView` doesn't have that duplication.

## Layout: search, list, and sidebar

`FeedBaseView` renders a search box + "Share" button + optional page-info button (`showPageInfo`) at
the top, then switches between three content states: a search-results list (when the search box has
text — `feedSearchProvider`, a `FutureProvider.family`, one-shot per query, not debounced), an
infinite-scroll list (`paginatedFeedProvider`, loads more at 200px from the bottom via a
`ScrollController` listener), or a loading skeleton. When `showSidebar` is true,
`_SidebarLayout` places [PostStatsSidebar](./widgets/post-stats-sidebar.md) beside the list on wide
screens (≥768px) or below it on narrow ones — no independent widget-level breakpoint handling
elsewhere in this vertical, this is the only responsive split.

## Widgets

8 significant widgets in
[`lib/components/feed/`](../../../../flutter-boilerplate/lib/components/feed/):

[post-card.md](./widgets/post-card.md) ·
[post-header.md](./widgets/post-header.md) ·
[post-content.md](./widgets/post-content.md) ·
[post-actions.md](./widgets/post-actions.md) ·
[reaction-buttons.md](./widgets/reaction-buttons.md) ·
[comment-section.md](./widgets/comment-section.md) ·
[post-stats-sidebar.md](./widgets/post-stats-sidebar.md) ·
[feed-list-empty-state.md](./widgets/feed-list-empty-state.md)

## API

[api.md](./api.md) — **confirmed zero Next.js involvement for this entire vertical**: every
`lib/api/server/posts/*.dart` file hand-rolls a direct `_dio.post('/graphql', ...)` call to the
NestJS backend, no BFF hop — see
[conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).
This matches the [messages](../messages/screen.md) vertical's pattern and is the third Phase-2 module
to confirm it independently.

## Known issues affecting this screen

- [MOB-009](../../../issues.md#mob-009) — [PostStatsSidebar](./widgets/post-stats-sidebar.md)'s
  "Load Stats" button is a silent no-op: its `onLoadStats` callback is never supplied at either of
  this screen's two instantiation sites (`_SidebarLayout`, Medium/Premium only), and the fully-working
  `postStatsProvider` it would call has zero readers anywhere in the app.
- [MOB-011](../../../issues.md#mob-011) — [PostCard](./widgets/post-card.md) never wires
  `onEditStart`/`onDeleteConfirm` when instantiating [PostHeader](./widgets/post-header.md): a post
  author's edit icon renders permanently disabled, and the delete icon shows a real confirm dialog
  that silently does nothing on confirm. Mobile-only — web's equivalent wires both correctly.
