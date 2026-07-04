# Phase 12 — Exception handling: unified error contract, frontend resolver, dedicated error/status pages, loading skeletons

> Execution tracker for the twelfth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**

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

- [ ] **T1 (M) — `ExceptionResponse`/`ExceptionCode` types + mapping
  function (D1/D2/D6).** One file exporting the union, the response type,
  and `toExceptionResponse(exception, hostType)` with a default
  per-exception-class table.
  *Verify:* unit test — each built-in exception subclass maps to its default
  `exc`/key; an exception carrying a structured `getResponse()` payload
  overrides the default.
- [ ] **T2 (S) — Global HTTP filter (D6).** `APP_FILTER` using T1; retire the
  route-scoped `HttpExceptionFilter` for real routes (check whether
  `src/exception-filters/*` still needs to stay as-is for the
  docs-checklist proof per this backend's `implement-nestjs-feature` skill
  convention before deleting anything — if so, leave the demo untouched and
  just stop treating it as the production path).
  *Verify:* any thrown `HttpException` on any real REST route returns
  `{statusCode, exc, msg, key}`; existing route-scoped demo (if kept) still
  passes its own proof test.
- [ ] **T3 (S) — GraphQL `formatError` (D6).** Wire into
  `GraphQLModule.forRoot` using T1.
  *Verify:* a GraphQL mutation error (e.g. duplicate-email register) returns
  the same shape under `errors[0].extensions`.
- [ ] **T4 (S) — Prisma error mapping (D7).** P2002/P2025 branch in T1's
  function.
  *Verify:* a direct unique-constraint violation (bypass the find-then-act
  guard in a test) maps to `EX_CONFLICT_DUPLICATE`/409, not a masked 500.
- [ ] **T5 (S) — Fix the 2 bare-`Error` throws.** `comment.service.ts:26` and
  `oauth/oauth.controller.ts:48` → proper `HttpException` subclasses with a
  specific exc/key.
  *Verify:* both now return structured 4xx responses, not masked 500s;
  duplicate-reply-comment over GraphQL returns a real error code, not
  `INTERNAL_SERVER_ERROR`.
- [ ] **T6 (M) — `sendWsError()` helper for `RealtimeGateway` (D6).** Replace
  the ad hoc `{type:'error', message}` sends (lines 209-211, 257-292,
  378-380, 482-507) with the helper; same `{exc,msg,key}` body over the
  existing frame transport.
  *Verify:* trigger each WS error branch (bad topic, missing page param,
  auth failure) from a test client — each now carries `exc`/`key`, not just
  a free-text message.
- [ ] **T7 (S) — Structured payload for the ~6 call sites needing a
  non-default code (D6 escape hatch).** Duplicate email, invalid
  credentials, account locked, not-your-post/comment, friend-request
  conflict states, invalid TOTP.
  *Verify:* each returns its intended specific `exc`/`key`, not the generic
  class-level default.

### Stage B — Frontend: exceptionHandler + i18n resolver

- [ ] **T8 (S) — `resolveByPath()` + `exceptionHandler()` (D3/D4).** New
  utility, no existing dot-path resolver to build on.
  *Verify:* unit tests — missing key, wrong page-segment, non-string leaf
  all fall back to `msg`; a real nested key resolves correctly.
- [ ] **T9 (S) — Frontend-only exception helper (D5).** Constructor for a
  local `Omit<ExceptionResponse,"statusCode">`; first real caller is the
  WS-unstable state (Stage C).
  *Verify:* same `exceptionHandler` call resolves a client-only exception
  identically to a backend-sourced one.
- [ ] **T10 (S) — `exc → surface` table + typed `apiFetchJson` (D3/D9).**
  Small lookup (form-field/toast/alert/badge); `apiFetchJson` throws a typed
  `ExceptionResponse` instead of a bare `Error`.
  *Verify:* a failed mutation surfaces via the correct UI mechanism
  automatically, without the calling component hand-rolling a catch block.
- [ ] **T11 (M) — Migrate the identified inline-red-text call sites.**
  `PostCard.tsx`, `ReactionButtons.tsx` (both variants — including the
  silently-swallowed `ReactionInline` catch), `CommentSection.tsx`,
  `premium/page.tsx`; first real use of `Toast`/`Alert` outside their demo
  pages.
  *Verify:* each migrated component shows a real `Toast`/`Alert` on failure,
  localized via `exceptionHandler`; no bare red `<p>`/`<div>` error text left
  in these files.

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
- [ ] **T13 (S) — `<AccessDenied>` + default `TierGate` fallback +
  `PRICING_PATH` (D8).** Migrate `premium/page.tsx` off its bespoke inline
  fallback.
  *Verify:* visit `/premium` on a FREE-tier test user → `<AccessDenied>`
  renders with a working "Go to payment page" button routing to `/pricing`.
- [ ] **T14 (S) — Small fixes surfaced while in this area.** i18n-ify
  `UnauthenticatedMessage.tsx`'s hardcoded "Sign In" label; fix
  `not-found.tsx`'s hardcoded `DEFAULT_LANG` to negotiate locale.
  *Verify:* both render correctly in a non-default locale.

### Stage D — BFF / GraphQL alignment

- [ ] **T15 (S) — `login`/`register` BFF routes off message-string-matching
  (D9).** Read `exc` for status mapping instead of `message === "..."` /
  `message.includes(...)`.
  *Verify:* invalid-credentials and duplicate-email flows still return
  401/409 respectively, now driven by `exc` not string content.
- [ ] **T16 (S) — Sweep remaining hand-rolled `{error:string}` BFF routes**
  (`posts/[id]`, `comments/[id]`, `reactions`, `users/search`,
  `admin/set-tier`) onto the unified shape; extend `graphqlErrorStatus()`
  beyond its current 2-code map.
  *Verify:* each route's error responses now match
  `{statusCode,exc,msg,key}`; `proxy/[...path]` (already shape-agnostic) and
  the hand-rolled routes are indistinguishable to a frontend caller.

