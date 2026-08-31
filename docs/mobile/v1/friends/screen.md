# Friends (screen)

**Route:** `/v1/:lang/friends` (GoRouter name `v1Friends`)
**Router registration:** [`router.dart#L458-464`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => FriendsPageView(lang: ...)`.
**Entry widget:** `FriendsPageView` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/friends/page_view.dart)
**Web equivalent:** [friends page](../../../frontend/v1/friends/page.md)

## What renders here

Same `TierGate` tier-branch pattern as every other tier-gated screen — and, matching the web page,
**no real tier differentiation**: all four tier widgets are typedefs or thin wrappers resolving to the
same [`FreeFriendsPage`](../../../../flutter-boilerplate/lib/views/friends/free_page_view.dart), which
itself is a one-line `build()` returning
[`FriendsPageContent`](#friendspagecontent--the-real-content). The three non-Free files even carry
doc comments explicitly noting they mirror web's `= FreePageView` re-exports.

## `FriendsPageContent` — the real content

[`friends_page_content.dart`](../../../../flutter-boilerplate/lib/views/friends/friends_page_content.dart) —
a single `ConsumerWidget`, no dedicated provider/notifier of its own beyond watching
`friendsListProvider` ([api.md](./api.md)). Renders an `EmptyWidget` (with a "Find friends" button) or
a `CardWidget` of clickable rows — avatar, name (falls back to email if no name — same rule as web),
email (shown only when it differs from the name), and a "Message" badge. Tapping a row sets
`selectedConversationUserIdProvider` (the same provider [messages](../messages/screen.md#state) reads)
and navigates to `/v1/$lang/messages` — **correctly interpolating the live `lang`**, unlike web's
equivalent action. See [Known issues](#known-issues).

## Known issues

- `FE-008` (resolved) — noted here for cross-reference only: this is a **web** bug, not
  a mobile one. Web's `FriendsPageContent.tsx` hardcodes `/v1/en/...` in its "Find friends" button and
  per-row navigation instead of using the current locale; this screen's equivalent
  (`friends_page_content.dart#L43,68,111`) correctly uses `lang` throughout, which is how the web gap
  was noticed while porting/comparing the two. See
  [frontend/v1/friends/page.md § Known issues](../../../frontend/v1/friends/page.md#known-issues).

## API

[api.md](./api.md) — reuses the same [messages](../messages/api.md) vertical's server files web's
equivalent page reuses, confirmed direct-REST-to-backend (no BFF — there is no BFF on this platform for
this vertical at all, see [conventions.md §9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)).
