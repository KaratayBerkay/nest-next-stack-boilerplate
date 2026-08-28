# Auth — API

Vertical: [README.md](./README.md) · Client: [`src/api/client/auth/`](../../../next-js-boilerplate/src/api/client/auth/) ·
Server (BFF): [`src/api/server/auth/`](../../../next-js-boilerplate/src/api/server/auth/)

Same three-layer BFF chain as every other vertical (see
[architecture.md § BFF proxy pattern](../../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)
and [messages/api.md](../v1/messages/api.md) for the fully-worked example):

```
Browser (component) → api/client hook → api/server/*.ts (apiFetch, same-origin)
  → app/api/auth/**/route.ts (real BFF: cookie↔header bridge, calls backend GraphQL/REST)
    → NestJS backend
```

**One structural difference from `api/client/messages/`:** none of the 6 in-scope pages actually
route their calls through `useAuthActions()` (the `api/client/auth/actions.ts` hook — the nominal
"client layer"). `login`/`register` go through [`useAuth()`](./hooks.md) instead (which calls the
same `api/server/auth/*.ts` functions directly, bypassing `actions.ts` entirely), and the other four
pages' form components import their one `api/server/auth/*.ts` function straight from `@/api/server/auth/*`
with no hook layer at all. `useAuthActions()` is real, working code — it's just not used by any of
this vertical's own pages; its only caller is the out-of-scope `settings/security` page (see below).

## Client (`src/api/client/auth/`)