### Stage E — Loading skeletons for every HTTP/WS-awaited page

- [ ] **T17 (S) — Give `Skeleton` real fallback shapes.**
  `src/components/ui/Skeleton.tsx` today only backs its own demo page; add
  the small set of composed shapes real pages need (card-list, message
  thread, stat row), built from the one primitive rather than one-off divs
  per page.
  *Verify:* each shape renders with the right dimensions/no layout shift
  when swapped for real content.
- [ ] **T18 (S) — Fix `messages/loading.tsx`.** Replace the plain-text
  fallback with `Skeleton`; confirm what it actually gates given
  `messages/page.tsx` is a Client Component (D10 note) — make it real or
  remove the false impression that it's doing something.
  *Verify:* cold navigation to `/messages` shows a `Skeleton`, not text, for
  whatever window it's actually visible.
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
- [ ] **T20 (S) — WS-gated skeleton for chat-room (closes Phase 11/D2/T10;
  D10.2).** Apply `useConnectionState()` (Stage C/T12) to gate
  `ChatRoomContent` behind `Skeleton` until `"open"`, replacing today's
  render-immediately-plus-badge-only behavior.
  *Verify:* cold-load `/chat-room?room=tech` → skeleton, then the live room;
  matches messages' existing behavior.
- [ ] **T21 (S) — Sweep remaining `v1/[lang]` pages** (`admin`, `share`, the
  `v1/[lang]` home page, anything else this audit turns up) for the same
  rule.
  *Verify:* grep sweep — every `page.tsx` under `v1/[lang]` calling
  `apiFetch`/`useQuery`/`useRealtime` has either a `Skeleton`-based boundary
  in its own file or a sibling `loading.tsx`; none left rendering blank or
  empty-looking during a load.

### Stage F — Zod schema generation + nested i18n content

- [ ] **T22 (S) — `auth` i18n namespace, both locales (D11).** Add
  `messages/{en,tr}/auth/messages.json` with the `form`/`errors` nested
  blocks; run `pnpm generate-i18n-types` to confirm the generator accepts
  the nesting and cross-locale shape-checks it.
  *Verify:* generator exits 0; `I18nMessages["auth"]` autocompletes
  `t.form.emailLabel` / `t.errors.emailTaken` in the editor.
- [ ] **T23 (S) — `generateZodSchema(tr)` pattern + the two real schemas
  (D12).** `src/lib/validation/` gets `generateAuthLoginSchema(tr)` /
  `generateAuthRegisterSchema(tr)`, replacing the native-attribute-only
  validation in `register-form.tsx`/`login-form.tsx`.
  *Verify:* unit test — a schema built from the `tr` fixture rejects an
  empty email with the exact `tr.errors.emailRequired` string, not a Zod
  default message.
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
- [ ] **T25 (S) — Sweep remaining hardcoded strings in the two real forms
  while in this area.** Headings ("Register"/"Sign In"), the cross-links
  ("No account? Register" / "Already have an account? Sign In"), and
  `SocialLoginButtons` (unread by this survey) fold into the same `auth`
  namespace.
  *Verify:* both pages render fully from `t.*` in both locales; grep finds
  no stray hardcoded English string left in either file.

## Verify loop (phase gate)

- [ ] **Contract:** a real validation error, a real conflict (duplicate
  email), and a real 403 (not-your-post) each produce
  `{statusCode,exc,msg,key}` — over REST, over GraphQL, and (topic/auth
  errors) over the WS gateway.
- [ ] **Resolution:** frontend resolves the correct localized string via
  `exceptionHandler` for a key that exists; falls back to `msg` for one that
  doesn't yet have an i18n entry.
- [ ] **Real UI, not inline text:** the migrated components (T11) show a
  `Toast`/`Alert`, not hand-rolled red text; grep confirms no leftover ad hoc
  `data.error ?? ...` display pattern in those files.
- [ ] **Connection state:** kill the realtime backend — `messages`,
  `chat-room`, and the ws demo all show one consistent, correctly-localized
  unstable state after the grace window, none stuck showing `undefined`;
  restore it — all clear together.
- [ ] **Entitlement:** FREE-tier user hitting `/premium` sees `<AccessDenied>`
  with a working CTA to `/pricing`.
- [ ] **BFF consistency:** a request through `proxy/[...path]` and a request
  through a hand-rolled BFF route return indistinguishable error shapes.
- [ ] **Loading states:** every real page under `/v1/[lang]` that awaits
  HTTP or WS data shows `Skeleton` — not blank, not plain text, not an
  empty-looking list — until that data/connection is ready; skeleton
  dimensions match the final content (no layout shift on swap-in).
- [ ] **Form validation:** the real login/register forms show per-field,
  i18n'd errors from a generated Zod schema (not native-attribute-only
  validation, not one generic error string); a server-side duplicate-email
  response renders in the same per-field slot as a client-side Zod failure;
  switching locale changes every string on both forms, none left hardcoded.
- [ ] **No regressions:** Phase 9/10 realtime loops (DM-unread bell
  aggregate, 3-state badge, feed live renew) still behave; the two bare
  `Error` fixes (T5) don't change happy-path behavior.

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
| **12 (this file)** | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons for every HTTP/WS-awaited page, `generateZodSchema(tr)` + nested `form`/`errors` i18n for real auth forms | this file |
| 13 (was 12) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 14 (was 13) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 15 (was 14) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 16 (was 15) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 13–16 were renumbered +1 to insert this exception-handling phase; Phase 11 keeps its number but is now marked parked rather than active. -->
