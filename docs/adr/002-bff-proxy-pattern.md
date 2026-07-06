# ADR 002: BFF proxy pattern (Next.js → NestJS)

**Status:** Accepted (implemented Phase 5)

## Context

The frontend (Next.js) and backend (NestJS) run as separate services, potentially on
different origins. The browser should never call the backend directly because:
- httpOnly cookies set by the backend are not readable by client-side JS
- Direct API exposure increases the attack surface (CSRF, token leakage)
- The backend's cookie naming convention (`__Secure-` prefix in production) differs
  from the frontend's BFF cookie names

## Decision

All browser-to-backend communication goes through Next.js **Route Handlers** (BFF layer):

```
Browser → Next.js Route Handler → NestJS GraphQL/REST → Response → Browser
```

The BFF:
- Owns the httpOnly cookies (access, refresh, rbac, device tokens)
- Forwards tokens as headers (`x-access-token`, `x-rbac-token`, etc.) to the backend
- Handles CSRF echo (double-submit cookie pattern) for mutations
- Implements silent refresh (401 → single-flight refresh → retry)
- Strips `__Secure-` prefix for local development
- Forwards the real client IP via `x-forwarded-for`

## Consequences

- **Positive:** Backend cookies are never exposed to client-side JS
- **Positive:** CSRF protection is structural (guard runs on every mutation at the BFF)
- **Positive:** The BFF can implement cross-cutting concerns (rate limit awareness,
  request logging, caching) in one place
- **Negative:** Every API call incurs an extra HTTP hop (Next.js → NestJS)
- **Negative:** BFF becomes a deployment dependency — frontend can't work without backend
- **Negative:** Streaming responses (SSE) must be proxied through the BFF

## When to deviate

- For a static frontend (Gatsby/Next.js export), use a separate API gateway
- For serverless Next.js on Vercel, the BFF runs as serverless functions — the
  pattern still works but may have cold-start latency
