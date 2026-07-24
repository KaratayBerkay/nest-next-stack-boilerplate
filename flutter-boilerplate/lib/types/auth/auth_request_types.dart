import 'user.dart';

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
  final AuthenticatedUser user;

  const LoginResponse({required this.accessToken, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String,
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

  const RegisterResponse({required this.accessToken});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      accessToken: json['accessToken'] as String,
    );
  }
}
