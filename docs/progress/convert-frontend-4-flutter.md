# convert-frontend-4-flutter — Make the Flutter app *look and behave* exactly like next-js-boilerplate

**Date:** 2026-07-24 · **Verified against:** `d195f64` (HEAD of main) · **Predecessor:** [convert-frontend-3-flutter.md](convert-frontend-3-flutter.md) (functional parity: routes, hooks, i18n, gates — all closed there; **this doc is about visual + behavioral fidelity**, page by page)

convert-frontend-3 made the app *work*: 300 tests, analyzer clean, 1,706 i18n keys wired, release APK builds. But open any screen next to its web twin and they are obviously different apps — the login page (see §0) is a bare Material scaffold while the web login is a branded card with labels, field-level errors, and an MFA flow. This doc is the program for closing that gap, starting with **login** as the fully-specified exemplar, and it fixes the **networking architecture** first, because today the app can only talk to `localhost`.

Per the roadmap workflow: complete a phase and its gate before the next; append dated status-log entries as work lands. Load the repo skills before touching code: `flutter-conversion`, `flutter-ui-widgets`, `flutter-theming`, `flutter-testing`.

---

## Quick reference — phased checklist

Step-by-step execution guide; each item's full spec is in the matching section below. Complete a phase's gate before starting the next (per the phased-roadmap doctrine — append dated status-log entries as work lands).

**Blocked externally — §N, owned outside the Flutter tree:**
- [ ] N-3 — `mobile.eys.gen.tr` proxies to the Next app (not Nest), WS upgrade mirrored from `app.eys.gen.tr`, CORS block from A2 — **blocks Phase A entirely**
- [ ] N-4 — seeded test users on `mobile.eys.gen.tr` — **blocks every gate in this doc**
- [ ] N-1 — mobile token refresh grant (BFF decision) — P1, blocks session persistence past access-token expiry; not gate-blocking yet
- [ ] N-2 — IANA timezone on login (BFF, optional) — deferred until per-user timezone correctness matters on mobile

### Phase A — Point the app at the real world (P0, do first)
- [ ] A1 — `.env` + the one sanctioned run command: `flutter run -d chrome --web-port 5262 --dart-define-from-file=.env`
- [ ] A2 — CORS allowlist on the `mobile.eys.gen.tr` vhost (openresty), scoped to `localhost:5262`/`:3001`
- [ ] A3 — curl-verify the upstream is the Next BFF, not Nest (`/api/auth/login` + WS probe)
- [ ] A4 — `usePathUrlStrategy()` in `main.dart` for clean URLs in the web preview
- **Gate:** DevTools shows the BFF's JSON error body for bad creds (no CORS error); a seeded login reaches the feed with data loading; URL bar shows `/auth/login`.

### Phase B — Auth visual system (build once, reuse × 6 screens)
- [ ] B1 — `AuthLayout` (`auth_form_wrapper.dart` confirmed not close enough to evolve — build fresh, delete it)
- [ ] B2 — `LabeledField` (`Input`'s label floats, confirmed — extend it with a static-label layout + `textInputAction`/`onSubmitted`/`autofocus`/`maxLength`/`inputFormatters`; don't fork a parallel widget)
- [ ] B3 — `LinkText` + shared "muted text + brand underlined link" footer pattern
- [ ] B4 — grep for real usage, delete every orphaned auth file in the same commit as its replacement, delete the `/auth/mfa` route
- **Gate:** widget tests for header/card/menus; grep-proven orphan list; analyze/format/test all green.

### Phase C — Login page (the exemplar)
- [ ] L1 — widget tree mirrors `login-form.tsx` line-for-line (+ loading and already-signed-in states)
- [ ] L2 — client-side validation mirrors `loginFormSchema`, first error per field, no API call on validation failure
- [ ] L3 — `LoginResult` sealed classes fix the 202/MFA parser crash; **fix** the existing `MfaServer.call` (`api/server/auth/mfa.dart`, already wired to `Urls.mfa` — live but sends only `{code}`) to also send `mfaToken`; map the BFF `{statusCode, exc, msg, key}` body to field/form errors, never `e.toString()`; locale-aware nav (`/v1/${locale}/feed`, never hard-coded `en`)
- [ ] L4 — page rebuild, 3 new components, `LoginResult` types, `login.dart` 202 handling, `mfa.dart` `mfaToken` fix, new test — plus deleting the confirmed-orphaned `login_form.dart`/`social_login_button(s).dart`/`provider_icon.dart` and the live-but-superseded `mfa/page_content.dart` + its route
- [ ] L5 — 7 widget-test cases incl. the full MFA flow + a `tr` locale smoke test
- **Gate:** side-by-side parity at 390px; all L5 tests green; wrong password shows the localized message; an MFA account completes login; commit `feat(flutter): login page web parity (convert-frontend-4 §C)`.

### Phase D — Remaining auth pages (one commit each)
- [ ] Register — name (optional)/email/password only, **no confirm field** (verified — that belongs to reset, not register); `passwordMin`(8) validation; `emailTaken` error routes to the email field; success returns a session directly, same shape as login
- [ ] Forgot password — single email field, non-zod manual required-check, success swaps card to a "check your inbox" message; error text is the raw server message, not an i18n key
- [ ] Reset password — `?token=` required (`resetPasswordTokenMissing` when absent), password + confirm **with** `passwordsMustMatch` (this is where that rule actually lives); success auto-redirects to login after 2s
- [ ] Verify email — auto-fires on mount with `?token=`, loading → success/failure states, no retry button, no redirect timer
- [ ] Remove the `/auth/mfa` route + `MfaPageContent` (web has no such URL) — this route is currently live and functional-ish, not dead code
- [ ] No new client-layer methods needed — `LoginActions` already has `register`/`requestPasswordReset`/`resetPassword`/`verifyEmail`; Phase D is UI-only
- **Gate:** full register → verify → login → forgot → reset journey works against `mobile.eys.gen.tr`; grep shows no orphans; suite green.

