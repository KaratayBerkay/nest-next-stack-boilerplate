import 'dart:convert';

import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../types/auth/user.dart';

const _accessTokenKey = 'access_token';
const _userKey = 'session_user';

const _storage = FlutterSecureStorage();

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AsyncValue<AuthenticatedUser?>> {
  AuthNotifier() : super(const AsyncData(null)) {
    _loadSession();
  }

  Future<void> _loadSession() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final token = await _storage.read(key: _accessTokenKey);
      if (token == null) return null;
      final userJson = await _storage.read(key: _userKey);
      if (userJson == null) return null;
      final json = jsonDecode(userJson) as Map<String, dynamic>;
      return AuthenticatedUser.fromJson(json);
    });
  }

  Future<void> setSession(String token, AuthenticatedUser user) async {
    await _storage.write(key: _accessTokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    state = AsyncData(user);
  }

  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _userKey);
    state = const AsyncData(null);
  }

  Future<String?> getToken() async {
    return _storage.read(key: _accessTokenKey);
  }
}

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).asData?.value != null;
});

final currentUserProvider = Provider<AuthenticatedUser?>((ref) {
  return ref.watch(authProvider).asData?.value;
});

final userTierProvider = Provider<String>((ref) {
  return ref.watch(authProvider).asData?.value?.tier ?? 'free';
});
