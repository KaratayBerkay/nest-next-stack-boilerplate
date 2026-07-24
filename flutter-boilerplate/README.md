# flutter-boilerplate

Flutter mobile clone of [next-js-boilerplate](https://github.com/anomalyco/nest-next-stack) — 130+ routes, 65+ UI components, tier-based views, Stripe billing, WebSocket realtime, and i18n mapped 1:1 from the Next.js web app.

## Architecture

```
lib/
├── api/              # Two-layer pattern
│   ├── server/       #   Dio HTTP calls (URL + method + header constants)
│   └── client/       #   Riverpod queryOptions + mutation hooks
├── app/              # GoRouter config, MaterialApp.router, app-wide providers
├── components/
│   └── ui/           # 50+ design-system widgets (Button, Card, Dialog, etc.)
├── constants/        # URLs, methods, headers, theme tokens, route names
├── hooks/            # Riverpod providers (auth, theme, locale, realtime, billing)
├── lib/              # Utilities (cn, DateTimeHelper, Tier, NetworkCache, etc.)
├── services/         # Push notifications (FCM), deep linking
├── types/            # Dart model classes (AuthenticatedUser, Post, etc.)
├── validators/       # Pure-function form validators (auth, billing, forms, messages)
└── views/            # Page content widgets (~180 routes)
    ├── v1/           # Authenticated shell (AppBar + NavRail + BottomNav)
    ├── feed/         # Tier-gated feed views (Free/Basic/Medium/Premium)
    ├── messages/     # Tier-gated messaging views
    └── ...
```

## Key Decisions

- **State:** Riverpod 3.x (auth uses `StateNotifierProvider` via legacy compat shim; new providers use `Notifier`/`NotifierProvider`)
- **Routing:** GoRouter 17.x with auth redirect guards and a `ShellRoute` for the V1 authenticated shell
- **HTTP:** Dio 5.x with an auth interceptor that attaches Bearer tokens and triggers logout on 401
- **Realtime:** Custom `RealtimeClient` wrapping `web_socket_channel` with auto-reconnect, exponential backoff, service registration, and topic watch/unwatch
- **Tier gate:** `TierGate` consumer widget + `Tier.hasAccess()` utility — maps to `allowedTiers` prop
- **Billing:** `flutter_stripe` 13.x with `StripeCardFormField` wrapping `CardField`, SetupIntent flow via the billing actions provider
- **i18n:** `flutter gen-l10n` from `l10n.yaml` — 1,298 strings in `app_en.arb` and `app_tr.arb` (generated from web `messages/` via `scripts/messages-to-arb.mjs`)
- **Push:** Firebase Cloud Messaging + `flutter_local_notifications` via `PushNotificationService`

## Getting Started

### 1. Sync secrets from Vault

```bash
# From repo root — fetches vault secrets and copies them to flutter-boilerplate/.env
docker compose run --rm vault-init
```

This populates `.vault-envs/mobile.env` from Vault at `secret/data/secret/production/mobile` and copies it to `flutter-boilerplate/.env`.

### 2. Run

```bash
cd flutter-boilerplate

# Web (Chrome) — fixed port for nginx proxying
flutter run -d chrome --web-port=4000 --dart-define-from-file=.env

# Android APK
flutter build apk --release --dart-define-from-file=.env

# iOS
flutter build ios --dart-define-from-file=.env
```

> **CORS:** When running Flutter web against `api.eys.gen.tr`, the backend must allow your Flutter origin in `CORS_ORIGIN`. For local dev, use `CORS_ORIGIN=*` on the backend, or proxy both through nginx on the same origin.

### Environment Variables

Set via `--dart-define-from-file=.env` or individual `--dart-define=KEY=VALUE` flags.

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `http://localhost:3001` | Backend API root |
| `STRIPE_PUBLISHABLE_KEY` | `""` | Stripe publishable key |
| `WS_URL` | `ws://localhost:3001/ws` | WebSocket endpoint |
| `APP_ENV` | `development` | Environment name |
| `APP_NAME` | `""` | App display name |
| `SENTRY_DSN` | `""` | Sentry error tracking DSN |
| `PUSH_ENABLED` | `false` | Firebase Cloud Messaging toggle |

## Testing

```bash
flutter test                          # Unit + widget tests (300 tests)
flutter test --coverage               # With coverage
flutter test integration_test/        # Integration tests (requires device)
flutter analyze                       # Lint check (0 errors, 0 warnings)
```

## Commands

| Command | Description |
|---|---|
| `flutter pub get` | Install dependencies |
| `flutter gen-l10n` | Regenerate i18n localizations |
| `flutter build apk` | Build Android APK |
| `flutter build ios` | Build iOS archive |
| `dart format lib/ test/` | Format all Dart files |

## CI/CD

GitHub Actions at `.github/workflows/flutter-ci.yml` runs on every push/PR touching `flutter-boilerplate/`:
1. `flutter pub get`
2. `flutter analyze`
3. `dart format --set-exit-if-changed`
4. `flutter test` (expects `+300: All tests passed!` — not just exit 0)
5. `flutter build apk --debug` (catches platform-level failures)
