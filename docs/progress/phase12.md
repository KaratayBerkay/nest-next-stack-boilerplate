# Phase 12 — Exception handling: unified error contract, frontend resolver, dedicated error/status pages, loading skeletons

> Execution tracker for the twelfth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **complete** (Phase 13 commits `5342030` +
> `6def6ff` remediated all 8 findings A–H). Phase 13's own live control run
> remains outstanding (deferred to Phase 14/T3 per project convention).

Scope note (2026-07-04): This phase is **inserted ahead of** the pre-existing
queue (same pattern Phase 11 used) rather than picking up the next topical
item. No code was written for this tracker (planning only).

## Relationship to Phase 11

Phase 11 (post-detail live-renew fix, close-out bookkeeping, verification
gate) is **not complete** — `git log` shows `HEAD` is literally the commit
that added `phase11.md`; the `TOPIC_ALLOWLIST` regex it targets is still the
old narrow form; `phase9.md`/`phase10.md` still both read "not started". By
explicit decision (2026-07-04) Phase 11 is **parked, not abandoned**: its
plan stands, none of its T1–T12 are marked done, and it should be resumed
after this phase (or whenever next prioritized). The two phases don't share
enough scope to merge into one tracker, but they **do** touch the same files,
so two things to know when Phase 11 resumes:

- Both phases edit `realtime.gateway.ts`. Phase 11/T1 widens
  `TOPIC_ALLOWLIST` (line 48); this phase's T6 adds a `sendWsError()` helper
  to the same file. Independent edits, low collision risk, but land one
  fully before starting the other to avoid rebase pain.
- **This phase's T12 subsumes Phase 11's T12 (D4 — extract shared connection
  badge).** Phase 11's T12 asked for exactly the shared-badge extraction that
  this phase's T12 does as a byproduct of building `<ConnectionUnstable>`. If
  this phase lands first, mark Phase 11's T12 done-via-Phase-12 rather than
  redoing it; don't build the badge twice.

## Why this is a full-stack phase, not a frontend tweak

Survey (2026-07-04, read directly off both apps): the `{ exc, msg, key }`
contract the user specified **does not exist anywhere in this codebase
today** — not in the backend, not in the BFF layer, not in the frontend.
Building only the frontend `exceptionHandler` would have nothing real to
consume. The gap spans three layers:

### Backend (`nest-js-boilerplate/`)

- **No global exception filter.** Repo-wide grep for `APP_FILTER` /
  `useGlobalFilters` → zero hits. What exists
  (`src/exception-filters/http-exception.filter.ts:19-42`, `{statusCode,
  timestamp, path, message}`) is bound **per-route only**, and its own
  docstring (lines 10-17) explains why: this is a hybrid HTTP/GraphQL/WS/gRPC
  app, and a naively-global `@Catch` filter calling `host.switchToHttp()`
  throws on non-HTTP contexts with no Express response to write to. Any real
  fix has to branch on `host.getType()`.
- **Throw payload is always a bare string**, consistently via Nest's
  exception subclasses (`auth.service.ts:61,125,128,134`,
  `post.service.ts:79,81,115,117`, ~12 sites in `messaging.service.ts`,
  `mfa.service.ts:59,65`) — no code, no field, no i18n key attached anywhere.
- **Two stray bare `Error` throws bypass `HttpException` entirely**, verified
  directly: `comment.service.ts:26` (`throw new Error('You have already
  replied to this comment')`, sitting a few lines from correctly-used
  `ForbiddenException`/`NotFoundException` at :81,83,112,114) and
  `oauth/oauth.controller.ts:48` (`throw new Error('Missing state or
  redirect_uri parameter')`). Both currently fall through to a masked 500 (or
  an opaque `INTERNAL_SERVER_ERROR` over GraphQL for the comment path) instead
  of a 4xx.
- **No Prisma error-code handling** — zero hits for
  `PrismaClientKnownRequestError`/`P2002`/`P2025`. Existing code avoids this
  with a manual find-then-act pattern (`auth.service.ts:60-61`,
  `messaging.service.ts:471-479`, `comment.service.ts:20-27`), which has
  TOCTOU gaps a proper error-code mapping would incidentally harden.
- **Validation is class-validator**, not Zod (`main.ts:48`,
  `app.useGlobalPipes(new ValidationPipe({transform:true, whitelist:true}))`,
  no custom `exceptionFactory`). Zod exists **only on the frontend**
  (`next-js-boilerplate/src/lib/validation/*`, `signup.ts` action) — confirms
  the user's "Form" `exc` example is a frontend-native concept the backend
  contract needs to be compatible with, not something the backend validates.
- **`RealtimeGateway` is a raw `ws` server, not a Nest gateway** — no
  `@WebSocketGateway`/`@SubscribeMessage`/`WsException` anywhere in
  `realtime.gateway.ts`, so none of Nest's filter machinery applies. Errors
  today are ad hoc `ws.send(JSON.stringify({type:'error', message:'...'}))`
  calls scattered per branch (lines 209-211, 257-292, 378-380, 482-507), and
  some failures (Redis writes, lines 643-660, 673-687) are silently swallowed
  with no client signal at all.
- **No shared error DTO anywhere**, and no shared package between the two
  apps (repo is just `nest-js-boilerplate/` + `next-js-boilerplate/` +
  `docs/` + `prod/`) — this phase is additive, not a migration of an existing
  convention.

### Frontend (`next-js-boilerplate/`)

- **i18n is fully custom** (no `next-intl`/`react-i18next` dependency).
  Messages live at `messages/{locale}/{page}/messages.json`
  (`src/lib/i18n/get-messages.ts:18-20`), and **every existing file is a flat,
  single-level string map** — confirmed directly (`messages/en/error/
  messages.json`, `messages/en/chat-room/messages.json`). Access is always
  **typed object-property access** (`t.pageNotFound`, `useMessages("error")`
  → `t.somethingWentWrongV1`), never a generic `t("a.b.c")` path call — **no
  dot-path resolver exists in the codebase** (`src/utils/` is empty; no
  lodash `get`/dot-prop dependency).
- **`Toast`/`Alert`/`Badge` components exist and are fully unused for real
  errors.** `src/components/ui/Toast.tsx` (`useToast()`, portal-rendered,
  auto-dismiss) and `Alert.tsx` are wired up only in demo pages
  (`app/v1/[lang]/ui/toast/page.tsx`, `ui/alert/page.tsx`). Every real
  feature component reinvents its own inline red text instead:
  `PostCard.tsx:56,64-79,251`, `ReactionButtons.tsx:109,121-131` (and the
  `ReactionInline` variant at :42-61 silently swallows errors — `catch {
  // silent }`), `CommentSection.tsx:161-176`, `premium/page.tsx:29-30`.
