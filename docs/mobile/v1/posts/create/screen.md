# Posts Create (screen)

**Route:** `/v1/:lang/posts/create` (GoRouter name `v1PostsCreate`)
**Router registration:** [`router.dart#L428-L434`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => PostCreatePageContent(lang: ...)`.
**Entry widget:** `PostCreatePageContent` in
[`create_page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/create_page_view.dart)
**Web equivalent:** none as a dedicated route — the equivalent flow is the
[share page](../../../../frontend/v1/share/page.md); see [posts/README.md](../README.md)

## What renders here

A minimal, no-tier-gate post composer: title + content `TextField`s and a "Create" text button in
the app bar. **No image picker at all** — unlike [share](../../share/screen.md), which has the full
image-pick/preview/upload flow, this screen only ever calls
`postActionsProvider.create(title: title, content: content)` with no `imageUrl` argument. A user who
wants to attach an image to a new post must use [share](../../share/screen.md) instead; this screen
cannot do it.

No validation beyond a non-empty check on both fields (`if (title.isEmpty || content.isEmpty)
return;`) — contrast [share](../../share/screen.md)'s title-length check (3-200 chars, matching the
backend DTO) and web's `minLength`/`maxLength` on the same field. A 1-character or 500-character
title both submit fine from this screen and either succeed or fail purely on the backend's own
`@MinLength(3)`/`@MaxLength(200)` validation (surfacing as a generic, unhandled GraphQL error here —
no try/catch around the `create()` call at all, unlike every other mutation call site in this
vertical).

On success, `context.pop()` — returns to whatever screen navigated here (normally
[posts list](../list/screen.md), via its `+` button) rather than navigating to the new post or the
feed.

## Calls

`postActionsProvider.create(title:, content:)` — see [api.md § Create a post](../../feed/api.md#shape-per-file) →
backend [post/endpoints.md#create-a-post](../../../../backend/social-content/post/endpoints.md#create-a-post).

## Known issues

None specific to this screen (the missing image picker and missing input-length validation are
real, minor UX gaps relative to [share](../../share/screen.md), but low enough impact — and
`share` already covers the same underlying need — that they aren't filed as separate issues here).
