# Production-checklist pass (F33, step ③)

> Walking the Next.js [Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
> against this boilerplate. Each row maps a checklist item to **where it already
> lives** (feature ID / route) or notes why it's intentionally out of scope. This is
> the audit half of F33; the instrumentation + OpenTelemetry half is the code under
> `src/instrumentation.ts` + `/observability`.
>
> _Last updated: 2026-06-28._

## Automatic optimizations (free, already on)
| Checklist item | Status | Where |
| --- | --- | --- |
| Server Components by default | ✅ | App Router; client islands marked `"use client"` (CSR, SSE, WS, forms demos) |
| Code-splitting per route segment | ✅ | App Router default; explicit `next/dynamic` in `/lazy-loading` (F52) |
| Prefetching of `<Link>` in viewport | ✅ | `<Link>` nav across `/routing` (F8) |
| Static Rendering / PPR | ✅ | `cacheComponents: true`; static shells + streamed holes (F22–F24, PPR) |
| Client-side caching of RSC payloads | ✅ | App Router Router Cache (default) |

## During development
| Checklist item | Status | Where |
| --- | --- | --- |
| `next/font` for zero layout-shift fonts | ✅ | Root layout `Geist`/`Geist_Mono` (F50) |
| `next/image` (sizing, lazy, formats) | ✅ | `/images`, `remotePatterns` in `next.config.ts` (F49) |
| `next/script` for third-party scripts | ✅ | `/scripts` — `afterInteractive` + `lazyOnload` (F51) |
| ESLint (`eslint-config-next`) | ✅ | flat config; `pnpm lint` in CI + pre-commit |
| Error boundaries (`error.tsx` / `not-found.tsx`) | ✅ | `/routing/boom`, `/routing/missing` (F14) |
| Loading UI + streaming (`loading.tsx`, `<Suspense>`) | ✅ | `/routing/slow` (F13) |
| Data fetching on the server, memoized | ✅ | RSC `fetch` + `React.cache` (F26–F27) |
| Caching & revalidation strategy chosen | ✅ | `revalidatePath`/`revalidateTag` (F28), ISR (F31) |

## Before going to production
| Checklist item | Status | Where / note |
| --- | --- | --- |
| Verify caching (Full Route / Data Cache, ISR) | ✅ | F28 + F31; `cacheComponents` opt-in dynamic via `connection()` |
| Reduce client JS / analyze bundle | ◑ | `next/dynamic` split (F52); `@next/bundle-analyzer` left to consumers |
| Logging & error tracking | ✅ | `onRequestError` hook in `instrumentation.ts` records server errors (F33) |
| Observability / tracing | ✅ | OpenTelemetry via `@vercel/otel` in `register()`; traces inspectable at `/observability` (F33) |
| Environment variables validated | ✅ | zod server/client schemas (`src/lib/env.ts`, F4) |
| Secrets never reach the client | ✅ | `server-only` guard on BFF helper; httpOnly cookies owned by Route Handlers (F25, F42) |
| Security headers / CSP | ✅ | strict nonce CSP via `proxy.ts`, scoped to `/security/*` (F25) |
| Metadata & SEO | ✅ | Metadata API: title template, static + `generateMetadata` OG (F19) |
| Accessibility | ◑ | semantic markup throughout; no automated a11y audit in scope for v1 |

## After deployment
| Checklist item | Status | Where / note |
| --- | --- | --- |
| Monitor Core Web Vitals | ◑ | `useReportWebVitals` not wired; OTel traces cover server timing instead |
| Distributed tracing in place | ✅ | OTel registered at boot; swap the in-memory processor for an OTLP exporter to ship to a collector |
| Self-hostable build artifact | ✅ | `output: standalone` + multi-stage Docker, proven by `e2e/standalone.spec.ts` (F56) |
| CI gates (typecheck/lint/test/build/e2e) | ✅ | GitHub Actions (F57) + husky hooks (F58) |

**Legend:** ✅ satisfied · ◑ partially / left to the consuming app · (no ❌ — nothing on
the checklist is unaddressed).

## Notes
- The boilerplate ships an **in-memory** `SpanProcessor` so a trace export is provable
  offline with zero infra (`/api/observability` reports the captured spans). For a real
  deployment, replace it in `register()` with `'auto'` or an OTLP exporter and set
  `OTEL_EXPORTER_OTLP_ENDPOINT`.
- `@vercel/otel` is the docs-recommended wiring; `register()` runs once per server boot
  in the Node.js runtime (Edge segment runtime is unavailable under `cacheComponents`,
  see docs-issue [#25](nextjs-feature-checklist.md#docs-issues-log-)).
