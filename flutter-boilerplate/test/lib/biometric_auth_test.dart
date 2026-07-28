import 'package:flutter_boilerplate/lib/biometric_auth.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FakeBiometricAuth', () {
    test('starts disabled and unavailable', () async {
      final auth = FakeBiometricAuth();
      expect(await auth.isAvailable(), isTrue);
      expect(await auth.isEnabled(), isFalse);
    });

    test('setEnabled works', () async {
      final auth = FakeBiometricAuth();
      await auth.setEnabled(true);
      expect(await auth.isEnabled(), isTrue);
      await auth.setEnabled(false);
      expect(await auth.isEnabled(), isFalse);
    });

    test('authenticate returns true only when available and enabled', () async {
      final auth = FakeBiometricAuth();

      expect(await auth.authenticate(), isFalse);

      await auth.setEnabled(true);
      expect(await auth.authenticate(), isTrue);

      auth.setAvailable(false);
      expect(await auth.authenticate(), isFalse);
    });

    test('setAvailable controls availability', () async {
      final auth = FakeBiometricAuth();
      auth.setAvailable(false);
      expect(await auth.isAvailable(), isFalse);
      expect(await auth.getAvailableBiometrics(), isEmpty);
    });
  });
}
