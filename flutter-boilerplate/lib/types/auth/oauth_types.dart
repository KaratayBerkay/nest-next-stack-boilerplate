import 'user.dart';

class OAuthProfile {
  final String type;
  final String provider;
  final String providerAccountId;
  final String email;
  final String? name;

  const OAuthProfile({
    required this.type,
    required this.provider,
    required this.providerAccountId,
    required this.email,
    this.name,
  });

  factory OAuthProfile.fromJson(Map<String, dynamic> json) {
    return OAuthProfile(
      type: json['type'] as String,
      provider: json['provider'] as String,
      providerAccountId: json['providerAccountId'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'provider': provider,
        'providerAccountId': providerAccountId,
        'email': email,
        'name': name,
      };
}

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
