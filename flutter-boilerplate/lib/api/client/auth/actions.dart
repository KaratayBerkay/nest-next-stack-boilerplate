import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/auth_request_types.dart';
import '../../../types/auth/mfa_types.dart';
import '../../server/auth/login.dart';
import '../../server/auth/logout.dart';
import '../../server/auth/mfa.dart';
import '../../server/auth/register.dart';
import '../../server/auth/request_password_reset.dart';
import '../../server/auth/reset_password.dart';
import '../../server/auth/verify_email.dart';

final loginActionsProvider = Provider((ref) => LoginActions(ref));

class LoginActions {
  final Ref _ref;

  LoginActions(this._ref);

  Future<LoginResult> login(LoginRequest request) async {
    final server = _ref.read(loginServerProvider);
    return server.call(request);
  }

  Future<Map<String, dynamic>> verifyLoginMfa(
    String mfaToken,
    String code,
  ) async {
    final server = _ref.read(mfaServerProvider);
    return server.verifyLoginMfa(mfaToken, code);
  }

  Future<RegisterResponse> register(RegisterRequest request) async {
    final server = _ref.read(registerServerProvider);
    return server.call(request);
  }

  Future<void> logout() async {
    final server = _ref.read(logoutServerProvider);
    await server.call();
  }

  Future<void> requestPasswordReset(String email) async {
    final server = _ref.read(requestPasswordResetServerProvider);
    await server.call(email);
  }

  Future<void> resetPassword(String token, String password) async {
    final server = _ref.read(resetPasswordServerProvider);
    await server.call(token, password);
  }

  Future<void> verifyEmail(String token) async {
    final server = _ref.read(verifyEmailServerProvider);
    await server.call(token);
  }

  Future<void> verifyEmailCode(String userId, String code) async {
    final server = _ref.read(verifyEmailServerProvider);
    await server.verifyCode(userId, code);
  }

  Future<bool> resendEmailCode(String userId, String email) async {
    final server = _ref.read(verifyEmailServerProvider);
    return server.resendCode(userId, email);
  }

  Future<EnrollMfaResponse> enrollMfa() async {
    final server = _ref.read(mfaServerProvider);
    return server.enrollMfa();
  }

  Future<VerifyMfaResponse> verifyMfa(String code) async {
    final server = _ref.read(mfaServerProvider);
    return server.verifyMfa(code);
  }

  Future<bool> disableMfa(String code) async {
    final server = _ref.read(mfaServerProvider);
    return server.disableMfa(code);
  }

  Future<String> resendLoginCode(String mfaToken) async {
    final server = _ref.read(mfaServerProvider);
    return server.resendLoginCode(mfaToken);
  }
}
