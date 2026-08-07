import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/app_config.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../api/server/auth/refresh_token.dart';
import '../types/auth/user.dart';

const _accessTokenKey = 'access_token';
const _refreshTokenKey = 'refresh_token';
const _rbacTokenKey = 'rbac_token';
const _deviceTokenKey = 'device_token';
const _userTokenKey = 'user_token';
const _userKey = 'session_user';

const _storage = FlutterSecureStorage();

final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>((ref) {
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

  Future<void> setSession(
    String token,
    AuthenticatedUser user, {
    required String rbacToken,
    required String deviceToken,
    required String userToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: token);
    await _storage.write(key: _rbacTokenKey, value: rbacToken);
    await _storage.write(key: _deviceTokenKey, value: deviceToken);
    await _storage.write(key: _userTokenKey, value: userToken);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    state = AsyncData(user);
  }

  Future<void> updateUser(AuthenticatedUser user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    state = AsyncData(user);
  }

  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _rbacTokenKey);
    await _storage.delete(key: _deviceTokenKey);
    await _storage.delete(key: _userTokenKey);
    await _storage.delete(key: _userKey);
    await _storage.delete(key: _refreshTokenKey);
    state = const AsyncData(null);
  }

  /// The full auth-frame token bundle the backend requires on every
  /// authenticated request (REST/GraphQL headers and the WS auth frame) —
  /// `accessToken` alone is rejected with "Missing RBAC token".
  Future<Map<String, String>?> getAuthTokens() async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    final rbacToken = await _storage.read(key: _rbacTokenKey);
    final deviceToken = await _storage.read(key: _deviceTokenKey);
    final userToken = await _storage.read(key: _userTokenKey);
    if (accessToken == null ||
        rbacToken == null ||
        deviceToken == null ||
        userToken == null) {
      return null;
    }
    return {
      'accessToken': accessToken,
      'rbacToken': rbacToken,
      'deviceToken': deviceToken,
      'userToken': userToken,
    };
  }

  Future<void> setRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  Future<void> updateAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  Future<bool> refreshAccessToken() async {
    final refreshToken = await getRefreshToken();
    if (refreshToken == null) return false;
    final tokens = await getAuthTokens();
    if (tokens == null) return false;
    try {
      final server = RefreshTokenServer(
        Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl)),
      );
      final result = await server.call(
        refreshToken,
        rbacToken: tokens['rbacToken']!,
        deviceToken: tokens['deviceToken']!,
        userToken: tokens['userToken']!,
      );
      await updateAccessToken(result.accessToken);
      // The backend rotates the refresh token on every use — must persist
      // the new one or the session hard-expires on a fixed clock from
      // login regardless of how many refreshes succeed in between.
      await setRefreshToken(result.refreshToken);
      // The backend also rotates rbac/device/user tokens on every refresh
      // and revokes the compound Redis key they were keyed on — without
      // persisting these too, the very next authenticated request presents
      // the stale trio, misses the new compound key, and 401s again
      // (session_miss), turning a successful refresh into a silent logout.
      await _storage.write(key: _rbacTokenKey, value: result.rbacToken);
      await _storage.write(key: _deviceTokenKey, value: result.deviceToken);
      await _storage.write(key: _userTokenKey, value: result.userToken);
      return true;
    } catch (_) {
      return false;
    }
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
