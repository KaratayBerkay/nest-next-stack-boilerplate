# Posts (mobile)

**Web equivalent:** [posts page](../../../frontend/v1/posts/page.md) — web has **one** posts route
(the detail page); mobile has **three**. This index exists because this folder has more than one
screen doc (see [conventions.md § 2](../../../conventions.md#2-file-naming)).

| Route | Screen | Doc | Web equivalent |
|---|---|---|---|
| `/v1/:lang/posts` | `PostsPageContent` | [list/screen.md](./list/screen.md) | none — closest analog is [feed](../../../frontend/v1/feed/page.md) |
| `/v1/:lang/posts/create` | `PostCreatePageContent` | [create/screen.md](./create/screen.md) | none — closest analog is [share](../../../frontend/v1/share/page.md) |
| `/v1/:lang/posts/:uuid` | `PostDetailPageContent` | [detail/screen.md](./detail/screen.md) | [posts page](../../../frontend/v1/posts/page.md) — the one direct match |

All three routes are registered in
[`router.dart#L421-L440`](../../../../flutter-boilerplate/lib/app/router.dart) and their entry
widgets live in [`lib/views/posts/`](../../../../flutter-boilerplate/lib/views/posts/) — **not** the
similarly-named [`lib/views/posts/[uuid]/`](../../../../flutter-boilerplate/lib/views/posts/[uuid]/)
folder, which is dead code. See [detail/screen.md § Known issues](./detail/screen.md#known-issues)
for the full finding — it's large enough (10 files, and it materially changes what mobile's post
detail screen can actually do) that it's worth flagging here too, before you go looking for it in the
wrong folder.

## Shared, vertical-wide docs

Like [messages](../messages/screen.md) and unlike a single-screen folder,
[hooks.md](./hooks.md) and [api.md](./api.md) live at this vertical's root, shared across all three
screens above.

## Known issues affecting this vertical

- [MOB-008](../../../issues.md#mob-008) — the real, routed `/posts/:uuid` screen
  ([detail/screen.md](./detail/screen.md)) has no edit-post, no reaction-breakdown, and no
  who-reacted UI at all; a separate, more fully-built implementation that does have all three exists
  in the codebase but is never wired into the router. Full evidence in
  [detail/screen.md § Known issues](./detail/screen.md#known-issues).
- [MOB-010](../../../issues.md#mob-010) — `lib/types/posts/post_summary.dart` and
  `lib/types/posts/post_media.dart` are dead code: neither `PostSummary` nor `PostMedia` has any
  reference anywhere outside its own definition file
  (`grep -rln "PostSummary\|PostMedia\b" flutter-boilerplate/lib` returns only the two definition
  files themselves). None of the three real screens in this vertical use these types — every real
  post/comment shape here comes from `types/feed/post.dart`/`comment.dart` instead (see
  [api.md](./api.md)).
