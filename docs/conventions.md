# Documentation conventions

The contract every doc in `docs/` follows. Read this before writing or reviewing any page.

## 1. Folder structure rule

- **Frontend & mobile**: the doc tree mirrors the real route/folder tree 1:1. `docs/frontend/v1/<x>/`
  exists iff `next-js-boilerplate/src/app/v1/[lang]/<x>/` exists. Mobile uses the **same `<x>` slug**
  as frontend (the shared URL segment) even though the actual Flutter source folder is snake_cased
  (e.g. doc folder `find-friends/`, real source `lib/views/find_friends/`) — this keeps the two doc
  trees diffable by swapping `frontend` ↔ `mobile` in a path.
- **Backend**: grouped into 5 fixed categories (`identity-access`, `social-content`,
  `messaging-realtime`, `billing-usage`, `platform-core`) since `nest-js-boilerplate/src` itself has
  no nesting to mirror — the category layer is a pure navigation aid. Every module folder underneath
  still matches `src/<module>/` exactly.
- **Dynamic route segments** (`[lang]`, `[uuid]`, `[tier]`, `:lang`) are never reproduced as literal
  bracket folders in the doc tree — use the static segment name only, and state the real dynamic
  pattern in the doc's intro.
- **Cross-cutting funnels** spanning multiple physical routes (billing: pricing → plans → checkout →
  premium → settings/billing) get one narrative hub file (`billing-funnel.md`) that links to the real
  per-route docs in order — never a folder that relocates or duplicates page content.

## 2. File naming

