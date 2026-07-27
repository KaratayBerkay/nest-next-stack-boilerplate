class AuthenticatedUser {
  final String id;
  final String email;
  final String name;
  final String tier;
  final String role;
  final String? avatarUrl;
  final String? language;
  final String? sessionId;

  const AuthenticatedUser({
    required this.id,
    required this.email,
    required this.name,
    required this.tier,
    this.role = 'USER',
    this.avatarUrl,
    this.language,
    this.sessionId,
  });

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) {
    return AuthenticatedUser(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      tier: ((json['tier'] as String?) ??
              (json['subscriptionTier'] as String?) ??
              'free')
          .toLowerCase(),
      role: (json['role'] as String?) ?? 'USER',
      avatarUrl: json['avatarUrl'] as String?,
      language: (json['language'] as String?) ?? (json['locale'] as String?),
      sessionId: json['sessionId'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'tier': tier,
        'role': role,
        'avatarUrl': avatarUrl,
        'language': language,
        'sessionId': sessionId,
      };
}
