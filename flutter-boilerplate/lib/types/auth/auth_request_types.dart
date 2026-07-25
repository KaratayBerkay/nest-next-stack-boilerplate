import 'user.dart';

sealed class LoginResult {}

class LoginSuccess extends LoginResult {
  final LoginResponse response;

  LoginSuccess(this.response);
}

class LoginMfaRequired extends LoginResult {
  final String mfaToken;
  final AuthenticatedUser user;

  LoginMfaRequired({required this.mfaToken, required this.user});
}

class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

class LoginResponse {
  final String accessToken;
  final String? refreshToken;
  final String rbacToken;
  final String deviceToken;
  final String userToken;
  final AuthenticatedUser user;

  const LoginResponse({
    required this.accessToken,
    this.refreshToken,
    required this.rbacToken,
    required this.deviceToken,
    required this.userToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String?,
      rbacToken: json['rbacToken'] as String,
      deviceToken: json['deviceToken'] as String,
      userToken: json['userToken'] as String,
      user: AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class RegisterRequest {
  final String email;
  final String password;
  final String name;

  const RegisterRequest({
    required this.email,
    required this.password,
    required this.name,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
        'name': name,
      };
}

class RegisterResponse {
  final String accessToken;
  final String? refreshToken;
  final String rbacToken;
  final String deviceToken;
  final String userToken;
  final AuthenticatedUser user;

  const RegisterResponse({
    required this.accessToken,
    this.refreshToken,
    required this.rbacToken,
    required this.deviceToken,
    required this.userToken,
    required this.user,
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String?,
      rbacToken: json['rbacToken'] as String,
      deviceToken: json['deviceToken'] as String,
      userToken: json['userToken'] as String,
      user: AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
