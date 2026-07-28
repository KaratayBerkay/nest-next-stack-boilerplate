import 'package:flutter_boilerplate/lib/biometric_auth.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

final biometricAvailableProvider = FutureProvider<bool>((ref) async {
  final auth = ref.read(biometricProvider);
  return auth.isAvailable();
});

final biometricEnabledProvider = FutureProvider<bool>((ref) async {
  final auth = ref.read(biometricProvider);
  return auth.isEnabled();
});
