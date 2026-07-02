# NestJS OAuth / Better Auth — Patterns & Plan

## Current State (2026-06-30)

### Architecture
- **Frontend:** `https://app.eys.gen.tr/` (Next.js BFF at port 3000)
- **Backend:** `https://api.eys.gen.tr/` (NestJS at port 3001)
- **OAuth:** Custom-built NestJS controllers + services at `src/auth/oauth/`
- **Flow:** Browser → Next.js BFF → NestJS OAuth initiate → Provider → NestJS callback → Next.js BFF callback → GraphQL `loginWithOAuth` → set cookies

### Known Issues
1. **Cross-origin redirect:** Next.js `<Link>` client-side navigation doesn't follow cross-origin redirects (`app.eys.gen.tr` → `api.eys.gen.tr`). Fixed by using `<button onClick={() => window.location.href = '...'}>`.
2. **Two URLs needed:** Frontend and backend are on different domains → need both `FRONTEND_URL` and `BACKEND_URL` (or just `APP_URL` for backend + derive frontend from request).
3. **Error redirects:** Was redirecting OAuth errors to backend path → now fixed to use frontend URL from stored `redirect_uri`.
4. **Outbox relay fails:** Redis/BullMQ not running → set `OUTBOX_POLL_MS=0` if not needed.

## Research: Better Auth (better-auth.com)

### What is Better Auth?
- TypeScript-first auth library (successor to Auth.js — they merged in 2026)
- Framework-agnostic: works with Next.js, NestJS, Hono, Express, etc.
- Self-hosted, open source
- Handles: OAuth 2.0 / OIDC, email+password, 2FA, passkeys, sessions, organizations

### Key Features for OAuth
- **`socialProviders` config:** Built-in support for Google, GitHub, Apple, Microsoft, etc.
- **Generic OAuth Plugin:** Any OAuth 2.0 / OIDC provider (LinkedIn, Hugging Face, Twitch, X)
- **Automatic callback URL handling:** Mounts `{baseURL}/api/auth/callback/{provider}`
- **Session management:** HttpOnly cookies, refresh, cache
- **Account linking:** Link multiple providers to same user

### NestJS Integration (`@thallesp/nestjs-better-auth`)
- Community-maintained package
- Provides `AuthModule.forRoot({ auth })` and decorators (`@Session()`, `@AllowAnonymous()`, `@OptionalAuth()`)
- Requires `bodyParser: false` in `NestFactory.create()`
- Global `AuthGuard` by default (can disable globally and use per-route)

### Providers Mapping

| Provider | Built-in? | Env Var Pattern |
|----------|-----------|-----------------|
| Google   | ✅ Built-in | `GOOGLE_CLIENT_ID/SECRET` |
| GitHub   | ✅ Built-in | `GITHUB_CLIENT_ID/SECRET` |
| X/Twitter | ✅ Built-in | `X_CLIENT_ID/SECRET` |
| LinkedIn | ⚡ Generic OAuth | `LINKEDIN_CLIENT_ID/SECRET` |
| Hugging Face | ⚡ Generic OAuth | `HUGGING_FACE_CLIENT_ID/SECRET` |
| Twitch   | ⚡ Generic OAuth | `TWITCH_CLIENT_ID/SECRET` |

### Callback URLs for Better Auth
- **Google/GitHub:** `https://api.eys.gen.tr/api/auth/callback/google`
- **Generic:** `https://api.eys.gen.tr/api/auth/callback/{provider}`

## Migration Plan (Custom → Better Auth)

### Phase 1: Setup Better Auth in NestJS
1. Install `better-auth` + `@thallesp/nestjs-better-auth` + adapter (`@prisma/client`)
2. Create `src/auth/better-auth.config.ts` with `betterAuth({...})`
3. Disable body parser in `main.ts`
4. Import `AuthModule.forRoot({ auth })` in `app.module.ts`
5. Add Better Auth env vars: `BETTER_AUTH_URL=https://api.eys.gen.tr`

### Phase 2: Configure OAuth Providers
1. **Google:** `socialProviders.google` — already have client ID/secret
2. **GitHub:** `socialProviders.github`
3. **X/Twitter:** `socialProviders.twitter` or Generic OAuth
4. **LinkedIn, Hugging Face, Twitch:** Generic OAuth plugin

### Phase 3: Prisma Schema
1. Run `npx @better-auth/cli generate` to create schema
2. Better Auth creates: `user`, `session`, `account`, `verification` tables
3. Merge with existing Prisma schema

### Phase 4: Update Next.js BFF
1. Remove custom OAuth routes (`api/auth/oauth/[...]`)
2. Better Auth client: `createAuthClient()` with `authClient.signIn.social()`
3. Or use `toNextJsHandler()` for the API route

### Phase 5: Clean Up
1. Remove `src/auth/oauth/` (controllers, services, providers DTOs)
2. Update `loginWithOAuth` / `AuthService` to work with Better Auth sessions
3. Test all 6 providers end-to-end

## Pros / Cons of Better Auth

### Pros
- Handles OAuth state machine, CSRF, PKCE automatically
- Session management with HttpOnly cookies built-in
- Active community, regularly updated
- Reduces custom auth code significantly
- Works across frameworks (Next.js, NestJS, Hono)
- Can co-exist with existing JWT auth during migration

### Cons
- NestJS integration is community-maintained (potential lag)
- Adds ~42 kB to bundle
- Migration effort from current custom setup
- May conflict with existing custom auth (JWT, guards)

## Alternative: Keep Custom + Fix Issues
If migration is too costly, the current custom OAuth only needs:
1. ✅ Cross-origin redirect (fixed)
2. ✅ Error redirect to frontend (fixed)
3. ⬜ Restore `BACKEND_URL` or add `FRONTEND_URL` for email links + error fallback
4. ⬜ Test remaining providers (GitHub, X, LinkedIn, Hugging Face, Twitch)

## Current Env Vars (NestJS)
```
APP_URL=https://api.eys.gen.tr
```
Need `FRONTEND_URL=https://app.eys.gen.tr` for email verification links and error redirect fallbacks.
