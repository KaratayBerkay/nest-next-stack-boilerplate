# Flutter-only infra

Supporting infrastructure with no Next.js equivalent page — either because the concept is
Flutter/mobile-specific (native share sheets, route-loading skeletons under a GoRouter navigator) or
because it mirrors a *component* web has (static error/not-found/loading pages) rather than a route.
None of the three areas below is a page or screen in its own right, so none gets a `screen.md`.

## `share_sheet/` — deleted

**Was at** `lib/views/common/share_sheet/` (not a top-level `lib/share_sheet/`). The whole folder —
all three files below — was removed in the cross-stack dead-code pass (commit `b98fac8a`), closing
[MOB-029](../issues.md#mob-029). Inventory kept for the record:

Three files, all plain Dart/Flutter with no external service dependency:

| File | Contents |
|---|---|
| `share_content.dart` | `ShareContent` — a `{title, description?, url?, imageUrl?, contentType?}` data model with `fromJson`/`toJson`. |
| `share_actions.dart` | `ShareActions` — a widget rendering a "Share" button (calls an `onShare` callback) and a "Copy link" button (clipboard + snackbar). |
| `share_platform.dart` | `SharePlatform` — a `{id, name, iconUrl?, isInstalled, packageName?}` data model for an installed share-target app. |

**⚠ All three were dead code** — `grep -rn "ShareContent(\|ShareActions(\|SharePlatform("
flutter-boilerplate/lib` matches only each file's own definition, nowhere else in the app. The real
`v1/share` screen (documented in Phase 2b) does not import from this folder, and the app's actual
native-share integration elsewhere (`mfa_enroll`, `attachment_preview`) uses the `share_plus` package
directly rather than this custom trio. See [MOB-029](../issues.md#mob-029).

## `lib/fallbacks/`

**Real, live** route-loading/skeleton fallback widgets — genuinely imported by multiple real screens
(e.g. every `settings/*/page_view.dart`). Barrel-exported from
[`index.dart`](../../flutter-boilerplate/lib/fallbacks/index.dart). Organized under three subfolders
(the task brief for this doc named only the first two; `views/` is real and included here for
completeness):

- **`app/{v1,auth,routing,security,i18n,demos,gallery}/`** — per-route/per-vertical loading skeletons,
  one file per target (e.g. `app/v1/feed_loading_fallback.dart`, `app/v1/admin_loading_fallback.dart`,
  `app/auth/verify_email_fallback.dart`). The `v1/` subfolder alone covers 16 targets including
  `admin_loading_fallback.dart` and `audit_logs_loading_fallback.dart` — this vertical's own loading
  states.
- **`shared/`** — 5 small presentational primitives reused across the `app/` fallbacks:
  `loading_dots.dart`, `loading_text.dart`, `mono_ellipsis.dart`, `pulse_block.dart`,
  `pulse_small_block.dart`.
- **`views/`** — 4 fallbacks scoped to specific feature verticals rather than routes:
  `chat_room_fallback.dart`, `find_friends_fallback.dart`, `messages_view_fallback.dart`,
  `notification_fallback.dart`.

## `lib/features/statics/`

Seven static app-level pages, mirroring web's `src/features/statics/` **concept-for-concept**
(loading, not-found ×2 including an i18n variant, error ×2 including a global variant,
access-denied, unauthorized):

| File | Widget |
|---|---|
| [`access_denied/access_denied_page.dart`](../../flutter-boilerplate/lib/features/statics/access_denied/access_denied_page.dart) | `AccessDeniedPage` |
| [`error/error_page.dart`](../../flutter-boilerplate/lib/features/statics/error/error_page.dart) | `ErrorPage` |
| [`error/global_error_page.dart`](../../flutter-boilerplate/lib/features/statics/error/global_error_page.dart) | `GlobalErrorPage` |
| [`loading/loading_page.dart`](../../flutter-boilerplate/lib/features/statics/loading/loading_page.dart) | `LoadingPage` |
| [`not_found/not_found_page.dart`](../../flutter-boilerplate/lib/features/statics/not_found/not_found_page.dart) | `NotFoundPage` |
| [`not_found/i18n_not_found_page.dart`](../../flutter-boilerplate/lib/features/statics/not_found/i18n_not_found_page.dart) | `I18nNotFoundPage` |
| [`unauthorized/unauthorized_page.dart`](../../flutter-boilerplate/lib/features/statics/unauthorized/unauthorized_page.dart) | `UnauthorizedPage` |

All seven are exported from
[`index.dart`](../../flutter-boilerplate/lib/features/statics/index.dart).

**⚠ The entire directory is dead code** — `grep -rln "features/statics"
flutter-boilerplate/lib`, excluding the directory's own files, returns **nothing**: no screen, no
router `errorBuilder`, no `ErrorWidget.builder`, nothing imports any of these seven widgets or the
barrel. This is a meaningful gap, not a cosmetic one: web's directly-equivalent
[`src/features/statics/`](../../next-js-boilerplate/src/features/statics/) is genuinely wired up (its
`AccessDeniedPage` is the exact fallback web's own [admin page](../frontend/v1/admin/page.md) renders
for a non-admin visitor — see
[`views/admin/PageContent.tsx`](../../next-js-boilerplate/src/views/admin/PageContent.tsx)). Mobile
built the equivalent widget set and never wired any of it into a real error boundary, router
`errorBuilder`, or the admin screen's own (missing) role-check fallback — see
[mobile/v1/admin/screen.md § The admin-role gate](./v1/admin/screen.md#the-admin-role-gate) for the one
place this would have been a direct, ready-to-use fix. See [MOB-028](../issues.md#mob-028).

## Naming trap: `lib/fallbacks/app/` vs. `lib/views/fallbacks/app/`

These are two different directories with confusingly similar names and paths. Read both fully before
assuming either one — don't guess from the name alone.

- **`lib/fallbacks/app/`** (documented above) — real, live, imported by real screens.
- **`lib/views/fallbacks/app/`** — **entirely dead**, and not a second flavor of real per-vertical
  loading content either. 19 files, unreferenced by anything outside the directory itself
  (`grep -rln "views/fallbacks"` excluding the directory's own files: zero matches, confirmed for
  every individual file and for the directory as a whole). Two distinct things live inside it, both
  dead:
  - **A self-contained tier-gated "not found"/"error" fallback system**
    (`app_fallback_base.dart` + `free_page_view.dart`/`basic_page_view.dart`/`medium_page_view.dart`/
    `premium_page_view.dart` + `page_view.dart`'s `FallbackAppContent`, a `TierGate` wrapping the four).
    All four tier variants render byte-identical content for a given `AppFallbackType` (`notFound` /
    `error`) — the tier branching exists structurally but carries no actual tier-specific behavior.
    Nothing imports `FallbackAppContent`; this cluster is unreachable from any route.
  - **13 more files sharing exact names with real files under `lib/fallbacks/app/**`**
    (`auth_fallback.dart`, `dynamic_loading_fallback.dart`, `feed_loading_fallback.dart`,
    `gallery_fallback.dart`, `i18n_fallback.dart`, `lazy_loading_fallback.dart`,
    `messages_loading_fallback.dart`, `ppr_fallback.dart`, `routing_fallback.dart`,
    `v1_content_fallback.dart`, `v1_page_fallback.dart`, `v1_shell_fallback.dart`,
    `verify_email_fallback.dart`) — every one of these is independently unreferenced too. This reads
    as an abandoned first draft of the fallback system, superseded by the real `lib/fallbacks/` tree
    and left behind rather than deleted, not a second real content type that belongs cross-referenced
    from any vertical's own docs.

See [MOB-027](../issues.md#mob-027) for the full write-up.
