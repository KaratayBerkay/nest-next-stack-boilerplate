# Sessions (screen)

**Route:** `/v1/:lang/settings/sessions` (GoRouter name `v1SettingsSessions`)
**Router registration:** [`router.dart#L391-397`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => SettingsSessionsPageContent(lang: state.pathParameters['lang'] ?? 'en')`.
**Entry widget:** `SettingsSessionsPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/sessions/page_view.dart)
**Web equivalent:** [settings/sessions page](../../../../frontend/v1/settings/sessions/page.md)

## What renders here

`ConsumerWidget`, no tier-branch split (unlike [messages](../../messages/screen.md)'s 4-file
`TierGate` pattern — this screen, like its web counterpart, has no tier-specific behavior to branch
on at all, so it was never given the tier-view treatment in the first place). Wrapped in
`SettingsShellScaffold` for the shared nav rail/tab row (see
[settings/README.md](../README.md)). All state is `sessionsProvider`
(`FutureProvider`-backed, defined in `api/client/sessions/query.dart`) — no local `State` class,
unlike web's `FreePageView` which owns `useState` directly.

## Layout

Single-column: a header row (title + "Log out all other sessions" button, shown unconditionally — web
only shows it when `sessions.length > 1`, see [Known issues](#known-issues)), then
`sessionsAsync.when(...)` branching loading/error/data, rendering one `Card`/`ListTile` per session —
current session gets a green "Current" `Badge` and no revoke button, everything else gets a text
"Revoke" button. Device labeling is inline (`_friendlyDeviceLabel`, a private top-level function in
this same file) rather than a separate widget — no `SessionCard`-equivalent file exists on mobile; the
web component of that name is documented as its own file only because web factored it out, not because
the UI itself is meaningfully more complex here.

## Behavior notes vs. web

- **"Log out all other sessions" is always visible here**, even with only one session (the current
  one) in the list — web's [`FreePageView`](../../../../frontend/v1/settings/sessions/page.md) hides
  the equivalent button when `sessions.length <= 1`. Tapping it with nothing else to revoke is harmless
  (`revokeAllOtherSessions` returns `false` for "nothing to revoke," not an error — see
  [sessions/endpoints.md#revoke-all-other-sessions](../../../../backend/identity-access/sessions/endpoints.md#revoke-all-other-sessions)),
  just a minor UI-parity gap, not a functional bug.
- **No "Trusted" badge, no expandable device-info block** — web's `SessionCard` renders both; this
  screen's `Session` model (a local class in `api/server/sessions/list.dart`, distinct from web's
  `SessionInfo` type) doesn't even carry a `trusted` field — the GraphQL query this screen sends
  (`api.md`) simply doesn't request `trusted` or `deviceType`, even though the backend `mySessions`
  field supports both.
- Uses `ref.invalidate(sessionsProvider)` to refresh after a revoke, rather than optimistic local-list
  filtering the way web's `FreePageView` does (`setSessions((prev) => prev.filter(...))`) — a full
  re-fetch instead of a client-side patch. Functionally equivalent, just a different refresh strategy.

## API

[api.md](./api.md) — all 4 operations are **direct GraphQL to the backend**, confirmed by reading
every file in `lib/api/server/sessions/`, no BFF involvement (mobile has no BFF layer at all for this
vertical — see [conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)).

## Known issues

- Minor UI-parity gaps vs. web noted inline above (always-visible "log out others" button, no
  trusted/device-info display) — none severe enough for an `issues.md` row on their own; flagged here
  for anyone doing a close parity pass on this vertical later.