### Phase E — Whole-app parity program
- [ ] 1. v1 shell — bottom nav/app bar, active states, tier badge
- [ ] 2. Feed — post cards, composer, reactions, stats sidebar, pull-to-refresh
- [ ] 3. Settings — all 5 tabs
- [ ] 4. Messages / chat-room — thread list, bubbles, input bar, presence dots
- [ ] 5. Posts (detail/create/edit), find-friends, notifications
- [ ] 6. Checkout/premium/pricing (device-only — Stripe is `kIsWeb`-guarded off in the preview)
- [ ] 7. Admin, users, share, gallery, demos, ui gallery — long tail
- **Standing rule:** any string/spacing/color that differs from the web twin is a defect unless this doc records the intentional deviation (current list: no social auth; no `Remember me`; MFA inline not routed; `ui/` demo-filler strings stay English per convert-frontend-3 §V-1).

---

## 0. Verified current state (2026-07-24, all claims checked against code)

### 0.1 What the routed login page actually is

`/auth/login` routes to `views/auth/login/page_content.dart` (`router.dart:220`). It is a plain Material page: default `AppBar(title: 'Sign In')`, centered `SingleChildScrollView`, two `FormTextField`s, a non-full-width `FilledButton`, then `Sign up` and `Forgot password?` as stacked `TextButton`s. Errors render `e.toString()` (raw `DioException` text reaches users), success navigates hard-coded `'/v1/en/feed'` (ignores the persisted locale), and **MFA is not handled at all**. This matches the screenshot taken via `flutter run -d chrome`.

The web twin (`src/app/auth/login/page.tsx` + `features/auth/ui/login-form.tsx` + `app/auth/layout.tsx`) is: centered 448px column → brand header row (site name uppercase + lang/theme toggles) → bordered `surface` card → brand-colored title, labeled inputs with placeholders and per-field errors, forgot-password link under the password field, full-width brand submit with `Signing in...` state, footer "Don't have an account? *Sign up*", **plus** a social-provider block and an inline **MFA challenge** state.

### 0.2 Three parallel auth implementations exist in the Flutter tree

| Tree | Files | Status |
|---|---|---|
| `views/auth/<page>/page_content.dart` | login, register, forgot-password, reset-password, verify-email, mfa | **Routed** (all 6 in `router.dart`) — the bare versions |
| `views/auth/*_form.dart` | `login_form.dart` (near-port: brand title, field errors, half-wired MFA), `register_form.dart`, `forgot_password_form.dart`, `reset_password_form.dart`, `verify_email_form.dart`, `social_login_button(s).dart`, `provider_icon.dart` | **Not referenced by the router** — `login_form.dart`'s `_handleMfa` even re-calls `login()` instead of verifying, and `_mfaToken` is never set |
| `features/auth/ui/` | `auth_form_wrapper.dart`, `mfa_challenge_widget.dart`, `social_login_buttons.dart` | Mirrors web's `features/auth/ui/` structure — confirmed orphaned (zero cross-file references) and not close enough to evolve into spec, §0.6 |

One page, three implementations. Phase B consolidates to exactly one.

### 0.3 The API is the **Next BFF**, not Nest — this decides everything about `mobile.eys.gen.tr`

Verified chain: web `AUTH_LOGIN_URL = "/api/auth/login"` → `src/app/api/auth/login/route.ts` is a **Next.js BFF route** that calls the **Nest backend over GraphQL** (`graphqlFetch(LOGIN_QUERY)`), converts the result to httpOnly cookies for browsers, and returns JSON. Nest itself listens on **:3000** (`main.ts:151`) and does **not** expose `/api/auth/login` REST at all (auth is GraphQL; only `auth/oauth` and `passport` REST controllers exist). Next dev runs on **:3001** (`package.json: next dev -p 3001`).

Flutter's `Urls.login = '/api/auth/login'` on `AppConfig.apiBaseUrl` (default `http://localhost:3001`) therefore already targets the **BFF** — correctly. Consequences:

- **`https://mobile.eys.gen.tr` must upstream to the same Next server as `app.eys.gen.tr`** (the ip:port of the Next app), *not* to Nest:3000. Pointing it at Nest gives 404s on every `/api/*` path the mobile app uses.
- Verification command (run once the DNS/proxy is up):
  ```bash
  curl -si https://mobile.eys.gen.tr/api/auth/login -X POST \
    -H 'Content-Type: application/json' -d '{"email":"x@x.x","password":"wrong"}'
  # Expect: HTTP 400/401 with JSON {statusCode, exc, msg, key} — the BFF error shape.
  # A 404, an HTML error page, or a GraphQL error means the proxy targets the wrong service.
  ```

**BFF login contract** (`login/route.ts`, verified):
- `POST /api/auth/login` body `{email, password, timezone?}` (web sends IANA timezone; it is optional server-side)
- 200 → `{user, accessToken}` (+ 5 httpOnly cookies that only matter to browsers)
- **202 → `{mfaRequired: true, mfaToken, user}`** — the TOTP challenge; verify via `POST /api/auth/login/mfa`
- error → `{statusCode, exc, msg, key}` where `key` is an i18n path like `auth.errors.emailRequired`

### 0.4 Two mobile-contract defects found while reading the flow

