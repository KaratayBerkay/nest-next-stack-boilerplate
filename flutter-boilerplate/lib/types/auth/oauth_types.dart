import 'user.dart';

class OAuthLoginResponse {
  final String accessToken;
  final String? refreshToken;
  final String rbacToken;
  final String deviceToken;
  final String userToken;
  final AuthenticatedUser user;

  const OAuthLoginResponse({
    required this.accessToken,
    this.refreshToken,
    required this.rbacToken,
    required this.deviceToken,
    required this.userToken,
    required this.user,
  });

  factory OAuthLoginResponse.fromJson(Map<String, dynamic> json) {
    final userData = json['user'] as Map<String, dynamic>;
    final mappedUser = <String, dynamic>{
      'id': userData['id'],
      'email': userData['email'],
      'name': userData['name'],
      'tier': userData['tier'] ?? 'free',
      'role': userData['role'],
      'avatarUrl': userData['avatarUrl'],
      'language': userData['locale'],
    };
    return OAuthLoginResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String?,
      rbacToken: json['rbacToken'] as String,
      deviceToken: json['deviceToken'] as String,
      userToken: json['userToken'] as String,
      user: AuthenticatedUser.fromJson(mappedUser),
    );
  }
}