| Location | Files |
|---|---|
| Backend module | `README.md` always + `endpoints.md` only if the module has a real REST controller, GraphQL resolver, or WS gateway (pure infra/provider modules get README.md only) |
| Frontend/mobile route folder | `page.md` / `screen.md`, `components/` or `widgets/` (kebab-case, one file per *significant* component — fold trivial presentational leaves and tier-variant page views like `FreePageView.tsx` into the parent doc, don't do 1:1 for every file), `hooks.md` (one combined doc per vertical), `api.md` (one combined doc per vertical) |
| Any folder with >1 page/screen doc | gets a `README.md` index; a single-page folder doesn't need one — the page.md/screen.md is the index |

## 3. Link syntax

All links are relative Markdown links: `[text](relative/path.md)` — plain shortest-path relative
filesystem paths, nothing exotic.

**Doc → source file** always crosses out of `docs/` into an app repo (no shorter common ancestor
than the monorepo root): `../` count = *(subdirectories under docs/) + 1*.

| Doc location | `../` count to repo root |
|---|---|
| `docs/backend/<category>/<module>/*.md` | 4 |
| `docs/frontend/v1/<page>/*.md` (top-level page) | 4 |
| `docs/frontend/v1/<page>/components/*.md` | 5 |
| `docs/frontend/v1/settings/<subpage>/*.md` | 5 |
| `docs/mobile/v1/<screen>/*.md` | 4 |
| `docs/mobile/v1/<screen>/widgets/*.md` | 5 |
| `docs/issues.md`, `docs/conventions.md`, `docs/README.md`, `docs/architecture.md` | 1 |

**Doc → doc, cross-app** (backend ↔ frontend ↔ mobile): shortest common ancestor is `docs/` itself,
so `../` count = *(subdirectories under docs/)*.

**Doc → doc, same app**: use the actual shortest path (usually 1-2 `../`).

**Before marking any doc done, resolve every link you wrote** — `ls` the target path from the doc's
own directory and fix anything that 404s. At this file count that's the only thing that reliably
catches mistakes.

## 4. Source-file links & line anchors

`[file.ts](../../path/to/file.ts#L120-L145)` — GitHub renders `#L120-L145` as a highlighted,
scrolled-to range when followed from a rendered `.md` in the same repo; most editors at minimum open
the right file. Treat exact-line-jump as best-effort, opening-the-right-file as guaranteed. Never
skip a source link because you're unsure of the exact line range — link the file, narrow later.

## 5. Endpoint entry headings & anchors

Every `endpoints.md` entry is a clean, punctuation-free `###` heading in Title Case (`### Send a
direct message`, not `### POST /api/conversations/:userId/messages`) — the verb/path goes on the
line *under* the heading. GitHub-flavored-Markdown auto-generates anchors by lowercasing, stripping
punctuation, and hyphenating spaces, so backticks/slashes/colons in a heading produce fragile
anchors. Give REST and GraphQL entries for the same underlying action deliberately distinct headings
so their anchors don't collide (e.g. "Send a direct message" vs "Send a message").

## 6. The "Kind" field

Every `endpoints.md` entry starts with **Kind:** one of `REST`, `GraphQL Query`, `GraphQL Mutation`,
`WS Event (client→server)`, `WS Event (server→client)`. One `endpoints.md` per module covers
whatever interface shapes that module actually exposes.

## 7. "Used by" is mandatory and bidirectional

Every `endpoints.md` entry has a **Used by** field linking every frontend page/component and mobile
screen/widget that calls it. Every frontend/mobile doc that calls a backend endpoint links back via
a **Calls** section (component-level) or a table row (page/screen-level `api.md`) to that exact
`endpoints.md#anchor`. Write both sides in the same change. An endpoint with an empty "Used by" is a
signal to check whether it's dead — file an `issues.md` row either way, don't just leave it blank.

## 8. REST vs GraphQL vs WS — which app doc "owns" a call (web)

The web browser never calls the backend directly (see [architecture.md § BFF pattern](./architecture.md)):
Browser → Next.js Route Handler (`src/api/server/**`, the BFF) → NestJS GraphQL/REST → Response.
A `src/api/server/**` file is documented in the frontend vertical's `api.md`, which itself links
onward to the backend `endpoints.md` entry it proxies to. For WebSockets, the web client opens the
socket directly (no BFF hop) — document the connection point in the frontend `page.md`'s data-flow
section, linking to the backend gateway's `endpoints.md#websocket-events`.

## 9. Flutter's call shapes — verify per vertical, don't assume BFF involvement

`flutter-boilerplate/lib/api/server/**` files split into a GraphQL shape (raw `POST /graphql`,
either via `gql_helper.dart`'s `gqlQuery()` or a hand-rolled `_dio.post('/graphql', ...)` — both
count, check for the literal string `/graphql` in the file, not just for the helper) and a
REST-shaped call (`_dio.get`/`_dio.post` against a path). **The REST shape does not imply a BFF
hop** — confirmed false for the `messages` vertical (Phase 0): every one of its REST-shaped calls
(`friends.dart`, `friend_requests.dart`, `accept_friend_request.dart`, etc.) hits a path that
matches the **backend's own native controller route** exactly (`/api/friends`, not the frontend
BFF's namespaced `/api/messages/friends`) — i.e. `apiBaseUrl` points at the NestJS backend directly,
and *neither* call shape involves the Next.js app at all for this vertical. See
`CROSS-007` (resolved) — an earlier research pass in this same effort
mis-classified this as "REST-via-BFF" without checking whether the REST path matched the backend's
native route or the frontend's BFF-namespaced one; that framing is retracted here and must not be
assumed for un-verified verticals either.

**Per vertical, per file, determine which of these three shapes actually applies — don't reuse a
prior vertical's answer:**

1. **Direct to backend, GraphQL shape** — posts to `/graphql`. **Calls** link goes straight to the
   backend `endpoints.md` § GraphQL entry.
2. **Direct to backend, REST shape** — the REST path matches a real backend controller route (check
   the backend module's own `endpoints.md` § REST for that exact path). **Calls** link goes straight
   to the backend `endpoints.md` § REST entry, skipping the frontend doc — there is no frontend
   involvement in this call.
3. **Via the Next.js BFF** — the REST path matches the *frontend's* BFF-namespaced route (e.g.
   `/api/messages/friends`, not the backend's `/api/friends`) rather than a backend route directly.
   **Calls** link goes to the matching frontend `api.md` entry, which itself links onward to the
   backend. Confirm this by checking whether the path Flutter calls appears as a backend controller
   route (shape 2) or only as a `next-js-boilerplate/src/app/api/**/route.ts` path (shape 3) —
   don't assume from the path alone.

State which of the three applies at the top of every mobile `api.md`, per file (a small table: file
→ shape → target doc), with the specific evidence (which path it hit, and what that path resolves
to) rather than a blanket per-vertical label.

## 10. Reporting issues while writing docs

Any discrepancy, dead code, missing parity, or doc/reality mismatch found while writing a doc gets a
row in [`issues.md`](./issues.md) **in the same change**. Link the issue from the doc that surfaced
it (a "Known issues" section on module/vertical READMEs, or an inline ⚠ callout on the specific
entry). Don't leave it as a prose aside buried in a random page — an issue that only exists as a
sentence inside a `page.md` will never get triaged.

## 11. Old reference docs are a lead, not a source of truth

This repo previously had hand-maintained reference docs (`AUTH.md`, `E2EE.md`, `REALTIME.md`, ADRs)
that were often detailed and well-written — but two were caught, while writing this pilot, actively
describing removed systems (see issues.md (resolved) and
issues.md (resolved)). Treat any surviving notes, comments, or memory of those docs as
a **draft lead only**: verify every non-trivial claim against the actual current source file before
writing it into a new doc. A doc that matches source today drifts the moment source changes again —
these docs are only as good as the next person's discipline in re-verifying them, not a one-time
transcription exercise.
