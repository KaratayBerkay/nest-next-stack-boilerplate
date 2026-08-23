# v1 Home (screen)

**Route:** `/v1/:lang` (root, GoRouter name `v1Home`) · **Router registration:**
[`router.dart#L292-298`](../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `V1HomeContent` in
[`page_content.dart`](../../../flutter-boilerplate/lib/views/v1/home/page_content.dart)
**Web equivalent:** [v1 home page](../../frontend/v1/page.md)

> This screen doc lives directly under `mobile/v1/` (not a nested vertical folder) to mirror
> [frontend's `v1/page.md`](../../frontend/v1/page.md) 1:1 — both document the root of their
> respective authenticated shells. `lib/views/v1/home/` is **not** covered by
> [app-shell.md](../app-shell.md) (the chrome doc) — this is the one real screen inside `lib/views/v1/`,
> distinct from the shell files that wrap every screen including this one.

## What renders here

A minimal placeholder `StatelessWidget`: a small "Version v1 · locale {lang}" label, the localized
nav-home title (`t.v1ShellNavHome`) as a headline, and a muted hint sentence
(`t.v1ShellSwipeLeftToClose`). No data fetch, no interactive elements.

## Not a parity gap: web's home page is equally minimal

[Web's `v1/[lang]` page](../../frontend/v1/page.md) is likewise scaffold content, not a real dashboard
— it additionally demonstrates the route segment's error/not-found boundaries (links to `/boom` and
`/missing`), a Next.js-specific pattern with no natural Flutter equivalent to port. Both platforms
treat "Home" as the first, always-visible nav item pointing at otherwise-placeholder content — this is
consistent behavior across platforms, not one being behind the other.

## Backend endpoints this screen depends on

None.

## Known issues affecting this screen

None found specific to this screen.
