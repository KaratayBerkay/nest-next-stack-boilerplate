# Posts Detail (screen)

**Route:** `/v1/:lang/posts/:uuid` (GoRouter name `v1PostDetail`)
**Router registration:** [`router.dart#L435-L440`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => PostDetailPageContent(lang: ..., postId: state.pathParameters['uuid'] ?? '')`.
**Entry widget:** `PostDetailPageContent` in
[`detail_page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/detail_page_view.dart)
**Web equivalent:** [posts page](../../../../frontend/v1/posts/page.md) — the one mobile `posts`
screen with a direct web match

> ⚠ **Read [Known issues](#known-issues) before assuming this screen has feature parity with a
> similarly-named folder in the source tree.** A separate, more fully-built implementation living at
> `lib/views/posts/[uuid]/` is **not** what this route actually renders — see below.

## What renders here

`TierGate`-wrapped, but **Basic, Medium, and Premium all render the exact identical
`_PostDetailView`** — there is no tier-differentiated content on this screen at all (Free gets a
plain upgrade-prompt text). Everything is defined inline in one file as a single private class,
`_PostDetailView` — the comment list and composer are inlined directly in its `build()` method, not
factored into their own widget class — so **no `widgets/` folder is needed for this screen**, since
it also reuses none of the shared [`components/feed/`](../../feed/screen.md#widgets) widget library
(no [PostCard](../../feed/widgets/post-card.md), no
[ReactionButtons](../../feed/widgets/reaction-buttons.md), no
[CommentSection](../../feed/widgets/comment-section.md) — confirmed by reading the file's imports
directly, none of them point at `components/feed/`).

The actual content, in order: author row (`Avatar` + name), title, body, cover image (`Image.network`
— not `CachedNetworkImage`, unlike every other image render site in this vertical), a comments
heading + list (each comment a plain inline `Row`, no [CommentCard](../../feed/widgets/comment-section.md)-equivalent
styling — no edit, no delete, no reactions on a comment from this screen), and a bottom-docked
comment-composer text field + send button.

**What this screen does *not* have, that the backend fully supports and web's equivalent page
renders:**

- No edit-post action anywhere (no edit button, no `PostEditForm`-equivalent).
- No delete-post action anywhere.
- No reaction toggle on the post itself (comments have no reaction affordance either).
- No reaction-breakdown display (Medium+ tier concept — see
  [post/endpoints.md](../../../../backend/social-content/post/endpoints.md#postreactionbreakdown-resolved-field)).
- No who-reacted display (Premium tier concept).

Compare with web's [posts page](../../../../frontend/v1/posts/page.md), which has all five of these
wired up (even though [FE-009](../../../../issues.md#fe-009) means the last two currently render
empty on web too — but the UI and the edit/delete/react actions themselves work on web).

## Known issues

**A separate, unrouted implementation at `lib/views/posts/[uuid]/` (10 files) has all five of the
missing features above, but nothing in the app ever reaches it.** Confirmed exhaustively, not
inferred:

- `grep -rn "PostDetailPage(" flutter-boilerplate/lib` (the class defined in
  [`views/posts/[uuid]/page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/[uuid]/page_view.dart))
  finds only definitions and internal references **within that same folder** — `free_page_view.dart`,
  `medium_page_view.dart`, `premium_page_view.dart`, `basic_page_view.dart` all reference sibling
  classes, but **nothing outside the folder imports any file from it**
  (`grep -rln "posts/\[uuid\]" flutter-boilerplate/lib --include="*.dart"` restricted to files outside
  that folder → zero matches).
- `router.dart` imports only
  [`views/posts/create_page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/create_page_view.dart),
  [`views/posts/detail_page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/detail_page_view.dart),
  and [`views/posts/page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/page_view.dart)
  — three flat files, never anything from the `[uuid]/` subfolder. The `/v1/:lang/posts/:uuid` route
  is wired to `PostDetailPageContent` (`detail_page_view.dart`), not `PostDetailPage`
  (`[uuid]/page_view.dart`).

The dead tree contains a full tier-differentiated `PostDetailBaseView` (Free: upgrade prompt; Basic:
plain; Medium: `+ReactionBreakdown`; Premium: `+ReactionBreakdown +WhoReacted +edit`) with its own
`PostHeader`/`PostContentView`/`PostEditForm`/`ReactionBreakdown`/`WhoReacted` — structurally the
closest mobile analog to web's [posts page](../../../../frontend/v1/posts/page.md) tier split that
exists anywhere in the mobile codebase, just never connected to the router. Two pieces of evidence
suggest it was abandoned mid-build rather than recently orphaned by a refactor:

1. **`WhoReacted` in the dead tree is 100% hardcoded fake data** — it accepts a `postId` prop but
   never uses it to fetch anything; it renders a literal `AvatarGroup` of `Avatar(name: 'Alice')`,
   `Avatar(name: 'Bob')`, `Avatar(name: 'Charlie')` and the literal string `'Alice, Bob and 5
   others'`
   ([`views/posts/[uuid]/who_reacted.dart#L32-42`](../../../../../flutter-boilerplate/lib/views/posts/[uuid]/who_reacted.dart)).
2. **`PremiumPostDetailPage` has a real comparison bug** that would need fixing before this tree
   could work correctly even if wired up:
   ```dart
   final isAuthor = user?.id == post.id;   // compares the viewer's id to the POST's id
   ```
   ([`views/posts/[uuid]/premium_page_view.dart#L35`](../../../../../flutter-boilerplate/lib/views/posts/[uuid]/premium_page_view.dart)) —
   should be `post.authorId` (confirmed `Post` has both `id` and a distinct `authorId` field, per
   [`types/feed/post.dart`](../../../../../flutter-boilerplate/lib/types/feed/post.dart)). As
   written, `isAuthor` is essentially always `false`, so even a resurrected version of this tree
   would never show its own edit button to a real author.

Also note: even the dead tree's `ReactionBreakdown` isn't a true per-type breakdown like web's
component of the same name — it reads `post.likeCount`/`post.isLikedBy()` (a single aggregate,
computed from `Post.reactions`), not a `reactionBreakdown`-shaped field; mobile's `Post` type has no
such field at all (neither `list.dart` nor `single.dart`'s GraphQL queries request it — see
[feed/api.md § Shape per file](../../feed/api.md#shape-per-file)). So even fully wired up and bug-fixed,
this tree's "reaction breakdown" would show only a like count, not a per-emoji-type breakdown.

**Recommended disposition** (for whoever owns this module next): either finish and route the
`[uuid]/` tree (fixing the `isAuthor` bug and replacing `WhoReacted`'s hardcoded data with a real
fetch first), or delete it and add edit/delete/reaction-breakdown/who-reacted directly to the live
`detail_page_view.dart` instead — keeping both around is the actively-misleading state a future
reader of this codebase would otherwise land in. Filed as [MOB-008](../../../../issues.md#mob-008) (proposed HIGH — a live,
reachable, paying-tier-visible capability gap, not just an unused code path) in
[issues.md](../../../../issues.md).

## Calls

```
_PostDetailView → postProvider(postId) / postCommentsProvider(postId)   — lib/api/client/posts/query.dart
  → PostSingleServer.call() / PostCommentsServer.list()                 — lib/api/server/posts/single.dart, comments.dart
    → backend: post / postComments queries
(comment composer, send) → postActionsProvider.addComment(postId, text)
  → PostCommentsServer.create()
    → backend: createComment mutation
```

- API layer: [api.md](../api.md)
- Backend endpoints: [post/endpoints.md#get-a-single-post](../../../../backend/social-content/post/endpoints.md#get-a-single-post),
  [comment/endpoints.md](../../../../backend/social-content/comment/endpoints.md)

No edit/delete/reaction calls exist from this screen — see [Known issues](#known-issues) above.
