import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

// `flutter test` runs with the package root as the working directory, so
// the platform config is reachable relatively — these guard the release
// manifest against the two regressions found in the 2026-09-02 security
// audit (MOB-042).
void main() {
  final release =
      File('android/app/src/main/AndroidManifest.xml').readAsStringSync();
  final debug =
      File('android/app/src/debug/AndroidManifest.xml').readAsStringSync();

  group('release AndroidManifest (MOB-042)', () {
    test('does not permit cleartext (http/ws) traffic', () {
      expect(release, isNot(contains('usesCleartextTraffic="true"')));
    });

    test('opts out of Auto Backup', () {
      expect(release, contains('android:allowBackup="false"'));
    });

    test(
        'keeps the launcher activity non-hijackable (singleTop, no task affinity)',
        () {
      expect(release, contains('android:launchMode="singleTop"'));
      expect(release, contains('android:taskAffinity=""'));
    });
  });

  group('debug AndroidManifest overlay', () {
    test('still permits cleartext so local http://10.0.2.2 backends work', () {
      expect(debug, contains('usesCleartextTraffic="true"'));
    });
  });
}
