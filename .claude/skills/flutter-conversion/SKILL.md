---
name: flutter-conversion
description: Architecture and porting conventions for flutter-boilerplate — the Flutter/Dart mobile clone of next-js-boilerplate in this repo. Use whenever creating, editing, reviewing, or debugging ANY Dart file under flutter-boilerplate/, and whenever porting a next-js-boilerplate feature, page, hook, view, or API call to the mobile app — even if the user just says "add X to the flutter app", "the mobile app is broken", "convert this page", or mentions Flutter, Dart, APK, Riverpod, GoRouter, or Dio in this repo. Covers the directory mapping, the riverpod_compat import rule, the two-layer Dio API pattern, auth/session, the GoRouter route-registration checklist, TierGate tier views, the ARB i18n workflow, the .env bundling trap, and how to run/build on this headless server.
---

# Porting next-js-boilerplate to flutter-boilerplate

`flutter-boilerplate/` is a 1:1 mechanical port of `next-js-boilerplate/` (same backend,
same routes, same tier logic, same two-layer API). The conversion contract: **for every
Flutter change, find the Next.js source file first and mirror its mechanics** — same file
role, same naming (converted), same data flow. Code that invents its own architecture
reads as foreign here even when it works. The full mapping plan lives in
`docs/progress/convert-frontend-2-flutter.md`; current status/fix list in
`docs/progress/convert-frontend-3-flutter.md`.

All paths below are relative to `flutter-boilerplate/`.

## Directory mapping (Next.js → Flutter)

| next-js-boilerplate/src/ | flutter-boilerplate/lib/ | Notes |
|---|---|---|
| `app/` (file-system routes) | `app/router.dart` (one GoRouter tree) + `app/app.dart` | routes are explicit `GoRoute` entries |
| `views/` | `views/` | page content widgets, `page_content.dart` / `page_view.dart` |
| `components/ui/` | `components/ui/` | design system — see **flutter-ui-widgets** skill |
| `api/server/` + `api/client/` | `api/server/` + `api/client/` | two-layer pattern, below |
| `constants/api/` | `constants/api/` | `urls.dart`, `methods.dart`, `headers.dart` |
| `hooks/useX.ts(x)` | `hooks/use_x.dart` | each exposes Riverpod providers, not classes |
| `lib/` | `lib/lib/` | yes, `lib/lib/` — intentional mirror (`cn.dart`, `tier.dart`, `date_time.dart`, `realtime/`, `i18n/`, …) |
| `types/<feature>/` | `types/<feature>/` | plain Dart classes with `fromJson`/`toJson` (no codegen) |
| `validators/` | `validators/` | pure-function validators, no zod equivalent |
| `features/` | `features/` | `auth`, `billing`, `forms`, `statics` |
| `store/` | `store/` | `ssr_cookies.dart` |
| `messages/<lang>/<ns>/` | `l10n/app_<lang>.arb` | flat keys, namespace prefix: `auth_login_title` |
| `public/` | `assets/` | declared in `pubspec.yaml` |

Naming conversion: kebab/PascalCase file names → `snake_case.dart`; `useTheme.tsx` →
`use_theme.dart`; React component `FooBar` → widget class `FooBar` in `foo_bar.dart`.

## The riverpod_compat rule (do not skip)

This app is on **Riverpod 3.x**, where `StateProvider`, `StateNotifier`, and
`StateNotifierProvider` moved to a legacy library. The repo has a shim:

```dart
// lib/lib/riverpod_compat.dart
export 'package:flutter_riverpod/flutter_riverpod.dart';
export 'package:riverpod/legacy.dart';
```

When a file needs any provider type, import the shim, not flutter_riverpod:

```dart
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
```

Why: importing `flutter_riverpod` directly and then using `StateProvider` does not
compile (this exact mistake shipped 3 analyzer errors in
`hooks/use_push_notifications.dart`). Widgets that only need `ConsumerWidget`/`ref` and
no legacy types may import `flutter_riverpod` — but the shim is always safe.

There is **no build_runner codegen** in this app: no `@riverpod`, no freezed, no
`*.g.dart`. Write providers and `fromJson` by hand like the existing files do.

## Two-layer API pattern

Never call Dio, `http`, or raw sockets in views, components, or hooks. Mirror
`AGENTS.md`'s web rule:

1. **Server layer** `api/server/<domain>/<verb>.dart` — a `Provider` + class making the
   Dio call, URLs from `constants/api/urls.dart`:

```dart
final loginServerProvider = Provider((ref) => LoginServer(ref.read(dioProvider)));

class LoginServer {
  final Dio _dio;
  LoginServer(this._dio);

  Future<LoginResponse> call(LoginRequest request) async {
    final response = await _dio.post<dynamic>(Urls.login, data: request.toJson());
    return LoginResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
```

2. **Client layer** `api/client/<domain>/actions.dart` (mutations) or `query.dart`
   (reads) — thin wrappers views actually import:

```dart
final loginActionsProvider = Provider((ref) => LoginActions(ref));

class LoginActions {
  final Ref _ref;
  LoginActions(this._ref);
  Future<LoginResponse> login(LoginRequest request) =>
      _ref.read(loginServerProvider).call(request);
}
```

