---
name: flutter-ui-widgets
description: Conventions for building design-system widgets in flutter-boilerplate/lib/components/ui — the Flutter twin of the web ui-components library. Use whenever creating, editing, restyling, or reviewing ANY widget under flutter-boilerplate — buttons, cards, inputs, dialogs, sheets, badges, panels — even if the user doesn't say "component" (e.g. "add a rating widget to the flutter app", "make this screen match the web version", "style this form on mobile"). Covers folder anatomy, enum variant maps, AppColors semantic tokens, UIConstants sizing, the cn()/merge utilities, VariantResolver, demo pages, route registration, and widget tests.
---

# Building UI widgets (flutter-boilerplate)

~65 widgets in `flutter-boilerplate/lib/components/ui/` mirror the web library in
`next-js-boilerplate/src/components/ui/` one-to-one (`alert-dialog/` →
`alert_dialog/`). A new widget must match the house anatomy exactly — same reasons as
the web side: uniformity is what keeps 65 widgets maintainable, and the two libraries
must stay recognizably the same system. When porting, open the web component first and
carry over its props, variants, and states under Flutter names.

All paths below are relative to `flutter-boilerplate/`.

## Read the exemplars first

- `lib/components/ui/button/button.dart` — enum variants + sizes, `loading`/`disabled`
  /`fullWidth`/`icon` props, per-variant Material button selection
- `lib/components/ui/pagination/` + `test/components/ui/pagination_test.dart` — widget
  + test pairing
- `lib/components/ui/utils/variant.dart` — `VariantResolver` for string-keyed variants
- `lib/lib/cn.dart` — `cn()` / `mergeShadows()` / `mergePadding()` utilities

## Anatomy — where files go

For a new widget `foo_bar` (web name `foo-bar`):

```
lib/components/ui/foo_bar/
  foo_bar.dart                    # implementation: class FooBar / FooBarWidget
  foo_bar_part.dart               # split subparts into sibling files (dialog does)
lib/components/ui/index.dart      # add the export to the central barrel
lib/views/ui/foo_bar/page_content.dart   # demo page — every ui widget has one
lib/app/router.dart               # register the demo route (see below)
test/components/ui/foo_bar_test.dart     # widget tests
```

Name collisions with Flutter SDK widgets get a `Widget` suffix (`PaginationWidget`,
`SwitchWidget` style); otherwise use the plain name.

## The variant pattern

Variants and sizes are **enums** (the Dart twin of the web's `as const` maps), resolved
in a `switch` that returns a Material style:

```dart
enum ButtonVariant { primary, secondary, ghost, danger, outline }
enum ButtonSize { sm, md, lg }

class Button extends StatelessWidget {
  final ButtonVariant variant;   // default ButtonVariant.primary
  final ButtonSize size;         // default ButtonSize.md
  final bool loading;
  final bool disabled;
  ...
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isDisabled = disabled || loading;   // loading always disables
    // switch (variant) → ElevatedButton / TextButton / OutlinedButton with
    // ElevatedButton.styleFrom(backgroundColor: colors.brand, ...)
  }
}
```

Conventions the exemplars enforce:

- `loading` renders a 16×16 `CircularProgressIndicator(strokeWidth: 2)` in place of the
  child and disables the handler.
- Disabled = `onPressed: null` plus explicit
  `disabledBackgroundColor: colors.x.withValues(alpha: 0.4)` — the visual twin of the
  web's `disabled:opacity-50`.
- For components whose variant arrives as a string (dynamic/demo contexts), use
  `VariantResolver<T>` from `lib/components/ui/utils/variant.dart` instead of ad-hoc
  `if` chains.

## Styling rules

**1. Semantic tokens only.** All colors come from `AppColors.of(context)`: `brand`,
`brandHover`, `surface`, `surfaceAlt`, `surfaceHover`, `fg`, `fgMuted`, `border`,
`danger`, `success`, `warning`, `info`. Never `Colors.red`, `Color(0xFF…)`, or
`Theme.of(context).colorScheme.*` in component files — widgets must survive theme
changes exactly like the web components survive `.theme-*` swaps. Full token
vocabulary and how to extend it: **flutter-theming** skill.

**2. Sizing/radius from `UIConstants`** (`lib/constants/ui.dart`): buttons/inputs
radius 6, cards radius 8, `animationDuration` 200ms, `toastDuration` 3s, header/nav
heights. Hardcode nothing that UIConstants already names.

**3. The merge utilities don't cascade.** `cn(a, b)` concatenates strings;
`mergeShadows`/`mergePadding` are additive. Like the web's non-merging `cn()`, a caller
can't "override" your styles — so expose knobs as constructor props (`variant`, `size`,
`fullWidth`) rather than accepting arbitrary style objects.

**4. Touch targets ≥ 36px** (the V0 control heights sm 32 / md 36 / lg 40 map to
mobile paddings) and every interactive widget needs a disabled treatment.

## Demo page + route

Every widget ships a demo page like the web's `/v1/[lang]/ui/*` gallery:

1. `lib/views/ui/foo_bar/page_content.dart` — sections showing each variant/size/state.
2. In `lib/app/router.dart`, inside the v1 `ShellRoute`, add:
   ```dart
   GoRoute(path: '/v1/:lang/ui/foo-bar', name: 'uiFooBar',
     builder: (_, state) => FooBarDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
   ```
   (kebab-case path — it must match the web route for parity.)

## Tests

Widget tests live at `test/components/ui/<name>_test.dart` and use the shared helper:

```dart
import '../../test_helpers.dart';

testWidgets('renders variants', (tester) async {
  await pumpTestApp(tester, const Button(child: Text('Save')));
  expect(find.text('Save'), findsOneWidget);
});
```

`pumpTestApp` wraps the widget in `ProviderScope` + themed `MaterialApp` + `Scaffold` —
never hand-roll that wrapper. Cover: renders, variant/size switches, disabled blocks
taps, loading state. More in **flutter-testing**.

## New-widget checklist

1. Read the web component + closest Flutter exemplar.
2. Implementation in `lib/components/ui/foo_bar/foo_bar.dart` — enum variants,
   AppColors tokens, UIConstants sizing, loading/disabled handled.
3. Export from `lib/components/ui/index.dart`.
4. Demo page + `GoRoute` under `/v1/:lang/ui/foo-bar`.
5. `test/components/ui/foo_bar_test.dart` with `pumpTestApp`.
6. `flutter analyze` and `dart format lib/ test/` clean.
