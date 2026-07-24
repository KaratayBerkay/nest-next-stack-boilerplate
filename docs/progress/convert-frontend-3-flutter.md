# convert-frontend-3-flutter — Make the Flutter app actually work, then reach parity

**Date:** 2026-07-24 · **Verified against:** `22cb57f` (HEAD of main) · **Predecessor:** [convert-frontend-2-flutter.md](convert-frontend-2-flutter.md) (the original conversion plan — structure/dependency mapping lives there, don't duplicate it here)

`flutter-boilerplate/` exists and is structurally faithful to the plan (809 Dart files, 122 routes, 66 UI widget folders, two-layer API, TierGate, realtime client, 300-test suite). But at HEAD **it does not build, does not pass its own gates, and cannot run anywhere by default**. Every claim below was reproduced on this server today — commands and exact errors included. This doc is the fix plan: Phase A makes every gate green, Phase B makes it a *proper mobile app* on real devices, Phase C closes the parity gap with next-js-boilerplate.

Per the roadmap workflow: complete a phase and its gate before starting the next; append a dated status log at the bottom as work lands.

**Skills:** four repo-local skills were authored for this work — `flutter-conversion` (architecture + porting rules), `flutter-ui-widgets`, `flutter-theming`, `flutter-testing` (in `.claude/skills/`, registered in AGENTS.md). Load them before touching Flutter code; they encode the conventions this doc assumes.

---

## 0. Verified current state (2026-07-24)

| Check | Command | Result |
|---|---|---|
| Deps | `flutter pub get` | ✅ OK (Flutter 3.44.2 / Dart 3.12.2 at `/opt/flutter`) |
| Analyzer | `flutter analyze` | ❌ **14 issues: 3 errors, 2 warnings, 9 infos** (details §A2/§A4) |
| Tests, fresh checkout | `flutter test` | ❌ `No file or variants found for asset: .env` → `Failed to build asset bundle`, **0 tests run — and exit code 0** (§A1) |
| Tests, with `.env` | `cp .env.example .env && flutter test` | ✅ **300/300 pass in ~35 s** — the suite itself is healthy |
| Release APK | `flutter build apk --release` | ❌ `:app:checkReleaseAarMetadata`: *"Dependency ':flutter_local_notifications' requires core library desugaring"* — fails after ~11 min (§A3) |
| Web/desktop run | `flutter build web` / `flutter run` | ❌ no `web/` or `linux/` platform folder; no AVD exists → **zero runnable targets on this server** (§B8) |
| Docker compose | `docker compose --profile flutter up` | ❌ broken by construction: builds to the final `FROM scratch` stage, then tries to run `sh`/`flutter`/`python3` in it (§A7) |
| CI | `.github/workflows/flutter-ci.yml` | ❌ red at `pub get`: workflow pins Flutter **3.27.x** but `pubspec.lock` was resolved under 3.44 (3.27 also pins `intl 0.19` vs project's `0.20.2`) (§A5) |
| Local gates | `.husky/pre-commit` / `pre-push` | ⚠️ only run next-js checks — nothing gates Dart commits, which is how the errors above landed on main (§A6) |

Environment notes: Android SDK 36.1 at `~/Android/Sdk` (⚠️ licenses not fully accepted — run `flutter doctor --android-licenses` once), Chrome present, GTK missing (`apt install libgtk-3-dev` if Linux desktop ever wanted), no emulator AVD created. `ios/` exists but is untestable here (no macOS).

Parity snapshot (§C for the full breakdown):

| Dimension | next-js | flutter | Parity |
|---|---|---|---|
| Routes (pages) | 157 | 122 | ~78% — plus **URL-contract drift** on 4 core routes (§B5) |
| UI widget folders | 71 | 66 | missing: `bottom-sheet`, `logo-spinner`, `page-header` (+ shared style files) |
| Hooks | 31 | 17 | 14 unported (§C3) |
| i18n keys | 1,318 (24 namespaces) | ~95 strings | **~7% — the biggest parity gap** (§C1) |
| Themes | 4 (light, dark, ocean, violet) | 2 (light, dark), not persisted | §C5 |
| Source files | 1,729 ts/tsx | 809 dart | expected consolidation, not 1:1 by count |

---

## Phase A — Every gate green on a fresh checkout

Goal: `git clone → cd flutter-boilerplate → make the four gates pass with zero manual folklore`. Nothing else matters until this is true — every later phase builds on trustworthy gates.

### A1 · The `.env` asset trap (P0 — breaks *every* flutter command)

`pubspec.yaml` bundles `.env` as an asset and `main.dart` `await dotenv.load()`s it unconditionally, but root `.gitignore` line 26 (`*.env`) means the file never exists on a fresh checkout, in CI, or in a clean Docker context. Every `flutter run/test/build` dies at asset bundling. Worse, **`flutter test` still exits 0** while running zero tests — which is how "300 tests green" got claimed while the tree was broken. Never trust the exit code; require the `+NNN: All tests passed!` line.

**Recommended fix — drop the runtime dotenv/asset entirely, use compile-time defines** (mobile-idiomatic; kills the whole failure class):

1. Rewrite `lib/app_config.dart` to compile-time constants:

```dart
class AppConfig {
  AppConfig._();
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:3001');
  static const stripePublishableKey = String.fromEnvironment('STRIPE_PUBLISHABLE_KEY', defaultValue: '');
  static const wsUrl = String.fromEnvironment('WS_URL', defaultValue: 'ws://localhost:3001/ws');
  static const appEnv = String.fromEnvironment('APP_ENV', defaultValue: 'development');
  // isProduction / isDevelopment stay as-is
}
```

2. Delete from `pubspec.yaml` assets: `- .env`. Delete `flutter_dotenv` from deps. Delete `await dotenv.load()` from `main.dart` (and the import).
3. Local/dev builds that need overrides: `flutter run --dart-define-from-file=.env` (Flutter reads the same KEY=VALUE file — `.env.example` format keeps working; keep `.env` gitignored, now harmlessly optional).
4. Update `Dockerfile` build line to `flutter build apk --release --dart-define-from-file=.env.example` (or real defines via build args — it already passes `--dart-define=APP_ENV`).

*Stopgap if you want green today without the refactor:* `cp -n .env.example .env` locally, add the same `cp` step to CI and Dockerfile. Fragile — every consumer must remember it; prefer the real fix.

### A2 · Analyzer errors — `lib/hooks/use_push_notifications.dart` (P0)

Three compile errors: the file imports `flutter_riverpod` directly and uses `StateProvider` (Riverpod 3 moved it to `legacy`), and references a nonexistent type `NotificationPermission` (firebase_messaging's type is `AuthorizationStatus`). The repo's own shim `lib/lib/riverpod_compat.dart` exists precisely for this and the file ignores it. (The app still built because nothing imports this hook — `pushNotificationPermissionProvider` has zero consumers.)

```dart
// replace: import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
...
final pushNotificationPermissionProvider =
    StateProvider<AuthorizationStatus?>((ref) => null);   // was NotificationPermission
```

Then either wire the permission provider up in `services/push_notification_service.dart` (set it after `FirebaseMessaging.instance.requestPermission()`) or delete it — dead providers rot. Also delete the unused `dart:io` import in `lib/hooks/use_device_type.dart` (the 2nd warning; the 1st is the `.env` asset warning, gone after A1).

### A3 · Release APK — enable core library desugaring (P0)

`flutter_local_notifications` ≥19 requires Java desugaring. In `android/app/build.gradle.kts`:

```kotlin
android {
    compileOptions {
        isCoreLibraryDesugaringEnabled = true          // add
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {                                          // add block (top level)
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}
```

Verify with `flutter build apk --release` → `build/app/outputs/flutter-apk/app-release.apk`. (First build ~11 min on this box; incremental is fast.)

### A4 · Analyzer zero-warnings policy (P1)

8 `use_build_context_synchronously` infos (comment_section, post_stats_sidebar, reaction_buttons, auth pages) + 1 `unnecessary_const`. The async-gap ones are real bug surface on mobile (navigating after dispose). Recipe — capture before the `await`, or guard the *same* context you use:

```dart
final messenger = ScaffoldMessenger.of(context);   // capture BEFORE await
await action();
messenger.showSnackBar(...);                       // safe
// or:  await action(); if (!context.mounted) return;  context.go(...)
```

Gate on `flutter analyze` printing `No issues found!` — infos included. That is the standard the README already (falsely) claims.

### A5 · CI workflow red (P0 for CI trust)

`.github/workflows/flutter-ci.yml` pins `flutter-version: 3.27.x`; the lockfile is resolved by 3.44 and `intl 0.20.2` conflicts with 3.27's pinned intl. Fix: `flutter-version: 3.44.2` — and adopt the rule (now in the `flutter-testing` skill): **whoever regenerates `pubspec.lock` bumps the workflow pin in the same commit.** If A1's stopgap was chosen instead of the real fix, CI also needs `cp .env.example .env` before the test step. Consider adding a `flutter build apk --debug` job — analyzer+tests would not have caught A3.

### A6 · Nothing gates Dart locally (P1)

`.husky/pre-push` runs only `tsc` for next-js. Add a guarded Flutter gate so broken Dart can't land silently:

```sh
# .husky/pre-push (append)
if git diff --cached --name-only HEAD | grep -q '^flutter-boilerplate/'; then
  (cd flutter-boilerplate && flutter analyze && dart format --set-exit-if-changed lib/ test/)
fi
```

(Full `flutter test` pre-push is a taste call — 35 s — but analyze+format is non-negotiable.)

### A7 · Docker compose `flutter` service cannot start (P1)

Two independent defects:
1. Compose has no `target:`, so it builds the Dockerfile's **final stage — `FROM scratch`** (contains only the APK), then `command:` tries to run `sh`, `flutter`, and `python3` inside it. A scratch image has no shell; the container can never start. The command *also* re-runs the whole APK build at container start, duplicating what the image build already did.
2. `flutter-boilerplate/` has no `.dockerignore`, so `build/` (GBs) and `.dart_tool/` ship as build context.

Fix — serve the already-built APK from a real base image, and let compose target it:

```dockerfile
# Dockerfile — append after the builder stage (keep `artifact` for --output extraction)
FROM python:3.12-alpine AS serve
WORKDIR /srv
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk .
RUN printf '<html><body><h1>Flutter APK</h1><a href="app-release.apk">Download</a></body></html>' > index.html
EXPOSE 8082
CMD ["python3", "-m", "http.server", "8082"]
```

```yaml
# docker-compose.yml — flutter service
flutter:
  profiles: ["flutter"]
  build:
    context: ./flutter-boilerplate
    target: serve
  ports:
    - "8082:8082"
  # command: removed — the image is the artifact
```

```
# flutter-boilerplate/.dockerignore (new)
build/
.dart_tool/
.git/
```

Also pin the base image — `ghcr.io/cirruslabs/flutter:latest` drifts; pin `:3.44.2` to match local + CI (one Flutter version everywhere is the whole point of A5).

**Phase A gate:** on a clean clone — `flutter analyze` → *No issues found*; `dart format --set-exit-if-changed lib/ test/` clean; `flutter test` → `+300: All tests passed!` (count visible, not exit-code-green); `flutter build apk --release` → APK exists; `docker compose --profile flutter up` serves the APK on :8082; CI workflow green on a PR.

---

## Phase B — A proper mobile app on a real device

Phase A makes it compile; this phase makes it *work on a phone*. These are the classic web→mobile conversion traps — each verified present in the code.

### B1 · Networking per target (P0 on device)

`API_BASE_URL=http://localhost:3001` on a phone is the phone itself. Targets: Android emulator → `http://10.0.2.2:3001`; physical device on LAN → `http://<server-LAN-ip>:3001`; production → `https://app.eys.gen.tr` (per prod deploy notes: WS probes there need HTTP/1.1-capable proxying; mobile WS goes through the same external openresty). Same for `WS_URL`. With A1's dart-defines this is a per-build flag, e.g. `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001`. Add a README matrix.

Security: `android:usesCleartextTraffic="true"` sits in the **main** manifest, shipping plaintext-HTTP capability in release. Move it to a debug-only overlay (`android/app/src/debug/AndroidManifest.xml`); release talks https only.

### B2 · Stripe will crash — wrong Activity class (P0 for billing)

`flutter_stripe` requires `FlutterFragmentActivity` + AppCompat-descendant themes; `MainActivity` is a plain `FlutterActivity`, and `app.dart` initializes Stripe at startup (`stripeInitProvider`). On device, Stripe UI (CardField/payment sheets) throws.

```kotlin
// android/app/src/main/kotlin/.../MainActivity.kt
import io.flutter.embedding.android.FlutterFragmentActivity
class MainActivity : FlutterFragmentActivity()
```

Plus in `android/app/src/main/res/values*/styles.xml`, base `LaunchTheme`/`NormalTheme` on `Theme.MaterialComponents` parents (flutter_stripe README's exact requirement), and confirm `minSdk ≥ 21` (template default flows from `flutter.minSdkVersion` — check the printed value once). iOS: `platform :ios, '13.0'` in the Podfile when iOS work starts.

### B3 · Firebase push is dead code right now (P1)

No `google-services.json`, no google-services Gradle plugin, and nobody calls `Firebase.initializeApp()` — `PushNotificationService.initialize()` just throws into its `catch (_) {}`. Two acceptable states, pick one explicitly:
- **Configured:** run `flutterfire configure` (adds `firebase_options.dart` + platform files), apply the google-services plugin, call `Firebase.initializeApp(options: ...)` in `main()` before `runApp`, keep graceful degradation for simulators.
- **Deferred:** gate the whole service behind `AppConfig` (`PUSH_ENABLED=false` default) so the dead path is *visibly* off instead of silently swallowed. Either way, stop relying on the silent catch — log it via `lib/lib/logger.dart`.

### B4 · App identity & signing (P1, blocks any distribution)

Still template values: `applicationId "com.example.flutter_boilerplate"`, label `flutter_boilerplate`, default icon, and **release builds signed with the debug keystore** (the build.gradle.kts TODO). Fix: pick the real id (e.g. `tr.gen.eys.app`), set `android:label`, generate an upload keystore + `key.properties` wiring (standard Flutter docs recipe), add launcher icons (`flutter_launcher_icons` package is the low-effort route).

### B5 · URL-contract drift breaks deep links & push navigation (P1)

The manifest claims `https://app.eys.gen.tr` links and `PushNotificationService.navigateTo` does `router.go(path)` with backend-sent paths — both arrive **web-shaped**. Four core routes drifted, so those links land on `missing_page.dart`:

| Web contract | Flutter today | Fix |
|---|---|---|
| `/v1/:lang/posts/:uuid` | `/v1/:lang/posts/:postId` | rename param to `:uuid` |
| `/v1/:lang/users/detail/:uuid` | `/v1/:lang/users/:userId` | add `/users/detail/:uuid` route (keep old as redirect) |
| `/v1/:lang/chat-room` | `/v1/:lang/chat/:conversationId` | add `/chat-room` (+`?conversation=` param) alias |
| `/v1/:lang/checkout/:tier` | `/v1/:lang/checkout/:plan` | rename param to `:tier` |

Rule going forward (in the `flutter-conversion` skill): **mobile route paths and params must byte-match the web routes** — the backend, notifications, and App Links all speak web URLs. Also: App Links auto-verification needs `/.well-known/assetlinks.json` served on `app.eys.gen.tr` with the release-signing SHA-256 (after B4); until then the https intent-filter only works via the chooser.

### B6 · Auth hardening (P1)

- **No refresh flow:** `AuthInterceptor` logs out on any 401. Web refreshes via `POST /api/auth/token` using the device token. Mirror it: on 401 → attempt refresh once (queue concurrent requests) → retry original → logout only on refresh failure.
- **Credential logging:** `LogInterceptor(requestBody: true, responseBody: true)` prints every login password and bearer token via debugPrint. Guard with `if (AppConfig.isDevelopment)` *and* redact `Authorization`/password fields. Do this before anyone runs a release build with adb attached.

### B7 · Persist theme & locale (P2)

`themeModeProvider` and `localeProvider` are in-memory `StateProvider`s — every launch resets to light/en; web persists both (theme-init.js + cookies). Persist through `shared_preferences` (already a dependency): read in `main()` before `runApp`, write on change, keep provider APIs unchanged (recipe in the `flutter-theming` skill).

### B8 · Give this headless server a preview target (P2, quality-of-life)

Today nothing can *run* here. Two cheap options, do both:
1. `flutter create --platforms web .` once, commit `web/` — `flutter run -d chrome` (Chrome is installed) gives instant UI preview; mark web as dev-preview-only (flutter_stripe/firebase have web caveats — guard their init with `kIsWeb`).
2. Create an AVD for real smoke tests: `flutter emulators --create --name pixel` then `flutter emulators --launch pixel` (headless: `-no-window` via `emulator` CLI) → `flutter run`, and `flutter test integration_test/` becomes possible (4 suites exist and currently never run anywhere).

**Phase B gate:** on an emulator/device against a real backend — register → login → feed loads → open post detail (deep-link a web URL) → chat over WS → checkout screen renders CardField → push permission prompt (or explicit PUSH_ENABLED=false) → kill app, relaunch: theme/locale/session survive. Release APK installs signed with the release keystore.

---

## Phase C — Parity closure ("exact same boilerplate")

Ordered by user-visible impact. Re-verify numbers before starting each item — this snapshot is 2026-07-24.

### C1 · i18n: 95 strings vs 1,318 keys (~7%) — the biggest gap

Views are overwhelmingly hardcoded English. Port namespace-by-namespace from `next-js-boilerplate/messages/{en,tr}/<ns>/messages.json` (24 namespaces: auth, feed, messages, notification, posts, settings, ui, v1, v1-shell, admin, apiKeys, chat-room, checkout, error, find-friends, forms, home, i18n, premium, pricing, share, shared, users, accordion) into `lib/l10n/app_{en,tr}.arb`.

Do it with a converter script, not by hand: `scripts/messages-to-arb.mjs` — flatten nested JSON to `ns_camelPath` keys (matches the existing `auth_login_title` convention), pass ICU `{placeholders}` through, emit both locales, fail on key-set mismatch between en/tr. Then sweep views namespace-by-namespace replacing literals with `AppLocalizations.of(context).<key>`, running `flutter gen-l10n` + committing generated files each time (both-ARBs-or-build-breaks rule is in the skills). Suggested order: v1-shell → auth → feed → messages → settings → the rest.

### C2 · Missing routes (35)

Feature routes to port: `/v1/:lang/ui` (gallery index), `/v1/:lang/ui/accordion/rich-items` + `/variants`, `/dashboard/@analytics` + `@team` (as tabs/panes inside `DashboardShell` — GoRouter has no parallel outlets; a `StatefulShellRoute` or TabBar is the honest mobile mapping), `/gallery/@modal/(.):id` (mobile pattern: `showModalBottomSheet` on top of the grid, keep the full-page `/gallery/:id` for deep links).

Demo routes: port the concept, not the web internals — `/demos` index exists; add mobile-meaningful ones (`/form`, `/i18n/:lang`, `/theme`, `/sse`→WS demo, `/ws`, `/lazy-loading`, `/images`, `/observability`, `/search-params`, `/routing/*` sub-demos incl. redirect/missing/slow/boom). Mark web-only ones N/A in a table when closing this item: `ssr`, `csr`, `ppr`, `server-actions`, `request-memoization`, `caching`, `static`, `scripts`, `fonts`, `security/csp`, `seo`, `ssr-cookies`, `csr-cookies`, `client-data`, `data-fetching`, `dynamic` (16 of the 35 — document, don't fake).

### C3 · Missing hooks (14 of 31)

Port with mobile-native mappings: `useApi`, `usePresence`, `useSSE` (→ WS-backed stream provider), `useNetworkLogger`, `usePerformanceLogger`, `usePageNavigation`, `usePostHashScroll` (→ ScrollController + anchor), `useLang`, `useExitAnimation`. Replace-don't-port (native equivalents): `useClickOutside` (TapRegion), `useMediaQuery` (MediaQuery/`use_breakpoint.dart` exists), `useEdgeSwipe`/`useSwipeGesture`/`useYSwipeGesture` (GestureDetector — but *do* mirror the edge-swipe-back UX in the v1 shell).

### C4 · Component library gaps

Missing folders: `bottom_sheet` (web `vaul` drawer — wrap `showModalBottomSheet` + `DraggableScrollableSheet`), `logo_spinner` (a demo page exists but no reusable widget), `page_header`. Structural debt: extract shared style maps (`button_styles`, `input_styles`, `menu_item_styles` equivalents) instead of per-file switches where ≥2 widgets share them; move request/response models still inlined in `api/server/*` files into `lib/types/<feature>/` (AGENTS.md types rule — `LoginRequest`/`LoginResponse` in `login.dart` is the exemplar offender).

### C5 · Themes: 2 of 4, unpersisted

Add `ocean` and `violet` `AppColors` presets derived from the web `.theme-*` values (never invent — contrast was CI-gated on web), extend `AppThemeMode`, branch `buildThemeData`, add the picker to settings/general. Persistence is B7. Six-spots-per-token recipe is in the `flutter-theming` skill.

### C6 · Housekeeping & honesty

- **pubspec:** remove unused codegen stack (`freezed`, `freezed_annotation`, `json_annotation`, `json_serializable`, `riverpod_annotation`, `riverpod_generator`, `go_router_builder`, `build_runner`) *or* adopt codegen deliberately — currently zero `*.g.dart` exist while 8 codegen packages resolve on every `pub get`. Removing is the cheap, honest option; document it.
- **README:** fix false claims — "0 errors 0 warnings" (was 14 issues), "150 tests" (300), "no legacy StateNotifier" (authProvider *is* a StateNotifierProvider via the compat shim — fine, but say so), `flutter gen-l10n` step (outputs are committed).
- **assets:** `assets/scripts/` bundles web JS (theme-init) into the APK — delete from pubspec assets.
- **integration_test/:** 4 suites exist and run nowhere. After B8's AVD: wire `flutter test integration_test/` into a nightly or manual CI job (emulator-in-CI is slow; don't put it in the PR gate).

**Phase C gate:** route diff vs web = explicit N/A table only; i18n key count ≥ web count for ported namespaces with en/tr in lockstep; `flutter analyze`/`format`/`test` green; APK smoke per Phase B gate still passes.

---

## Appendix — "Proper Flutter app" doctrine (what this conversion got wrong, generalized)

1. **An asset declared in pubspec must exist in every context that builds** — gitignored files are not assets. Prefer `--dart-define(-from-file)` for config; never make boot depend on an optional file.
2. **Exit codes lie in Flutter tooling** (`flutter test` bundling failure → 0). Gates must assert on positive evidence (`All tests passed!`, artifact exists).
3. **Read each plugin's platform requirements the day you add it** — flutter_stripe (FragmentActivity + Material themes), flutter_local_notifications (desugaring), firebase_messaging (google-services + init). Analyzer and unit tests catch none of these; only a real `flutter build apk` + device run does.
4. **One Flutter version everywhere** — local SDK, CI pin, Docker base tag, `pubspec.lock` resolver. Version skew fails at `pub get` (best case) or ships subtle differences (worst).
5. **The URL contract belongs to the backend/web** — mobile routers mirror it byte-for-byte or deep links/push die quietly.
6. **`localhost` does not exist on phones**; cleartext HTTP is debug-only.
7. **Silent catch-alls hide dead subsystems** (push). Feature-flag intentionally-off things; log unexpectedly-off things.
8. **Template identity (`com.example`, debug signing) is a release blocker**, not polish.
9. **Gates run where the code changes** — hooks/CI that only cover the web package let mobile rot invisibly.
10. **Mirror, don't invent** — every file here has a Next.js twin; when in doubt, open the twin (that's what the `flutter-conversion` skill enforces).

---

## Status log

- **2026-07-24 — Doc created.** Full diagnosis done on `22cb57f`: analyze 3E/2W/9I, test suite 0-run-exit-0 without `.env` / 300-pass with it, APK blocked on desugaring, CI red on version pin, compose service unrunnable, parity measured (routes 122/157, i18n ~7%, hooks 17/31, themes 2/4). Four `flutter-*` skills authored in `.claude/skills/` and registered in AGENTS.md. **No fixes applied yet — Phase A not started.** (A local gitignored `flutter-boilerplate/.env` was created from `.env.example` on this server to run the suite.)
