---
name: flutter-theming
description: The theme token system for flutter-boilerplate — AppColors/AppTypography ThemeExtensions mirroring the web app's Tailwind semantic tokens. Use for ANY styling, color, font, dark-mode, or theme work in the Flutter app: "change the brand color on mobile", "dark mode looks wrong in the APK", "add a new theme", "match the web palette", spacing/radius questions, or adding tokens. Covers lib/constants/theme.dart, the token↔Tailwind mapping, how to add a token or a theme, theme mode state, Geist fonts, and contrast rules.
---

# Theming (flutter-boilerplate)

Everything lives in `flutter-boilerplate/lib/constants/theme.dart`: `AppThemeMode`,
`AppColors` + `AppTypography` (both `ThemeExtension`s), and `buildThemeData()` which
`app/app.dart` feeds to `MaterialApp.router` as `theme`/`darkTheme`. This is the Flutter
twin of the web's Tailwind v4 token system (see **tailwind-theming**) — same token
names, same semantics, so a design change lands identically on web and mobile.

## Token vocabulary — mapped to the web

Access in widgets via `AppColors.of(context)` (falls back to light):

| Flutter `AppColors` | Web Tailwind token | Use |
|---|---|---|
| `brand` / `brandHover` | `bg-brand` / hover | primary actions, focus |
| `surface` | `bg-bg` / `bg-surface` | page + card backgrounds |
| `surfaceAlt` | `bg-surface` (alt) | raised/secondary surfaces |
| `surfaceHover` | `hover:bg-surface-hover` | hover fills |
| `fg` | `text-fg` | primary text |
| `fgMuted` | `text-muted` | secondary text |
| `border` | `border-border` | hairlines, input borders |
| `danger` | `bg-error` / `text-error` | destructive — **naming drift: web says `error`, Flutter says `danger`** |
| `success` / `warning` / `info` | same-named tokens | status colors |

Rules carried over from the web system:

- **Never** hardcode `Colors.*` or `Color(0xFF…)` in components/views — tokens only,
  or the widget breaks the moment a theme changes.
- Status tinting: soft fills use the token `.withValues(alpha: 0.1)` with a
  `0.3`-alpha border — the twin of `bg-error/10 border-error/30 text-error`.
- Keep WCAG AA contrast between any `fg*` token and the surfaces it sits on, in BOTH
  light and dark presets (the web repo gates this in CI; the palettes here were derived
  from the passing web values — don't drift casually).

## Adding a token

`AppColors` is a hand-written ThemeExtension, so one new token touches **six spots** in
`theme.dart` — miss one and either the constructor breaks or theme-change animation
`lerp`s wrongly:

1. the `final Color` field, 2. the constructor, 3. the `light` preset, 4. the `dark`
preset, 5. `copyWith`, 6. `lerp`.

Then mirror the same token into the web's `globals.css` (or confirm it exists) so the
systems stay in lockstep, and update this skill's table.

## Adding a theme

The web has four themes (light, dark, ocean, violet); Flutter currently ships
**light + dark only** — a known parity gap. To add one: new `static const AppColors
<name>` preset, extend `AppThemeMode`, branch in `buildThemeData()`, and surface it in
the settings theme picker. Derive values from the web `.theme-<name>` block, never
invent a palette ad hoc.

## Theme mode state

`hooks/use_theme.dart` → `themeModeProvider` (a legacy `StateProvider<AppThemeMode>`
via `riverpod_compat`). It is **not persisted yet** (web persists + replays via
`theme-init.js`): toggling dies with the process. When adding persistence, write
through `shared_preferences`, read it before `runApp`, and keep the provider API
unchanged so callers don't churn.

## Typography & fonts

`AppTypography` (same file) defines the text ramp (`h1`…`caption`, `code`, `label`);
use it through the theme extension rather than ad-hoc `TextStyle`s. The brand font is
**Geist** — bundled at `assets/fonts/Geist-*.ttf`, weights 400/500/600/700, registered
in `pubspec.yaml`. Don't add font files without registering weights there.

## Sizing / radius / motion

Not theme tokens but the same design language, from `lib/constants/ui.dart`
(`UIConstants`): button/input radius 6, card radius 8, header/bottom-nav 56,
`animationDuration` 200ms, `toastDuration` 3s. Change them there, never inline.
