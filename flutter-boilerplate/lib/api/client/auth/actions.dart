import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/auth/login.dart';
import '../../server/auth/register.dart';
import '../../server/auth/logout.dart';

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
}
