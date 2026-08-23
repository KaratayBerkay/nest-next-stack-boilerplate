# Frontend showcase / demo-gallery index

Catalogues the 161 `page.tsx` files that exist to exercise the design system or a Next.js
framework pattern, not as real product functionality — per
[../README.md § Scope of this documentation](../README.md#scope-of-this-documentation).
One line each, grouped by gallery. **Not documented individually** — no `page.md` exists or is
planned for any route below; this index is the entire doc surface for these pages.


## Next.js framework-pattern demos — `(demos)` route group (23 pages)

Public, unauthenticated (`(demos)/layout.tsx`, no session check) — each demonstrates one Next.js
docs concept. Source root: [`src/app/(demos)/`](../../../next-js-boilerplate/src/app/(demos)/).


| Route | Demonstrates |
|---|---|
| `/caching` | `fetch` cache semantics |
| `/client-data` | client-side data fetching |
| `/csr-cookies` | reading cookies client-side |
| `/csr` | client-side rendering |
| `/data-fetching` | server-side data fetching |
| `/dynamic` | dynamic rendering |
| `/fonts` | `next/font` |
| `/form` | Server Actions form |
| `/images` | `next/image` |
| `/lazy-loading` | `next/dynamic` lazy import |
| `/observability` | instrumentation/observability hooks |
| `/ppr` | Partial Prerendering |
| `/request-memoization` | fetch request memoization |
| `/scripts` | `next/script` |
| `/search-params` | searchParams (server + client variants) |
| `/seo` | metadata/SEO API |
| `/server-actions` | Server Actions |
| `/sse` | Server-Sent Events |
| `/ssr-cookies` | cookies in SSR |
| `/ssr` | server-side rendering |
| `/static` | static rendering |
| `/theme` | theme/color-scheme switching |
| `/ws` | WebSocket demo |

## Demos index — `/demos` (1 page)

[`src/app/demos/page.tsx`](../../../next-js-boilerplate/src/app/demos/page.tsx) — a landing/index page linking into the
`(demos)` gallery above.


## Root splash — `/` (1 page)

[`src/app/page.tsx`](../../../next-js-boilerplate/src/app/page.tsx) — the bare site root. Not one of the 34 real pages in
[../README.md](../README.md)'s page-index table and not documented as its own `page.md`; included
here for inventory completeness (it is one of the 195 `page.tsx` files). Mixes a `DemoBadge`
("Next.js 16 · Tailwind v4") and a Tailwind/CSS-Modules/global-CSS styling showcase with real
sign-in/register/chat-room/messages links — part marketing splash, part framework demo.


## Dashboard — parallel-routes demo (3 pages)

[`src/app/dashboard/`](../../../next-js-boilerplate/src/app/dashboard/) — `page.tsx` + two parallel route slots
(`@analytics/page.tsx`, `@team/page.tsx`) demonstrating Next.js parallel routes. No Flutter
equivalent gallery entry (the concept is Next.js-router-specific) — see
[../../mobile/_reference/showcase-index.md](../../mobile/_reference/showcase-index.md).


## Gallery — intercepting-route demo (3 pages)

| Route | Demonstrates |
|---|---|
| `/gallery` | grid index |
| `/gallery/[id]` | detail page (direct navigation) |
| `/gallery/@modal/(.)[id]` | the *same* detail rendered as an intercepting-route modal when navigated from the grid — a Next.js-specific pattern with no Flutter equivalent |


## i18n locale-negotiation demo (1 page)

[`src/app/i18n/[lang]/page.tsx`](../../../next-js-boilerplate/src/app/i18n/[lang]/page.tsx) — paired with the `/i18n` →
`/i18n/{locale}` `Accept-Language`-based redirect in
[`proxy.ts`](../../../next-js-boilerplate/src/proxy.ts).


## Routing demos (12 pages)

Source root: [`src/app/routing/`](../../../next-js-boilerplate/src/app/routing/).

| Route | Demonstrates |
|---|---|
| `/routing/a` | basic route A (compare with `b`) |
| `/routing/boom` | a second render-error trigger, distinct from `v1/[lang]/boom` |
| `/routing/b` | basic route B |
| `/routing/items/[id]` | dynamic segment detail |
| `/routing/items` | dynamic segment list |
| `/routing/metadata-demo` | generateMetadata demo index |
| `/routing/metadata-demo/[slug]` | per-slug generateMetadata |
| `/routing/missing` | a second not-found trigger, distinct from `v1/[lang]/missing` |
| `/routing` (index) | routing gallery index |
| `/routing/redirect-perm` | permanent (308) redirect demo |
| `/routing/redirect-temp` | temporary (307) redirect demo |
| `/routing/slow` | artificial-latency streaming demo |

## Security demo (1 page)

[`src/app/security/csp/page.tsx`](../../../next-js-boilerplate/src/app/security/csp/page.tsx) — Content-Security-Policy
nonce demo. Flutter has no CSP concept — its own dead `nonce_panel.dart` (see
[MOB-001](../../issues.md#mob-001)) is the mobile side of this same gap, already documented.


## shadcnblocks marketing-block gallery — `v1/[lang]/pages/*` (27 pages)

Source root: [`src/app/v1/[lang]/pages/`](../../../next-js-boilerplate/src/app/v1/[lang]/pages/) — one route per
marketing-block category (each renders a shadcnblocks-style section example, not a real page).

| Route |
|---|
| `/v1/[lang]/pages/about` |
| `/v1/[lang]/pages/accept-invite` |
| `/v1/[lang]/pages/application-shell` |
| `/v1/[lang]/pages/background-pattern` |
| `/v1/[lang]/pages/banner` |
| `/v1/[lang]/pages/blog` |
| `/v1/[lang]/pages/blog-post` |
| `/v1/[lang]/pages/book-a-demo` |
| `/v1/[lang]/pages/careers` |
| `/v1/[lang]/pages/case-studies` |
| `/v1/[lang]/pages/chart-group` |
| `/v1/[lang]/pages/checkout` |
| `/v1/[lang]/pages/code-example` |
| `/v1/[lang]/pages/community` |
| `/v1/[lang]/pages/compare` |
| `/v1/[lang]/pages/compare-products` |
| `/v1/[lang]/pages/compliance` |
| `/v1/[lang]/pages/contact` |
| `/v1/[lang]/pages/cta` |
| `/v1/[lang]/pages/dashboard` |
| `/v1/[lang]/pages/data-table` |
| `/v1/[lang]/pages/deals` |
| `/v1/[lang]/pages/download` |
| `/v1/[lang]/pages/experience` |
| `/v1/[lang]/pages/faq` |
| `/v1/[lang]/pages/feature` |
| `/v1/[lang]/pages` (index) |

## Forms gallery — `v1/[lang]/forms/*` (16 pages)

Source root: [`src/app/v1/[lang]/forms/`](../../../next-js-boilerplate/src/app/v1/[lang]/forms/).

| Route |
|---|
| `/v1/[lang]/forms/advanced` |
| `/v1/[lang]/forms/api-key` |
| `/v1/[lang]/forms/billing` |
| `/v1/[lang]/forms/checkout` |
| `/v1/[lang]/forms/content-editor` |
| `/v1/[lang]/forms/editable-table` |
| `/v1/[lang]/forms/elements` |
| `/v1/[lang]/forms/error-lab` |
| `/v1/[lang]/forms/field-states` |
| `/v1/[lang]/forms/filters` |
| `/v1/[lang]/forms/form-builder` |
| `/v1/[lang]/forms/layouts` |
| `/v1/[lang]/forms/profile` |
| `/v1/[lang]/forms/team-invite` |
| `/v1/[lang]/forms/uploads` |
| `/v1/[lang]/forms` (index) |

## UI-kit gallery — `v1/[lang]/ui/*` (71 pages)

Source root: [`src/app/v1/[lang]/ui/`](../../../next-js-boilerplate/src/app/v1/[lang]/ui/) — one route per
[`src/components/ui/`](../../../next-js-boilerplate/src/components/ui/) component, demonstrating its
variants/states.

| Route |
|---|
| `/v1/[lang]/ui/accordion` |
| `/v1/[lang]/ui/alert-dialog` |
| `/v1/[lang]/ui/alert` |
| `/v1/[lang]/ui/aspect-ratio` |
| `/v1/[lang]/ui/avatar` |
| `/v1/[lang]/ui/badge` |
| `/v1/[lang]/ui/breadcrumb` |
| `/v1/[lang]/ui/button` |
| `/v1/[lang]/ui/calendar` |
| `/v1/[lang]/ui/card` |
| `/v1/[lang]/ui/carousel` |
| `/v1/[lang]/ui/chart` |
| `/v1/[lang]/ui/checkbox` |
| `/v1/[lang]/ui/collapsible` |
| `/v1/[lang]/ui/combobox` |
| `/v1/[lang]/ui/command` |
| `/v1/[lang]/ui/confirm-dialog` |
| `/v1/[lang]/ui/context-menu` |
| `/v1/[lang]/ui/counter` |
| `/v1/[lang]/ui/data-table` |
| `/v1/[lang]/ui/date-picker` |
| `/v1/[lang]/ui/dialog` |
| `/v1/[lang]/ui/drawer` |
| `/v1/[lang]/ui/dropdown-menu` |
| `/v1/[lang]/ui/dropdown` |
| `/v1/[lang]/ui/emoji-picker` |
| `/v1/[lang]/ui/empty` |
| `/v1/[lang]/ui/error-boundary` |
| `/v1/[lang]/ui/field-info-button` |
| `/v1/[lang]/ui/file-upload` |
| `/v1/[lang]/ui/form-error-banner` |
| `/v1/[lang]/ui/form-field-info` |
| `/v1/[lang]/ui/form-level-error` |
| `/v1/[lang]/ui/hover-card` |
| `/v1/[lang]/ui/image-upload` |
| `/v1/[lang]/ui/input-group` |
| `/v1/[lang]/ui/input-otp` |
| `/v1/[lang]/ui/input` |
| `/v1/[lang]/ui/kbd` |
| `/v1/[lang]/ui/label` |
| `/v1/[lang]/ui/logo-spinner` |
| `/v1/[lang]/ui/menubar` |
| `/v1/[lang]/ui/native-select` |
| `/v1/[lang]/ui/navigation-menu` |
| `/v1/[lang]/ui/page-header` |
| `/v1/[lang]/ui/page-info` |
| `/v1/[lang]/ui/pagination` |
| `/v1/[lang]/ui/popover` |
| `/v1/[lang]/ui/progress` |
| `/v1/[lang]/ui/radio-group` |
| `/v1/[lang]/ui/resizable` |
| `/v1/[lang]/ui/scroll-area` |
| `/v1/[lang]/ui/scroll-to-bottom-button` |
| `/v1/[lang]/ui/select` |
| `/v1/[lang]/ui/separator` |
| `/v1/[lang]/ui/sheet` |
| `/v1/[lang]/ui/skeleton` |
| `/v1/[lang]/ui/slider` |
| `/v1/[lang]/ui/spinner` |
| `/v1/[lang]/ui/step-indicator` |
| `/v1/[lang]/ui/switch` |
| `/v1/[lang]/ui/table` |
| `/v1/[lang]/ui/tabs` |
| `/v1/[lang]/ui/textarea` |
| `/v1/[lang]/ui/time-input` |
| `/v1/[lang]/ui/toast` |
| `/v1/[lang]/ui/toggle-group` |
| `/v1/[lang]/ui/toggle` |
| `/v1/[lang]/ui/tooltip` |
| `/v1/[lang]/ui/typography` |
| `/v1/[lang]/ui` (index) |

## v1 error/not-found demo fixtures (2 pages)

`/v1/[lang]/boom` and `/v1/[lang]/missing` — linked from [../v1/page.md](../v1/page.md); not
listed again here as a table since both are already fully described there.