Request/response models: prefer `lib/types/<feature>/` (mirrors `src/types/` rule);
some older server files still define them inline — follow the types/ rule for new code.

The shared Dio instance is `dioProvider` in `lib/lib/api_client.dart`:
`AppConfig.apiBaseUrl` base URL, JSON headers, `AuthInterceptor` (Bearer token from
secure storage; 401 → logout). There is no token-refresh flow yet — if you add one,
mirror `POST /api/auth/token` from the web app.

## Auth & session

`hooks/use_auth.dart` is the source of truth:

- `authProvider` — `StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>`
- Storage: `flutter_secure_storage`, keys `access_token` and `session_user` (same names
  as the web cookies — intentional)
- Derived: `isAuthenticatedProvider`, `currentUserProvider`, `userTierProvider`
  (defaults `'free'`)
- Login flows call `authProvider.notifier.setSession(token, user)` after the API call

## Adding a route (checklist)

Routes live in one file, `app/router.dart` (`routerProvider`), guarded by a redirect:
unauthenticated `/v1/*` → `/auth/login`; authenticated `/auth/*` → `/v1/en/feed`.

1. Create the view: `views/<route>/page_content.dart` (public pages) or tier-gated
   `page_view.dart` (v1 pages) — mirror the Next.js `src/views/<route>/` file.
2. Import it in `app/router.dart` and add a `GoRoute` with a `name:`.
   - Public: top-level `GoRoute(path: '/pricing', name: 'pricing', …)`
   - Authenticated: inside the v1 `ShellRoute`, path `'/v1/:lang/…'`, pass
     `lang: state.pathParameters['lang'] ?? 'en'` down.
   - UI demos: `'/v1/:lang/ui/<kebab-name>'`, name `'uiFooBar'`.
3. Add the path to `constants/routes.dart` (`Routes.<name>`).
4. Add any user-facing strings to `l10n/app_en.arb` + `app_tr.arb` (see i18n below).
5. Add a widget test under `test/` (see **flutter-testing** skill).

Dynamic segments: `[uuid]` → `:uuid` via `state.pathParameters`; search params via
`state.uri.queryParameters` — same shapes as the web router.

## Tier-gated views

Mirror of the web's tier views: each v1 feature has `free_page_view.dart`,
`basic_page_view.dart`, `medium_page_view.dart`, `premium_page_view.dart` composed by a
`page_view.dart` using `TierGate` (`lib/lib/tier_view.dart`) + `Tier.hasAccess()`
(`lib/lib/tier.dart`). The current tier comes from `userTierProvider`. Never branch on
tier inline in a view — route through TierGate so upgrade prompts stay consistent.

## i18n

- Source of truth: `l10n/app_en.arb` + `l10n/app_tr.arb`, flat keys prefixed by
  namespace (`auth_login_title`, `feed_noPosts`) — the ARB twin of
  `messages/<lang>/<ns>/messages.json`.
- `flutter gen-l10n` generates `l10n/app_localizations*.dart` (checked in — regenerate
  and commit when ARBs change; `l10n.yaml` routes output next to the ARBs).
- Use in widgets: `AppLocalizations.of(context).auth_login_title`. Locale state:
  `localeProvider` (`hooks/use_locale.dart`); delegates wired in `app/app.dart`.
- Add every new key to **both** ARB files or `gen-l10n` fails the build.

## Environment & config — the .env trap

`pubspec.yaml` declares `.env` as a bundled asset and `main.dart` runs
`await dotenv.load()` before `runApp`. But `.env` is **gitignored** (root
`.gitignore: *.env`), so on any fresh checkout every `flutter run/test/build` dies with
`No file or variants found for asset: .env` — and `flutter test` still exits 0, so
don't trust a green-looking test command without seeing test counts. First command in
any session:

```bash
cd flutter-boilerplate && cp -n .env.example .env
```

Config access goes through `AppConfig` (`lib/app_config.dart`) — never `dotenv.env[…]`
directly in features. Networking reality on devices: `localhost` in `.env` points at
the phone itself. Use `http://10.0.2.2:3001` for the Android emulator, a LAN IP for a
physical device, or the deployed `https://app.eys.gen.tr` backend.

## Running on this server (headless)

- `flutter analyze` / `flutter test` / `dart format` — always available; these are the
  gates (pre-push hooks only cover next-js, so run them yourself).
- `flutter build apk --release` — works (Android SDK at ~/Android/Sdk); output
  `build/app/outputs/flutter-apk/app-release.apk`, install on a phone via `adb` or the
  compose download page.
- There is **no AVD** and **no web/ or linux/ platform folder**, so `flutter run` has
  no usable target by default. To preview UI without a phone, add web support once
  (`flutter create --platforms web .`) and use `flutter run -d chrome`, or create an
  AVD (`flutter emulators --create`).

## Related skills

UI widgets/design system → **flutter-ui-widgets**; colors/typography/theme tokens →
**flutter-theming**; tests, gates, CI pitfalls → **flutter-testing**. The web-side
equivalents (ui-components, tailwind-theming, datetime-inputs) describe the source
conventions being mirrored — consult them when porting to keep semantics aligned.
