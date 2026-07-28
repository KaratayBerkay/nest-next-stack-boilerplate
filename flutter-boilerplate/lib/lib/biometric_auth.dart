import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

const _biometricEnabledKey = 'biometric_enabled';

abstract class BiometricAuthInterface {
  Future<bool> isAvailable();
  Future<bool> isEnabled();
  Future<void> setEnabled(bool enabled);
  Future<bool> authenticate({
    String reason = 'Authenticate to access the app',
    bool stickyAuth = true,
  });
  Future<List<BiometricType>> getAvailableBiometrics();
}

final biometricProvider =
    Provider<BiometricAuthInterface>((ref) => BiometricAuth());

class BiometricAuth implements BiometricAuthInterface {
  final LocalAuthentication _auth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  Future<bool> isAvailable() async {
    try {
      return await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> isEnabled() async {
    try {
      final val = await _storage.read(key: _biometricEnabledKey);
      return val == 'true';
    } catch (_) {
      return false;
    }
  }

  @override
  Future<void> setEnabled(bool enabled) async {
    if (enabled) {
      await _storage.write(key: _biometricEnabledKey, value: 'true');
    } else {
      await _storage.delete(key: _biometricEnabledKey);
    }
  }

  @override
  Future<bool> authenticate({
    String reason = 'Authenticate to access the app',
    bool stickyAuth = true,
  }) async {
    try {
      final available = await isAvailable();
      if (!available) return false;
      return await _auth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (_) {
      return [];
    }
  }
}

class FakeBiometricAuth implements BiometricAuthInterface {
  bool _available = true;
  bool _enabled = false;

  void setAvailable(bool v) => _available = v;

  @override
  Future<bool> isAvailable() async => _available;

  @override
  Future<bool> isEnabled() async => _enabled;

  @override
  Future<void> setEnabled(bool enabled) async {
    _enabled = enabled;
  }

  @override
  Future<bool> authenticate({
    String reason = 'Authenticate to access the app',
    bool stickyAuth = true,
  }) async {
    return _available && _enabled;
  }

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async {
    return _available ? [BiometricType.fingerprint] : [];
  }
}
