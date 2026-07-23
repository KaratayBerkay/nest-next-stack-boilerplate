# Convert next-js-boilerplate → flutter-boilerplate

**Goal:** Clone the entire next-js-boilerplate (~1,000+ source files, ~180 routes, ~400 view components, ~200 UI components, two-layer API, i18n, realtime, tier-based views, Stripe billing) into a Flutter mobile application that mirrors the exact same mechanics.

---

## Table of Contents

1. [Project Structure Mapping](#1-project-structure-mapping)
2. [Dependency Mapping](#2-dependency-mapping)
3. [Routing & Navigation](#3-routing--navigation)
4. [State Management & Data Flow](#4-state-management--data-flow)
5. [API Layer](#5-api-layer)
6. [UI Component Library](#6-ui-component-library)
7. [Theming & Styling](#7-theming--styling)
8. [i18n & Localization](#8-i18n--localization)
9. [Auth & Session](#9-auth--session)
10. [Tier-Based Views](#10-tier-based-views)
11. [Forms & Validation](#11-forms--validation)
12. [Billing & Stripe](#12-billing--stripe)
13. [Realtime (WebSocket/SSE)](#13-realtime-websocketsse)
14. [Feature Pages (Page-by-Page Conversion)](#14-feature-pages-page-by-page-conversion)
15. [UI Component Demos](#15-ui-component-demos)
16. [Fallbacks, Error Boundaries, Static Pages](#16-fallbacks-error-boundaries-static-pages)
17. [Hooks & Utilities](#17-hooks--utilities)
18. [Testing](#18-testing)
19. [Build & Config Files](#19-build--config-files)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Project Structure Mapping

### Root-level files

| Next.js File | Flutter Equivalent | Notes |
|---|---|---|
| `package.json` | `pubspec.yaml` | Dependencies, scripts |
| `tsconfig.json` | `analysis_options.yaml` | Type-checking rules |
| `next.config.ts` | `flutter-boilerplate/lib/app_config.dart` | App-wide config (env vars, base URL, feature flags) |
| `vitest.config.ts` | `flutter_test` config in `pubspec.yaml` | Test framework config |
| `playwright.config.ts` | `integration_test/` setup | E2E testing config |
| `.env` / `.env.example` | `.env` / `.env.example` + `flutter_dotenv` | Environment variables |
| `eslint.config.mjs` | `analysis_options.yaml` (lints via `custom_lint`) | Linting rules |
| `.prettierrc` | (Dart format — built-in) | Code formatting |
| `postcss.config.mjs` | Not needed | CSS processing not needed in Flutter |
| `Dockerfile` | `Dockerfile` | Containerization |
| `Dockerfile` | `android/` + `ios/` | Platform build configs |

### Source directory mapping

```
next-js-boilerplate/src/          flutter-boilerplate/lib/
├── app/                          ├── app/          (route config + GoRouter)
├── views/                        ├── views/        (page content widgets)
├── components/                   ├── components/   (reusable widgets)
│   └── ui/                       │   └── ui/       (design system widgets)
├── api/                          ├── api/
│   ├── server/                   │   └── server/   (HTTP call layer)
│   └── client/                   │   └── client/   (client wrappers)
├── types/                        ├── types/        (Dart model classes)
├── constants/                    ├── constants/    (app constants)
├── hooks/                        ├── hooks/        (custom hooks → Riverpod providers)
├── lib/                          ├── lib/          (utility functions)
├── validators/                   ├── validators/   (form validation)
├── store/                        ├── store/        (state management)
├── features/                     ├── features/     (feature-based modules)
├── fallbacks/                    ├── fallbacks/    (loading/error widgets)
├── services/                     ├── services/     (background services)
├── integrations/                 ├── integrations/ (3rd-party integrations)
├── generated/                    ├── generated/    (generated code)
└── context/                      └── context/      (Flutter InheritedWidgets / providers)

messages/                         lib/l10n/         (ARB files for i18n)
public/                           assets/           (static assets: images, fonts, js)
```

### Flutter-specific additions

```
flutter-boilerplate/
├── android/                      # Android platform
├── ios/                          # iOS platform
├── test/                         # Unit & widget tests
├── integration_test/             # Integration/E2E tests
├── assets/
│   ├── images/
│   ├── fonts/
│   └── scripts/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── app.dart                  # MaterialApp + GoRouter config
│   └── ...
└── .env
```

---

## 2. Dependency Mapping

| Next.js Package | Flutter Package | Purpose |
|---|---|---|
| `next` | `go_router` (+ `go_router_builder`) | File-system → declarative routing |
| `react` + `react-dom` | Flutter SDK (`widgets`, `material`) | UI framework |
| `@tanstack/react-query` | `flutter_riverpod` + `riverpod_annotation` | Server state / data fetching |
| `@tanstack/react-form` | `reactive_forms` or `formz` | Form state management |
| `zod` | `dartz` + manual validation or `formz` | Validation schemas |
| `zustand` / context | `riverpod` | Client state management |
| `next-intl` / custom i18n | `flutter_localizations` + `intl` | Internationalization |
| `tailwindcss` | Custom `ThemeData` + `ThemeExtension` | Utility-first styling |
| `@radix-ui/react-*` | Flutter Material/Cupertino widgets + custom | Accessible headless UI primitives |
| `@stripe/react-stripe-js` | `stripe_android` + `stripe_ios` + `stripe_sdk` | Payment processing |
| `embla-carousel-react` | `carousel_slider` or `flutter_carousel_widget` | Carousel |
| `react-day-picker` | `table_calendar` | Calendar/date picker |
| `vaul` | Custom `DraggableScrollableSheet` + `showModalBottomSheet` | Drawer/bottom sheet |
| `react-resizable-panels` | Custom `LayoutBuilder` + `GestureDetector` | Resizable panels |
| `@tabler/icons-react` | `tabler_icons` or manual SVGs | Icon library |
| `react-hot-toast` | `fluttertoast` or `snackbar` | Toast notifications |
| `pino` | `logger` | Logging |
| `kafkajs` | (Backend-only — not needed in Flutter) | Kafka client |
| `@opentelemetry/api` | Custom analytics service | Observability |
| `@vercel/otel` | Not needed in Flutter | OpenTelemetry |
| `server-only` | Not needed (no RSC in Flutter) | Server-only code marker |

### Key Flutter packages to add

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Routing
  go_router: ^14.0.0
  go_router_builder: ^2.4.0

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0
  riverpod_generator: ^2.4.0

  # Networking
  dio: ^5.4.0
  retrofit: ^4.1.0
  retrofit_generator: ^8.1.0

  # Forms
  reactive_forms: ^17.0.0
  formz: ^0.7.0

  # Local storage
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0

  # Internationalization
  intl: ^0.19.0
  intl_utils: ^2.8.0

  # UI
  flutter_svg: ^2.0.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  carousel_slider: ^5.0.0
  table_calendar: ^3.1.0
  flutter_stripe: ^11.0.0

  # Utilities
  logger: ^2.3.0
  dartz: ^0.10.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0
  equatable: ^2.0.0

  # Environment
  flutter_dotenv: ^5.1.0

  # WebSocket
  web_socket_channel: ^3.0.0

  # Push
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^18.0.0

  # Device info
  device_info_plus: ^11.0.0

dev_dependencies:
  build_runner: ^2.4.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  retrofit_generator: ^8.1.0
  riverpod_generator: ^2.4.0
  go_router_builder: ^2.4.0
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.0
  integration_test:
    sdk: flutter
  custom_lint: ^0.6.0
```

---

## 3. Routing & Navigation

### Next.js `src/app/` → Flutter `go_router`

The file-system based routing in `src/app/` maps to GoRouter's declarative route tree.

**Pattern:**

```
Next.js route                              Flutter GoRouter path
────────────────────────────────────────── ──────────────────────────────────────
/                                          /
/auth/login                                /auth/login
/auth/register                             /auth/register
/auth/forgot-password                      /auth/forgot-password
/auth/reset-password                       /auth/reset-password
/auth/verify-email                         /auth/verify-email
/v1/[lang]                                 /v1/:lang
/v1/[lang]/feed                            /v1/:lang/feed
/v1/[lang]/messages                        /v1/:lang/messages
/v1/[lang]/settings                        /v1/:lang/settings
/v1/[lang]/settings/billing                /v1/:lang/settings/billing
/v1/[lang]/posts/[uuid]                    /v1/:lang/posts/:uuid
/gallery                                   /gallery
/(marketing)/pricing                       /pricing
/(marketing)/about                         /about
/(demos)/ ...                              /demos/...
```

### Route configuration (`lib/app/router.dart`)

```dart
// Mirror of src/app/ route structure
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isV1Route = state.matchedLocation.startsWith('/v1');

      if (!isLoggedIn && isV1Route) return '/auth/login';
      if (isLoggedIn && isAuthRoute) return '/v1/en/feed';
      return null;
    },
    routes: [
      // Marketing routes (route group)
      GoRoute(path: '/', builder: (_, __) => const HomePage()),
      GoRoute(path: '/pricing', builder: (_, __) => const PricingPage()),
      GoRoute(path: '/about', builder: (_, __) => const AboutPage()),

      // Auth routes
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/auth/register', builder: (_, __) => const RegisterPage()),
      GoRoute(path: '/auth/forgot-password', builder: (_, __) => const ForgotPasswordPage()),
      GoRoute(path: '/auth/reset-password', builder: (_, __) => const ResetPasswordPage()),
      GoRoute(path: '/auth/verify-email', builder: (_, __) => const VerifyEmailPage()),

      // V1 shell (authenticated area)
      ShellRoute(
        builder: (_, __, child) => V1Shell(lang: lang, child: child),
        routes: [
          GoRoute(path: '/v1/:lang', builder: (_, state) => V1Home(lang: state.pathParameters['lang']!)),
          GoRoute(path: '/v1/:lang/feed', builder: (_, state) => FeedPage(lang: state.pathParameters['lang']!)),
          GoRoute(path: '/v1/:lang/messages', builder: (_, state) => MessagesPage(lang: state.pathParameters['lang']!)),
          // ... all v1 routes
        ],
      ),

      // Gallery (with modal)
      GoRoute(path: '/gallery', builder: (_, __) => const GalleryPage(),
        routes: [
          GoRoute(path: ':id', builder: (_, state) => GalleryDetail(id: state.pathParameters['id']!)),
        ],
      ),

      // Demo routes
      GoRoute(path: '/demos', builder: (_, __) => const DemosPage(),
        routes: [
          GoRoute(path: 'caching', builder: (_, __) => const CachingDemo()),
          GoRoute(path: 'form', builder: (_, __) => const FormDemo()),
          // ... all demos
        ],
      ),
    ],
  );
});
```

**Key mechanics to mirror:**
- **Parallel routes** (`dashboard/@analytics`, `dashboard/@team`) → `ShellRoute` with named outlets
- **Intercepting routes** (`gallery/@modal/(.)[id]`) → `showDialog`/`showModalBottomSheet` on navigation
- **Dynamic routes** (`[uuid]`, `[id]`, `[slug]`) → GoRouter path parameters `:uuid`, `:id`, `:slug`
- **Route groups** (`(marketing)`, `(demos)`) → Flattened — groups don't affect URL
- **Layout nesting** → `ShellRoute` / parent `Scaffold` widgets
- **Search params** → GoRouter `state.uri.queryParameters`
- **Loading state** → `SkeletonScreen` widgets shown during `AsyncValue` loading
- **Error state** → `ErrorScreen` widgets shown on `AsyncValue.error`
- **Not found** → GoRouter `errorBuilder` or fallback route

---

## 4. State Management & Data Flow

### Next.js → Flutter mapping

| Next.js Pattern | Flutter Equivalent |
|---|---|
| `@tanstack/react-query` (`useQuery`, `useMutation`) | Riverpod `FutureProvider.family`, `AsyncNotifierProvider` |
| `@tanstack/react-form` | `reactive_forms` `FormControl`, `FormGroup` |
| React Context (`AuthProvider`, `ThemeProvider`) | Riverpod `Provider`, `NotifierProvider` |
| `zustand` stores | Riverpod `NotifierProvider` (mutable state) |
| `useState` / `useReducer` | Riverpod `StateProvider` or local `StatefulWidget` |
| SSR data fetching (server components) | Not applicable — Flutter has no SSR. Use `FutureProvider` with initial data from API |
| `Suspense` with fallback | `AsyncValue.when(loading: ..., error: ..., data: ...)` |
| `server-only` | Not needed; all Flutter code runs on device |

### Provider architecture

```dart
// ─── lib/store/providers.dart ───

// Auth state — mirrors useAuth.tsx + AuthProvider
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthenticatedUser?> build() async {
    return _getSessionFromStorage();
  }

  Future<void> login(String email, String password) async { ... }
  Future<void> register(String email, String password, String name) async { ... }
  Future<void> logout() async { ... }
}

// Theme state — mirrors useTheme.tsx
@riverpod
class ThemeMode extends _$ThemeMode {
  @override
  AppThemeMode build() => AppThemeMode.light;
  void toggle() => state = state == AppThemeMode.light ? AppThemeMode.dark : AppThemeMode.light;
}

// Locale state
@riverpod
class Locale extends _$Locale {
  @override
  String build() => 'en';
  void set(String lang) => state = lang;
}

// Query pattern — mirrors @tanstack/react-query
// src/api/client/feed/query.ts
@riverpod
Future<List<Post>> feedPosts(FeedPostsRef ref, String lang, String tier) async {
  final feedServer = ref.read(feedServerProvider);
  return feedServer.getPosts(lang, tier);
}

// Mutation pattern
@riverpod
class CreatePost extends _$CreatePost {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<void> call(CreatePostRequest data) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(postServerProvider).create(data));
    ref.invalidate(feedPostsProvider);
  }
}
```

---

## 5. API Layer

### Two-layer pattern (same as Next.js)

**Server layer** (`lib/api/server/`) — Makes actual HTTP calls using Dio:

```dart
// lib/api/server/auth/login.dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../constants/api/urls.dart';
import '../../../constants/api/methods.dart';

final loginServerProvider = Provider((ref) => LoginServer(ref.read(dioProvider)));

class LoginServer {
  final Dio _dio;
  LoginServer(this._dio);

  Future<LoginResponse> call(LoginRequest request) async {
    final response = await _dio.post(
      Urls.login,
      data: request.toJson(),
    );
    return LoginResponse.fromJson(response.data);
  }
}
```

**Client layer** (`lib/api/client/`) — Wrappers that call server functions through Riverpod:

```dart
// lib/api/client/auth/actions.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final loginActionsProvider = Provider((ref) => LoginActions(ref));

class LoginActions {
  final Ref _ref;
  LoginActions(this._ref);

  Future<LoginResponse> login(LoginRequest request) async {
    final server = _ref.read(loginServerProvider);
    return server.call(request);
  }
}
```

**Usage in views:**

```dart
// lib/views/auth/LoginForm.dart
class LoginForm extends ConsumerWidget {
  Future<void> _handleLogin(LoginRequest data, WidgetRef ref) async {
    await ref.read(loginActionsProvider).login(data);
  }
}
```

**API constants** (`lib/constants/api/`):

```dart
// lib/constants/api/urls.dart
class Urls {
  static const login = '/api/auth/login';
  static const register = '/api/auth/register';
  static const feed = '/api/posts';
  static const messages = '/api/messages';
  // ...
}

// lib/constants/api/methods.dart
class HttpMethods {
  static const get = 'GET';
  static const post = 'POST';
  static const put = 'PUT';
  static const delete = 'DELETE';
}

// lib/constants/api/headers.dart
class Headers {
  static const jsonContentType = {'Content-Type': 'application/json'};
}
```

**Dio setup** (`lib/lib/api_client.dart`):

```dart
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  dio.interceptors.addAll([
    AuthInterceptor(ref),
    LoggerInterceptor(),
    RetryInterceptor(),
  ]);
  return dio;
});
```

---

## 6. UI Component Library

### Mapping `src/components/ui/` to Flutter widgets

Each kebab-case component directory in Next.js maps to a Flutter widget file.

**Folder structure:**

```
flutter-boilerplate/lib/components/ui/
├── accordion/
│   ├── accordion.dart
│   ├── accordion_item.dart
│   └── accordion_trigger.dart
├── alert/
│   ├── alert.dart
│   ├── alert_description.dart
│   └── alert_title.dart
├── button/
│   ├── button.dart
│   ├── button_group.dart
│   └── icon_button.dart
├── dialog/
│   ├── dialog.dart
│   ├── dialog_content.dart
│   ├── dialog_title.dart
│   └── dialog_actions.dart
├── input/
│   ├── input.dart
│   ├── date_input.dart
│   ├── date_time_input.dart
│   └── file_input.dart
├── toast/
│   ├── toast.dart
│   ├── toast_provider.dart
│   └── use_toast.dart
├── tabs/
│   ├── tabs.dart
│   ├── tabs_list.dart
│   └── tabs_content.dart
├── index.dart                     # Barrel exports
├── cn.dart                        # cn() equivalent
├── button_styles.dart             # Button variant maps
├── global_style_variants.dart     # useComponentVariant equivalent
└── skeleton_shapes.dart           # Skeleton widgets
```

**Key patterns to replicate from UI components skill:**

```
Component anatomy (kebab folder + PascalCase shim):
  src/components/ui/accordion/  →  lib/components/ui/accordion/
  ├── accordion.dart            →  accordion.dart
  ├── accordion-content.dart    →  accordion_content.dart
  ├── ...                       →  ...
  └── index.ts                  →  accordion.dart (re-export)

Types in src/types/ui/  →  types compact in same file or types/ui/

non-merging cn()  →  Utility that merges style lists without mutation:
  String cn(String? a, String? b) → List<Style> mergeStyles(...)

as const variant maps  →  Sealed class / enum:
  enum ButtonVariant { primary, secondary, ghost, danger }

useComponentVariant  →  NotifierProvider + variant resolution:
  final buttonVariantProvider = Provider.family<ButtonStyle, ButtonVariant>(...)

Semantic color tokens  →  ThemeExtension<AppColors>:
  context.theme.surface, context.theme.fg, context.theme.brand, ...
```

**Button component example:**

```dart
// lib/components/ui/button/button.dart
enum ButtonVariant { primary, secondary, ghost, danger, outline }
enum ButtonSize { sm, md, lg }

class Button extends StatelessWidget {
  final ButtonVariant variant;
  final ButtonSize size;
  final Widget child;
  final VoidCallback? onPressed;
  final bool loading;
  final bool disabled;

  const Button({
    super.key,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    required this.child,
    this.onPressed,
    this.loading = false,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.extension<AppColors>()!;

    return ElevatedButton(
      style: _buildStyle(colors),
      onPressed: (disabled || loading) ? null : onPressed,
      child: loading ? const CircularProgressIndicator() : child,
    );
  }

  ButtonStyle _buildStyle(AppColors colors) {
    switch (variant) {
      case ButtonVariant.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.brand,
          foregroundColor: colors.surface,
        );
      case ButtonVariant.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.surfaceAlt,
          foregroundColor: colors.fg,
        );
      case ButtonVariant.ghost:
        return TextButton.styleFrom(foregroundColor: colors.fg);
      case ButtonVariant.danger:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.danger,
          foregroundColor: colors.surface,
        );
    }
  }
}
```

**Full UI component conversion list** (one-to-one from Next.js):

| Next.js `components/ui/` | Flutter `components/ui/` | Notes |
|---|---|---|
| `accordion/` | `accordion.dart` | `ExpansionPanelList` + custom |
| `alert/` | `alert.dart` | Custom `Container` + icon |
| `alert-dialog/` | `alert_dialog.dart` | `AlertDialog` wrapper |
| `aspect-ratio/` | `aspect_ratio.dart` | `AspectRatio` widget |
| `avatar/` | `avatar.dart` | `CircleAvatar` + group |
| `badge/` | `badge.dart` | `Badge` widget |
| `breadcrumb/` | `breadcrumb.dart` | Row of links with separator |
| `button/` | `button.dart` | `ElevatedButton`/`TextButton` wrapper |
| `calendar/` | `calendar.dart` | `table_calendar` wrapper |
| `card/` | `card.dart` | `Card` widget |
| `carousel/` | `carousel.dart` | `carousel_slider` wrapper |
| `checkbox/` | `checkbox.dart` | `CheckboxListTile` + card/chip variants |
| `collapsible/` | `collapsible.dart` | `ExpansionTile` |
| `combobox/` | `combobox.dart` | `Autocomplete` + overlay |
| `command/` | `command.dart` | Custom command palette |
| `confirm-dialog/` | `confirm_dialog.dart` | `AlertDialog` with confirm/cancel |
| `context-menu/` | `context_menu.dart` | Long-press menu |
| `counter/` | `counter.dart` | `Stepper` widget |
| `date-picker/` | `date_picker.dart` | `showDatePicker` + custom |
| `dialog/` | `dialog.dart` | `Dialog` wrapper with parts |
| `drawer/` | `drawer.dart` | `Drawer` / `showModalBottomSheet` |
| `dropdown/` | `dropdown.dart` | `DropdownButton` |
| `dropdown-menu/` | `dropdown_menu.dart` | `PopupMenuButton` |
| `empty/` | `empty.dart` | Empty state widget |
| `error-boundary/` | `error_boundary.dart` | `ErrorWidget.builder` |
| `field-info-button/` | `field_info_button.dart` | Tooltip icon button |
| `file-upload/` | `file_upload.dart` | `file_picker` + drag target |
| `form-error-banner/` | `form_error_banner.dart` | Error summary widget |
| `form-field-info/` | `form_field_info.dart` | Helper text widget |
| `form-level-error/` | `form_level_error.dart` | Per-field error text |
| `hover-card/` | `hover_card.dart` | `Tooltip` / popup |
| `image-upload/` | `image_upload.dart` | `image_picker` wrapper |
| `input/` | `input.dart` | `TextField` wrapper + date/time variants |
| `input-group/` | `input_group.dart` | `InputDecorator` + prefix/suffix |
| `input-otp/` | `input_otp.dart` | OTP text field |
| `kbd/` | `kbd.dart` | Keyboard shortcut display |
| `label/` | `label.dart` | `Text` with typography style |
| `logo-spinner/` | `logo_spinner.dart` | Animated logo loading |
| `menubar/` | `menubar.dart` | `MenuBar` |
| `native-select/` | `native_select.dart` | `DropdownButton` |
| `navigation-menu/` | `navigation_menu.dart` | `NavigationBar` / `NavigationRail` |
| `page-header/` | `page_header.dart` | Page title widget |
| `page-info/` | `page_info.dart` | Page metadata |
| `pagination/` | `pagination.dart` | Row of page buttons |
| `popover/` | `popover.dart` | `PopupRoute` / `Overlay` |
| `progress/` | `progress.dart` | `LinearProgressIndicator` |
| `radio-group/` | `radio_group.dart` | `RadioListTile` group |
| `resizable/` | `resizable.dart` | `Flexible` + `GestureDetector` divider |
| `scroll-area/` | `scroll_area.dart` | `Scrollbar` + `ListView` |
| `scroll-to-bottom-button/` | `scroll_to_bottom_button.dart` | FAB to scroll to bottom |
| `select/` | `select.dart` | `DropdownButtonFormField` |
| `separator/` | `separator.dart` | `Divider` |
| `sheet/` | `sheet.dart` | `DraggableScrollableSheet` |
| `skeleton/` | `skeleton.dart` | `shimmer` package wrapper |
| `slider/` | `slider.dart` | `Slider` widget |
| `spinner/` | `spinner.dart` | `CircularProgressIndicator` |
| `step-indicator/` | `step_indicator.dart` | `Stepper` / custom steps |
| `switch/` | `switch.dart` | `Switch` widget |
| `table/` | `table.dart` | `DataTable` |
| `tabs/` | `tabs.dart` | `TabBar` + `TabBarView` |
| `textarea/` | `textarea.dart` | `TextField` multiline + auto-resize |
| `time-input/` | `time_input.dart` | `showTimePicker` |
| `toast/` | `toast.dart` | `ScaffoldMessenger.showSnackBar` / overlay |
| `toggle/` | `toggle.dart` | `ToggleButtons` |
| `toggle-group/` | `toggle_group.dart` | `ToggleButtons` group |
| `tooltip/` | `tooltip.dart` | `Tooltip` widget |
| `typography/` | `typography.dart` | `TextTheme` wrapper |

**Shared utility files:**

| Next.js `src/components/ui/` | Flutter `lib/components/ui/` |
|---|---|
| `cn.ts` → `cn()` | `utils/styles.dart` → `mergeStyles()` |
| `button-styles.ts` | `button/button_styles.dart` |
| `input-styles.ts` | `input/input_styles.dart` |
| `field-messages.tsx` | `form_error_banner.dart` + `field_info.dart` |
| `global-style-variants.ts` | `utils/variant.dart` |
| `skeleton-shapes.tsx` | `skeleton/skeleton_shapes.dart` |
| `index.ts` | `index.dart` (barrel) |

---

## 7. Theming & Styling

### Next.js Tailwind v4 → Flutter ThemeData + ThemeExtension

**Tailwind tokens → `ThemeExtension<AppColors>`:**

```dart
// lib/constants/theme/app_colors.dart
class AppColors extends ThemeExtension<AppColors> {
  final Color brand;
  final Color surface;
  final Color surfaceAlt;
  final Color surfaceHover;
  final Color fg;
  final Color fgMuted;
  final Color border;
  final Color danger;
  final Color success;
  final Color warning;
  final Color info;

  const AppColors({
    required this.brand,
    required this.surface,
    required this.surfaceAlt,
    required this.surfaceHover,
    required this.fg,
    required this.fgMuted,
    required this.border,
    required this.danger,
    required this.success,
    required this.warning,
    required this.info,
  });

  // Light theme
  static const light = AppColors(
    brand: Color(0xFF6366F1),
    surface: Color(0xFFFFFFFF),
    surfaceAlt: Color(0xFFF9FAFB),
    surfaceHover: Color(0xFFF3F4F6),
    fg: Color(0xFF111827),
    fgMuted: Color(0xFF6B7280),
    border: Color(0xFFE5E7EB),
    danger: Color(0xFFEF4444),
    success: Color(0xFF10B981),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF3B82F6),
  );

  // Dark theme
  static const dark = AppColors(
    brand: Color(0xFF818CF8),
    surface: Color(0xFF111827),
    surfaceAlt: Color(0xFF1F2937),
    surfaceHover: Color(0xFF374151),
    fg: Color(0xFFF9FAFB),
    fgMuted: Color(0xFF9CA3AF),
    border: Color(0xFF374151),
    danger: Color(0xFFFCA5A5),
    success: Color(0xFF6EE7B7),
    warning: Color(0xFFFCD34D),
    info: Color(0xFF93C5FD),
  );

  @override
  AppColors copyWith({...}) => ...;
  @override
  AppColors lerp(AppColors? other, double t) => ...;
}
```

**Font tokens:**

```dart
// lib/constants/theme/app_typography.dart
class AppTypography extends ThemeExtension<AppTypography> {
  final TextStyle h1;
  final TextStyle h2;
  final TextStyle h3;
  final TextStyle body;
  final TextStyle bodySmall;
  final TextStyle caption;
  final TextStyle code;
  final TextStyle label;

  // Mirrors the tailwind classes used across the codebase
}
```

**Theme data factory:**

```dart
// lib/constants/theme/theme_data.dart
ThemeData buildThemeData(AppThemeMode mode) {
  final colors = mode == AppThemeMode.light ? AppColors.light : AppColors.dark;

  return ThemeData(
    useMaterial3: true,
    brightness: mode == AppThemeMode.light ? Brightness.light : Brightness.dark,
    extensions: [colors],
    // ... map all color tokens to MaterialColor schemes
  );
}
```

**Theme toggle provider:**

```dart
// lib/hooks/use_theme.dart — mirrors src/hooks/useTheme.tsx
@riverpod
class ThemeMode extends _$ThemeMode {
  @override
  AppThemeMode build() => AppThemeMode.light;
  void toggle() => state = state == AppThemeMode.light ? AppThemeMode.dark : AppThemeMode.light;
}
```

**Theme initialization script** (`public/scripts/theme-init.js`) → Platform channels or `shared_preferences` to persist theme choice during splash screen.

---

## 8. i18n & Localization

### Next.js `messages/` → Flutter ARB files

| Next.js | Flutter |
|---|---|
| `messages/en/` | `lib/l10n/app_en.arb` |
| `messages/tr/` | `lib/l10n/app_tr.arb` |
| `getAllMessages(lang)` | `Intl.defaultLocale = lang` |
| `getMessages(lang, ns)` | Generated `AppLocalizations.of(context)` |
| `MessagesProvider` | `MaterialApp( localizationsDelegates: [...], supportedLocales: [...] )` |
| `useMessages("ns")` | `context.appLocalizations.property` |
| `generate-i18n-types.ts` | `flutter gen-l10n` or `intl_utils` |

**Namespace → ARB mapping:**

Each `messages/en/<namespace>/messages.json` becomes a section in `app_en.arb`:

```arb
{
  "@@locale": "en",
  "@@context": "All application strings",

  "auth_login_title": "Login",
  "auth_login_email": "Email",
  "auth_login_password": "Password",
  "auth_login_submit": "Sign In",
  "feed_title": "Feed",
  "feed_noPosts": "No posts yet",
  "v1_greeting": "Welcome to v1",
  "settings_title": "Settings",
  "settings_billing_title": "Billing",
  "error_generic": "Something went wrong"
}
```

---

## 9. Auth & Session

### Next.js auth patterns → Flutter auth

| Next.js Pattern | Flutter Equivalent |
|---|---|
| `getSessionUser()` (SSR) | `AuthNotifier` reads token from `flutter_secure_storage` |
| `AuthProvider` wrapping layout | `ProviderScope` with `authProvider` at root |
| `window.dispatchEvent(new CustomEvent('auth:logout'))` | `ref.read(authProvider.notifier).logout()` |
| `access_token` cookie | `flutter_secure_storage.write(key: 'access_token', value: token)` |
| `device_token` cookie | `shared_preferences` or secure storage |
| `POST /api/auth/login` | `dio.post('/api/auth/login')` |
| `POST /api/auth/register` | `dio.post('/api/auth/register')` |
| `POST /api/auth/logout` | `dio.post('/api/auth/logout')` + clear storage |
| `GET /api/auth/me` | `dio.get('/api/auth/me')` (token in Authorization header) |
| `POST /api/auth/token` (refresh) | `dio.interceptors` auto-refresh on 401 |
| `AuthInterceptor` | `DioInterceptor` adds Bearer token + handles 401 → refresh → retry |

**Auth state provider:**

```dart
// lib/hooks/use_auth.dart — mirrors src/hooks/useAuth.tsx
@freezed
class AuthenticatedUser with _$AuthenticatedUser {
  const factory AuthenticatedUser({
    required String id,
    required String email,
    required String name,
    required String tier,          // free, basic, medium, premium
    String? avatarUrl,
    String? language,
  }) = _AuthenticatedUser;

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) =>
      _$AuthenticatedUserFromJson(json);
}

@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthenticatedUser?> build() async {
    final token = await _storage.read(key: 'access_token');
    if (token == null) return null;
    return _fetchMe(token);
  }

  Future<void> login(String email, String password) async { ... }
  Future<void> register(String email, String password, String name) async { ... }
  Future<void> logout() async { ... }
}
```

**Auth redirect guard (GoRouter redirect):**

```dart
GoRouter(
  redirect: (context, state) {
    final authState = ref.read(authProvider);
    final isAuthenticated = authState.valueOrNull != null;
    final isAuthRoute = state.matchedLocation.startsWith('/auth');
    final isV1Route = state.matchedLocation.startsWith('/v1');

    if (!isAuthenticated && isV1Route) return '/auth/login';
    if (isAuthenticated && isAuthRoute) return '/v1/en/feed';
    return null;
  },
);
```

---

## 10. Tier-Based Views

### Mapping plan-based views

The Next.js boilerplate has tier-based views for feed, messages, notifications, settings, posts, find-friends, etc. Each feature has `FreePageView`, `BasicPageView`, `MediumPageView`, `PremiumPageView`.

**Flutter pattern:**

```dart
// lib/lib/tier_view.dart — mirrors src/lib/tier-view.tsx
class TierGate extends ConsumerWidget {
  final Widget freeWidget;
  final Widget? basicWidget;
  final Widget? mediumWidget;
  final Widget? premiumWidget;
  final Set<String> allowedTiers;

  const TierGate({
    required this.freeWidget,
    this.basicWidget,
    this.mediumWidget,
    this.premiumWidget,
    this.allowedTiers = const {'free', 'basic', 'medium', 'premium'},
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).valueOrNull;
    final tier = user?.tier ?? 'free';

    if (!allowedTiers.contains(tier)) {
      return UpgradePrompt(tier: tier);
    }

    switch (tier) {
      case 'premium': return premiumWidget ?? mediumWidget ?? basicWidget ?? freeWidget;
      case 'medium': return mediumWidget ?? basicWidget ?? freeWidget;
      case 'basic': return basicWidget ?? freeWidget;
      default: return freeWidget;
    }
  }
}
```

**Usage in views:**

```dart
// lib/views/feed/FreePageView.dart
class FeedPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: const FreeFeedList(),
      basicWidget: const BasicFeedList(),
      mediumWidget: const MediumFeedList(),
      premiumWidget: const PremiumFeedList(),
    );
  }
}
```

---

## 11. Forms & Validation

### Next.js zod + `@tanstack/react-form` → Flutter `reactive_forms` + validators

| Next.js Pattern | Flutter Equivalent |
|---|---|
| `zod` schemas in `src/validators/` | Custom validators in `lib/validators/` |
| `@tanstack/react-form` | `reactive_forms` `FormGroup` + `FormControl` |
| `useForm({ validators: { schema } })` | `FormGroup({ controls: { field: FormControl(...) } })` |
| `<form.Field name="email">` | `ReactiveTextField(formControlName: 'email')` |
| `handleSubmit(data)` | `formGroup.markAllAsTouched(); formGroup.valid ? ...` |
| `form.state.meta.errors` | `formControl.errors` |
| Exception → form errors | `exceptionToFormErrors()` → `formControl.setErrors(...)` |

**Validator files mapping:**

```dart
// lib/validators/auth/schema.dart — mirrors src/validators/auth/schema.ts
class LoginFormValidators {
  static Map<String, List<ValidatorFunction>> get rules => {
    'email': [Validators.required, Validators.email],
    'password': [Validators.required, Validators.minLength(8)],
  };
}

class RegisterFormValidators {
  static Map<String, List<ValidatorFunction>> get rules => {
    'email': [Validators.required, Validators.email],
    'password': [Validators.required, Validators.minLength(8)],
    'name': [Validators.required],
  };
}
```

**Forms conversion list:**

| Next.js `src/validators/` | Flutter `lib/validators/` |
|---|---|
| `auth/schema.ts` | `auth/schema.dart` |
| `auth/signup-schema.ts` | `auth/signup_schema.dart` |
| `billing/schema.ts` | `billing/schema.dart` |
| `demos/form-schema.ts` | `demos/form_schema.dart` |
| `forms/advanced.ts` | `forms/advanced.dart` |
| `forms/billing.ts` | `forms/billing.dart` |
| `forms/checkout.ts` | `forms/checkout.dart` |
| `forms/editor.ts` | `forms/editor.dart` |
| `forms/elements.ts` | `forms/elements.dart` |
| `forms/field-states.ts` | `forms/field_states.dart` |
| `forms/filters.ts` | `forms/filters.dart` |
| `forms/invite.ts` | `forms/invite.dart` |
| `forms/layouts.ts` | `forms/layouts.dart` |
| `forms/profile.ts` | `forms/profile.dart` |
| `forms/table.ts` | `forms/table.dart` |
| `messages/schema.ts` | `messages/schema.dart` |

---

## 12. Billing & Stripe

### Next.js Stripe integration → Flutter stripe

| Next.js Pattern | Flutter Equivalent |
|---|---|
| `@stripe/react-stripe-js` + `@stripe/stripe-js` | `flutter_stripe` package |
| `StripeProvider` (wraps app) | `Stripe.publishableKey = env.stripePublishableKey` |
| `StripeElements` wrapper | `CardFormField` widget |
| `StripeCardForm` | `CardFormField` in a `Form` |
| `createSetupIntent` API call | Server creates SetupIntent → client confirms via `Stripe.confirmSetupIntent` |
| `subscribe` API call | Server creates PaymentIntent → client confirms |
| `billing/history` | `FutureProvider` fetching invoices |
| `billing/payment-methods` | `FutureProvider` fetching saved cards |
| `billing/cancel` | Mutation to cancel subscription |

**Flutter Stripe integration:**

```dart
// lib/components/StripeProvider.dart — mirrors src/components/StripeProvider.tsx
class StripeInit extends StatefulWidget {
  final Widget child;
  const StripeInit({super.key, required this.child});

  @override
  State<StripeInit> createState() => _StripeInitState();

  static _StripeInitState? of(BuildContext context) {
    return context.findAncestorStateOfType<_StripeInitState>();
  }
}

class _StripeInitState extends State<StripeInit> {
  @override
  void initState() {
    super.initState();
    Stripe.publishableKey = Env.stripePublishableKey;
  }

  @override
  Widget build(BuildContext context) => child;
}
```

**Card form:**

```dart
// lib/views/checkout/StripeCardForm.dart — mirrors src/views/checkout/StripeCardForm.tsx
class StripeCardForm extends StatefulWidget {
  final void Function(PaymentMethod)? onPaymentMethodCreated;

  @override
  State<StripeCardForm> createState() => _StripeCardFormState();
}

class _StripeCardFormState extends State<StripeCardForm> {
  late CardFormField _cardField;

  Future<void> _onFormComplete() async {
    // SetupIntent flow
    final setupIntent = await _createSetupIntent();
    final result = await Stripe.instance.confirmSetupIntent(
      PaymentIntentParams.clientSecret(setupIntent.clientSecret),
    );
    if (result.setupIntent?.status == SetupIntentStatus.succeeded) {
      widget.onPaymentMethodCreated?.call(result.paymentMethod);
    }
  }
}
```

---

## 13. Realtime (WebSocket/SSE)

### Next.js EventSource + WebSocket → Flutter `web_socket_channel`

| Next.js Pattern | Flutter Equivalent |
|---|---|
| `EventSource` (SSE) | `WebSocket` via `web_socket_channel` |
| `websocket` (WS) | `WebSocketChannel.connect()` |
| `RealtimeProvider` | `RealtimeNotifier` (Riverpod) |
| `useConversation()` | `conversationProvider` (StreamProvider) |
| `useNotifications()` | `notificationProvider` (StreamProvider) |
| `useRoom()` | `roomProvider` (StreamProvider) |
| `realtime-client.ts` | `RealtimeClient` class wrapping WebSocket |
| `tab-coordinator.ts` | Not needed (single device) |
| `renew-dispatch.ts` | Auto-reconnect logic |
| `event-dispatch.ts` | StreamController broadcast |

**Flutter realtime architecture:**

```dart
// lib/lib/realtime/realtime_client.dart — mirrors src/lib/realtime/realtime-client.ts
class RealtimeClient {
  WebSocketChannel? _channel;
  final _controller = StreamController<Map<String, dynamic>>.broadcast();
  Timer? _reconnectTimer;

  Stream<Map<String, dynamic>> get stream => _controller.stream;

  void connect(String url, {Map<String, String>? headers}) {
    _channel = WebSocketChannel.connect(Uri.parse(url));
    _channel!.stream.listen(
      (data) => _controller.add(jsonDecode(data)),
      onDone: _scheduleReconnect,
      onError: (_) => _scheduleReconnect,
    );
  }

  void _scheduleReconnect() {
    _reconnectTimer = Timer(const Duration(seconds: 5), () => connect(_lastUrl));
  }

  void send(Map<String, dynamic> data) {
    _channel?.sink.add(jsonEncode(data));
  }

  void dispose() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _controller.close();
  }
}
```

**Stream providers:**

```dart
// lib/lib/realtime/use_conversation.dart — mirrors src/lib/realtime/useConversation.ts
final conversationProvider = StreamProvider.family<Message, String>((ref, conversationId) {
  final client = ref.read(realtimeClientProvider);
  return client.stream
    .where((event) => event['conversationId'] == conversationId)
    .map((event) => Message.fromJson(event));
});

// lib/lib/realtime/use_notifications.dart — mirrors src/lib/realtime/useNotifications.ts
final notificationStreamProvider = StreamProvider<Notification>((ref) {
  final client = ref.read(realtimeClientProvider);
  return client.stream
    .where((event) => event['type'] == 'notification')
    .map((event) => Notification.fromJson(event));
});
```

---

## 14. Feature Pages (Page-by-Page Conversion)

Each Next.js route group/feature is listed below with the Flutter equivalent.

### 14.1 V1 Shell (Authenticated Layout)

**Next.js:** `src/views/v1/[lang]/V1Shell.tsx`, `V1Sidebar.tsx`, `V1Header.tsx`, `V1Nav.tsx`, `ProfileDropdown.tsx`, `MessageDropdown.tsx`, `Badge.tsx`, `PageNavWrapper.tsx`

**Flutter:**

```
lib/views/v1/
├── v1_shell.dart              # Scaffold with NavigationRail/BottomNav
├── v1_sidebar.dart            # Drawer / NavigationRail
├── v1_header.dart             # AppBar with dropdowns
├── v1_nav.dart                # Bottom navigation bar
├── profile_dropdown.dart      # PopupMenuButton for user
├── message_dropdown.dart      # Unread messages indicator
├── badge.dart                 # Notification badge widget
└── page_nav_wrapper.dart      # AnimatedSwitcher / PageView wrapper
```

### 14.2 Auth Pages

**Next.js:** `src/views/auth/LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, `VerifyEmailForm.tsx`, `SocialLoginButtons.tsx`, `SocialLoginButton.tsx`, `ProviderIcon.tsx`

**Flutter:**

```
lib/views/auth/
├── login_form.dart
├── register_form.dart
├── forgot_password_form.dart
├── reset_password_form.dart
├── verify_email_form.dart
├── social_login_buttons.dart
├── social_login_button.dart
└── provider_icon.dart
```

### 14.3 Feed

**Next.js:** `src/views/feed/FreePageView.tsx`, `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx`, `FeedBaseView.tsx`, `FreeFeedList.tsx`, `MediumFeedList.tsx`, `PremiumFeedList.tsx`

**Flutter:**

```
lib/views/feed/
├── page_view.dart             # TierGate wrapping Free/Basic/Medium/Premium
├── free_page_view.dart
├── basic_page_view.dart
├── medium_page_view.dart
├── premium_page_view.dart
├── feed_base_view.dart        # Shared layout
├── free_feed_list.dart
├── medium_feed_list.dart
└── premium_feed_list.dart
```

### 14.4 Messages / Chat

**Next.js:** `src/views/messages/FreePageView.tsx`, `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx`, `MessagesSidebar.tsx`, `ChatView.tsx`, `ChatInputBar.tsx`, `ChatMessageBubble.tsx`, `ChatMessageList.tsx`, `ChatViewHeader.tsx`, `MessagesSidebarConversations.tsx`, `MessagesSidebarFriends.tsx`, `MessagesSidebarSearch.tsx`, `MessagesSidebarTabBar.tsx`, `EmptyChatState.tsx`

**Flutter:**

```
lib/views/messages/
├── page_view.dart             # TierGate wrapper
├── free_page_view.dart
├── basic_page_view.dart
├── medium_page_view.dart
├── premium_page_view.dart
├── messages_sidebar.dart      # Conversations list
├── messages_sidebar_conversations.dart
├── messages_sidebar_friends.dart
├── messages_sidebar_search.dart
├── messages_sidebar_tab_bar.dart
├── chat_view.dart             # Main chat area
├── chat_input_bar.dart
├── chat_message_bubble.dart
├── chat_message_list.dart
├── chat_view_header.dart
└── empty_chat_state.dart
```

### 14.5 Notifications

**Next.js:** `src/views/notification/FreePageView.tsx`, `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx`, `NotificationPageContent.tsx`, `NotificationHeader.tsx`, `NotificationItem.tsx`

**Flutter:**

```
lib/views/notification/
├── page_view.dart             # TierGate wrapper
├── free_page_view.dart
├── basic_page_view.dart
├── medium_page_view.dart
├── premium_page_view.dart
├── notification_page_content.dart
├── notification_header.dart
└── notification_item.dart
```

### 14.6 Posts / Post Detail

**Next.js:** `src/views/posts/[uuid]/FreePageView.tsx`, `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx`, `PostDetailBaseView.tsx`, `PostContentView.tsx`, `PostHeader.tsx`, `PostEditForm.tsx`, `ReactionBreakdown.tsx`, `WhoReacted.tsx`

**Flutter:**

```
lib/views/posts/
├── [uuid]/
│   ├── page_view.dart
│   ├── free_page_view.dart
│   ├── basic_page_view.dart
│   ├── medium_page_view.dart
│   ├── premium_page_view.dart
│   ├── post_detail_base_view.dart
│   ├── post_content_view.dart
│   ├── post_header.dart
│   ├── post_edit_form.dart
│   ├── reaction_breakdown.dart
│   └── who_reacted.dart
```

### 14.7 Find Friends

**Next.js:** `src/views/find-friends/FreePageView.tsx`, `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx`, `FreeFindFriendsContent.tsx`, `MediumFindFriendsContent.tsx`, `SuggestedFriendsPanel.tsx`, `UserSearchCard.tsx`, `PendingRequestCard.tsx`, `PaginationBar.tsx`, `useFriendActions.ts`, `useFriendSearch.ts`, `search-utils.ts`

**Flutter:**

```
lib/views/find_friends/
├── page_view.dart
├── free_page_view.dart
├── basic_page_view.dart
├── medium_page_view.dart
├── premium_page_view.dart
├── free_find_friends_content.dart
├── medium_find_friends_content.dart
├── suggested_friends_panel.dart
├── user_search_card.dart
├── pending_request_card.dart
├── pagination_bar.dart
├── use_friend_actions.dart
├── use_friend_search.dart
└── search_utils.dart
```

### 14.8 Settings Pages

**Next.js:** `src/views/settings/account/`, `billing/`, `general/`, `privacy/`, `sessions/`, `api-keys/`

**Flutter:**

```
lib/views/settings/
├── settings_shell.dart          # ShellRoute with settings nav
├── page_view.dart
├── plan_advantages.dart
├── plan_info_card.dart
├── upgrade_actions.dart
├── account/
│   ├── page_view.dart (tier-gated)
│   ├── account_avatar_section.dart
│   ├── account_form_fields.dart
│   └── profile_actions.dart
├── billing/
│   ├── page_view.dart (tier-gated)
│   ├── billing_address_form.dart
│   ├── billing_info_display.dart
│   ├── invoice_table.dart
│   ├── payment_methods.dart
│   ├── plan_details.dart
│   ├── plan_benefits.dart
│   └── status_badge.dart
├── general/
│   ├── page_view.dart (tier-gated)
│   └── settings_select.dart
├── privacy/
│   ├── page_view.dart (tier-gated)
│   └── privacy_toggle_row.dart
├── sessions/
│   ├── page_view.dart (tier-gated)
│   ├── session_card.dart
│   └── empty_sessions.dart
└── api_keys/
    ├── page_content.dart
    ├── api_key_list.dart
    ├── create_api_key_form.dart
    └── api_key_handlers.dart
```

### 14.9 Checkout / Plans / Pricing

**Next.js:** `src/views/checkout/CheckoutPageContent.tsx`, `StripeCardForm.tsx`, `StripeElements.tsx`
**Next.js:** `src/views/plans/PageContent.tsx`
**Next.js:** `src/views/pricing/PageContent.tsx`

**Flutter:**

```
lib/views/checkout/
├── checkout_page_content.dart
├── stripe_card_form.dart
└── stripe_elements.dart

lib/views/plans/
└── page_content.dart

lib/views/pricing/
└── page_content.dart
```

### 14.10 Admin

**Next.js:** `src/views/admin/PageContent.tsx`, `UserTierRow.tsx`, `audit-logs/`

**Flutter:**

```
lib/views/admin/
├── page_content.dart
├── user_tier_row.dart
└── audit_logs/
    ├── audit_logs_page_content.dart
    ├── audit_logs_table.dart
    ├── audit_logs_filters.dart
    └── audit_logs_diff_view.dart
```

### 14.11 Premium / Boom / Share / Users

**Next.js:** `src/views/premium/`, `boom/`, `share/`, `users/`

**Flutter:**

```
lib/views/premium/
├── page_view.dart (tier-gated)
├── stats_section.dart
├── growth_stats_section.dart
└── premium_handlers.dart

lib/views/boom/
└── page_content.dart

lib/views/share/
├── page_content.dart
├── image_preview_section.dart
└── share_actions.dart

lib/views/users/
├── list/free_page_view.dart
└── detail/[uuid]/free_page_view.dart
```

### 14.12 Forms (Feature-Rich Form Demo Pages)

**Next.js:** 14 form demo sections under `src/views/forms/`

**Flutter:**

```
lib/views/forms/
├── page_content.dart
├── forms_layout.dart
├── advanced/
│   ├── page_content.dart
│   ├── personal_info_fields.dart
│   ├── business_fields.dart
│   ├── team_members.dart
│   └── advanced_handlers.dart
├── api_key/
│   ├── page_content.dart
│   ├── api_key_create_form.dart
│   ├── api_key_list.dart
│   └── use_api_key_mutations.dart
├── billing/
│   ├── page_content.dart
│   ├── billing_summary.dart
│   ├── coupon_status.dart
│   ├── billing_handlers.dart
│   ├── billing_constants.dart
│   └── billing_utils.dart
├── checkout/
│   ├── page_content.dart
│   ├── address_group.dart
│   └── submit_checkout.dart
├── content_editor/
│   ├── page_content.dart
│   ├── editor_header.dart
│   ├── editor_form_fields.dart
│   ├── editor_preview.dart
│   ├── editor_effects.dart
│   ├── draft_alert.dart
│   ├── draft_utils.dart
│   └── submit_content.dart
├── editable_table/
│   ├── page_content.dart
│   ├── editable_table_row.dart
│   ├── editable_table_row_actions.dart
│   ├── editable_table_totals.dart
│   └── editable_table_constants.dart
├── elements/
│   ├── page_content.dart
│   ├── section_card.dart
│   ├── default_inputs_section.dart
│   ├── selects_section.dart
│   ├── textarea_section.dart
│   ├── toggles_section.dart
│   ├── date_time_section.dart
│   ├── input_groups_section.dart
│   ├── input_states_section.dart
│   ├── file_upload_sections.dart
│   └── form_validation_section.dart
├── error_lab/
│   ├── page_content.dart
│   ├── scenario_selectors.dart
│   ├── error_result_display.dart
│   └── trigger_handler.dart
├── field_states/
│   ├── page_content.dart
│   ├── eager_classic_forms.dart
│   ├── dynamic_async_forms.dart
│   ├── field_states_grid.dart
│   ├── state_card.dart
│   ├── linked_fields_section.dart
│   ├── programmatic_meta_section.dart
│   ├── validation_modes_section.dart
│   └── field_states_helpers.dart
├── filters/
│   ├── page_content.dart
│   ├── filters_form.dart
│   ├── filter_section.dart
│   ├── constants.dart
│   └── use_filters_form.dart
├── form_builder/
│   ├── page_content.dart
│   ├── field_editor.dart
│   ├── form_preview.dart
│   └── form_builder_utils.dart
├── layouts/
│   ├── page_content.dart
│   ├── layout_card.dart
│   ├── personal_info_section.dart
│   ├── address_section.dart
│   ├── membership_section.dart
│   ├── contact_form.dart
│   ├── sectioned_card_form.dart
│   ├── two_column_grid_form.dart
│   ├── icon_field.dart
│   ├── icon_prefixed_form.dart
│   └── icons.dart
├── profile/
│   ├── page_content.dart
│   ├── profile_fields.dart
│   ├── profile_basic_fields.dart
│   ├── profile_avatar_field.dart
│   ├── profile_preferences_fields.dart
│   ├── profile_constants.dart
│   ├── profile_validators.dart
│   └── submit_profile.dart
├── team_invite/
│   ├── page_content.dart
│   ├── emails_step.dart
│   ├── role_step.dart
│   ├── message_step.dart
│   ├── review_step.dart
│   ├── navigation_buttons.dart
│   ├── quota_exceeded.dart
│   └── config.dart
└── uploads/
    ├── page_content.dart
    ├── avatar_upload_section.dart
    ├── document_upload_section.dart
    └── gallery_upload_section.dart
```

### 14.13 Demo Pages (Next.js feature demos)

**Next.js routes under `(demos)` and `demos`:**

```
lib/views/demos/
├── page_content.dart
├── caching.dart
├── client_data.dart
├── csr.dart
├── csr_cookies.dart
├── data_fetching.dart
├── dynamic.dart
├── fonts.dart
├── form.dart
├── images.dart
├── lazy_loading.dart
├── observability.dart
├── ppr.dart
├── request_memoization.dart
├── scripts.dart
├── search_params.dart
├── seo.dart
├── server_actions.dart
├── sse.dart
├── ssr.dart
├── ssr_cookies.dart
├── static.dart
├── theme.dart
└── ws.dart
```

### 14.14 Marketing Pages

```
lib/views/
├── home/page_content.dart          # src/app/page.tsx
├── about/page_content.dart         # src/app/(marketing)/about/
└── pricing/page_content.dart       # src/app/(marketing)/pricing/
```

### 14.15 Dashboard (Parallel Routes)

```
lib/views/dashboard/
├── dashboard_shell.dart            # ShellRoute with parallel columns
├── analytics_panel.dart            # @analytics/page.tsx
└── team_panel.dart                 # @team/page.tsx
```

### 14.16 Gallery

```
lib/views/gallery/
├── gallery_page.dart
├── photo_detail.dart               # [id]/page.tsx
└── photo_modal.dart                # @modal/(.)[id]/page.tsx
```

---

## 15. UI Component Demos

The Next.js boilerplate has demo pages for every UI component at `src/app/v1/[lang]/ui/<component>/`. These demonstrate all variants and states of each component.

**Flutter:**

```
lib/views/ui/
├── ui_layout.dart                  # Tabs layout for component demos
├── page_content.dart               # UI demo index
├── _shared/
│   ├── example_tabs.dart           # Tab bar for component examples
│   ├── example_tabs_desktop_bar.dart
│   ├── example_tabs_mobile_accordion.dart
│   ├── tab_nav.dart
│   └── variant_gallery.dart        # Grid showing all variants
├── accordion/
│   ├── page_content.dart
│   ├── single_state_example.dart
│   ├── multi_state_example.dart
│   ├── faq_section.dart
│   ├── user_profile_section.dart
│   └── rich_items_example.dart
├── alert/
│   ├── page_content.dart
│   ├── components_tab.dart
│   ├── examples_tab.dart
│   ├── dismissible_alert_section.dart
│   ├── full_width_modal_alert.dart
│   ├── popup_alerts_example.dart
│   ├── server_retry_tab.dart
│   ├── status_alerts_section.dart
│   └── top_banner_alert.dart
├── button/
│   ├── page_content.dart
│   ├── variants_tab.dart
│   ├── sizes_tab.dart
│   ├── icon_buttons_tab.dart
│   └── button_groups_tab.dart
├── dialog/
│   ├── page_content.dart
│   ├── basic_dialog_tab.dart
│   ├── sizes_tab.dart
│   ├── scrollable_tab.dart
│   └── fullscreen_tab.dart
└── ... (50+ component demo folders — one per UI component)
```

---

## 16. Fallbacks, Error Boundaries, Static Pages

### Fallbacks

**Next.js:** `src/fallbacks/` — Loading skeletons for every route.

**Flutter:**

```
lib/fallbacks/
├── index.dart
├── shared/
│   ├── loading_dots.dart
│   ├── loading_text.dart
│   ├── mono_ellipsis.dart
│   ├── pulse_block.dart
│   └── pulse_small_block.dart
├── app/
│   ├── auth_fallback.dart
│   ├── verify_email_fallback.dart
│   ├── dynamic_loading_fallback.dart
│   ├── lazy_loading_fallback.dart
│   ├── ppr_fallback.dart
│   ├── v1_content_fallback.dart
│   ├── v1_page_fallback.dart
│   ├── v1_shell_fallback.dart
│   ├── feed_loading_fallback.dart
│   ├── messages_loading_fallback.dart
│   ├── settings_loading_fallback.dart
│   └── ...
└── views/
    ├── chat_room_fallback.dart
    ├── find_friends_fallback.dart
    ├── messages_view_fallback.dart
    └── notification_fallback.dart
```

### Static Pages (Error, 404, Access Denied, etc.)

**Next.js:** `src/features/statics/`

**Flutter:**

```
lib/features/statics/
├── index.dart
├── error/
│   ├── error_page.dart            # Generic error screen
│   └── global_error_page.dart     # Unhandled error screen
├── not_found/
│   ├── not_found_page.dart        # Non-i18n 404
│   └── i18n_not_found_page.dart   # i18n-aware 404
├── access_denied/
│   └── access_denied_page.dart    # Role/tier denial screen
├── unauthorized/
│   └── unauthorized_page.dart     # Unauthenticated prompt
└── loading/
    └── loading_page.dart          # Generic loading screen
```

---

## 17. Hooks & Utilities

### Hooks mapping

**Next.js `src/hooks/` → Flutter custom hooks (Riverpod providers):**

| Next.js Hook | Flutter Provider/Utility |
|---|---|
| `useAuth` | `authProvider` (Notifier) |
| `useTheme` | `themeModeProvider` (Notifier) |
| `useLang` | `localeProvider` (Notifier) |
| `useDebounce` | `debounce` extension / `Timer` |
| `useApi` | Dio instance via `dioProvider` |
| `useBreakpoint` | `LayoutBuilder` / `MediaQuery` |
| `useMediaQuery` | `MediaQuery.of(context)` |
| `useClickOutside` | `GestureDetector` on overlay |
| `useAutoScroll` | `ScrollController` + `WidgetsBindingObserver` |
| `useComponentVariant` | `variantProvider` (family) |
| `useConnectionState` | `connectivity_plus` package |
| `useDeviceType` | `device_info_plus` package |
| `useEdgeSwipe` | `GestureDetector` edge drag |
| `useExitAnimation` | `AnimatedSwitcher` / `AnimationController` |
| `useEventLogger` | Custom analytics service |
| `useMinTier` | `TierGate` utility |
| `useNetworkLogger` | Dio interceptor |
| `usePerformanceLogger` | `Stopwatch` wrapper |
| `usePostHashScroll` | Scroll to position |
| `usePresence` | WebSocket presence channel |
| `usePushNotifications` | `firebase_messaging` |
| `useSSE` | `web_socket_channel` |
| `useSwipeGesture` | `GestureDetector` |
| `useClientSearchParams` | GoRouter `state.uri.queryParameters` |
| `useCurrencyCookie` | `shared_preferences` |
| `useDateDisplayCookie` | `shared_preferences` |
| `useMessagesData` | Riverpod family for messages |
| `useMessagesSearch` | Riverpod family for message search |
| `useMessagesPage` | Riverpod provider for message page state |

### Utility libraries mapping

**Next.js `src/lib/` → Flutter `lib/lib/`:**

| Next.js Utility | Flutter Equivalent |
|---|---|
| `lib/cn.ts` | `utils/styles.dart` (mergeStyles) |
| `lib/api-client.ts` | `lib/api_client.dart` (Dio) |
| `lib/auth-ssr.ts` | `services/auth_service.dart` |
| `lib/backend.ts` | Not needed |
| `lib/cookie.ts` | `flutter_secure_storage` |
| `lib/currency.ts` | `utils/currency.dart` |
| `lib/date-time.ts` | `utils/date_time.dart` |
| `lib/dedup.ts` | Not needed in Flutter |
| `lib/env.ts` | `flutter_dotenv` |
| `lib/event-logger.ts` | `services/analytics_service.dart` |
| `lib/exception-handler.ts` | `utils/error_handler.dart` |
| `lib/font-classes.ts` | `constants/theme/typography.dart` |
| `lib/get-base-path.ts` | Not needed |
| `lib/i18n/` | `lib/l10n/` + `intl` |
| `lib/image.ts` | `cached_network_image` |
| `lib/initials.ts` | `utils/string_utils.dart` |
| `lib/kafka.ts` | Not needed |
| `lib/logger.ts` | `logger` package |
| `lib/observability.ts` | `services/observability_service.dart` |
| `lib/popover-positioning.ts` | Overlay positioning utils |
| `lib/read-lang-cookie.ts` | `shared_preferences` |
| `lib/realtime/` | `services/realtime_client.dart` |
| `lib/request-context.ts` | Not needed |
| `lib/request-logger.ts` | Dio interceptor |
| `lib/resolve-variant.ts` | `utils/variant.dart` |
| `lib/seo/JsonLd.tsx` | Deep linking config |
| `lib/settings/` | `services/settings_service.dart` |
| `lib/tier.ts` | `utils/tier.dart` |
| `lib/tier-view.tsx` | `widgets/tier_gate.dart` |
| `lib/v1/touch-handlers.ts` | Gesture recognizers |
| `lib/vault.ts` | Not needed |
| `lib/xhr-upload.ts` | Dio multipart upload |

---

## 18. Testing

| Next.js | Flutter |
|---|---|
| `vitest` (unit) | `flutter_test` (unit + widget) |
| `@testing-library/react` | `flutter_test` + `ProviderContainer` (Riverpod test) |
| `playwright` (E2E) | `integration_test` package |
| `vitest --coverage` | `flutter test --coverage` + `lcov` |
| `@axe-core/playwright` (a11y) | `flutter_ume` or manual |
| `lighthouse` (perf) | Flutter DevTools |

**Test file mapping:**

```
next-js-boilerplate/                     flutter-boilerplate/
├── src/components/DemoBadge.test.tsx    ├── test/components/demo_badge_test.dart
├── src/components/ui/button.test.tsx    ├── test/components/ui/button_test.dart
├── src/lib/cn.test.ts                  ├── test/lib/cn_test.dart
├── src/views/forms/checkout/           ├── test/views/forms/checkout/
│   └── __tests__/submitCheckout.test.ts │   └── submit_checkout_test.dart
└── e2e/                                └── integration_test/
```

---

## 19. Build & Config Files

| Next.js | Flutter |
|---|---|
| `package.json` (scripts) | `pubspec.yaml` (flutter commands) |
| `tsconfig.json` | `analysis_options.yaml` |
| `next.config.ts` | `lib/app_config.dart` |
| `.env` | `.env` + `flutter_dotenv` |
| `eslint.config.mjs` | `analysis_options.yaml` (lints) |
| `vitest.config.ts` | `flutter_test` config in pubspec |
| `playwright.config.ts` | `integration_test` config |
| `postcss.config.mjs` | Not needed |
| `Dockerfile` | `Dockerfile` |
| `pnpm-workspace.yaml` | Not needed (monorepo handled at root) |
| `.prettierrc` | Built-in `dart format` |
| `commitlint.config.mjs` | `husky` + commit lint |
| `.husky/` | `husky` equivalent or custom |
| `lighthouserc.json` | Flutter DevTools |
| `.dependency-cruiser.js` | `dart_code_metrics` or `custom_lint` |

**Scripts mapping:**

```yaml
# pubspec.yaml
scripts:
  dev: "flutter run"
  build: "flutter build apk && flutter build ios"
  test: "flutter test"
  test:watch: "flutter test --watch"
  test:coverage: "flutter test --coverage"
  lint: "dart analyze"
  format: "dart format ."
  generate-i18n: "flutter gen-l10n"
  generate: "dart run build_runner build --delete-conflicting-outputs"
  analyze: "flutter analyze"
```

---

## 20. Implementation Phases

### Phase 1: Scaffold & Foundation (Week 1-2)
- [ ] Create flutter-boilerplate with `flutter create`
- [ ] Set up `pubspec.yaml` with all dependencies
- [ ] Configure `analysis_options.yaml` with lint rules
- [ ] Set up `go_router` with all route definitions
- [ ] Create app shell: `main.dart`, `app.dart`
- [ ] Set up Dio HTTP client with interceptors
- [ ] Set up Riverpod with all base providers
- [ ] Create `ThemeData` + `ThemeExtension` for color tokens
- [ ] Set up `flutter_localizations` + ARB files
- [ ] Create constants (urls, methods, headers, routes, site, upload, etc.)

### Phase 2: Auth & Shell (Week 3-4)
- [ ] Build auth forms (login, register, forgot/reset password, verify email)
- [ ] Build auth service (login, register, logout, token refresh, me)
- [ ] Build V1 shell (AppBar, NavigationRail/BottomNav, Drawer)
- [ ] Build profile dropdown, message dropdown, badges
- [ ] Set up auth redirect guards in GoRouter
- [ ] Build `TierGate` widget

### Phase 3: UI Component Library (Week 5-8)
- [ ] Build 20 core components (Button, Input, Card, Dialog, Tabs, etc.)
- [ ] Build 20 advanced components (Combobox, Command, DatePicker, etc.)
- [ ] Build 20 remaining components (Carousel, Resizable, Toast, etc.)
- [ ] Build 10 specialized components (OTP, File Upload, Image Upload, etc.)
- [ ] Build component demo pages for all components
- [ ] Create `cn()` equivalent and variant system
- [ ] Add component tests

### Phase 4: Feature Pages (Week 9-14)
- [ ] Build Feed pages (all 4 tiers)
- [ ] Build Messages/Chat pages (all 4 tiers)
- [ ] Build Notifications pages (all 4 tiers)
- [ ] Build Posts/Post Detail pages (all 4 tiers)
- [ ] Build Find Friends pages (all 4 tiers)
- [ ] Build Settings pages (account, billing, general, privacy, sessions, api-keys)
- [ ] Build Checkout/Plans/Pricing pages
- [ ] Build Admin pages
- [ ] Build Premium page
- [ ] Build Share page
- [ ] Build Users pages

### Phase 5: Realtime & WebSocket (Week 15)
- [ ] Build RealtimeClient with auto-reconnect
- [ ] Build conversation stream provider
- [ ] Build notification stream provider
- [ ] Build room/presence stream provider
- [ ] Wire up chat view to realtime

### Phase 6: Billing & Stripe (Week 16)
- [ ] Integrate `flutter_stripe`
- [ ] Build CardForm widget
- [ ] Build payment flow (SetupIntent, PaymentIntent)
- [ ] Build billing history
- [ ] Build payment methods management
- [ ] Build subscription management

### Phase 7: Forms Demo Pages (Week 17-18)
- [ ] Build all 14 form demo sections
- [ ] Build form framework (reactive_forms wrappers)
- [ ] Build validators for all form schemas

### Phase 8: Testing & Polish (Week 19-20)
- [ ] Add unit tests for all providers
- [ ] Add widget tests for all components
- [ ] Add integration tests for critical flows
- [ ] Accessibility review
- [ ] Performance optimization (rendering, network, memory)
- [ ] Platform-specific polish (iOS safe areas, Android back gesture)
- [ ] Deep linking setup
- [ ] Push notifications via Firebase

---

## Appendix: Complete Route ↔ Page Mapping

```
NEXT.JS ROUTE                               FLUTTER GOROUTER PATH                 VIEW WIDGET
─────────────────────────────────────────── ───────────────────────────────────── ────────────────────────────────
/                                            /                                     views/home/page_content.dart
/auth/login                                  /auth/login                           views/auth/login_form.dart
/auth/register                               /auth/register                        views/auth/register_form.dart
/auth/forgot-password                        /auth/forgot-password                 views/auth/forgot_password_form.dart
/auth/reset-password                         /auth/reset-password                  views/auth/reset_password_form.dart
/auth/verify-email                           /auth/verify-email                    views/auth/verify_email_form.dart
/(marketing)/pricing                         /pricing                              views/pricing/page_content.dart
/(marketing)/about                           /about                                views/about/page_content.dart
/v1/[lang]                                   /v1/:lang                             views/v1/v1_shell.dart + v1_home.dart
/v1/[lang]/feed                              /v1/:lang/feed                        views/feed/page_view.dart (tier-gated)
/v1/[lang]/messages                          /v1/:lang/messages                    views/messages/page_view.dart (tier-gated)
/v1/[lang]/notification                      /v1/:lang/notification                views/notification/page_view.dart (tier-gated)
/v1/[lang]/posts/[uuid]                      /v1/:lang/posts/:uuid                 views/posts/[uuid]/page_view.dart (tier-gated)
/v1/[lang]/find-friends                      /v1/:lang/find-friends                views/find_friends/page_view.dart (tier-gated)
/v1/[lang]/find-friends/requests             /v1/:lang/find-friends/requests       views/find_friends/requests_page.dart
/v1/[lang]/plans                             /v1/:lang/plans                       views/plans/page_content.dart
/v1/[lang]/premium                           /v1/:lang/premium                     views/premium/page_view.dart (tier-gated)
/v1/[lang]/checkout/[tier]                   /v1/:lang/checkout/:tier              views/checkout/checkout_page_content.dart
/v1/[lang]/share                             /v1/:lang/share                       views/share/page_content.dart
/v1/[lang]/settings                          /v1/:lang/settings                    views/settings/settings_shell.dart
/v1/[lang]/settings/account                  /v1/:lang/settings/account            views/settings/account/page_view.dart (tier-gated)
/v1/[lang]/settings/billing                  /v1/:lang/settings/billing            views/settings/billing/page_view.dart (tier-gated)
/v1/[lang]/settings/general                  /v1/:lang/settings/general            views/settings/general/page_view.dart (tier-gated)
/v1/[lang]/settings/privacy                  /v1/:lang/settings/privacy            views/settings/privacy/page_view.dart (tier-gated)
/v1/[lang]/settings/sessions                 /v1/:lang/settings/sessions           views/settings/sessions/page_view.dart (tier-gated)
/v1/[lang]/settings/api-keys                 /v1/:lang/settings/api-keys           views/settings/api_keys/page_content.dart
/v1/[lang]/admin                             /v1/:lang/admin                       views/admin/page_content.dart
/v1/[lang]/admin/audit-logs                  /v1/:lang/admin/audit-logs            views/admin/audit_logs/audit_logs_page_content.dart
/v1/[lang]/boom                              /v1/:lang/boom                        views/boom/page_content.dart
/v1/[lang]/users/list                        /v1/:lang/users/list                  views/users/list/free_page_view.dart
/v1/[lang]/users/detail/[uuid]               /v1/:lang/users/detail/:uuid          views/users/detail/[uuid]/free_page_view.dart
/v1/[lang]/forms                             /v1/:lang/forms                       views/forms/page_content.dart
/v1/[lang]/forms/advanced                    /v1/:lang/forms/advanced              views/forms/advanced/page_content.dart
/v1/[lang]/forms/api-key                     /v1/:lang/forms/api-key               views/forms/api_key/page_content.dart
/v1/[lang]/forms/billing                     /v1/:lang/forms/billing               views/forms/billing/page_content.dart
/v1/[lang]/forms/checkout                    /v1/:lang/forms/checkout              views/forms/checkout/page_content.dart
/v1/[lang]/forms/content-editor              /v1/:lang/forms/content-editor        views/forms/content_editor/page_content.dart
/v1/[lang]/forms/editable-table              /v1/:lang/forms/editable-table        views/forms/editable_table/page_content.dart
/v1/[lang]/forms/elements                    /v1/:lang/forms/elements              views/forms/elements/page_content.dart
/v1/[lang]/forms/error-lab                   /v1/:lang/forms/error-lab             views/forms/error_lab/page_content.dart
/v1/[lang]/forms/field-states                /v1/:lang/forms/field-states          views/forms/field_states/page_content.dart
/v1/[lang]/forms/filters                     /v1/:lang/forms/filters               views/forms/filters/page_content.dart
/v1/[lang]/forms/form-builder                /v1/:lang/forms/form-builder          views/forms/form_builder/page_content.dart
/v1/[lang]/forms/layouts                     /v1/:lang/forms/layouts               views/forms/layouts/page_content.dart
/v1/[lang]/forms/profile                     /v1/:lang/forms/profile               views/forms/profile/page_content.dart
/v1/[lang]/forms/team-invite                 /v1/:lang/forms/team-invite            views/forms/team_invite/page_content.dart
/v1/[lang]/forms/uploads                     /v1/:lang/forms/uploads               views/forms/uploads/page_content.dart
/v1/[lang]/ui                                /v1/:lang/ui                          views/ui/page_content.dart
/v1/[lang]/ui/accordion                      /v1/:lang/ui/accordion                views/ui/accordion/page_content.dart
/v1/[lang]/ui/alert                          /v1/:lang/ui/alert                    views/ui/alert/page_content.dart
... (50+ UI demo routes)                     /v1/:lang/ui/<component>              views/ui/<component>/page_content.dart
/dashboard                                   /dashboard                            views/dashboard/dashboard_shell.dart
/gallery                                     /gallery                              views/gallery/gallery_page.dart
/gallery/[id]                                /gallery/:id                          views/gallery/photo_detail.dart
/routing/...                                 /routing/...                          views/routing/...
/security/csp                                /security/csp                         views/security/csp/nonce_panel.dart
/demos                                       /demos                                views/demos/page_content.dart
/(demos)/caching                             /demos/caching                        views/demos/caching.dart
/(demos)/form                                /demos/form                           views/demos/form.dart
... (20+ demo routes)                        /demos/<name>                         views/demos/<name>.dart
```

**Total: ~180 routes mapped 1:1 from Next.js to Flutter GoRouter.**

---

*End of conversion plan. This document serves as the blueprint for building `flutter-boilerplate/` as a 1:1 mobile clone of `next-js-boilerplate/`, preserving the same architecture, component hierarchy, data flow, tier system, and feature set.*