| File | Exports | Real caller(s) among the 6 pages |
|---|---|---|
| [`actions.ts`](../../../next-js-boilerplate/src/api/client/auth/actions.ts) | `useAuthActions()` — all 15 server functions below, uniformly wrapped | **None.** Used only by [`SecurityChangePassword.tsx`](../../../next-js-boilerplate/src/views/settings/security/SecurityChangePassword.tsx) (`settings/security` page, out of scope for this pass) and re-exported from [`src/api/index.ts`](../../../next-js-boilerplate/src/api/index.ts). |
| `queries.ts` | `meQueryOptions()` (React Query option builder around `getMeServer`) | **Deleted** (dedup pass, commit `aa04a418`) — was dead code, never imported anywhere. See [Known issues](#known-issues). |

## Server / BFF (`src/api/server/auth/`)

Base URL constants live in
[`src/constants/api/urls.ts`](../../../next-js-boilerplate/src/constants/api/urls.ts) (`AUTH_*`).
Every route below lives under [`src/app/api/auth/`](../../../next-js-boilerplate/src/app/api/auth/).

| File | BFF route | Backend endpoint | Used by (in-scope) |
|---|---|---|---|
| [`login.ts`](../../../next-js-boilerplate/src/api/server/auth/login.ts) (`loginServer`) | `POST /api/auth/login` | [Log in](../../backend/identity-access/auth/endpoints.md#log-in) | [hooks.md](./hooks.md)'s `useAuth().login()` → [login page](./login/page.md) |
| [`register.ts`](../../../next-js-boilerplate/src/api/server/auth/register.ts) (`registerServer`) | `POST /api/auth/register` | [Register](../../backend/identity-access/auth/endpoints.md#register) | `useAuth().register()` → [register page](./register/page.md) |
| [`logout.ts`](../../../next-js-boilerplate/src/api/server/auth/logout.ts) (`logoutServer`) | `POST /api/auth/logout` | [Log out](../../backend/identity-access/auth/endpoints.md#log-out) | `useAuth().logout()` — app-wide (not one of the 6 pages; see [hooks.md](./hooks.md)) |
| [`me.ts`](../../../next-js-boilerplate/src/api/server/auth/me.ts) (`getMeServer`) | `GET /api/auth/me` | [Get the current session user](../../backend/identity-access/auth/endpoints.md#get-the-current-session-user) (fallback only — see below) | `useAuth.tsx`'s mount effect + `refreshUser()` — app-wide |
| [`me-raw.ts`](../../../next-js-boilerplate/src/api/server/auth/me-raw.ts) (`getMeRawServer`) | `GET /api/auth/me` | same route as above | **None among real pages** — only [`views/demos/csr-cookies/PageContent.tsx`](../../../next-js-boilerplate/src/views/demos/csr-cookies/PageContent.tsx). ⚠ its `AuthMeResult` type doesn't match the route's real response — see [Known issues](#known-issues) |
| [`token.ts`](../../../next-js-boilerplate/src/api/server/auth/token.ts) (`refreshTokenServer`) | `GET /api/auth/token` | *(none — see below)* | `useAuth.tsx`'s SSR-hydrate branch — app-wide |
| [`verify-email.ts`](../../../next-js-boilerplate/src/api/server/auth/verify-email.ts) (`verifyEmailServer`/`verifyEmailCodeServer`/`resendEmailCodeServer`) | `POST /api/auth/verify-email`, `/api/auth/verify-email/code`, `/api/auth/resend-email-code` | [Verify email](../../backend/identity-access/auth/endpoints.md#verify-email), [Verify email with a code](../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code), [Resend the email verification code](../../backend/identity-access/auth/endpoints.md#resend-the-email-verification-code) | [verify-email page](./verify-email/page.md), directly |
| [`request-password-reset.ts`](../../../next-js-boilerplate/src/api/server/auth/request-password-reset.ts) | `POST /api/auth/request-password-reset` | [Request a password reset](../../backend/identity-access/auth/endpoints.md#request-a-password-reset) | [forgot-password page](./forgot-password/page.md), directly |
| [`reset-password.ts`](../../../next-js-boilerplate/src/api/server/auth/reset-password.ts) | `POST /api/auth/reset-password` | [Reset password](../../backend/identity-access/auth/endpoints.md#reset-password) | [reset-password page](./reset-password/page.md), directly |
| [`undo-password-change.ts`](../../../next-js-boilerplate/src/api/server/auth/undo-password-change.ts) | `POST /api/auth/undo-password-change` | [Undo a password change](../../backend/identity-access/auth/endpoints.md#undo-a-password-change) | [undo-password-change page](./undo-password-change/page.md), directly |
| [`change-password.ts`](../../../next-js-boilerplate/src/api/server/auth/change-password.ts) | `POST /api/auth/change-password` | [Change password](../../backend/identity-access/auth/endpoints.md#change-password) | **Out of scope** — `settings/security` page only, via `useAuthActions()` |
| [`device-handshake.ts`](../../../next-js-boilerplate/src/api/server/auth/device-handshake.ts) (`deviceHandshakeServer`) | `POST /api/auth/device-handshake` | [Device handshake](../../backend/identity-access/auth/endpoints.md#device-handshake) (1:1 passthrough to the backend's own `POST /devices/handshake`) | `useAuth.tsx`'s mount effect (both branches) — app-wide |
| [`mfa.ts`](../../../next-js-boilerplate/src/api/server/auth/mfa.ts) — 5 exports, see below | 5 routes, see below | see below | split in-scope/out-of-scope, see below |

### `mfa.ts` — split file, only 2 of 5 exports are in scope

This one file backs both the login-time MFA challenge (in scope — part of the `login` flow) and MFA
**enrollment** (out of scope — a different vertical's settings page):

| Export | BFF route | Backend endpoint | In scope? |
|---|---|---|---|
| `verifyMfaServer` | `POST /api/auth/login/mfa` | [Verify a login MFA code](../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code) | Yes — [login page](./login/page.md)'s `MfaChallengeForm` |
| `resendLoginCodeServer` | `POST /api/auth/login/mfa/resend` | [Resend a login MFA code](../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code) | Yes — same |
| `enrollMfaServer` | `POST /api/auth/mfa/enroll` | *(mfa module, out of scope)* | No |
| `verifyMfaEnrollmentServer` | `POST /api/auth/mfa/verify` | *(mfa module, out of scope)* | No |
| `disableMfaServer` | `POST /api/auth/mfa/disable` | *(mfa module, out of scope)* | No |

### `me.ts` vs. `me-raw.ts` vs. `token.ts` — three ways to ask "who/what is the session," not duplicates

- **`getMeServer()`** (`me.ts`) is the one real pages use. Its BFF route
  ([`app/api/auth/me/route.ts`](../../../next-js-boilerplate/src/app/api/auth/me/route.ts)) has a
  **fast path** (decode the `session_user` cookie written at login/register time, if it already
  carries `sessionId` — a canary for "was this cookie minted after the field existed") and a **slow
  path** (fall through to the real `me` GraphQL query, then re-write the cookie) — see
  [backend endpoints.md § Get the current session user](../../backend/identity-access/auth/endpoints.md#get-the-current-session-user).
- **`getMeRawServer()`** (`me-raw.ts`) hits the exact same `/api/auth/me` route but declares a
  completely different response type (`{authed: boolean, session?: string}`) that the route has never
  actually returned (it returns `{user, accessToken}`) — see [Known issues](#known-issues).
- **`refreshTokenServer()`** (`token.ts`) hits `/api/auth/token`, which — despite the name — **does
  not refresh anything**. Per its route's own source: it just reads the current `access_token`/
  `rbac_token`/`device_token`/`user_token` cookies (all httpOnly, unreadable from client JS) and
  echoes their values back as JSON, so client-side code can hold a copy (e.g. for use as an
  `Authorization: Bearer` value). The **real** refresh — the one the 401→retry interceptor in
  [`src/lib/api-client.ts`](../../../next-js-boilerplate/src/lib/api-client.ts) actually calls — is a
  different route, `/api/auth/refresh` (no dedicated `api/server/auth/*.ts` wrapper; called via the
  `AUTH_REFRESH_URL` constant directly from `api-client.ts`), which does the real CSRF-guarded backend
  `refresh` mutation and rotates every cookie. Confirmed by reading both routes directly — `token`'s
  route never calls the backend at all, `refresh`'s route always does.

## OAuth — no `api/server` file at all

Unlike every other flow above, OAuth login has **no typed `api/client`/`api/server` wrapper**. The
[`SocialLoginButton`](./login/components/social-login-buttons.md) component triggers it with a plain
`window.location.href` navigation to `AUTH_OAUTH_PREFIX + provider` (`/api/auth/oauth/{provider}`),
which is itself a **redirect-issuing** BFF route, not a JSON API:

```
Browser (full navigation) → GET /api/auth/oauth/[provider]           (BFF: sets oauth_state cookie, 302s)
  → backend GET /auth/oauth/:provider                                (302 to the real provider)
    → (user consents on the provider's own site)
      → backend GET /auth/oauth/:provider/callback                   (exchanges code, stores profile in Redis, 302s)
        → GET /api/auth/oauth/[provider]/callback                    (BFF: validates state, calls loginWithOAuth, sets cookies, 302s)
          → browser lands back on the app, session cookies already set
```

Source: [`app/api/auth/oauth/[provider]/route.ts`](../../../next-js-boilerplate/src/app/api/auth/oauth/[provider]/route.ts)
(initiate) and [`.../callback/route.ts`](../../../next-js-boilerplate/src/app/api/auth/oauth/[provider]/callback/route.ts)
(finish — calls the backend's
[Log in with OAuth](../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) mutation
server-to-server). Backend REST legs:
[Start an OAuth flow](../../backend/identity-access/auth/endpoints.md#start-an-oauth-flow),
[Handle an OAuth provider callback](../../backend/identity-access/auth/endpoints.md#handle-an-oauth-provider-callback).
The `oauth_state` cookie (httpOnly, scoped to the callback path, 10-minute maxAge) is what the
callback route checks against the provider-echoed `state` query param — a CSRF-style defense
independent of the backend's own single-use Redis `state` key.

## Known issues

- ⚠ **`me-raw.ts`'s type is wrong.** `AuthMeResult = {authed: boolean, session?: string}` doesn't
  match what `/api/auth/me` actually returns (`{user, accessToken}`, confirmed from
  [`app/api/auth/me/route.ts`](../../../next-js-boilerplate/src/app/api/auth/me/route.ts)). Only
  reachable from a demo page, so low real-world impact — but the type is simply incorrect.
- ⚠ **`meQueryOptions()` is dead code** — zero callers anywhere in the frontend, not even re-exported
  from the barrel `src/api/index.ts`.
- Filed as [`issues.md`](../../issues.md) rows — see this doc's parent
  [README.md § Known issues](./README.md#known-issues) for the full list with severity.
