# User Detail (screen)

**Route:** `/v1/:lang/users/detail/:uuid` (GoRouter name `v1UserDetail`) — also reachable via
`/v1/:lang/users/:userId` (name `v1UserDetailLegacy`), a plain redirect to this same path.
**Router registration:** [`router.dart#L529-538`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`redirect: (_, state) => requireAdmin(...)`; see
[../README.md](../README.md#read-this-before-assuming-parity-with-web).
**Entry widget:** `UserDetailPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/users/detail/page_view.dart)
**Web equivalent:** [users/detail page](../../../../frontend/v1/users/detail/page.md) — **not a
parity match**, see [../README.md](../README.md)

## What renders here

A `ConsumerWidget` reading a `userId` constructor param (from the route's `:uuid`/`:userId` segment)
and watching `_userDetailProvider(userId)` — avatar, name, email, bio, a tier badge, and an "Add
Friend" button calling `friendActionsProvider.sendRequest(user.id)`.

## Known issues

- [MOB-003](../../../../issues.md#mob-003) — **`_userDetailProvider` ignores its own `userId` parameter
  and always shows the caller's own profile.**

  ```dart
  final _userDetailProvider = FutureProvider.family((ref, String userId) async {
    final server = ref.read(profileGetServerProvider);
    return server.call();          // ← userId is never read anywhere in this body
  });
  ```

  `profileGetServerProvider` →
  [`ProfileGetServer.call()`](../../../../../flutter-boilerplate/lib/api/server/profile/get.dart)
  takes **zero arguments** and always issues the `myProfile` GraphQL query, which the backend resolves
  entirely from `@CurrentUser()` — there is no backend query anywhere in the schema that accepts a
  target user id and returns *another* user's profile (confirmed: `grep -n "^type Query" -A 60
  nest-js-boilerplate/src/schema.gql` has no `user(id: ...)`-shaped entry; see
  [social-content/profile/README.md](../../../../backend/social-content/profile/README.md)). So this
  screen structurally **cannot** show the tapped user's data today, regardless of the `userId` bug —
  fixing the provider to thread `userId` through still has nowhere to send it. A real fix needs either
  a new backend query, or (simpler, given the callers already have the data) passing the already-fetched
  friend/search row through navigation `extra` instead of re-fetching by id at all.

  **Consequence for "Add Friend":** the button below calls
  `friendActionsProvider.sendRequest(user.id)`, where `user` is the caller's own profile — so it always
  attempts to send a friend request **to yourself**, which the backend rejects with `403
  EX_FORBIDDEN` (self-friending — see
  [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)).
  The one interactive element on this screen cannot succeed for any user it's tapped for.

  **Reachability**: this screen requires `ADMIN`/`SUPERADMIN` role to reach at all (see
  [../README.md](../README.md)), so the practical blast radius is small — but it's the *only* code
  path in either app that attempts to show one user's profile to another, and it's completely
  non-functional.
