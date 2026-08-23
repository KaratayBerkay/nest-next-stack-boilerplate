# v1 Home (page)

**Route:** `/v1/[lang]` (root) · **Source:** [`page.tsx`](../../../next-js-boilerplate/src/app/v1/[lang]/page.tsx)
**Mobile equivalent:** [v1 home screen](../../mobile/v1/screen.md)
**Nav label:** "Home" (`t.navHome`, `href: ""` in
[`V1Nav.tsx`](../../../next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx) — the first, always-visible
link) · listed in the page index as [../README.md § Home](../README.md)

## What renders here

Not a product landing page — a framework-pattern fixture demonstrating this route segment's own error
and not-found boundaries. Resolves `[lang]` inside a `<Suspense>` (`V1Content`, so the page still
builds cleanly under `cacheComponents`), shows the active locale (`data-testid="active-locale"`) and a
localized greeting (`data-testid="v1-greeting"`), then two links:

- **"Trigger a render error"** → `/v1/[lang]/boom` — caught by
  [`v1/[lang]/error.tsx`](../../../next-js-boilerplate/src/app/v1/[lang]/error.tsx) (the segment's
  error boundary)
- **"Visit a missing resource"** → `/v1/[lang]/missing` — caught by
  [`v1/[lang]/not-found.tsx`](../../../next-js-boilerplate/src/app/v1/[lang]/not-found.tsx) (HTTP 404)

Both target routes are themselves catalogued as demo fixtures in
[_reference/showcase-index.md](../_reference/showcase-index.md) rather than documented as standalone
pages. This is consistent with (not a gap versus) mobile's own home screen — see below.

## Not a parity gap: mobile's home screen is equally minimal

[Mobile's `v1/:lang` screen](../../mobile/v1/screen.md) (`V1HomeContent`) is just as much a placeholder
— locale label + nav-home text + a swipe-hint sentence, no error/not-found demo links (Flutter has no
equivalent server-error-boundary concept to demonstrate the same way). Both platforms' "Home" is the
first item in the authenticated shell's nav, and both render essentially scaffold content rather than
a real dashboard — this is parity, not one platform being behind the other.

## Backend endpoints this page depends on

None.

## Known issues affecting this page

None found specific to this page.
