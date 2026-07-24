import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/auth_request_types.dart';
import '../../server/auth/login.dart';
import '../../server/auth/logout.dart';
import '../../server/auth/register.dart';
import '../../server/auth/request_password_reset.dart';
import '../../server/auth/reset_password.dart';
import '../../server/auth/verify_email.dart';

final loginActionsProvider = Provider((ref) => LoginActions(ref));

class LoginActions {
  final Ref _ref;

  LoginActions(this._ref);

  Future<LoginResponse> login(LoginRequest request) async {
    final server = _ref.read(loginServerProvider);
    return server.call(request);
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
}
