# Mobile showcase / demo-gallery index

Catalogues Flutter's equivalent of the showcase/demo galleries web excludes from its real-page
docs — per [../README.md § Scope of this documentation](../README.md#scope-of-this-documentation).
Mirrors [../../frontend/_reference/showcase-index.md](../../frontend/_reference/showcase-index.md)'s
structure/grouping so the two are diffable. One line each, grouped by gallery. **Not documented
individually** — no `screen.md` exists or is planned for any route below.

Counted by registered `GoRoute` (the natural per-route unit, matching web's one-`page.tsx`-per-route
convention), not by `.dart` file count — Flutter splits each gallery screen's supporting widgets
across more files than routes (e.g. the UI-kit gallery is 67 routes but 76 files under
[`lib/views/ui/`](../../../flutter-boilerplate/lib/views/ui/)).


## UI-kit gallery — `v1/:lang/ui/*` (67 routes)

Source root: [`lib/views/ui/`](../../../flutter-boilerplate/lib/views/ui/) (76 `.dart` files). One route per
[`lib/components/ui/`](../../../flutter-boilerplate/lib/components/ui/) widget. **Missing versus web**
(confirmed by diffing the two platforms' registered route slugs exactly — web has these, mobile's
registered routes do not): `field-info-button`, `form-level-error`, `input`, `page-info` — not filed as
a new issue here since UI-kit gallery parity is outside this phase's assigned scope; noted for whoever
eventually audits gallery parity specifically.

| Route |
|---|
| `/v1/:lang/ui/accordion` |
| `/v1/:lang/ui/alert-dialog` |
| `/v1/:lang/ui/alert` |
| `/v1/:lang/ui/aspect-ratio` |
| `/v1/:lang/ui/avatar` |
| `/v1/:lang/ui/badge` |
| `/v1/:lang/ui/breadcrumb` |
| `/v1/:lang/ui/button` |
| `/v1/:lang/ui/calendar` |
| `/v1/:lang/ui/card` |
| `/v1/:lang/ui/carousel` |
| `/v1/:lang/ui/chart` |
| `/v1/:lang/ui/checkbox` |
| `/v1/:lang/ui/collapsible` |
| `/v1/:lang/ui/combobox` |
| `/v1/:lang/ui/command` |
| `/v1/:lang/ui/confirm-dialog` |
| `/v1/:lang/ui/context-menu` |
| `/v1/:lang/ui/counter` |
| `/v1/:lang/ui/data-table` |
| `/v1/:lang/ui/date-picker` |
| `/v1/:lang/ui/dialog` |
| `/v1/:lang/ui/drawer` |
| `/v1/:lang/ui/dropdown-menu` |
| `/v1/:lang/ui/dropdown` |
| `/v1/:lang/ui/emoji-picker` |
| `/v1/:lang/ui/empty` |
| `/v1/:lang/ui/error-boundary` |
| `/v1/:lang/ui/file-upload` |
| `/v1/:lang/ui/form-error-banner` |
| `/v1/:lang/ui/form-field-info` |
| `/v1/:lang/ui/hover-card` |
| `/v1/:lang/ui/image-upload` |
| `/v1/:lang/ui/input-group` |
| `/v1/:lang/ui/input-otp` |
| `/v1/:lang/ui/kbd` |
| `/v1/:lang/ui/label` |
| `/v1/:lang/ui/logo-spinner` |
| `/v1/:lang/ui/menubar` |
| `/v1/:lang/ui/native-select` |
| `/v1/:lang/ui/navigation-menu` |
| `/v1/:lang/ui/page-header` |
| `/v1/:lang/ui/pagination` |
| `/v1/:lang/ui/popover` |
| `/v1/:lang/ui/progress` |
| `/v1/:lang/ui/radio-group` |
| `/v1/:lang/ui/resizable` |
| `/v1/:lang/ui/scroll-area` |
| `/v1/:lang/ui/scroll-to-bottom-button` |
| `/v1/:lang/ui/select` |
| `/v1/:lang/ui/separator` |
| `/v1/:lang/ui/sheet` |
| `/v1/:lang/ui/skeleton` |
| `/v1/:lang/ui/slider` |
| `/v1/:lang/ui/spinner` |
| `/v1/:lang/ui/step-indicator` |
| `/v1/:lang/ui/switch` |
| `/v1/:lang/ui/table` |
| `/v1/:lang/ui/tabs` |
| `/v1/:lang/ui/textarea` |
| `/v1/:lang/ui/time-input` |
| `/v1/:lang/ui/toast` |
| `/v1/:lang/ui/toggle` |
| `/v1/:lang/ui/toggle-group` |
| `/v1/:lang/ui/tooltip` |
| `/v1/:lang/ui/typography` |
| `/v1/:lang/ui` (index) |

## Forms gallery — `v1/:lang/forms/*` (16 routes)

Source root: [`lib/views/forms/`](../../../flutter-boilerplate/lib/views/forms/) (95 `.dart` files — the largest gallery by
file count, though not by route count). Matches web's forms gallery 1:1, 16 routes on both
platforms.

| Route |
|---|
| `/v1/:lang/forms/advanced` |
| `/v1/:lang/forms/api-key` |
| `/v1/:lang/forms/billing` |
| `/v1/:lang/forms/checkout` |
| `/v1/:lang/forms/content-editor` |
| `/v1/:lang/forms/editable-table` |
| `/v1/:lang/forms/elements` |
| `/v1/:lang/forms/error-lab` |
| `/v1/:lang/forms/field-states` |
| `/v1/:lang/forms/filters` |
| `/v1/:lang/forms/form-builder` |
| `/v1/:lang/forms/layouts` |
| `/v1/:lang/forms/profile` |
| `/v1/:lang/forms/team-invite` |
| `/v1/:lang/forms/uploads` |
| `/v1/:lang/forms` (index) |

## Demos gallery — `v1/:lang/demos` (1 route)

Source root: [`lib/views/demos/`](../../../flutter-boilerplate/lib/views/demos/) (32 `.dart` files under one route,
internally sectioned rather than split into 23 separate routes like web's `(demos)` group — the
Next.js-specific concepts each web demo covers (PPR, SSR/CSR toggling, `next/font`, Server Actions,
etc.) don't map to 23 distinct Flutter concepts, so consolidation here is expected, not a gap.


## Gallery — `/gallery`, `/gallery/:id` (2 routes)

Source root: [`lib/views/gallery/`](../../../flutter-boilerplate/lib/views/gallery/). Mirrors web's grid-index +
detail-page pair; no equivalent of web's third, intercepting-route modal variant (Flutter/GoRouter
has no intercepting-route concept).


## Dashboard — `/dashboard` (1 route)

Source root: [`lib/views/dashboard/`](../../../flutter-boilerplate/lib/views/dashboard/). One consolidated screen — no
equivalent of web's `@analytics`/`@team` parallel-route slots (a Next.js-router-specific concept).


## Routing demos — `/routing/item/:itemId`, `/routing/post/:postId`, `/routing/slug/:slug` (3 routes)

Source root: [`lib/views/routing/`](../../../flutter-boilerplate/lib/views/routing/). A much smaller gallery than web's 12
routes — most of web's routing demos (redirect-perm/temp, metadata-demo, SSR/PPR streaming) are
Next.js-server-rendering concepts with no Flutter/client-app equivalent to demonstrate; the 3
dynamic-segment routes here are the genuinely portable subset.


## Boom — `/v1/:lang/boom` (1 route)

Source root: [`lib/views/boom/`](../../../flutter-boilerplate/lib/views/boom/) (1 file) — backs the `/v1/:lang/boom` route
only (mirrors web's `v1/[lang]/boom`); no top-level `/boom` route distinct from it exists on
mobile, unlike web (which has both `v1/[lang]/boom` and a second, separate `routing/boom`).