1. **MFA response crashes the parser (P1).** Dio treats 202 as success, so `LoginServer.call` runs `LoginResponse.fromJson` on `{mfaRequired, mfaToken, user}` → `json['accessToken'] as String` throws on null. Any MFA-enabled account cannot log in on mobile today. Fix in §C. (A second, distinct MFA bug — the *verify* step's request body — was found in a later pass; see §0.6.)
2. **Token refresh is dead on arrival (P1, needs a backend/BFF decision).** `api/server/auth/refresh_token.dart` POSTs `{refreshToken}` to `/api/auth/token` — but the BFF route has **GET only** and reads httpOnly *cookies*; there is no POST handler, and the login body gives mobile **no refresh material** (`{user, accessToken}` only — refresh/device tokens go into cookies mobile never sees). So the B6 refresh-once interceptor can never succeed: when the access token expires, mobile silently logs out. See §N-1 for the fix options — this is a BFF change, not a Flutter change. (Whether a "B6 refresh-once interceptor" actually exists and calls this wasn't independently confirmed in the follow-up pass — see §0.6.)

### 0.5 Environment & tooling facts

- `flutter run -d chrome` **without** `--dart-define-from-file=.env` silently uses `localhost:3001` defaults — which is why the app currently "works" on this dev box and nowhere else. `.env` (gitignored, from `.env.example`) is where `API_BASE_URL=https://mobile.eys.gen.tr` belongs.
- **CORS:** irrelevant for real devices (native HTTP has no CORS), but the **Chrome dev preview is a browser**: origin `http://localhost:<random-port>` calling `https://mobile.eys.gen.tr` needs CORS headers. Next route handlers set none, and Nest's `CORS_ORIGIN` allowlist doesn't apply to the BFF. Fix at the openresty layer (§A2) + pin the dev port with `--web-port`.
- Flutter web serves **hash URLs** (`/#/auth/login`); the web app uses clean paths. One-line fix (§A4).
- The red **DEBUG banner** is debug-mode only; use `flutter run -d chrome --release` (or `--profile`) for screenshots.
- i18n is **ready**: all 42 login-related keys already exist in both ARBs (`authFormLogin*`, `authErrors*`, `authLoading`, `authSignedInAs`, …) — the sweep in convert-frontend-3 ported the entire web `auth` namespace. No new keys are needed for login.
- `flutter_secure_storage ^10.3.1` supports web (WebCrypto) — the Chrome preview can hold sessions.
- Session storage (`use_auth.dart`): `setSession` writes `access_token` + `session_user`; `getToken` feeds the Bearer interceptor. Matches the BFF body. ✅

### 0.6 · Second verification pass (2026-07-24) — corrections and new facts

Every "unverified" or "check whether" flag left in §0.1–0.5 and in Phases B–D got read against the actual code in a follow-up pass. Two things in the original doc were wrong; the rest is new ground. Phases B–D below have been edited in place to match — this is the changelog.

**Corrections (the original doc was wrong or overstated):**
- **MFA is not "missing," it's live but broken differently than described.** `Urls.mfa` (`/api/auth/login/mfa`) is not an unused constant — it's already wired: `MfaServer.call(code)` (`api/server/auth/mfa.dart`) posts it, and the routed-but-bare `mfa/page_content.dart` already calls it. The real bug: `MfaServer.call` only sends `{code}`; the verified BFF contract (`src/app/api/auth/login/mfa/route.ts`) requires `{mfaToken, code}` → `{user, accessToken}`. §L3 originally planned a brand-new `login_mfa.dart`/`LoginMfaServer` — corrected to "add the missing `mfaToken` param to the existing `MfaServer.call`."
- **Register has no confirm-password field.** The live `register-form.tsx` fields are name (optional) / email / password only — no confirm, no `passwordsMustMatch`. That validation rule belongs to **reset-password**, not register. Phase D's original delta row conflated the two; corrected below.

**New facts (nothing else was wrong, but these weren't checked before):**
- All ten orphaned auth files (§0.2's "not referenced" row) confirmed at **zero** grep hits — not even a stray self-reference beyond their own class declaration. Two of them, `features/auth/ui/social_login_buttons.dart` and `views/auth/social_login_buttons.dart`, independently declare the same class name `SocialLoginButtons` — a latent collision if either were ever imported. Both get deleted in B4 regardless.
- `auth_form_wrapper.dart` and `mfa_challenge_widget.dart` — the two files B1/L3 said to "evaluate first, evolve if close" — are **not** close enough. `auth_form_wrapper.dart` is a flat, unstyled `Center > ConstrainedBox(maxWidth 400) > Column`, no `Scaffold`/`SafeArea`/header row/card. `mfa_challenge_widget.dart` is missing a title, error line, and "use a different account" link, while carrying an unwanted `Timer`-based resend-cooldown that isn't part of the target spec. Both get built fresh; B1 and L3 no longer hedge on this.
- `components/ui/input/input.dart`'s label **floats** (plain `InputDecoration.labelText`, no `floatingLabelBehavior` override) — confirms B2's suspicion. It also has no `textInputAction`, `onSubmitted`, `autofocus`, `maxLength`, or `inputFormatters` params, all of which L1/L3's snippets assume. `LabeledField` can't just wrap `Input` as-is — `Input` needs those params added first (B2 updated below). `Button`'s `variant`/`fullWidth`/`loading` API, by contrast, matches every doc snippet exactly — no changes needed there.
- `LoginActions` (`api/client/auth/actions.dart`) already has `login`, `register`, `logout`, `requestPasswordReset`, `resetPassword`, `verifyEmail` — Phase D needs **zero new client-layer methods**, only new UI on top of what exists. (There is no `mfa` method — the live MFA flow bypasses `LoginActions` entirely and calls `mfaServerProvider` directly; see the L3 fix.)
- `RefreshTokenServer` (`api/server/auth/refresh_token.dart`) is defined and does POST `{refreshToken}` to `/api/auth/token` as §0.4 claims, but this pass didn't find a caller wiring it into an actual interceptor — worth a quick confirm of the "B6 refresh-once interceptor" before relying on that language when N-1 is addressed.
- `flutter-boilerplate/README.md` already documents a dev-run command — `flutter run --dart-define-from-file=.env` (no `-d chrome`, no `--web-port`) — that **conflicts** with Phase A's new sanctioned command. A1 must update that block, not just `.env.example`.
- The root `Makefile` has zero flutter targets and zero dev-run-style targets of any kind (it's purely a docker-compose wrapper: `up`/`down`/`build`/`logs`/etc., `.PHONY` + trailing `## comment` convention, `SERVICE ?=` variable pattern). A new `flutter-run` target is a new category, not an extension — proposed in A1.
- Zero tests anywhere in the suite use `ProviderScope` overrides (`grep -rl "overrideWith" flutter-boilerplate/test` → nothing), and `flutter-boilerplate/test/views/` doesn't exist — all 65 current tests are component-level (`test/components/ui/`) plus one exception (`test/lib/tier_view_test.dart`). `login_test.dart` (L5) is simultaneously the **first** override-based test and the **first** view-level test in the repo — there's no prior art to copy; its patterns become the template every Phase D test copies.
- `authProvider`, `localeProvider`, `themeModeProvider` exact locations confirmed: `authProvider` (`StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>`, with derived `isAuthenticatedProvider`/`currentUserProvider`/`userTierProvider`) lives in `hooks/use_auth.dart`; `localeProvider` **and** `themeModeProvider` both actually live in `hooks/use_theme.dart` (`hooks/use_locale.dart` is only a re-export shim for `localeProvider`). Both persist via `shared_preferences`, not secure storage — matches the "already persist" claim.

---

## Mission & method — how "exactly like the web" is achieved

Every page follows the same **parity loop**:

1. **Open the web twin first** (`flutter-conversion` skill rule). The web file *is* the spec — layout, spacing, copy, states, and behavior all come from it. Never restyle from the screenshot alone.
2. **Translate Tailwind → tokens, not pixels → guesses.** Use the mapping table below. All colors via `AppColors.of(context)` (they mirror the web `.theme-*` tokens — `flutter-theming` skill), all radii/sizes via `UIConstants` where named.
3. **Build with the existing `components/ui` library** (`Input`, `Button` with `variant`/`fullWidth`/`loading`, etc. — `flutter-ui-widgets` skill). Missing primitives get added to the library, never inlined per page.
4. **Compare side-by-side:** `pnpm --dir next-js-boilerplate dev` (`:3001`) in Chrome device-toolbar at **390×844**, next to `flutter run -d chrome --web-port 5262 --dart-define-from-file=.env` sized the same. The web app at mobile width is the reference rendering.
5. **Gate:** widget tests for every state, `flutter analyze` clean, `dart format` clean, `flutter test` all green, and the side-by-side matches (structure, spacing rhythm, copy, colors — not font-antialiasing pixels).

**Tailwind → Flutter mapping** (derived from the actual classes in the auth pages; reuse everywhere):

| Web | Value | Flutter |
|---|---|---|
| `max-w-md` | 448 | `ConstrainedBox(maxWidth: 448)` |
| `py-16` / `p-6` / `p-4` | 64 / 24 / 16 | `EdgeInsets` |
| `gap-6` / `gap-4` / `gap-3` / `gap-1` | 24 / 16 / 12 / 4 | `SizedBox` between children |
| `text-sm` / `text-xs` | 14 / 12 | `fontSize` |
| `font-semibold` / `font-medium` | w600 / w500 | `FontWeight` |
| `tracking-wide uppercase` | — | `letterSpacing: 0.5` + `.toUpperCase()` |
| `rounded-md` / `rounded-lg` / `.surface` radius | 6 / 8 / 12 | `UIConstants` (6, 8) / 12 for the surface card |
| `h-9` (input/button) | 36 | control height (already the ui-library md size) |
| `.surface` | 1px border @ 12% fg, radius 12, shadow-sm | `Container` + `Border.all(colors.border)`, `BorderRadius.circular(12)`, small `BoxShadow` |
| `text-brand` / `text-muted` / `text-fg` / red-600 / `bg-brand text-brand-fg` | tokens | `colors.brand` / `colors.fgMuted` / `colors.fg` / `colors.danger` / `Button(variant: primary)` |
| `underline` links | — | `TextStyle(decoration: TextDecoration.underline)` |

**Product decision (from Berkay, 2026-07-24): no social providers on mobile.** The web login/register compose `SocialLoginButtons`; the mobile auth pages omit that block entirely (the OAuth redirect flow is browser-shaped anyway). The Flutter social widgets become dead code and are deleted in Phase B consolidation.

---

## Phase A — Point the app at the real world (P0, do first)

Nothing visual matters while the app can only reach `localhost`.

### A1 · `.env` + run command become the documented dev loop

```bash
# flutter-boilerplate/.env  (gitignored; copy from .env.example and edit)
API_BASE_URL=https://mobile.eys.gen.tr
WS_URL=wss://mobile.eys.gen.tr/ws
APP_ENV=development
APP_NAME=Flutter Boilerplate
```

```bash
# the ONLY sanctioned dev-preview command (put it in README + a Makefile target):
cd flutter-boilerplate && flutter run -d chrome \
  --web-port 5262 \
  --dart-define-from-file=.env
```

`--web-port 5262` is load-bearing: it pins the browser origin so CORS (A2) can allowlist it. Also update `.env.example` with the `mobile.eys.gen.tr` values commented out, so the file documents both localhost and remote modes.

**Verified (§0.6): `flutter-boilerplate/README.md`'s existing Getting Started block already documents a run command — `flutter run --dart-define-from-file=.env` (no `-d chrome`, no `--web-port`) — that now conflicts with the sanctioned one above. Update that block too, not just `.env.example`.**

The root `Makefile` has no flutter targets today (it's a pure docker-compose wrapper — `up`/`down`/`build`/`logs`/etc., `.PHONY` + trailing `## comment` per target, `SERVICE ?=` var pattern) — a new target is a new category, matching the existing style:

```makefile
.PHONY: flutter-run
flutter-run: ## Run flutter-boilerplate in Chrome against mobile.eys.gen.tr (web-port 5262)
	cd flutter-boilerplate && flutter run -d chrome --web-port 5262 --dart-define-from-file=.env
```

### A2 · CORS for the Chrome preview, at the openresty layer

Real devices don't preflight; only the browser preview does. Cleanest fix is on the `mobile.eys.gen.tr` vhost (keeps the Next app untouched):

```nginx
# inside the mobile.eys.gen.tr server/location block
set $cors_origin "";
if ($http_origin ~ ^http://localhost:(5262|3001)$) { set $cors_origin $http_origin; }
add_header Access-Control-Allow-Origin $cors_origin always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
if ($request_method = OPTIONS) { return 204; }
```

(Mobile sends `Authorization: Bearer`, no cookies — so no `Allow-Credentials` needed; do **not** use `*` together with credentials.) Alternative if proxy config is off-limits: add a `headers()` block for `/api/:path*` in `next.config.ts` — works but ships CORS to the public app domain too, so prefer the proxy.

### A3 · Verify the upstream is the Next BFF

Run the curl from §0.3. Also probe WS: `curl -si --http1.1 -H 'Upgrade: websocket' -H 'Connection: Upgrade' https://mobile.eys.gen.tr/ws` → expect `101` or a WS handshake error, not 404 (per the prod-deploy notes, WS probes need HTTP/1.1; the openresty upgrade config that serves `app.eys.gen.tr` must be mirrored on this vhost).

### A4 · Clean URLs in the web preview

**Verified (§0.6): this is the actual current file** — `main.dart` is `Future<void> main() async`, not `void main()`. The edit:

```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';   // + new import

import 'app/app.dart';

Future<void> main() async {
  usePathUrlStrategy();          // + /auth/login instead of /#/auth/login
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    const ProviderScope(
      child: FlutterBoilerplateApp(),
    ),
  );
}
```

`flutter_web_plugins` is SDK-bundled (add to pubspec `dependencies` with `sdk: flutter` — confirmed absent from `pubspec.yaml` today, §0.6). Harmless on Android/iOS builds.

**Phase A gate:** in the Chrome preview with `.env` pointing at `mobile.eys.gen.tr` — DevTools Network shows `POST https://mobile.eys.gen.tr/api/auth/login` returning the BFF's JSON error body for wrong credentials (no CORS error), and a successful login with a seeded user lands on the feed with data loading. URL bar shows `/auth/login`.

---

## Phase B — The auth visual system (build once, reuse on all 6 auth screens)

### B1 · `AuthLayout` — the twin of `app/auth/layout.tsx`

New file `lib/components/auth/auth_layout.dart`. **Verified (§0.6): `features/auth/ui/auth_form_wrapper.dart` is not close enough to evolve** — it's a flat `Center > ConstrainedBox(maxWidth 400) > Column`, no `Scaffold`/`SafeArea`, no header row, no card. Build fresh; delete `auth_form_wrapper.dart` in the same commit (already confirmed orphaned, §0.6):

```
Scaffold(backgroundColor: colors: default page bg — NO AppBar)
└─ SafeArea → Center → SingleChildScrollView(padding: EdgeInsets.symmetric(vertical: 64, horizontal: 16))
   └─ ConstrainedBox(maxWidth: 448)
      └─ Column(crossAxisAlignment: stretch, children: [
           Row(spaceBetween: [
             Text(Site.appName.toUpperCase(),
                  style: 12, w600, colors.brand, letterSpacing 0.5),
             Row(gap 8: [LangMenuButton(), ThemeMenuButton()]),
           ]),
           SizedBox(24),
           Container(                    // the `.surface` card
             padding: EdgeInsets.all(24),
             decoration: BoxDecoration(
               border: Border.all(color: colors.border),
               borderRadius: BorderRadius.circular(12),
               boxShadow: [subtle shadow-sm],
             ),
             child: child,               // page slots its content here
           ),
         ])
```

`LangMenuButton` / `ThemeMenuButton`: compact `IconButton`s opening a `PopupMenuButton`-style menu (the web `ThemeToggle` opens a 180px dropdown listing themes with an active-dot; `LangSwitcher` lists `en`/`tr`). Wire them to the existing `localeProvider` and `themeModeProvider` (both defined in `hooks/use_theme.dart`, both persisted via `shared_preferences` — confirmed §0.6; `hooks/use_locale.dart` is only a re-export shim, import from `use_theme.dart` directly) — both already persist (convert-frontend-3 B7). Reuse `ThemePicker`'s labels (`t.settingsThemeLight` …).

### B2 · `LabeledField` — the twin of `Label` + `Input` + error line

The web anatomy is: `Label` (14, w500, `text-fg`, required `*` in `text-error`) **above** the input; input is h-36, radius 6, 1px `border`, transparent bg, placeholder in `fgMuted@70%`, focus ring brand, error state = border+ring `danger`; error text below (12, danger, gap 2). **Verified (§0.6): `components/ui/input/input.dart`'s label floats** (`InputDecoration.labelText`, Material default, no `floatingLabelBehavior` override) — extend the ui `Input` with a static-label layout rather than building a parallel widget (one library, per skill). While in there, also add the params later steps assume but `Input` doesn't have today: `textInputAction`, `onSubmitted`, `autofocus`, `maxLength`, `inputFormatters` (`errorText`/`controller`/`obscureText` already match and pass through as-is). Add to `lib/components/auth/labeled_field.dart` only what composes the extended `Input` with the required-asterisk label.

### B3 · Small shared pieces

- `LinkText` — 12px underlined `fgMuted` text that is tappable (forgot-password, "Use a different account"), hover→brand on web (skip hover; keep pressed opacity).
- Footer pattern "muted text + brand underlined link" → `Text.rich` with a `TapGestureRecognizer` span (or `Wrap` of `Text` + `GestureDetector` — pick one, reuse on login/register).

### B4 · Consolidation — one implementation per page

The mapping grep has already been run (§0.6): `grep -rn "login_form\|register_form\|social_login\|provider_icon\|auth_form_wrapper\|mfa_challenge" lib/ --include='*.dart'` returns **zero cross-file hits** — all ten files below are confirmed dead, including a same-name collision (`SocialLoginButtons` declared independently in both `features/auth/ui/social_login_buttons.dart` and `views/auth/social_login_buttons.dart`). The routed `views/auth/<page>/page_content.dart` files are **rebuilt** on `AuthLayout` (Phase C/D); every one of `views/auth/*_form.dart`, both `social_login_buttons.dart` copies, `provider_icon.dart`, and `features/auth/ui/*` unless reused per B1/B2 is **deleted in the same commit** as the page that replaces it. Also delete the `/auth/mfa` route + `MfaPageContent` — **this one is live and partially functional today** (routed, and its `MfaServer` call actually reaches the BFF, just with the wrong body — §0.6), not dead code, so removing it is a deliberate URL-contract fix (the web has no such URL; MFA is an inline login state), not a dead-code sweep. The URL contract must stay byte-equal (doctrine #5).

**Phase B gate:** `AuthLayout` + `LabeledField` exist with widget tests (brand header renders, card decorates, theme/lang menus switch providers); grep proves which auth files are orphans; analyze/format/test green.

---

## Phase C — Login page, exact build spec (the exemplar — §L)

Target: `views/auth/login/page_content.dart` rebuilt. **No social block. No `Remember me`** (the web form doesn't render it either, despite the i18n key). All strings via existing `t.authFormLogin*` / `t.authErrors*` keys.

### L1 · Widget tree (mirrors `login-form.tsx` line-for-line)

```
AuthLayout(
  child: Column(stretch, [                       // card interior; web: gap-4, text-center
    Text(t.authFormLoginTitle,                    // "Sign In"
         center, 14, w600, colors.brand),
    SizedBox(16),
    // ── form (web: gap-3) ──
    LabeledField(
      label: t.authFormLoginEmailLabel, required: true,
      hint: t.authFormLoginEmailPlaceholder,      // you@example.com
      controller: _email, keyboardType: email,
      errorText: _fieldErrors['email'],
      textInputAction: next,
    ),
    SizedBox(12),
    LabeledField(
      label: t.authFormLoginPasswordLabel, required: true,
      controller: _password, obscureText: true,   // NB: web login passes NO placeholder here
      errorText: _fieldErrors['password'],
      textInputAction: done, onSubmitted: _submit,
    ),
    SizedBox(8),
    Align(left, LinkText(t.authFormLoginForgotPassword,   // 12, underline, fgMuted
                         onTap: → context.go('/auth/forgot-password'))),
    if (_fieldErrors['form'] != null) ...[
      SizedBox(12),
      Text(_fieldErrors['form']!, 14, colors.danger, center),
    ],
    SizedBox(12),
    Button(variant: primary, fullWidth: true,     // h-36, bg brand, radius 6
      loading: _submitting,                       // ui Button renders the 16px spinner
      child: Text(_submitting ? t.authFormLoginSubmitting : t.authFormLoginSubmit),
      onPressed: _submitting ? null : _submit),
    SizedBox(16),
    Text.rich(center, 12, colors.fgMuted,         // "Don't have an account? Sign up"
      [ t.authFormLoginNoAccount + ' ',
        span(t.authFormLoginRegisterLink, colors.brand, underline,
             onTap: → context.go('/auth/register')) ]),
  ]),
)
```

Two more render states, exactly as the web has them:
- **`authProvider` loading** → `Text(t.authLoading, 14, fgMuted)` inside the card.
- **Already signed in** → `t.authSignedInAs(email)`-style block (`authSignedInAs` key exists with `{email}` placeholder; role/status line uses `t.authRole` / `t.authStatus`). Web shows this instead of the form when `user != null` (Flutter: `authProvider`'s `AsyncValue<AuthenticatedUser?>`, or the derived `currentUserProvider`/`isAuthenticatedProvider` — both confirmed to exist, §0.6).

### L2 · Validation (client-side, pre-submit — mirror of `loginFormSchema`)

On submit: clear `_fieldErrors`; empty email → `t.authErrorsEmailRequired`; invalid email → `t.authErrorsEmailInvalid` (reuse `validators/auth/schema.dart` — align its messages to these exact keys); empty password → `t.authErrorsPasswordRequired`. First error per field, set into `_fieldErrors` — do **not** call the API when validation fails. (Web uses zod `safeParse` → `flatten().fieldErrors` → first message; same semantics.)

### L3 · Submit flow, MFA, and error mapping

**Fix the server layer first** — `LoginServer.call` must stop assuming success-shape (defect §0.4-1). Introduce a sealed result in `types/auth/auth_request_types.dart`:

```dart
sealed class LoginResult {}
class LoginSuccess extends LoginResult { final LoginResponse response; ... }
class LoginMfaRequired extends LoginResult { final String mfaToken; final AuthenticatedUser user; ... }
```

`LoginServer.call` returns `LoginMfaRequired` when `response.statusCode == 202 || data['mfaRequired'] == true`, else parses `LoginResponse`. **Verified contract** (`src/app/api/auth/login/mfa/route.ts`): body `{mfaToken, code}` → 200 `{user, accessToken}` (+ the same 5 cookies, irrelevant to mobile).

**Verified (§0.6): the verify pair already exists, it's just incomplete — don't add a new file.** `api/server/auth/mfa.dart` already defines `MfaServer.call(code)`, already posts `Urls.mfa`, and is already invoked from the live (bare) `mfa/page_content.dart`. Its only bug is the request body: it sends `{code}` and needs to send `{mfaToken, code}`. Fix:

- `api/server/auth/mfa.dart` → add a `mfaToken` param to `MfaServer.call(mfaToken, code)`, include it in the POST body
- Optional cleanup while this file is open: today's live `mfa/page_content.dart` calls `mfaServerProvider` directly, bypassing `LoginActions` entirely — breaks the two-layer Dio pattern (`flutter-conversion` skill). Consider adding `LoginActions.loginMfa(...)` and routing through it instead.

**Page flow** (mirror of `handleLoginSubmit` + the MFA sub-state):

1. `LoginActions.login(LoginRequest(email, password))`
2. `LoginSuccess` → `authProvider.notifier.setSession(token, user)` → `context.go('/v1/${ref.read(localeProvider).languageCode}/feed')` — **never** hard-code `en`.
3. `LoginMfaRequired` → swap the card content to the MFA state (below).
4. `DioException` → map the BFF error body, never `e.toString()`:
   ```dart
   final data = err.response?.data;
   final msg = (data is Map && data['msg'] is String) ? data['msg'] as String : null;
   final field = (data is Map) ? data['field'] as String? : null;
   field != null
     ? _fieldErrors[field] = msg ?? t.authErrorsLoginFailed
     : _fieldErrors['form'] = msg ?? t.authErrorsLoginFailed;   // 401 → "Invalid credentials. Please try again."
   ```
5. `timezone`: the web sends the IANA zone; pure Dart can't produce one without a plugin. **Omit it for now** (verified optional in the BFF) — noted as §N-2 if per-user timezones start mattering on mobile.

**MFA state** (same card, replaces the form — web lines 138-198): brand 14/w600 `t.authFormLoginMfaTitle` → 12/fgMuted `t.authFormLoginMfaDescription` (+ the account email) → `LabeledField(t.authFormLoginMfaCodeLabel, hint: t.authFormLoginMfaCodePlaceholder)` restricted to 6 digits (`FilteringTextInputFormatter.digitsOnly`, `maxLength: 6`, autofocus) → `_mfaError` line (14, danger; `<6` digits → `t.authFormLoginMfaCodeLengthError` client-side) → full-width primary `t.authFormLoginMfaVerify`/`MfaVerifying` → `LinkText(t.authFormLoginDifferentAccount)` that resets `_mfaState/_mfaCode/_mfaError`. On verify success: `setSession` + locale-aware `go(...)`. `features/auth/ui/mfa_challenge_widget.dart` is confirmed not close enough to reuse (§0.6 — missing title/error line/different-account link, carries an unwanted resend-cooldown timer) — build this fresh, delete that file in the same commit.

### L4 · Files touched

| File | Change |
|---|---|
| `views/auth/login/page_content.dart` | rebuilt per L1–L3 |
| `components/auth/auth_layout.dart`, `labeled_field.dart`, `link_text.dart` | new (Phase B) |
| `types/auth/auth_request_types.dart` | `LoginResult` sealed classes |
| `api/server/auth/login.dart` | 202/mfaRequired handling |
| `api/server/auth/mfa.dart` | add `mfaToken` param to the existing `MfaServer.call` (§0.6 — not a new file) |
| `api/client/auth/actions.dart` | optional: add `loginMfa(...)` to route MFA through the actions layer |
| `views/auth/login_form.dart`, `social_login_button(s).dart`, `provider_icon.dart` | **delete** (confirmed orphaned, §0.6) |
| `views/auth/mfa/page_content.dart` + its `/auth/mfa` GoRoute in `app/router.dart` | **delete** — superseded by the inline MFA state in L1/L3 (confirmed live-but-bare today, §0.6) |
| `test/views/auth/login_test.dart` | new (L5) |

### L5 · Tests (widget, with `pumpTestApp` + mocked `loginActionsProvider` via `ProviderScope` overrides)

**Verified (§0.6): this is greenfield on two axes at once.** No test in the suite uses `ProviderScope` overrides yet (`grep -rl "overrideWith" flutter-boilerplate/test` → nothing — every existing test either has no auth dependency or reads a real `ProviderContainer` directly), and `flutter-boilerplate/test/views/` doesn't exist at all (all 65 current tests are component-level, plus one exception). `login_test.dart` establishes both patterns for the first time — the override helper this produces becomes the template every Phase D test copies, so it's worth getting right here rather than in a rush on page 2.

1. Renders: title, both labels + required asterisks, email placeholder, forgot link, submit label, footer link — and **no** social buttons.
2. Empty submit → both required errors, action never called.
3. Invalid email → `authErrorsEmailInvalid`.
4. Submit success → `setSession` called, navigation to `/v1/en/feed` (locale override in test).
5. 401 DioException → form error shows `authErrorsLoginFailed`, button re-enabled.
6. `LoginMfaRequired` → MFA card renders; wrong-length code → length error; verify success → session+nav; "Use a different account" returns to the form.
7. `tr` locale smoke: pump with `Locale('tr')`, assert a Turkish string renders.

**Phase C gate:** side-by-side at 390px — Flutter login is structurally indistinguishable from the web login (brand header, card, labels, link placement, button, footer); all L5 tests green; wrong password shows the localized message; an MFA account completes login; analyze/format/full-suite green. Commit: `feat(flutter): login page web parity (convert-frontend-4 §C)`.

---

## Phase D — Remaining auth pages (same recipe, one commit each)

All reuse `AuthLayout` + `LabeledField` + the error-mapping helper from L3 (extract it to `lib/lib/api_error.dart` when this page needs it). `LoginActions` already has every method these pages need (`register`, `requestPasswordReset`, `resetPassword`, `verifyEmail`) — this phase is UI-only, no new client-layer code. **Contracts below verified 2026-07-24** against the live BFF routes and web forms (§0.6) — corrects an earlier draft that wrongly gave register a confirm-password field. Re-confirm the Flutter ARBs actually carry every key referenced below before starting each page — only the login namespace was checked in §0.5.

### D1 · Register

Web source: `features/auth/ui/register-form.tsx` (routed from `app/auth/register/page.tsx`). **Ignore** `views/ui/card/RegisterForm.tsx` — a second, dead variant with first/last-name + confirm-password fields that isn't used by the live route; a handful of Flutter ARB keys (`firstNameLabel`, `lastNameLabel`, `confirmPasswordLabel`/`Required`, `passwordMin6`) exist only because that dead variant's namespace got ported too — don't wire them up.

- **Fields:** name (optional, placeholder "John Doe"), email (required), password (required, min 8) — **no confirm-password field**.
- **Validation:** email required/invalid, password required + `passwordMin`(8) + `passwordMax`(128). No `passwordsMustMatch` on this page (see D3).
- **Submit → `POST /api/auth/register`:** body `{email, password, name?, timezone?}` → 201 `{user, accessToken}` (same shape as login success — sets the session directly; no separate "go verify your email" branch was observed in the live form, despite `/auth/verify-email` existing for the token-link flow. Confirm this on the dev environment before building — a silent server-side change here wouldn't surprise anyone).
- **Errors:** `exc === "EX_AUTH_EMAIL_TAKEN"` (409) arrives with `field: "email"` → route it to the email field, message `t.authErrorsEmailTaken` ("This email is already registered"); any other `field` → that field; no `field` → form-level `t.authErrorsRegisterFailed`.
- **States:** same `authProvider`-loading and already-signed-in branches as login (L1).

### D2 · Forgot password

Web source: `views/auth/forgot-password/PageContent.tsx`.

- **Fields:** email only.
- **Validation:** manual (`if (!email)`), not zod — no invalid-format check client-side.
- **Submit → `POST /api/auth/request-password-reset`:** body `{email}` → 200 `{ok: true}` always (deliberately doesn't leak whether the email exists).
- **Success:** replaces the form with a message card ("If an account exists with this email, you will receive a password reset link.") + a link back to login.
- **Error:** the web renders the *raw* `err.message`, not an i18n key — decide here whether Flutter mirrors that literally (surfacing whatever the BFF's `msg` string is) or normalizes to a local `t.authErrorsForgotPasswordFailed` fallback; either is defensible, but pick one and note it, don't leave it implicit.

### D3 · Reset password

Web source: `features/auth/ui/reset-password-form.tsx`, reads `?token=` from the route.

- **Fields:** password (required, min 8) + confirm password (required) — **this is where `passwordsMustMatch` actually lives** (object-level zod `.refine`, error attached to the confirm field).
- **Three states, not two:** (1) no `?token=` at all → terminal error card, `t.authErrorsResetPasswordTokenMissing`, form never renders; (2) token present → normal form; (3) after success → message card + auto-navigate to login **after a 2-second delay** (the web uses `setTimeout(…, 2000)` — Flutter needs an equivalent timer, not an immediate nav).
- **Submit → `POST /api/auth/reset-password`:** body `{token, newPassword}` → 200 `{ok: true}`.
- **Error:** form-level, `err.message ?? t.authErrorsResetPasswordFailed`; form stays interactive for retry (no lockout).

### D4 · Verify email

Web source: `features/auth/ui/verify-email-form.tsx`, reads `?token=` from the route.

- **No form fields at all** — pure status page.
- **Auto-fires on mount:** `?token=` missing → straight to the error state (`t.authErrorsVerifyEmailTokenMissing`); otherwise calls `POST /api/auth/verify-email` with `{token}` immediately.
- **Three states:** verifying → success (green, "Your email has been verified. You can now sign in." + login link) → error (red, `err.message ?? t.authErrorsVerifyEmailFailed`). **No retry button, no redirect timer** — unlike D3, a failure here just sits there.

### D5 · `/auth/mfa` route

Web has no such URL. Delete the route + `MfaPageContent` — covered by B4/L3, listed here only so the parity checklist is complete.

**Phase D gate:** all four pages pass the parity loop against the contracts above; the full register → verify → login → forgot → reset journey works end-to-end against `mobile.eys.gen.tr`; `grep` confirms no orphans remain; suite green.

---

## Phase E — Whole-app parity program (after auth proves the loop)

Rebuild order = user-visible impact × traffic. **Re-verify each page's web twin before starting it** — do not trust this table's granularity in three weeks:

1. **v1 shell** — bottom nav/app bar vs web's shell chrome, active states, tier badge
2. **Feed** — post cards, composer, reactions, stats sidebar (mobile placement), pull-to-refresh
3. **Settings** (all 5 tabs) — list styling, section cards, pickers
4. **Messages / chat-room** — thread list, bubbles, input bar, presence dots
5. **Posts** (detail/create/edit), **Find-friends**, **Notifications**
6. **Checkout/premium/pricing** (device-only — Stripe is `kIsWeb`-guarded off in the preview)
7. **Admin, users, share, gallery, demos, ui gallery** — long tail

Per page, the deliverable is the §C pattern: target spec extracted from the web file(s) → build on ui-library widgets + tokens → tests per state → side-by-side check → one commit → status-log line. Shared primitives that emerge (page headers, section cards, empty states) go into `components/` on first duplication, mirroring the web component of the same name.

**Standing rule:** any string/spacing/color that differs from the web twin is a defect unless this doc records the intentional deviation (current list: no social auth; no `Remember me`; MFA inline not routed; `ui/` demo-filler strings stay English per convert-frontend-3 §V-1).

---

## §N — Backend/BFF asks (blocking items owned outside the Flutter tree)

- **N-1 · Mobile token refresh (P1).** Mobile never receives refresh material (§0.4-2). Options, pick one on the BFF: (a) `POST /api/auth/token` accepting `{deviceToken}`/`{refreshToken}` from the body for clients sending `X-Client: mobile`, returning `{accessToken}`; or (b) include `refreshToken`+`deviceToken` in the login/register JSON body for mobile clients (flag via header) and keep the existing Flutter POST shape. Until one lands, mobile sessions end at access-token expiry — decide and note the choice here.
- **N-2 · IANA timezone on login** — only if mobile users need server-side timezone correctness; would add the `flutter_timezone` plugin.
- **N-3 · `mobile.eys.gen.tr` proxy config** — upstream = the Next app (§0.3), WS upgrade block mirrored from `app.eys.gen.tr`, CORS block from §A2. Owner: server config (same openresty as the prod-deploy notes).
- **N-4 · Seeded test users** on the environment `mobile.eys.gen.tr` serves — needed for every gate in this doc (the WS-E2E test users from the prod deploy notes may already fit).

---

## Status log

- **2026-07-24 — Doc created.** Full analysis on `d195f64`: routed login is the bare `page_content.dart` (screenshot confirmed); three parallel auth implementations mapped; **BFF architecture established** (mobile consumes Next `/api/*` on :3001 — Nest :3000 has no REST auth; `mobile.eys.gen.tr` must upstream to the Next app); BFF login contract extracted (200 `{user, accessToken}` / 202 `{mfaRequired, mfaToken, user}` / error `{statusCode, exc, msg, key}`); two contract defects found (202-MFA crashes `LoginResponse.fromJson`; token refresh has no mobile grant — GET/cookie-only BFF route vs Flutter's POST `{refreshToken}`); CORS scoped to the Chrome preview only, fix at openresty; all 42 login i18n keys verified present; Tailwind→Flutter mapping table derived from the real auth classes. **No code changed yet — Phase A not started.**
- **2026-07-24 — Quick-reference checklist added.** Condensed the phase/step/gate structure above into a checkbox tracker (`## Quick reference — phased checklist`) right after the intro, for use as a working execution tracker. No content changed — same phases, same gates, same §N blockers, just scannable.
- **2026-07-24 — Second verification pass (§0.6), doc corrected and extended.** Ran 8 parallel read-only checks against the actual Flutter/Next code to resolve every "unverified"/"check whether" flag left in the first pass. Two corrections: MFA's verify step isn't missing (it's live at `api/server/auth/mfa.dart` → `Urls.mfa` → the routed `mfa/page_content.dart`, just posts `{code}` instead of `{mfaToken, code}` — L3 corrected from "add a new file" to "add the missing field"); Register has no confirm-password field (that validation belongs to reset-password — Phase D's delta table was wrong, now rewritten D1–D5 with full per-page contracts and i18n keys, matching L1–L3's fidelity). New facts folded in: all 10 orphaned auth files confirmed at zero grep hits (plus a same-name `SocialLoginButtons` collision); `auth_form_wrapper.dart`/`mfa_challenge_widget.dart` confirmed not close enough to evolve, build fresh; `Input`'s label floats and is missing 5 params `LabeledField` needs (B2 updated); `LoginActions` already covers every Phase D method; `login_test.dart` will be the first `ProviderScope`-override test and first view-level test in the suite (no prior art); README's existing dev-run command conflicts with the new sanctioned one (A1 updated); Makefile has zero flutter targets, a concrete `flutter-run` target proposed matching repo convention. No code changed — still 0/5 phases started.
- **2026-07-24 — Consistency pass: propagated §0.6 corrections everywhere they were missed.** The Quick-reference checklist's B1/B2 lines still had the old "evaluate/check whether" hedges after the main text was already corrected to a definite verdict — fixed. §0.2's table still called `features/auth/ui/` usage "unverified" after §0.6 confirmed it orphaned — fixed. §0.4's refresh-interceptor claim now cross-references §0.6's caveat that no caller was actually found. A4's `main.dart` sample was hypothetical (`void main()`) and didn't match the real file (`Future<void> main() async`, confirmed in §0.6) — replaced with the actual file plus the exact diff. No new facts gathered, no code changed — this pass only removed internal contradictions between the original doc and its own §0.6 corrections.
