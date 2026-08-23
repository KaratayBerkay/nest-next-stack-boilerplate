# API Keys (screen)

**Route:** `/v1/:lang/settings/api-keys` (GoRouter name `v1SettingsApiKeys`)
**Router registration:** [`router.dart#L398-404`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => SettingsApiKeysPageContent(lang: state.pathParameters['lang'] ?? 'en')`.
**Entry widget:** `SettingsApiKeysPageContent` in
[`page_content.dart`](../../../../../flutter-boilerplate/lib/views/settings/api_keys/page_content.dart)
**Web equivalent:** [settings/api-keys page](../../../../frontend/v1/settings/api-keys/page.md)

## What renders here

`ConsumerWidget`, no tier branch. All key data comes from `apiKeysProvider` (a `FutureProvider`);
create/revoke go through `apiKeyActionsProvider`. **Every real widget on this screen is defined inline
inside `page_content.dart` itself** — the header row + create button, the list of `Card`s, and the
create dialog (`_showCreateDialog`, a `StatefulBuilder`-wrapped `AlertDialog`) are all private methods
of this one file. See [Known issues](#known-issues) — this matters because a *separate*, unused set of
widget files also exists for this exact same UI.

## Layout

Header row (title + "Create" `TextButton`) → `keysAsync.when(...)`: empty state is a centered message
+ create button, populated state is a `ListView` of `Card`s (name, active/disabled `Badge`, masked
prefix, created/expiry/last-used lines, role/tier badges, a trailing delete `IconButton`). Creating a
key opens an `AlertDialog` with a name field and `ChoiceChip` expiry presets
(`null`/7/30/90/365 days — same five options as web's `CreateApiKeyForm`), and successfully creating
one opens a **second** dialog (`_showKeyDialog`) showing the full key once, selectable, with no
copy-to-clipboard button (web's equivalent has one) — the user has to long-press-select-copy manually.

## Behavior notes vs. web

- No enabled/disabled toggle or rename action anywhere — same [CROSS-012](../../../../issues.md#cross-012)
  gap as web; the `Badge` here is exactly as read-only as web's.
- The "created key" dialog has no copy button (see above) — a small UX gap worth noting if this screen
  gets touched again, not severe enough for its own `issues.md` row.

## Widgets

**None** — despite a `widgets/`-shaped folder existing in source
(`lib/views/settings/api_keys/` contains `api_key_list.dart`, `create_api_key_form.dart`,
`api_key_handlers.dart` alongside `page_content.dart`), none of those three files are reachable from
this screen. See [Known issues](#known-issues).

## API

[api.md](./api.md) — **confirmed zero Next.js involvement**: all 3 real `lib/api/server/api_keys/*.dart`
files call the NestJS backend directly over GraphQL.

## Known issues

- ⚠ **Three dead widget files, mirroring the exact pattern found on
  [web's security page](../../../../frontend/v1/settings/security/api.md#known-issues) in this same
  run.** `api_key_list.dart` (`ApiKeyList`/`ApiKeyItem`), `create_api_key_form.dart`
  (`CreateApiKeyForm`), and `api_key_handlers.dart` (`ApiKeyHandlers`/`apiKeyHandlersProvider`) are
  each fully implemented, then never imported anywhere outside themselves — confirmed by
  `grep -rln "ApiKeyList(\|CreateApiKeyForm(\|apiKeyHandlersProvider" lib` returning only each file's
  own definition site (a second, unrelated `ApiKeyList` in `views/forms/api_key/api_key_list.dart`, the
  forms-gallery demo, is a different class in a different file — not a false negative here). The real
  screen, `page_content.dart`, reimplements the same list/create/revoke UI entirely inline instead.
  Logged jointly with the web-side instance as [CROSS-013](../../../../issues.md#cross-013), since the
  same failure shape appearing on both platforms in the same vertical looks like a pattern (a
  scaffolded-then-inlined page leaving its original component files behind) worth someone's attention,
  not two unrelated one-offs.
