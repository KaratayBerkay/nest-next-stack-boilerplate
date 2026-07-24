---
name: flutter-testing
description: Testing and quality gates for flutter-boilerplate — widget/unit tests, flutter analyze, dart format, the flutter-ci.yml workflow, and this repo's Flutter-specific traps. Use whenever running, writing, or fixing tests for the Flutter app, before committing ANY flutter-boilerplate change, when "flutter test fails", "CI is red", "tests pass but the app doesn't build", or coverage questions come up. Covers the .env asset-bundle trap (test exits 0 while running zero tests), pumpTestApp, test layout, ProviderScope overrides, integration_test device requirements, and keeping the CI Flutter version in sync with pubspec.lock.
---

# Testing & gates (flutter-boilerplate)

All commands run from `flutter-boilerplate/`. The husky pre-commit/pre-push hooks only
gate next-js-boilerplate — **nothing stops a broken Dart commit except you running the
gates yourself**:

```bash
cp -n .env.example .env        # once per fresh checkout — see trap below
flutter analyze                # must be 0 errors 0 warnings
dart format --set-exit-if-changed lib/ test/
flutter test                   # ~300 unit+widget tests
```

## Trap 1 — .env asset failure with exit code 0

`pubspec.yaml` bundles `.env` (gitignored). Without it, `flutter test` prints
`No file or variants found for asset: .env … Failed to build asset bundle` and runs
**zero tests — yet can still exit 0**. Never report the suite green from the exit code
alone; require the `+NNN: All tests passed!` line. `flutter run`/`build` fail on the
same missing file. Fix: `cp -n .env.example .env` (tests don't read real values).

## Trap 2 — CI Flutter version vs pubspec.lock

`.github/workflows/flutter-ci.yml` pins a Flutter version; `pubspec.lock` was resolved
by the locally installed Flutter (3.44.x, Dart 3.12). If the CI pin is older (e.g.
3.27.x), `flutter pub get` fails in CI before analyze even runs — Flutter pins its own
`intl`/SDK constraints per release. When bumping the local Flutter or regenerating the
lockfile, update the workflow's `flutter-version` to the same minor in the same commit.

## Layout — test/ mirrors lib/

```
test/
  test_helpers.dart          # createTestApp / pumpTestApp — always use these
  components/ui/<name>_test.dart
  validators/<feature>_test.dart
  lib/<util>_test.dart       # cn, tier, date_time, initials, …
  hooks/ views/ …            # same mirror rule
integration_test/            # app_test, auth_flow, feed, ui_demo — DEVICE ONLY
```

`flutter test` does not run `integration_test/`; those need a device/emulator
(`flutter test integration_test/`) and there is no AVD on this server — treat them as
phone-in-hand suites, don't chase them locally.

## Widget test pattern

```dart
import '../../test_helpers.dart';

void main() {
  testWidgets('disabled button blocks taps', (tester) async {
    var tapped = false;
    await pumpTestApp(tester, Button(
      disabled: true,
      onPressed: () => tapped = true,
      child: const Text('Save'),
    ));
    await tester.tap(find.text('Save'), warnIfMissed: false);
    expect(tapped, isFalse);
  });
}
```

`pumpTestApp` = `ProviderScope` + `MaterialApp(theme: buildThemeData(light))` +
`Scaffold`. Hand-rolled wrappers drift from the app's real theme/provider setup — don't.

To fake providers (auth state, API layers), pass overrides through a custom
`ProviderScope(overrides: [authProvider.overrideWith(...)], child: …)` around the
widget — override the **client-layer** provider (`loginActionsProvider` etc.), never
mock Dio itself; that keeps tests aligned with the two-layer API boundary. `mocktail`
is available for class mocks.

## What to cover (house norms)

- Every `components/ui/` widget: renders, each variant/size, disabled/loading behavior.
- Every validator: valid input, each failure branch (they're pure functions — cheap).
- `lib/lib/` utilities: direct unit tests (`tier_test.dart`, `date_time_test.dart` are
  the exemplars).
- Views with providers: one smoke test that the page builds under fake auth.

## CI (`flutter-ci.yml`)

Steps on any `flutter-boilerplate/**` change: pub get → analyze → format check →
`flutter test --no-pub --coverage` → Codecov upload. Anything you'd push must pass the
same four locally first — CI has no `.env` step unless the workflow creates one
(`cp .env.example .env`), so keep that step present in the workflow when touching it.
