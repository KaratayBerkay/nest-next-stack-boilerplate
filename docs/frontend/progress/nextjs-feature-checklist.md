# Next.js Docs — Full Feature Checklist (the mapping / test matrix)

> Goal: implement **every relevant feature in the Next.js docs** and prove each one works,
> so the result is a battle-tested boilerplate. This is the source of truth for coverage —
> the **mapping** from each docs feature → where it lives in `src/` → the test that proves it.

**Status legend**

| Mark | Meaning |
| --- | --- |
| ⬜ | Not started |
| 🔵 | In progress |
| ✅ | Implemented (code written) |
| 🧪 | **Verified** — an automated test proves it behaves as the docs describe |
| ⚠️ | **Docs issue** — example did not work as written (see Docs issues log) |
| ⏭️ | Skipped / out of scope (decision logged in [`README.md`](README.md)) |

**Conventions**
- Each feature = a real route/module under `src/` where practical, exercised by an e2e (Playwright) or unit/component (Vitest) test.
- "Verified" requires a test, not just a build.
- Built from the Next.js 16 App Router docs (2026-06). Reconcile against the live left sidebar at <https://nextjs.org/docs> as we go; add new/renamed pages.
- **Planned location / proof** columns are intent until the feature lands (then they become real paths).

Counts update as we progress: **56 / ~60 verified** (🧪), 3 logged docs issues (⚠️: #25 runtime, #59 CSP-nonce-vs-PPR, #18 dynamicParams-vs-cacheComponents). Internationalization (#18) is now implemented (previously out of scope). _Stages 0–6 done (Foundation, Routing, Rendering, Data, Backend/cookies, Real-time, Optimizing, Config); plus Security (CSP nonce + `server-only`), Instrumentation/OTel (F33), i18n (locale routing), and SEO (sitemap, robots.txt, JSON-LD structured data)._

---

## Foundation
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 1 | Installation / scaffold (create-next-app) | 🧪 | repo root, `src/app/` | `pnpm build` + `pnpm lint` green (commit `2adb7c4`); Playwright GET `/` deferred to F5 harness |
| 2 | Project structure (`src/`, `@/*`, feature-driven) | 🧪 | `src/{app,features,shared,hooks,lib,types}` + `src/README.md` | build+lint+tsc green (`50ade6d`); `shared/site.ts` imports `@/lib` (cross-layer alias resolves) |
| 3 | TypeScript (strict) | 🧪 | `tsconfig.json` | `pnpm typecheck` clean (`1c7f774`+) |
| 4 | ESLint + Prettier | 🧪 | `eslint.config.mjs`, `.prettierrc`, `eslint-config-prettier` | `pnpm lint` 0 warnings + `pnpm format:check` clean (`23e1ea4`) |
| 5 | Tailwind CSS v4 (CSS-first `@theme`) + CSS Modules + global CSS | 🧪 | `src/app/globals.css`, `src/shared/ui/Badge.*`, `src/app/page.tsx` | compiled CSS contains `--color-brand`/`text-brand`, `.surface`, hashed `badge` (`46ae083`); e2e render deferred to F5 |
| 6 | Environment variables (zod-validated) | 🧪 | `src/lib/env.ts`, `.env.example` | `src/lib/env.test.ts` — defaults applied, invalid ws/backend URL rejected (`0c94790`) |

## Routing
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 7 | Layouts & pages | 🧪 | `src/app/routing/{layout,page}.tsx` + `routing/{a,b}/page.tsx`, `src/shared/ui/Counter.tsx` | `e2e/routing-layout.spec.ts` — layout counter preserved across `<Link>` nav while page counter resets (`34cfc61`) |
| 8 | Linking & navigating (`<Link>`, `useRouter`) | 🧪 | `src/shared/ui/NavLink.tsx`, `src/app/routing/_components/RouterNav.tsx` | `e2e/routing-nav.spec.ts` — window tag survives `<Link>`/`router.back`/`router.push` (no reload); `usePathname` + `aria-current` update (`f2e7897`) |
| 9 | Dynamic routes (`[id]`, async `params`) | 🧪 | `src/app/routing/items/[id]/page.tsx` (+ index) | `e2e/routing-dynamic.spec.ts` — async `params` awaited; id present in server-rendered HTML; build marks route `ƒ` dynamic (`711b11c`) |
| 10 | Route groups `(group)` | 🧪 | `src/app/(marketing)/{layout,about,pricing}` | `e2e/routing-groups.spec.ts` — /about & /pricing 200 inside the group layout; /marketing/about 404 (group name not in URL) (`76b4edc`) |
| 11 | Parallel routes (`@slot`) | 🧪 | `src/app/dashboard/{layout,@team,@analytics}` (+ slot `default.tsx`) | `e2e/routing-parallel.spec.ts` — main + both named slots visible together at /dashboard (`bfb6f3a`) |
| 12 | Intercepting routes (`(.)`) | 🧪 | `src/app/gallery/{layout,page,[id],@modal/(.)[id],@modal/default}` | `e2e/routing-intercepting.spec.ts` — soft nav overlays modal (list stays mounted); hard nav shows full page, no modal (`5e523a2`) |
| 13 | Loading UI & streaming (`loading.tsx`, `<Suspense>`) | 🧪 | `src/app/routing/slow/{loading,page}.tsx` | `e2e/routing-loading.spec.ts` — loading.tsx fallback→shell on soft nav; `<Suspense>` fallback→streamed content on committed hard load (`ea8e644`) |
| 14 | Error handling (`error.tsx`, `not-found.tsx`) | 🧪 | `src/app/routing/boom/{page,Boom,error}`, `routing/missing/page`, `routing/not-found` | `e2e/routing-error.spec.ts` — thrown render error shows error.tsx + reset; notFound() → 404 + not-found.tsx (`954d02f`) |
| 15 | Redirecting (`redirect`, `permanentRedirect`) | 🧪 | `src/app/routing/redirect-{temp,perm}/page.tsx` | `e2e/routing-redirect.spec.ts` — 307 + Location /routing/a; 308 + Location /routing/b; follow lands on target (`377c33d`) |
| 16 | Route Handlers (`route.ts`, Web Request/Response) | 🧪 | `src/app/api/echo/route.ts` | `e2e/routing-route-handler.spec.ts` — GET echoes ?name as JSON; POST round-trips body (201) (`b323b03`) |
| 17 | `proxy.ts` (Next 16 middleware rename) | 🧪 | `src/proxy.ts` | `e2e/routing-proxy.spec.ts` — x-proxy header on matched routes; legacy /old-about 308 → /about; `/api` excluded by matcher (`fee6654`) ⚠️ file must be `src/proxy.ts` (not root) with `export function proxy` (not `middleware`) |
| 18 | Internationalization (routing) | 🧪 | `src/app/i18n/[lang]/{layout,page,LocaleSwitcher}.tsx` (locale-scoped, like `/security`); `src/lib/i18n/{config,dictionaries}.ts` + per-locale JSON dictionaries (en/tr/de); `Accept-Language` negotiation + invalid-locale 404 in `src/proxy.ts` | `e2e/i18n.spec.ts` (5) — bare `/i18n` 307→`Accept-Language` match (tr) / falls back to en; en/tr/de each server-rendered from its dictionary; unsupported `/i18n/fr` → 404; UI locale switch updates content with no full reload. `src/lib/i18n/config.test.ts` (5) — `matchLocale` q-weight negotiation. ⚠️ see Docs issues log (#18 `dynamicParams` vs `cacheComponents`) |
| 19 | Metadata & `generateMetadata` | 🧪 | `src/app/layout.tsx` (root template), `src/app/routing/metadata-demo/{page,[slug]/page}.tsx` | `e2e/routing-metadata.spec.ts` — root default title; static page custom title + OG; dynamic `generateMetadata` per slug (`037dafd`) |
| 33 | Search params (`searchParams` prop + `useSearchParams`) | 🧪 | `src/app/search-params/…` — server reads the `searchParams` prop; a client island reads `useSearchParams()` | `e2e/search-params.spec.ts` — server reads the prop; client reads via hook; links update params without a full reload (`30bb0bd`) |
| 34 | Sitemap (`sitemap.ts`) | 🧪 | `src/app/sitemap.ts` — dynamic `MetadataRoute.Sitemap` listing all static routes + versioned locale pages | `e2e/seo.spec.ts` — `/sitemap.xml` returns 200 with `<urlset>`, contains `/routing` and `/v1/en` |
| 35 | Robots (`robots.ts`) | 🧪 | `src/app/robots.ts` — `MetadataRoute.Robots` allowing all crawling, disallowing `/api/`, linking sitemap | `e2e/seo.spec.ts` — `/robots.txt` contains `User-Agent: *`, `Disallow: /api/`, `Sitemap:` |
| 36 | JSON-LD structured data (`<script type="application/ld+json">`) | 🧪 | `src/shared/ui/JsonLd.tsx` — reusable component; `WebSite` schema in root layout; `BreadcrumbList` schema on `/seo` demo page | `e2e/seo.spec.ts` — root layout renders `WebSite` JSON-LD; `/seo` renders `BreadcrumbList` with 2 items |

## Rendering
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 20 | Server-Side Rendering (RSC, dynamic) | 🧪 | `src/app/(demos)/ssr/page.tsx` | `e2e/rendering-ssr-csr.spec.ts` — data present in **initial HTML**; `getByTestId` confirms visible on load |
| 21 | Client-Side Rendering (`"use client"`) | 🧪 | `src/app/(demos)/csr/page.tsx` | `e2e/rendering-ssr-csr.spec.ts` — data **absent** in initial HTML; loading→fetched on mount |
| 22 | Static rendering (default cache) | 🧪 | `src/app/(demos)/static/page.tsx` | `e2e/rendering-static-dynamic.spec.ts` — timestamp present in HTML via `request.get()` |
| 23 | Dynamic rendering (`force-dynamic`) | 🧪 | `src/app/(demos)/dynamic/page.tsx` | `e2e/rendering-static-dynamic.spec.ts` — timestamp on every request; `getByTestId` visible |
| 24 | Partial Prerendering (PPR) | 🧪 | `src/app/(demos)/ppr/page.tsx` (via `cacheComponents: true`) | `e2e/rendering-ppr.spec.ts` — static shell served immediately; cookie-based greeting streams at request time |
| 25 | Runtimes (Node vs Edge) | ⚠️ | — | Blocked by `cacheComponents: true`. In Next.js 16 with CC enabled, `export const runtime` is removed; all pages use Node.js runtime. Edge runtime is only available in `proxy.ts`. |

## Data fetching & caching
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 26 | Server data fetching (`fetch` in RSC) | 🧪 | `src/app/(demos)/data-fetching/page.tsx` — async RSC fetches `/api/data` via `fetch` inside `<Suspense>` | `e2e/data-fetching.spec.ts` — data name, id, nested.value in initial HTML |
| 27 | Request memoization (`React.cache`) | 🧪 | `src/app/(demos)/request-memoization/page.tsx` — uncached vs `React.cache`'d async function; same-argument calls demonstrated | `e2e/request-memoization.spec.ts` — uncached shows different counts, cached shows same; `src/lib/dedup.test.ts` — uncached counter increments per call |
| 28 | Caching & revalidating (`revalidate`, tags, `revalidatePath`, `revalidateTag`) | 🧪 | `src/app/(demos)/caching/page.tsx` — `cacheLife` + `cacheTag` + inline Server Actions for on-demand revalidation | `e2e/caching.spec.ts` — revalidatePath and revalidateTag both serve fresh content after purge |
| 29 | Server Actions & mutations (`useActionState`/`useFormStatus`) | 🧪 | `src/app/(demos)/server-actions/page.tsx` + `actions.ts` + `GreetingForm.tsx` — form with Server Action, `useActionState` for result, `useFormStatus` for pending button | `e2e/server-actions.spec.ts` — fill name, submit, greeting appears |
| 30 | Client data (TanStack Query) | 🧪 | `src/hooks/useApi.ts` (tanstack/react-query), `src/shared/api/QueryProvider.tsx`, `src/app/(demos)/client-data/page.tsx` | `e2e/client-data.spec.ts` — loading state in initial HTML, data appears after hydration |
| 31 | Incremental Static Regeneration (ISR) | 🧪 | `src/app/(demos)/caching/page.tsx` — `cacheLife` with `revalidate: 120` produces static page with 2m revalidation | build output shows `○ /caching 2m` — ISR active |
| 32 | Forms — TanStack Form + Zod (client + server validation) | 🧪 | `src/app/(demos)/form/{page,Form}.tsx` + `src/lib/forms/signup-options.ts` + `src/actions/signup.ts` — `@tanstack/react-form-nextjs` signup form: **field-level** Zod validators (`onChange`+`onBlur`, kept per-field so a stale error can't linger on a field fixed without re-blur) + `createServerValidate`/`mergeForm` running the same rules server-side via a `"use server"` action | `e2e/form.spec.ts` (5) — initial values; blur surfaces errors; errors clear on valid input; submit enables only when valid; valid submit runs the Server Action → success banner |

## Backend integration & cookies (the core)
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 42 | Reading cookies (`cookies()` in RSC/handlers) | 🧪 | `src/app/(demos)/ssr-cookies/page.tsx` — `cookies()` in RSC + `<Suspense>`; `src/lib/backend.ts` — server fetch with cookie forwarding | `e2e/cookie-auth.spec.ts` — SSR cookie in initial HTML |
| 43 | Setting cookies (Route Handler / Server Action) | 🧪 | `src/app/api/auth/login/route.ts` — sets `access_token` cookie (non-httpOnly, accessible to client) via `NextResponse`; proxy forwards `refresh_token` httpOnly from NestJS | `e2e/cookie-auth.spec.ts` — `/api/auth/login` validates + proxies |
| 44 | BFF proxy — forward credentials to NestJS | 🧪 | `src/app/api/auth/{login,register,logout,refresh,me}/route.ts` — BFF route handlers call NestJS GraphQL via `graphqlFetch`; `src/app/api/proxy/[...path]/route.ts` — generic proxy | `e2e/auth.spec.ts` — `/api/auth/me` returns `{ user: null }` when unauthenticated |
| 45 | Real auth via NestJS GraphQL (login/register/logout/refresh/me) | 🧪 | `src/app/api/auth/{login,register,logout,refresh,me}/route.ts`; `src/hooks/useAuth.tsx` — `AuthProvider` + `useAuth`; `src/app/(demos)/auth/{login,register}/page.tsx` — auth forms; `src/shared/ui/AuthStatus.tsx` — sign in/out | `e2e/auth.spec.ts` (5 tests) — login form renders, register form renders, link nav works, `/api/auth/me` returns null, Sign In link visible. `e2e/cookie-auth.spec.ts` (5 tests) — API endpoint validation, SSR cookie status, AuthStatus visibility |
| 46 | CORS / `credentials` interplay (when calling NestJS) | 🧪 | BFF proxy forwards cookies via server-side `fetch` (no CORS needed); NestJS `enableCors({ origin: true, credentials: true })` | verified by proxy forwarding flow |

## Security & data protection
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 59 | Content Security Policy — nonce via `proxy.ts` | 🧪 | `src/proxy.ts` — per-request nonce + strict CSP (`'strict-dynamic'`, `object-src 'none'`, `frame-ancestors 'none'`) scoped to `/security/*`; `src/app/security/csp/page.tsx` reads `x-nonce` via `headers()` (dynamic, in `<Suspense>`) | `e2e/security-csp.spec.ts` — CSP header carries `'strict-dynamic'` + a per-request `'nonce-…'`; nonce differs each request; the page renders the nonce it received; non-`/security` routes carry no nonce CSP (`93418ad`) ⚠️ see Docs issues log (CSP nonce vs `cacheComponents`) |
| 60 | Data security — `server-only` guardrail | 🧪 | `src/lib/backend.ts` — `import "server-only"` so an accidental client import of the BFF helper (reads `BACKEND_URL` + forwards cookies) becomes a build error; tainting (`experimental.taint`) documented as an optional extra layer, not enabled | `pnpm build` green proves no client module imports the server-only BFF helper |

## Real-time
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 47 | Server-Sent Events (Route Handler `ReadableStream`) | 🧪 | `src/app/api/sse/route.ts` — `ReadableStream` emitting `text/event-stream` every 500ms; `src/hooks/useSSE.ts` — `EventSource` lifecycle | `e2e/sse.spec.ts` — connects, streams events, stops after navigation |
| 48 | WebSocket consumed from NestJS gateway | 🧪 | `src/hooks/useWebSocket.ts` — native `WebSocket` auto-reconnect; `src/app/(demos)/ws/page.tsx` — connect, send, receive | `e2e/websocket.spec.ts` — page renders gracefully (full round-trip requires NestJS gateway running) |

## Optimizing
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 49 | Images (`next/image`) | 🧪 | `/images` — local SVG, external (`picsum.photos`), `priority`, `sizes`, `remotePatterns` in config | `e2e/images.spec.ts` — local alt, external `/_next/image` srcset, sizes attr |
| 50 | Fonts (`next/font`) | 🧪 | Root layout — `Geist` + `Geist_Mono` CSS variables; `/fonts` demo page | `e2e/fonts.spec.ts` — computed `font-family` includes "geist" |
| 51 | Scripts (`next/script`) | 🧪 | `/scripts` — `afterInteractive` + `lazyOnload` inline Script components | `e2e/scripts.spec.ts` — console logs from each strategy |
| 52 | Lazy loading (`next/dynamic`) | 🧪 | `/lazy-loading` — `next/dynamic` with loading fallback; separate chunk via `HeavyComponent` | `e2e/lazy-loading.spec.ts` — lazy component renders with content |

## Configuring & ops
| # | Doc page | Status | Planned location | Planned proof |
| --- | --- | --- | --- | --- |
| 53 | Absolute imports / module aliases | 🧪 | `tsconfig.json` | build + tests resolve `@/*` (`1c7f774`) |
| 54 | Vitest (unit/component) | 🧪 | `vitest.config.ts`, `*.test.ts(x)` | `pnpm test` green — 7 tests (`1c7f774`) |
| 55 | Playwright (e2e) | 🧪 | `e2e/home.spec.ts`, `playwright.config.ts` | `pnpm test:e2e` green on dedicated port 3100 (`1c7f774`) |
| 56 | Build & deploy (self-hosted Node, `output: standalone`) | 🧪 | `next.config.ts` — `output: standalone`; `Dockerfile` — multi-stage (`node:22-alpine`); `docker-compose.yml`; `.dockerignore` | `e2e/standalone.spec.ts` — `docker build` → `docker run` → HTTP 200 |
| 57 | CI (GitHub Actions) | 🧪 | `.github/workflows/ci.yml` | green run #28318606988 (1m17s) on `23e1ea4`: install→typecheck→lint→format:check→test→build→e2e |
| 58 | Git hooks (husky/lint-staged/commitlint) | 🧪 | `.husky/{pre-commit,commit-msg,pre-push}` | proven live on `23e1ea4`: lint-staged + commitlint ran on commit, tsc on push; bad msg rejected |
| 33 | Instrumentation + OpenTelemetry + production checklist | 🧪 | `src/instrumentation.ts` (`register` + `onRequestError`) + `@vercel/otel` in-memory span processor; `/observability` + `/api/observability`; [`production-checklist.md`](production-checklist.md) | `e2e/observability.spec.ts` — startup marker present + custom `observability.check` span exported |
| — | Frontend event logging → Kafka → Elasticsearch | 🔵 | `src/lib/event-logger.ts` client batching → `src/app/api/events/route.ts` BFF → `kafkajs` producer (`src/lib/kafka.ts`) → topic `frontend-events` → `FrontendEventConsumer` (NestJS) → ES index `frontend-events` | `src/hooks/useEventLogger.ts` auto-captures errors + page views; `sendBeacon` fallback on unload |

---

## Docs issues log (⚠️)
> What the docs say → what actually happened → the fix. Accumulates as features land.

**#25 — Runtimes (Node vs Edge).** Docs show `export const runtime = "edge"`. With
`cacheComponents: true` enabled app-wide, Next.js 16 removes the `runtime` segment
option — all pages run on the Node.js runtime; Edge is only available inside `proxy.ts`.
→ Left as Node-only; logged, not worked around.

**#59 — CSP nonce vs `cacheComponents` (PPR).** The CSP guide's `proxy.ts` nonce
recipe assumes the whole app is dynamically rendered: a fresh nonce per request can
only be injected during SSR. This boilerplate runs `cacheComponents: true`, so most
routes are statically prerendered (PPR) and their shell scripts can't carry a
per-request nonce — the docs even note "PPR is incompatible with nonce-based CSP."
→ Fix: scope the strict nonce CSP to `/security/*` in the proxy and let that page opt
into dynamic rendering (reads `x-nonce` via `headers()` inside `<Suspense>`), so the
nonce flows through the streamed hole while the rest of the app keeps its static shell.
A global nonce CSP would have required dropping `cacheComponents` everywhere.

**#18 — i18n locale gating vs `cacheComponents` (PPR).** Two recipes from the
Internationalization guide don't hold under `cacheComponents: true`:
1. `export const dynamicParams = false` — the documented way to make unknown
   `[lang]` values 404 — is a **hard build error**: _"Route segment config
   `dynamicParams` is not compatible with `nextConfig.cacheComponents`."_
2. Validating the locale in the page via `notFound()` doesn't reliably 404. The
   page must read `params` inside `<Suspense>` to build under PPR, and the static
   shell flushes a **200** before the streamed hole can change the status.
→ Fix: do both the `Accept-Language` negotiation **and** the invalid-locale 404
   in `proxy.ts`, which always runs per-request before the response commits — bare
   `/i18n` 307-redirects to the best match; `/i18n/{unsupported}` returns a
   deterministic 404. `generateStaticParams` still prerenders en/tr/de as static
   PPR pages. (Mirrors the #59 lesson: per-request concerns belong in the proxy.)

Watch list for 2026: `middleware.ts` → `proxy.ts` rename (#17); Tailwind v4
CSS-first config (no `tailwind.config.js`) (#5); async `params`/`searchParams` (#9);
SSE long-lived connections vs serverless timeouts (#47); cross-origin WebSocket cookie
auth (#48).