- **No offline/forbidden/entitlement full-page state exists.** There's
  `global-error.tsx` (root, hardcoded English by necessity), `not-found.tsx`
  (root, **hardcodes `DEFAULT_LANG`** instead of negotiating locale), and
  `/v1/[lang]/error.tsx` + `not-found.tsx` (segment-level, i18n'd). The
  closest structural precedent for "denied + CTA" is
  `UnauthenticatedMessage.tsx` (verified, 16 lines: centered message + a
  `LOGIN_PATH` link styled as a button) — but its "Sign In" label is
  hardcoded, not i18n'd, and it's used inline within a page, not as a
  route-level state.
- **Three independent, inconsistent derivations of the same connection
  enum**, none using the hook built for exactly this
  (`useRealtimeStatus()`, `RealtimeProvider.tsx:732-734`, currently called by
  nobody). Verified directly:
  - `realtime-client.ts:1-7` — the real enum is `"idle" | "connecting" |
    "authenticating" | "open" | "backoff" | "down"` (**not** `"offline"`).
  - `messages/page.tsx:246-250` collapses it to online/offline/connecting but
    hardcodes `"Connecting…"` at line 284 instead of using the `t.connecting`
    key that already exists in `messages/messages.json`.
  - `chat-room/page.tsx:91-94` does the identical collapse, copy-pasted, but
    renders 100% hardcoded English ("Connected"/"Connecting…"/"Disconnected")
    despite `chat-room/messages.json` defining unused `connected`/`connecting`
    keys (verified: file has them, component never references `t.connected`
    anywhere).
  - `(demos)/ws/page.tsx:6-18` takes a third approach, a `STATUS_LABEL`/
    `STATUS_COLOR` lookup map that **has no entries for `"backoff"` or
    `"down"`** — reaching either state renders `undefined` text on an
    `undefined` class.
- **Tier-gating is real; payment is not.** `SubscriptionTier` enum
  (`FREE|BASIC|MEDIUM|PREMIUM`, `schema.prisma:51-56`), `User
  .subscriptionTier` (`:259`), working frontend plumbing
  (`src/lib/tier.ts`, `TierGate.tsx` — verified, 19 lines, `fallback ?? null`
  with no default fallback UI — `useMinTier.ts`, real usage in
  `premium/page.tsx:46-70` with a bespoke inline fallback). No
  `Payment`/`Billing`/`Invoice` model, no `stripe`/`checkout` anywhere, no
  route constant for it (`constants/routes.ts` — verified, only
  `LOGIN_PATH`/`REGISTER_PATH`/`FIND_FRIENDS_PATH` exist). `/pricing`
  (`app/(marketing)/pricing/page.tsx`) is a static marketing page with no
  click handlers. So: the "subscription suspended → go to payment page"
  example is illustrative, reuses real tier-gating, but points at the
  existing static pricing page — this phase does not build billing.

### BFF / GraphQL layer

- **Three divergent error shapes reach the browser depending on which route
  handled the request**: `src/app/api/proxy/[...path]/route.ts:27-56` passes
  the raw NestJS body through unmodified; hand-rolled routes
  (`api/posts/[id]/route.ts`, `api/comments/[id]/route.ts`,
  `api/reactions/route.ts`, `api/users/search/route.ts`,
  `api/admin/set-tier/route.ts`) reshape into an ad hoc, hardcoded-English
  `{ error: string }`; `api-client.ts` (verified, 25 lines) does neither —
  `apiFetchJson` throws a bare `Error(\`apiFetchJson: ${status}
  ${statusText}\`)`, no structured shape at all.
- **401 detection is HTTP-status-only** (`api-client.ts:9-11`, dispatches
  `window` event `"auth:logout"`, consumed by
  `features/auth/hooks/useAuth.tsx:104-121`) — safe to add body fields
  without breaking this.
- **`login`/`register` BFF routes guess HTTP status by string-matching the
  GraphQL error message** (`api/auth/login/route.ts:77-78` — `status =
  message === "Invalid credentials" ? 401 : 500`; `api/auth/register/
  route.ts:66-67` — `status = message.includes("already") ? 409 : 400`).
  Fragile: breaks the moment a message string changes. The closest existing
  "code → treatment" convention worth evolving is `graphqlErrorStatus()`
  (`lib/backend.ts:120-128`, maps Apollo `extensions.code`
  `UNAUTHENTICATED`→401, `FORBIDDEN`→403), which only knows 2 codes today.

### Loading states (skeletons) — added 2026-07-04

New requirement: every page must show a skeleton while it has an HTTP
request or a WS connection outstanding — never a blank screen, a bare
spinner, or (worse) content that renders as if the empty/loading state were
the real state. Verified this is a real, current gap, not hypothetical:

- **A `Skeleton` primitive already exists** (`src/components/ui/Skeleton.tsx`)
  but is used **nowhere except its own demo page**
  (`app/v1/[lang]/ui/skeleton/page.tsx`) — confirmed by grep, zero other
  references.
- **Only one real `loading.tsx` exists app-wide**:
  `app/v1/[lang]/messages/loading.tsx`, and it renders plain text ("Loading
  messages...") — not `Skeleton`. Worse, `messages/page.tsx:1` is `"use
  client"` with no async Server Component in the segment, so there's nothing
  for this Suspense fallback to actually suspend on — it doesn't gate on the
  real data-fetch or WS-connect, despite its presence implying it does.
- **Every real feature page is a Client Component fetching via TanStack
  Query v5** (`@tanstack/react-query: ^5.101.1`, confirmed installed) using
  plain `useQuery`/`useInfiniteQuery` — grep confirms **zero** uses of
  `useSuspenseQuery`/`useSuspenseInfiniteQuery` anywhere in the app, across
  `feed/page.tsx`, `messages/page.tsx`, `find-friends/page.tsx`,
  `posts/[uuid]/page.tsx`, plus the shared hooks `useConversations.ts`,
  `useRoom.ts`, `useConversation.ts`, `useNotifications.ts`. Consequence,
  confirmed directly: `find-friends/page.tsx:114,118` defaults query data to
  `[]` (`const { data: friends = [] } = useQuery(...)`), so mid-load the page
  renders as **"you have no friends"**, not "still loading" — a real UX bug,
  not a hypothetical one.
- **The two existing `<Suspense>` wrappers in real pages
  (`chat-room/page.tsx:325-333`, `posts/[uuid]/page.tsx:246-254`) are the
  standard Next.js `useSearchParams()` boilerplate boundary** (same pattern
  `RealtimeProvider.tsx:365`'s comment explains), not a data-loading gate —
  confirmed by reading both call sites. Their fallback resolves
  near-instantly and has no connection to the page's actual query/WS state,
  so neither page satisfies the new rule despite already having a
  `<Suspense>`.
- Phase 10/T13 already solved this correctly for **one** case (the messages
  thread gates on WS `connecting`); Phase 11/D2/T10 flagged the identical gap
  for chat-room and left it parked. This requirement generalizes both into
  one system-wide rule instead of another one-off page patch.
- Current best-practice research (2026-07-04, web search — see chat sources):
  prefer `<Suspense>` boundaries close to the component that actually
  fetches, not one page-wide boundary; size skeleton fallbacks to match the
  real content's dimensions so nothing shifts when data arrives; use route
  `loading.tsx` for the pre-hydration paint plus nested `<Suspense>` for
  granular in-page streaming. Reference: [Next.js `loading.js` file
  convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading),
  [Next.js streaming guide](https://nextjs.org/docs/app/guides/streaming).

### Form validation (Zod) & nested i18n — added 2026-07-04

New requirement: validation schemas are built by a `generateZodSchema(tr)`
-style factory consuming already-loaded page translations, so Zod's own
issue messages are real i18n text, not hardcoded strings — and a validation
failure (client-side Zod or server-side `EX_VALIDATION_FORM` alike) renders
through the same `key`-based pipeline as the rest of this phase. This needs
real nested i18n content to exist, which today it doesn't:

- **The real login/register forms have zero i18n and zero Zod validation.**
  Read directly, `features/auth/ui/register-form.tsx` and `login-form.tsx`:
  every label, button, and error string is hardcoded English ("Register",
  "Sign In", "Registration failed", "Login failed"); validation is native
  HTML attributes only (`required`, `minLength={8}`) with one generic
  `error` string caught from whatever `err.message` the `register()`/
  `login()` call throws — no per-field errors, no schema, no `useMessages`
  call anywhere in either file.
- **No `auth` i18n namespace exists at all.** `messages/{en,tr}/` today has
  only `chat-room`, `error`, `find-friends`, `home`, `i18n`, `messages`,
  `shared`, `users`, `v1`, `v1-shell` — confirmed via directory listing.
  "Generate proper i18n messages" is real content-authoring work here, not
  just plumbing.
- **A different Zod-validated form already exists, but it's an unrelated
  Next.js-docs-checklist demo, not the real auth flow — don't conflate the
  two.** `app/(demos)/form/Form.tsx` (`SignupForm`, using
  `@tanstack/react-form`) + `features/auth/actions/signup.ts`
  (`signupAction`, a Server Action) prove out the Next.js "Forms" doc
  pattern with **duplicated, hardcoded** schemas: client-side `fieldSchemas`
  (`Form.tsx:20-24`, "Name is required", "Invalid email", "Must be 18 or
  older") and a separately maintained server-side `signupSchema`
  (`signup.ts:11-15`) with the same rules re-typed under a `"Server: "`
  prefix. No i18n either. This is a different code path from
  `(demos)/auth/register`'s real `RegisterForm` — this phase touches the
  real form, not the docs demo (though the demo would be a reasonable place
  to later prove the new pattern too, if the frontend's docs-checklist
  convention wants that parity — check before changing it).
- **The i18n type generator already fully supports nested objects** —
  re-confirmed directly: `scripts/generate-i18n-types.ts`'s `flattenKeys()`
  (lines 56-67) and `shapeToType()` (lines 69-93) both recurse through
  nested objects, and the cross-locale key-shape validation (lines 137-155)
  walks the flattened dotted key set — so `en`/`tr` having mismatched nested
  keys already fails the generator, which is exactly the safety net a
  `form`/`errors` convention needs. Nothing to build here; just use it.

## Decisions

The user's spec (`{ exc, msg, key }`, an `exceptionHandler(exceptionResponse,
relatedI18nMessageBlock)`, plus dedicated full-page states) left several
things underspecified given what's actually in this codebase. Concrete calls,
made so implementation isn't blocked re-litigating them — flag any of these
that don't match intent before Stage A starts:

- **D1 — Contract shape.** Multi-field form validation (e.g. register
  failing both email-taken and password-too-short at once) doesn't fit a
  single flat `{exc,msg,key}`. Proposed shape:
  ```ts
  type ExceptionResponse = {
    statusCode: number;
    exc: ExceptionCode;               // dispatch code, e.g. "EX_VALIDATION_FORM"
    msg: string;                      // fallback text if no i18n key resolves
    key: string;                      // dotted i18n path, first segment = page
    field?: string;                   // set when exc === EX_VALIDATION_FORM and exactly one field failed
    fields?: { field: string; msg: string; key: string }[]; // multi-field case
  };
  ```
- **D2 — `exc` naming.** Descriptive `SCREAMING_SNAKE_CASE` in one
  `ExceptionCode` union (e.g. `EX_VALIDATION_FORM`,
  `EX_AUTH_INVALID_CREDENTIALS`, `EX_CONFLICT_DUPLICATE`, `EX_NOT_FOUND`,
  `EX_FORBIDDEN`, `EX_WS_UNSTABLE`, `EX_TIER_INSUFFICIENT`, `EX_INTERNAL`),
  not opaque numeric codes like the spec's `EX1234` example — numeric codes
  need a separately maintained lookup doc; descriptive strings are
  self-explanatory straight off a network-tab payload or log line. Keep the
  `EX_` prefix (nod to the original example) so a raw JSON blob is
  recognizable as "one of ours" without other context.
- **D3 — What `key` in the spec's "Alert example" line means.** The spec
  defines `key` once at the top level (i18n path) but also says, under the
  `exc` "Alert" example, "key is required to know which alert will be
  triggered — sonner, alert, a badge etc." Read as talking about `exc`'s
  *value*, not a second field: `exc` alone decides the dispatch surface
  (attach-to-form-field / toast / alert / badge / full-page); `key` + `msg`
  are only ever about *which text* to show, decoupled from *how* it's shown.
  Frontend keeps one small `exc → surface` lookup table (T10).
- **D4 — i18n key resolution.** `key`'s first dot-segment names an existing
  page namespace (`error`, `messages`, `chat-room`, …); the remaining
  segments are a path walked inside that page's already-loaded JSON, which
  may now nest (the type generator already walks nested objects —
  `scripts/generate-i18n-types.ts:63-79` — no existing file uses it yet, so
  this is additive, not breaking). `exceptionHandler(exceptionResponse,
  relatedI18nMessageBlock)` takes the caller's already-loaded block for the
  page `key` names — mirroring `useMessages(page)` — not the whole message
  tree. Missing segment, wrong page, or a non-string leaf → return `msg`.
- **D5 — Frontend-only exceptions.** No network round-trip: client code
  builds a local `Omit<ExceptionResponse, "statusCode">` (e.g. `{exc:
  "EX_WS_UNSTABLE", msg: "Connection is unstable.", key:
  "error.connectionUnstable"}`) and runs it through the *same*
  `exceptionHandler`. Backs the WS-unstable state (T9).
- **D6 — Backend filter architecture.** One shared mapping function,
  `toExceptionResponse(exception, hostType)`, called from three thin
  adapters instead of three independent implementations: an HTTP
  `APP_FILTER` (promotes/replaces today's route-scoped
  `HttpExceptionFilter`), a GraphQL `formatError` in `GraphQLModule.forRoot`,
  and a `sendWsError(ws, exc, msg?, key?)` helper for `RealtimeGateway` (can't
  use Nest filters — it's raw `ws`). Default `exc`/`key` derived from the
  exception **class** (`ConflictException` → `EX_CONFLICT`, etc.); a call
  site needing a more specific code passes a structured object as
  `HttpException`'s 2nd constructor arg (idiomatic Nest — becomes
  `getResponse()`), e.g. `throw new ConflictException({exc:
  "EX_AUTH_EMAIL_TAKEN", msg: "Email already registered", key:
  "auth.emailTaken"})`. Most of the ~15 identified throw sites need no
  change; only ones needing a non-default code do (T7).
- **D7 — Prisma errors.** Add a `PrismaClientKnownRequestError` branch to the
  same mapping function (P2002 → 409/`EX_CONFLICT_DUPLICATE`, P2025 →
  404/`EX_NOT_FOUND`) so a future direct-throw path is covered automatically.
  Do not rip out the existing find-then-act pre-checks — separate hardening,
  out of scope here.
- **D8 — Full-page states use `exceptionHandler` for copy only, not for the
  show/hide decision.** `exceptionHandler` answers "what text for this one
  error"; the WS-unstable and entitlement-denied states answer "should this
  view be replaced", driven by ongoing *state* (connection status, tier), not
  a single caught exception:
  - `<ConnectionUnstable>` — content-area state (replaces the data region,
    not the whole route/chrome) shown when `useRealtimeStatus()` is
    `"down"`, or `"backoff"` past a short grace window (avoid flashing on a
    normal reconnect blip). Consolidates the 3 divergent derivations above
    into one `useConnectionState()` hook + one component (also fixes
    `chat-room/page.tsx`'s dead i18n keys and `(demos)/ws/page.tsx`'s missing
    `backoff`/`down` labels as a byproduct).
  - `<AccessDenied title message ctaLabel ctaHref>` — generalizes
    `UnauthenticatedMessage.tsx`'s message+button shape (currently
    hardcoded/un-i18n'd, inline-only). `TierGate` gets this as its default
    `fallback` when none is passed; `premium/page.tsx`'s bespoke inline
    fallback is replaced by it; add `PRICING_PATH = "/pricing"` to
    `constants/routes.ts` for the CTA target.
- **D9 — BFF alignment.** Once the backend emits the unified shape,
  `proxy/[...path]/route.ts` gets it for free. The hand-rolled routes and
  `graphqlErrorStatus()` switch from message-string-matching / a 2-entry map
  to reading `exc` directly. `apiFetchJson` starts throwing a typed
  `ExceptionResponse` instead of a bare `Error(string)` so callers can feed
  it straight into `exceptionHandler`.
- **D10 — Loading skeletons: two mechanisms, one component.** HTTP and WS
  "awaited" states aren't the same kind of thing, so they use different
  plumbing, but always render the same `Skeleton`:
  1. **HTTP via TanStack Query** (the dominant real pattern): migrate each
     page's primary blocking query from `useQuery`/`useInfiniteQuery` to
     `useSuspenseQuery`/`useSuspenseInfiniteQuery`, wrap the data-dependent
     section in `<Suspense fallback={<Skeleton .../>}>` sized to the real
     content, and give the route a `Skeleton`-based `loading.tsx` for the
     pre-hydration paint. Queries gated by `enabled: !!user` (e.g.
     `find-friends/page.tsx`) don't fit `useSuspenseQuery` directly — it has
     no `enabled` escape hatch — so keep those pages' Suspense boundary
     below an outer auth-resolved check instead of forcing the query itself
     to stay non-Suspense.
  2. **WS-dependent content** (chat-room membership/messages, feed/post-detail
     live-renew, the messages thread): not Suspense-compatible — a socket
     isn't a one-shot resource. Gate on `useConnectionState()` (Stage C/T12)
     and render `Skeleton` until the connection reaches `"open"`, exactly as
     Phase 10 already does correctly for the messages thread.
  3. The existing `useSearchParams()` `<Suspense>` wrappers in `chat-room/
     page.tsx` and `posts/[uuid]/page.tsx` stay as-is — different, unrelated
     requirement — but don't by themselves satisfy this rule; the real
     skeleton has to gate the inner content's actual query/WS state, not
     just the outer searchParams boundary.
- **D11 — Reserved nested blocks: `form` and `errors` (pins down D4).**
  Every page namespace may nest two conventional blocks alongside its
  existing flat UI-copy keys: `form` (field labels/placeholders for that
  page's inputs) and `errors` (validation/exception text for that page,
  resolved by `exceptionHandler`/`generateZodSchema` alike). Example, the
  new `auth` namespace this phase adds:
  ```json
  {
    "loginTitle": "Sign In",
    "registerTitle": "Register",
    "form": { "emailLabel": "Email", "passwordLabel": "Password", "nameLabel": "Name" },
    "errors": {
      "emailRequired": "Email is required",
      "emailInvalid": "Invalid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 8 characters",
      "invalidCredentials": "Invalid email or password",
      "emailTaken": "This email is already registered"
    }
  }
  ```
  One shared `auth` namespace for both login and register (not separate
  `auth/login` + `auth/register` folders) since the two forms share
  `email`/`password` copy almost entirely — splitting them would duplicate
  those strings across two files for two field-identical inputs.
- **D12 — `generateZodSchema(tr)` pattern.** One factory **per form**, not a
  single universal schema builder (forms have different fields/rules) —
  naming convention `generate<Form>Schema(tr)`, e.g.
  `generateAuthLoginSchema(tr: I18nMessages["auth"])`,
  `generateAuthRegisterSchema(tr)`. Each validator's message is
  `tr.errors.*` directly — already-resolved locale text, since `tr` is what
  `useMessages("auth")` returns — so Zod doesn't need its own key-lookup at
  validation time; the resolution already happened before `tr` was passed
  in. On submit, `schema.safeParse(values)`; a failure maps to the same
  `ExceptionResponse.fields` shape from D1 (`{field, msg, key}` per issue,
  `key` reconstructed as `"auth.errors.<name>"` for parity/debugging even
  though `msg` is already resolved text) so the **same** field-error
  rendering path handles a client-side Zod failure and a server-side
  `EX_VALIDATION_FORM` response identically — one component, two possible
  origins. The real forms (`register-form.tsx`, `login-form.tsx`) keep
  their existing per-field `useState` pattern rather than adopting the
  demo's TanStack Form — smaller, contained change; migrating the real forms
  to a different form library is a separate concern this request doesn't
  require.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day. Suggested order: **A (backend contract) → B
(frontend resolver, needs A's shape to exist) → C (status pages, needs B) →
D (BFF alignment, needs A) → E (loading skeletons, needs C/T12's
`useConnectionState()` for its WS half) → F (Zod schema generation + nested
i18n content, needs B's resolver + D1's `fields` shape)**, since C, D, E,
and F all consume what A/B produce.

### Stage A — Backend: unified exception contract

- [x] **T1 (M) — `ExceptionResponse`/`ExceptionCode` types + mapping
  function (D1/D2/D6).** One file exporting the union, the response type,
  and `toExceptionResponse(exception, hostType)` with a default
  per-exception-class table.
  *Verify:* unit test — each built-in exception subclass maps to its default
  `exc`/key; an exception carrying a structured `getResponse()` payload
  overrides the default.
  *Checked 2026-07-04:* done — `to-exception-response.spec.ts` 15/15 pass.
  Minor nit: actual signature is `toExceptionResponse(exception)`, no
  `hostType` 2nd param as written above; host-branching happens at the three
  call sites instead (T2/T3/T6). Harmless, just a spec/code naming drift.
- [x] **T2 (S) — Global HTTP filter (D6).** `APP_FILTER` using T1; retire the
  route-scoped `HttpExceptionFilter` for real routes (check whether
  `src/exception-filters/*` still needs to stay as-is for the
  docs-checklist proof per this backend's `implement-nestjs-feature` skill
  convention before deleting anything — if so, leave the demo untouched and
  just stop treating it as the production path).
  *Verify:* any thrown `HttpException` on any real REST route returns
  `{statusCode, exc, msg, key}`; existing route-scoped demo (if kept) still
  passes its own proof test.
  *Checked 2026-07-04:* **bug found.** `GlobalHttpExceptionFilter` is wired
  via `APP_FILTER` correctly, and the docs demo (`errors.controller.ts`) was
  correctly left alone (its e2e still 4/4). But
  `messaging.controller.ts:34` still has a class-level
  `@UseFilters(HttpExceptionFilter)` — Nest picks the closest filter first,
  so every exception thrown anywhere in that controller (all of
  `messaging.service.ts`, including T7's new structured payloads) is still
  intercepted by the *old* filter, which reads `payload.message` (absent on
  the new `{exc,msg,key}` shape) and falls back to a generic
  class-name-derived string. Friends/conversations/messages REST endpoints
  are silently still on the old contract. Fix: remove the `@UseFilters`
  decorator from `messaging.controller.ts`.
- [ ] **T3 (S) — GraphQL `formatError` (D6).** Wire into
  `GraphQLModule.forRoot` using T1.
  *Verify:* a GraphQL mutation error (e.g. duplicate-email register) returns
  the same shape under `errors[0].extensions`.
  *Checked 2026-07-04:* implementation looks correct — `formatError`
  (`app.module.ts:113-124`) calls `toExceptionResponse` and merges into
  `extensions`; traced through Nest's `ExternalExceptionsHandler` to confirm
  both `HttpException` and raw (e.g. Prisma) resolver errors reach it. Left
  unchecked because no test actually fires a GraphQL mutation to confirm the
  live response shape — the verify step as written wasn't executed.
- [x] **T4 (S) — Prisma error mapping (D7).** P2002/P2025 branch in T1's
  function.
  *Verify:* a direct unique-constraint violation (bypass the find-then-act
  guard in a test) maps to `EX_CONFLICT_DUPLICATE`/409, not a masked 500.
  *Checked 2026-07-04:* done — P2002→409/`EX_CONFLICT_DUPLICATE`,
  P2025→404/`EX_NOT_FOUND` both directly unit-tested in
  `to-exception-response.spec.ts`. (Tested by constructing the Prisma error
  directly rather than literally bypassing a guard in an integration test —
  equivalent coverage of the mapping logic itself.)
- [x] **T5 (S) — Fix the 2 bare-`Error` throws.** `comment.service.ts:26` and
  `oauth/oauth.controller.ts:48` → proper `HttpException` subclasses with a
  specific exc/key.
  *Verify:* both now return structured 4xx responses, not masked 500s;
  duplicate-reply-comment over GraphQL returns a real error code, not
  `INTERNAL_SERVER_ERROR`.
  *Checked 2026-07-04:* done — `comment.service.ts:27-31` now throws
  `ConflictException({exc:'EX_CONFLICT_DUPLICATE',...})`,
  `oauth.controller.ts:49-53` throws
  `BadRequestException({exc:'EX_VALIDATION_FORM',...})`. Repo-wide grep
  confirms no bare `Error()` remains in either file.
- [ ] **T6 (M) — `sendWsError()` helper for `RealtimeGateway` (D6).** Replace
  the ad hoc `{type:'error', message}` sends (lines 209-211, 257-292,
  378-380, 482-507) with the helper; same `{exc,msg,key}` body over the
  existing frame transport.
  *Verify:* trigger each WS error branch (bad topic, missing page param,
  auth failure) from a test client — each now carries `exc`/`key`, not just
  a free-text message.
  *Checked 2026-07-04:* structurally done — `sendWsError(ws,exc,msg,key?)`
  at `realtime.gateway.ts:701-715`, all former ad hoc sends now route
  through it (grep confirms exactly one literal `type: 'error'` left in the
  file). Left unchecked because `realtime.gateway.ts` has no spec file at
  all — the verify step's "trigger each branch from a test client" was
  never executed.
- [x] **T7 (S) — Structured payload for the ~6 call sites needing a
  non-default code (D6 escape hatch).** Duplicate email, invalid
  credentials, account locked, not-your-post/comment, friend-request
  conflict states, invalid TOTP.
  *Verify:* each returns its intended specific `exc`/`key`, not the generic
  class-level default.
  *Checked 2026-07-04:* done at the code level — confirmed structured
  payloads at `auth.service.ts:62,130,137,147`, `post.service.ts:81,121`,
  `comment.service.ts:88,122`, `messaging.service.ts:467,485,493,516`,
  `mfa.service.ts:65`. Caveat: the `messaging.service.ts` sites are reached
  through the controller T2 found still shadowed by the old filter, so
  those specific payloads are neutralized at runtime until T2 is fixed.

### Stage B — Frontend: exceptionHandler + i18n resolver

- [x] **T8 (S) — `resolveByPath()` + `exceptionHandler()` (D3/D4).** New
  utility, no existing dot-path resolver to build on.
  *Verify:* unit tests — missing key, wrong page-segment, non-string leaf
  all fall back to `msg`; a real nested key resolves correctly.
  *Checked 2026-07-04:* done — `exception-handler.test.ts`, 18/18 pass,
  covers all four cases. **But it breaks `pnpm typecheck` repo-wide**:
  `exception-handler.test.ts:130` references `ExceptionCode` as a type
  without importing it (`TS2304: Cannot find name 'ExceptionCode'`). Small
  fix (add the import) but real — worth landing before calling Stage B
  clean.
- [ ] **T9 (S) — Frontend-only exception helper (D5).** Constructor for a
  local `Omit<ExceptionResponse,"statusCode">`; first real caller is the
  WS-unstable state (Stage C).
  *Verify:* same `exceptionHandler` call resolves a client-only exception
  identically to a backend-sourced one.
  *Checked 2026-07-04:* **not done.** `clientException()` exists
  (`exception-handler.ts:61-67`) and is exercised only by its own test —
  zero production callers. `ConnectionUnstable.tsx` (its intended first
  caller per D5) hardcodes English strings directly as default props and
  never calls `exceptionHandler`/`clientException` at all. See T12 below —
  the component isn't even rendered in 2 of its 3 intended surfaces, so
  there's currently nowhere for this helper to be used.
- [ ] **T10 (S) — `exc → surface` table + typed `apiFetchJson` (D3/D9).**
  Small lookup (form-field/toast/alert/badge); `apiFetchJson` throws a typed
  `ExceptionResponse` instead of a bare `Error`.
  *Verify:* a failed mutation surfaces via the correct UI mechanism
  automatically, without the calling component hand-rolling a catch block.
  *Checked 2026-07-04:* **partial.** `EXC_TO_SURFACE`/`getSurface()`
  (`exception-handler.ts:19-34`) is real and tested. But `apiFetchJson`
  (`api-client.ts:31-52`) still throws a plain `Error`, only optionally
  bolting on a non-standard `.exception` property — not a typed
  `ExceptionResponse` as D9 asked. Moot in practice anyway: grep shows
  `apiFetchJson` has zero real callers — every T11 call site below still
  uses the older `apiFetch` + manual `.error` string parsing.
- [ ] **T11 (M) — Migrate the identified inline-red-text call sites.**
  `PostCard.tsx`, `ReactionButtons.tsx` (both variants — including the
  silently-swallowed `ReactionInline` catch), `CommentSection.tsx`,
  `premium/page.tsx`; first real use of `Toast`/`Alert` outside their demo
  pages.
  *Verify:* each migrated component shows a real `Toast`/`Alert` on failure,
  localized via `exceptionHandler`; no bare red `<p>`/`<div>` error text left
  in these files.
  *Checked 2026-07-04:* **partial, one regression.** `PostCard.tsx` toasts
  on `refreshPost` failure now (hardcoded string, not exceptionHandler'd),
  but `handleEdit`/`handleDelete` still `catch { // silent }` — errors
  surface nowhere. `ReactionButtons.tsx`'s flagged `ReactionInline` silent
  catch now toasts (good) but never checks `res.ok`, so a non-2xx response
  is silently treated as success; `ReactionRow` toasts with a hardcoded
  string on `!res.ok`. `CommentSection.tsx`'s submit toasts (hardcoded
  string); its edit/delete paths show nothing on failure. **`premium/page.tsx`
  regression: lines 82-86 still render the exact hand-rolled
  `bg-red-50`/`text-red-700` div this task named for removal** — no
  Toast/Alert import exists in the file at all. (This is almost certainly
  why commit b270b70 removed an "unused `AccessDenied` import" from this
  file — a wire-up was attempted and abandoned partway.) None of these
  files call `exceptionHandler`/`getSurface` anywhere, so even the fixed
  spots use ad hoc text, not resolved i18n.

### Stage C — Dedicated full-page/status states

- [ ] **T12 (M) — `useConnectionState()` + `<ConnectionUnstable>` (D8).**
  Wraps existing `useRealtimeStatus()`; replaces the 3 divergent derivations
  in `messages/page.tsx`, `chat-room/page.tsx`, `(demos)/ws/page.tsx`; fixes
  chat-room's dead i18n keys and the ws-demo's missing `backoff`/`down`
  labels along the way. **Supersedes Phase 11's T12/D4** (see Relationship
  note above).
  *Verify:* kill the realtime backend → all 3 surfaces show one consistent,
  correctly-localized state; restore it → all 3 clear together; no more
  `undefined` labels reachable.
  *Checked 2026-07-04:* **partial.** `useConnectionState()`
  (`hooks/useConnectionState.ts`) does correctly consolidate the derivation
  into one `"online"|"connecting"|"unstable"` enum, and all 3 surfaces now
  call it — the "3 divergent derivations" problem is genuinely fixed, and
  the ws-demo's missing `backoff`/`down` labels are gone. But: **(1)** no
  grace-window debounce anywhere — D8 explicitly asked to avoid flashing on
  a normal reconnect blip, and the hook maps `backoff` straight to
  `"unstable"` with no timer; **(2)** `<ConnectionUnstable>` is only ever
  actually *rendered* in `(demos)/ws/page.tsx` — `chat-room/page.tsx` and
  `messages/page.tsx` both import it but never render it (confirmed by
  their own `pnpm lint` warnings: "'ConnectionUnstable' is defined but
  never used"), so those two surfaces do NOT show "one consistent" state —
  chat-room just recolors an avatar ring/disables input instead; **(3)**
  `ConnectionUnstable`/`AccessDenied` are both 100% hardcoded English
  (`ConnectionUnstable.tsx:11-12`), never call `exceptionHandler`/T9's
  `clientException`, so this isn't localized at all; **(4)**
  `chat-room/page.tsx:119-122`'s Avatar tooltip is still hardcoded
  "Connected"/"Connecting…"/"Disconnected" (the input placeholder below it
  *was* correctly fixed to use `t.connecting`/`t.disconnected`) — so "fixes
  chat-room's dead i18n keys" is only half true.
- [x] **T13 (S) — `<AccessDenied>` + default `TierGate` fallback +
  `PRICING_PATH` (D8).** Migrate `premium/page.tsx` off its bespoke inline
  fallback.
  *Verify:* visit `/premium` on a FREE-tier test user → `<AccessDenied>`
  renders with a working "Go to payment page" button routing to `/pricing`.
  *Checked 2026-07-04:* done — `TierGate.tsx:19-20` defaults to
  `<AccessDenied/>` when no `fallback` is passed (test-covered,
  `TierGate.test.tsx`: "renders AccessDenied when below tier and no
  fallback is given"); `premium/page.tsx` now omits its own fallback,
  relying on the default — confirms b270b70's "remove unused
  `AccessDenied` import" there was a correct cleanup, not a regression.
  Minor loose end: `PRICING_PATH` was added to `constants/routes.ts` but is
  never imported anywhere — `AccessDenied.tsx:14` hardcodes the literal
  string `"/pricing"` instead, so the constant is dead code today.
- [x] **T14 (S) — Small fixes surfaced while in this area.** i18n-ify
  `UnauthenticatedMessage.tsx`'s hardcoded "Sign In" label; fix
  `not-found.tsx`'s hardcoded `DEFAULT_LANG` to negotiate locale.
  *Verify:* both render correctly in a non-default locale.
  *Checked 2026-07-04:* done — `UnauthenticatedMessage.tsx` now calls
  `useMessages("home")`, defaults `label` to `t.signIn`; `not-found.tsx`
  now negotiates via a client-side `clientLang()` (`navigator.language`)
  lazy `useState` initializer instead of a hardcoded `DEFAULT_LANG` (also
  fixes the useEffect/setState lint issue b270b70 mentions). Loose end
  found in the same area: `UnauthenticatedMessage`'s *own* "Sign In" label
  is fixed, but several callers still pass hardcoded English into its
  `message` prop — `premium/page.tsx` ("Sign in to view premium"),
  `messages/page.tsx` ("Sign in to start messaging") — while
  `chat-room/page.tsx` correctly passes `t.signInRequired`. Inconsistent
  rollout, same spirit as T14 even if not literally in its scope.

### Stage D — BFF / GraphQL alignment

- [ ] **T15 (S) — `login`/`register` BFF routes off message-string-matching
  (D9).** Read `exc` for status mapping instead of `message === "..."` /
  `message.includes(...)`.
  *Verify:* invalid-credentials and duplicate-email flows still return
  401/409 respectively, now driven by `exc` not string content.
  *Checked 2026-07-04:* **partial.** Both routes now call
  `graphqlErrorStatus(errors,...)` for the HTTP status instead of
  string-matching — real fix, and it's genuinely wired to backend data
  (`app.module.ts:113-124` puts `exc`/`msg`/`key` in GraphQL `extensions`).
  But the response *body* (`login/route.ts:80`, `register/route.ts:68`) is
  still `{error: message}` — `exc`/`msg`/`key` are computed and then
  discarded before reaching the client. Status code fixed; shape isn't.
- [ ] **T16 (S) — Sweep remaining hand-rolled `{error:string}` BFF routes**
  (`posts/[id]`, `comments/[id]`, `reactions`, `users/search`,
  `admin/set-tier`) onto the unified shape; extend `graphqlErrorStatus()`
  beyond its current 2-code map.
  *Verify:* each route's error responses now match
  `{statusCode,exc,msg,key}`; `proxy/[...path]` (already shape-agnostic) and
  the hand-rolled routes are indistinguishable to a frontend caller.
  *Checked 2026-07-04:* **not done.** All 5 routes still return
  `{error: string}`. `posts/[id]` and `comments/[id]`'s PUT/DELETE still
  use inline `code === "FORBIDDEN" ? 403 : 500`-style matching, not even
  calling `graphqlErrorStatus()`. `users/search` hardcodes 400/401.
  `reactions`/`admin/set-tier` do call the extended `graphqlErrorStatus()`
  for status only. The extension itself is real (`backend.ts:120-141`, now
  an 8-code map, up from 2) — the shape sweep across these 5 routes never
  happened. `proxy/[...path]` is confirmed still shape-agnostic
  (passthrough, `route.ts:41-48`), so the phase gate's "BFF consistency"
  item fails today only because these 5 routes haven't caught up, not
  because of any proxy issue.

### Stage E — Loading skeletons for every HTTP/WS-awaited page

- [x] **T17 (S) — Give `Skeleton` real fallback shapes.**
  `src/components/ui/Skeleton.tsx` today only backs its own demo page; add
  the small set of composed shapes real pages need (card-list, message
  thread, stat row), built from the one primitive rather than one-off divs
  per page.
  *Verify:* each shape renders with the right dimensions/no layout shift
  when swapped for real content.
  *Checked 2026-07-04:* done — `components/ui/skeleton-shapes.tsx` adds
  `SkeletonLine/Card/Message/ChatMessage/ConversationSidebar/FeedList`, all
  composed from `SkeletonLine`/shared primitives, used across
  feed/messages/chat-room/notification.
- [x] **T18 (S) — Fix `messages/loading.tsx`.** Replace the plain-text
  fallback with `Skeleton`; confirm what it actually gates given
  `messages/page.tsx` is a Client Component (D10 note) — make it real or
  remove the false impression that it's doing something.
  *Verify:* cold navigation to `/messages` shows a `Skeleton`, not text, for
  whatever window it's actually visible.
  *Checked 2026-07-04:* `loading.tsx` itself is done — real
  Skeleton-composed fallback, no more plain text. But the same "false
  impression" bug got **relocated, not removed**: `messages/page.tsx` now
  also wraps its content in its own inline `<Suspense fallback={...}>`
  (near-duplicate markup of `loading.tsx`), and `notification/page.tsx` has
  the same pattern — but neither `useConversations`/`useConversation`
  (plain `useQuery`/`useInfiniteQuery`, confirmed by grep) nor
  `useNotifications` (plain `useQuery`) ever throw a promise, so these
  inner `<Suspense>` boundaries never actually trigger; the *real* gating
  in both files correctly happens via a manual `connectionState`/`isLoading`
  conditional underneath. Not functionally broken (the manual conditional
  does the real job) but keeps the misleading "Suspense implies gating"
  impression T18 was written to remove. Checking this box for the literal
  `loading.tsx` fix; flagging the relocated issue for anyone touching this
  next.
- [ ] **T19 (M) — Migrate the real client-fetch pages to `useSuspenseQuery` +
  `<Suspense fallback={<Skeleton/>}>` (D10.1):** `feed/page.tsx`,
  `find-friends/page.tsx` (fix the `[]`-default masking loading as "no
  friends"; respect the `enabled:!!user` nuance), `posts/[uuid]/page.tsx`
  (data query only — its existing `<Suspense>` is the unrelated
  searchParams wrapper and needs its own inner boundary), `premium/page.tsx`,
  `notification/page.tsx`.
  *Verify:* throttle network (DevTools "Slow 3G") on each page → `Skeleton`
  shows immediately, sized to the real layout, never a blank screen or a
  list that looks empty-but-actually-loading.
  *Checked 2026-07-04:* **partial — 2 of 5 named pages untouched.**
  `feed/page.tsx` is a clean, correct migration (`useSuspenseQuery` +
  `<Suspense fallback={<SkeletonFeedList/>}>` + `loading.tsx`) — the best
  example of this pattern in the phase. `notification/page.tsx` has a real
  Skeleton-gated loading state too (via `isLoading`, not suspense, but
  functionally sound). **But `find-friends/page.tsx` and
  `posts/[uuid]/page.tsx` — both explicitly named in this task — don't
  appear anywhere in commit abb4218's diff; neither was touched at all.**
  `premium/page.tsx`'s stats fetch also has no skeleton (just a "Loading…"
  button label, weaker than even the bare-spinner case this phase's intro
  says never to leave in).
- [x] **T20 (S) — WS-gated skeleton for chat-room (closes Phase 11/D2/T10;
  D10.2).** Apply `useConnectionState()` (Stage C/T12) to gate
  `ChatRoomContent` behind `Skeleton` until `"open"`, replacing today's
  render-immediately-plus-badge-only behavior.
  *Verify:* cold-load `/chat-room?room=tech` → skeleton, then the live room;
  matches messages' existing behavior.
  *Checked 2026-07-04:* done — messages are gated on `msgsLoading` with
  `SkeletonChatMessage`, plus a top-level `Suspense`+skeleton fallback
  around the whole `ChatRoomContent` for the searchParams boundary.
- [ ] **T21 (S) — Sweep remaining `v1/[lang]` pages** (`admin`, `share`, the
  `v1/[lang]` home page, anything else this audit turns up) for the same
  rule.
  *Verify:* grep sweep — every `page.tsx` under `v1/[lang]` calling
  `apiFetch`/`useQuery`/`useRealtime` has either a `Skeleton`-based boundary
  in its own file or a sibling `loading.tsx`; none left rendering blank or
  empty-looking during a load.
  *Checked 2026-07-04:* **not done.** `admin/page.tsx` and `share/page.tsx`
  both fetch via `apiFetch` (3 call sites each) but have zero `Skeleton`
  usage and no sibling `loading.tsx` — grep-confirmed gap. (`users/list`,
  `users/detail/[uuid]`, `settings/sessions`, `boom`, and the `v1/[lang]`
  home page don't fetch page-blocking app data the same way — mostly async
  Server Components doing i18n-only loads — so likely out of scope, but
  worth a second look if anyone treats this box as fully swept.)

### Stage F — Zod schema generation + nested i18n content

- [x] **T22 (S) — `auth` i18n namespace, both locales (D11).** Add
  `messages/{en,tr}/auth/messages.json` with the `form`/`errors` nested
  blocks; run `pnpm generate-i18n-types` to confirm the generator accepts
  the nesting and cross-locale shape-checks it.
  *Verify:* generator exits 0; `I18nMessages["auth"]` autocompletes
  `t.form.emailLabel` / `t.errors.emailTaken` in the editor.
  *Checked 2026-07-04:* done — real nested content in both locales (deeper
  nesting than the tracker's own example: `form.login.*` / `form.register.*`
  / `social.*` / `errors.*`). Actually ran `pnpm generate-i18n-types`: exit
  0, and `git diff` on `src/generated/i18n-messages.d.ts` showed zero
  changes afterward — proof the committed generated file already matched,
  i.e. the generator was really exercised on this content. Minor:
  `layout.tsx` calls `getAllMessages(DEFAULT_LANG)` unconditionally and the
  real auth pages live outside the `[lang]` segment, so the `tr` content —
  though correctly generated — may not actually be reachable at runtime
  yet; worth a look, separate from this task's own scope.
- [ ] **T23 (S) — `generateZodSchema(tr)` pattern + the two real schemas
  (D12).** `src/lib/validation/` gets `generateAuthLoginSchema(tr)` /
  `generateAuthRegisterSchema(tr)`, replacing the native-attribute-only
  validation in `register-form.tsx`/`login-form.tsx`.
  *Verify:* unit test — a schema built from the `tr` fixture rejects an
  empty email with the exact `tr.errors.emailRequired` string, not a Zod
  default message.
  *Checked 2026-07-04:* **partial.** `src/lib/validation/auth.ts` exists
  and is wired into both forms, but as `loginFormSchema(errors)` /
  `registerFormSchema(errors)` — not D12's naming
  (`generateAuthLoginSchema(tr)`) or its shape: each returns a **plain
  object of individual field schemas**, not one composed `z.object()`. This
  is the root structural cause of T24's failure below — D1's `fields[]`
  array exists specifically for simultaneous multi-field failures, which
  this shape can't produce. Manually traced (no unit test exists for this
  file): `.min(1, errors.emailRequired)` before
  `.email(errors.emailInvalid)` does correctly yield the exact tracker
  string on an empty email, so that one behavior is right.
- [ ] **T24 (M) — Wire the two real forms + unify with backend field
  errors.** `register-form.tsx`/`login-form.tsx` call `useMessages("auth")`,
  run the generated schema on submit (per-field error state instead of one
  generic `error` string), and map a backend `EX_VALIDATION_FORM`/`fields`
  response (Stage A/T7's duplicate-email case) onto the *same* per-field
  error state — so "email already registered" (server) and "invalid email"
  (client) render through one code path.
  *Verify:* submit with an empty email → inline `tr.errors.emailRequired`
  under the email field, no round-trip; submit a real duplicate email → the
  server's `EX_AUTH_EMAIL_TAKEN` renders in the same spot, same styling.
  *Checked 2026-07-04:* **not done — this is the biggest real gap in the
  phase.** `useMessages("auth")` is called, but error state in both forms
  is still `const [error, setError] = useState("")` — one generic string,
  unchanged in shape from before this phase. An early `return` after the
  email check drops a simultaneous password failure. The backend-unification
  half is completely absent: both catch blocks do
  `msg.toLowerCase().includes("already"|"taken"|"credentials")` — the exact
  pre-phase-12 string-sniffing pattern. Traced upstream: `useAuth.tsx`'s
  `login`/`register` use raw `fetch()` (not `apiFetchJson`) and
  `throw new Error(data.error)`, discarding `exc`/`fields`/`key` entirely;
  `api/auth/register/route.ts` still returns the legacy `{error: message}`
  shape (see T15). Repo-wide grep confirms `ExceptionFieldError`/`.fields`/
  `err.exception` are consumed nowhere in `src/`. The backend and Stage-B
  infra this needs genuinely exist (`EX_AUTH_EMAIL_TAKEN` et al.) — none of
  it reaches these two forms yet.
- [ ] **T25 (S) — Sweep remaining hardcoded strings in the two real forms
  while in this area.** Headings ("Register"/"Sign In"), the cross-links
  ("No account? Register" / "Already have an account? Sign In"), and
  `SocialLoginButtons` (unread by this survey) fold into the same `auth`
  namespace.
  *Verify:* both pages render fully from `t.*` in both locales; grep finds
  no stray hardcoded English string left in either file.
  *Checked 2026-07-04:* **partial.** Headings, cross-links, and
  `social-login-buttons.tsx`'s copy are correctly i18n'd (provider brand
  names staying hardcoded is reasonable). Leftover hardcoded English found
  with no locale entry backing it: `"Loading..."` (login-form.tsx:23,
  register-form.tsx:22), `"Signed in as"` (:30/:29), `"Role:"`/`"Status:"`
  (:33/:32).

**Unreviewed addition found during this pass:** `src/lib/forms/auth-options.ts`
(27 lines, added whole-cloth in abb4218) defines `loginFormOpts`/
`registerFormOpts` via `@tanstack/react-form`'s `formOptions()`. Repo-wide
grep: zero importers, including this same commit's own login/register forms
(which use plain `useState`, per D12's explicit decision to *not* adopt
TanStack Form for the real forms). This file builds exactly the path D12
rejected — recommend deleting rather than treating it as legitimate
factoring left over for later use.

## Verify loop (phase gate)

**Overall: the phase gate now passes (remediated by Phase 13, commits
`5342030` + `6def6ff`).** All 8 blocking findings (A–H) are resolved in code.
Live rebuilt-container verification remains outstanding (deferred to Phase
14/T3). Two post-merge residual items fixed in Phase 14/T1–T2.

- [x] **Contract:** PASSES — `messaging.controller.ts` filter shadowing
   removed in Phase 13/T1. REST endpoints now return the unified shape.
- [x] **Resolution:** PASSES — `exceptionHandler`/`resolveByPath` tests
   pass; missing `ExceptionCode` import fixed in Phase 13/T7.
- [x] **Real UI, not inline text:** PASSES — `premium/page.tsx` now uses
   Toast; PostCard/CommentSection error states handled.
- [x] **Connection state:** PASSES — `<ConnectionUnstable>` wired in both
   `messages`/`chat-room`; grace-window debounce added.
- [x] **Entitlement:** PASSES — unchanged, still correct.
- [x] **BFF consistency:** PASSES — all 7 routes return
   `{statusCode,exc,msg,key}`. Residual: 5 routes missing HTTP status
   override — fixed in Phase 14/T1.
- [x] **Loading states:** PASSES — `find-friends`, `posts/[uuid]`, `admin`,
   `share` all have skeletons/loading.tsx.
- [x] **Form validation:** PASSES — Zod object schemas, per-field errors,
   `apiFetchJson` wired in both forms.
- [ ] **No regressions:** not yet directly exercised (Phase 14/T3).

## Control run — 2026-07-04

Static/code-level verification pass (reading current HEAD, running each
app's own test/lint/typecheck/i18n-generator commands, tracing NestJS
filter-resolution source) — **not** a live pass against rebuilt containers
the way phase3.md's control run was; runtime/WS behavior under a real
server is still unconfirmed. **Phase 12 is NOT complete.**

**Verified working (static):** the core contract types and mapping function
(T1), Prisma error mapping (T4), the two bare-`Error` fixes (T5), the
`exceptionHandler`/`resolveByPath` resolver (T8, 18/18 tests),
`TierGate`/`AccessDenied` entitlement gating (T13, test-covered),
`UnauthenticatedMessage`/`not-found.tsx` locale fixes (T14), the `Skeleton`
shape library (T17), `messages/loading.tsx` and chat-room's WS-gated
skeleton (T18/T20), and the `auth` i18n namespace + generator run (T22) all
hold up. Full backend suite 148/149 (1 pre-existing unrelated failure);
frontend suite 55/55; `pnpm lint` 0 errors.

**Findings (blocking — all resolved by Phase 13, commits `5342030` + `6def6ff`):**

- **A — `messaging.controller.ts:34` filter shadowing.** Removed in
   Phase 13/T1. ✓
- **B — `premium/page.tsx` hand-rolled error div.** Replaced with Toast in
   Phase 13/T3. ✓
- **C — form/backend field-error unification.** Reshaped schemas, per-field
   errors, `apiFetchJson` in Phase 13/T8. ✓
- **D — BFF shape sweep.** All 7 routes return `{statusCode,exc,msg,key}`
   in Phase 13/T2. Residual: 5 routes missing `{status: body.statusCode}`
   in `NextResponse.json()` — fixed in Phase 14/T1.
- **E — `<ConnectionUnstable>` orphaned.** Wired in both pages, grace
   window added in Phase 13/T4. ✓
- **F — Suspense/skeleton migration.** `find-friends` and `posts/[uuid]`
   migrated in Phase 13/T5. ✓
- **G — `admin`/`share` loading skeletons.** `loading.tsx` added in
   Phase 13/T6. ✓
- **H — assorted small items.** All fixed in Phase 13/T7
   (`ExceptionCode` import, `auth-options.ts` deletion, `PRICING_PATH`
   wiring, auth-form i18n strings). ✓

All findings resolved in Phase 13 (commits `5342030` + `6def6ff`). Residual
items (BFF HTTP status, displayName sweep-miss) fixed in Phase 14/T1–T2.
Live rebuilt-container verification for Phase 12+13 realtime loops deferred
to Phase 14/T3.

## Phase queue (updated 2026-07-04)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — T11 broken, T4/T15 carried to 11 | [phase10.md](phase10.md) |
| 11 (parked — plan only, tasks open) | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX — deferred in favor of Phase 12, resume after | [phase11.md](phase11.md) |
| **12 (implemented, not gate-clean)** | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons for every HTTP/WS-awaited page, `generateZodSchema(tr)` + nested `form`/`errors` i18n for real auth forms — see "Follow-up (2026-07-04 verification)" for what's left | this file |
| 13 (planned) | Phase 12 remediation (8 lettered findings) + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | [phase13.md](phase13.md) |
| 14 (was 12, now 13) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 15 (was 13, now 14) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 16 (was 14, now 15) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 17 (was 15, now 16) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases were renumbered +1 (now 14-17) to insert Phase 13
(this phase's remediation + realtime UX fixes); Phase 11 keeps its number
but is marked parked rather than active. -->
