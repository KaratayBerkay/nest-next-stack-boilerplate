# Auth — Hooks

Vertical: [README.md](./README.md) · Source: [`src/features/auth/hooks/useAuth.tsx`](../../../next-js-boilerplate/src/features/auth/hooks/useAuth.tsx)

Unlike the messages vertical (5 page-specific hook files under `src/hooks/messages/`), this vertical
has exactly **one** hook, but it's a foundational one — the app-wide session context every guarded
page reads from, not just the 6 pages in this doc set.

### `useAuth` / `AuthProvider`

[`useAuth.tsx`](../../../next-js-boilerplate/src/features/auth/hooks/useAuth.tsx) — also importable
from [`src/hooks/useAuth.tsx`](../../../next-js-boilerplate/src/hooks/useAuth.tsx), a one-line
re-export barrel (`export { useAuth, AuthProvider, type User } from "@/features/auth/hooks/useAuth"`)
— both paths resolve to the same module; most call sites (`login-form.tsx`, `AuthStatus.tsx`,
`register-form.tsx`) use the `@/hooks/useAuth` shim.

`AuthProvider` wraps the app and exposes `{user, token, loading, login, verifyMfa, register, logout,
refreshUser}` via React context. Session bootstrapping has two paths:

- **SSR-hydrated** — if the server already resolved a session user (via `SessionHydrator`, a
  descendant component fed by RSC props rather than an inline `<script>` tag, which the doc comment
  notes broke React 19 hydration), that user is used as the initial state with no client fetch. A
  fire-and-forget [`deviceHandshakeServer()`](./api.md) + [`refreshTokenServer()`](./api.md#mets-vs-me-rawts-vs-tokents--three-ways-to-ask-whowhat-is-the-session-not-duplicates)
  pair still runs, to get the device token into `localStorage` and the access token into React state
  (cookies alone aren't enough — both are httpOnly).
- **Cold load** — no SSR user: calls `deviceHandshakeServer()` then [`getMeServer()`](./api.md),
  swallowing failure as "guest."

Beyond bootstrapping, `AuthProvider` owns several cross-cutting effects worth knowing about since
they're easy to miss reading any one page in isolation:

- **`login`/`register`/`verifyMfa`** each call their [`api.md`](./api.md) server function, update
  `user`/`token` state, and — on success — persist `deviceToken` into IndexedDB/localStorage via
  `setDeviceToken()` (lazy-imported from `@/lib/crypto/device-storage`) for the wire-crypto handshake
  (see [messaging-realtime/wire-crypto](../../backend/messaging-realtime/wire-crypto/README.md)).
  `login`/`verifyMfa` rethrow the original `mfaRequired`/`exception`-shaped error object rather than
  a generic `Error`, which is exactly what [`LoginCredentialsForm`](./login/components/login-credentials-form.md)
  and [`MfaChallengeForm`](./login/components/mfa-challenge-form.md) pattern-match on to route between
  "show a field error" and "show the MFA challenge screen."
- **`auth:logout` window event listener** — `apiFetch` (in
  [`src/lib/api-client.ts`](../../../next-js-boilerplate/src/lib/api-client.ts)) dispatches this on a
  definitive 401; the handler here clears `user`/`token`, calls `logoutServer()` (clears BFF cookies
  *before* navigating — otherwise a stale `session_user` cookie survives into the next page load and
  the login-loop bug this exact ordering was written to prevent recurs), wipes wire-crypto key
  material (`flushAll()` from `@/lib/crypto/device-storage`), and redirects to `/auth/login` unless
  already on an `/auth/*` route.
- **`tier-changed` window event listener** — after a billing change, the backend rewrites the live
  session's tier in Redis, which invalidates the `rbac_token` cookie (derived from the *old* tier) for
  the very next authenticated request. This handler proactively rotates the session
  (`refreshSession()`, from `src/lib/api-client.ts`) then re-fetches the display user, so the
  401→refresh→retry safety net only has to catch cases where this frame was missed rather than being
  the primary mechanism.
- **`setOwnUserId(user?.id ?? null)`** — bridges the signed-in user's id into
  [`src/api/client/messages/query.ts`](../../../next-js-boilerplate/src/api/client/messages/query.ts)'s
  decrypt helpers (messaging vertical, not auth-specific — mentioned here only because this is where
  it's actually wired).

### Not a hook, but lives in the same file: `SessionHydrator`

A tiny client component (`{user, token} → void`) rendered once, high in the tree, to deliver the
SSR-resolved session into `AuthProvider`'s state via a second, internal `AuthHydrateContext` — the
mechanism that avoids the old `window.__INITIAL_USER__` inline-script approach. Not itself
independently interesting beyond that history; documented here because it lives in the same file as
`useAuth`/`AuthProvider` rather than because it's a hook.

## Used by

Every page in this vertical either calls `useAuth()`'s methods directly
([login](./login/page.md), [register](./register/page.md)) or triggers a BFF route the rest of the
app doesn't otherwise touch
([forgot-password](./forgot-password/page.md), [reset-password](./reset-password/page.md),
[verify-email](./verify-email/page.md), [undo-password-change](./undo-password-change/page.md)) —
see each page's own "Calls" table. `AuthProvider` itself is mounted far above any of these, in the
root layout, so every other page in the app also depends on it for `user`/`loading`/`logout`.
