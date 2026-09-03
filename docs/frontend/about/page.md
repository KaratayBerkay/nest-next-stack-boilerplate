# About (page)

**Route:** `/about` · **Source:** [`page.tsx`](../../../next-js-boilerplate/src/app/(marketing)/about/page.tsx)
(real source folder is `src/app/(marketing)/about/` — `(marketing)` is a Next.js **route group**,
invisible in the actual URL, dropped from this doc path the same way dynamic `[segments]` are per
[conventions.md §1](../../conventions.md#1-folder-structure-rule))
**Layout:** [`(marketing)/layout.tsx`](../../../next-js-boilerplate/src/app/(marketing)/layout.tsx) —
the same genuinely public shell [pricing](../pricing/page.md) uses (logo, a "Pricing" nav link, theme
toggle), no session check of any kind
**Mobile equivalent:** [about screen](../../mobile/about/screen.md)

## What renders here

A minimal static page: an `<h1 data-testid="page-heading">About</h1>` and one sentence noting it's
served at `/about` with the `(marketing)` group prefix dropped from the URL. No data fetch, no client
component, no session dependency — genuinely public.

## ⚠ No in-app nav link reaches this page on either platform

`(marketing)/layout.tsx`'s own header nav has exactly one link ("Pricing") — `/about` isn't referenced
there, in [`V1Nav.tsx`](../../../next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx), or anywhere else
with an `href` (`grep -rn '"/about"\|href.*about' next-js-boilerplate/src` outside this route's own
files matches only [`sitemap.ts`](../../../next-js-boilerplate/src/app/sitemap.ts) — an SEO listing,
not a clickable link — and [`proxy.ts`](../../../next-js-boilerplate/src/proxy.ts)'s unrelated
`/old-about → /about` legacy-redirect demo). The page works correctly and isn't gated behind
auth — it's simply undiscoverable by clicking around the app; a visitor reaches it only via a direct
URL, the sitemap, or a search engine. See `CROSS-038` (resolved) — mobile has the identical
gap, via a richer page.

## Backend endpoints this page depends on

None.

## Known issues affecting this page

- `CROSS-038` (resolved) — no discoverable nav entry point on either platform (see above).
