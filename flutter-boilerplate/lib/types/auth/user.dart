class AuthenticatedUser {
  final String id;
  final String email;
  final String name;
  final String tier;
  final String role;
  final String? avatarUrl;
  final String? language;
  final String? sessionId;
  final bool mfaEnabled;

  const AuthenticatedUser({
    required this.id,
    required this.email,
    required this.name,
    required this.tier,
    this.role = 'USER',
    this.avatarUrl,
    this.language,
    this.sessionId,
    this.mfaEnabled = false,
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
      mfaEnabled: json['mfaEnabled'] as bool? ?? false,
    );
  }

  AuthenticatedUser copyWith({bool? mfaEnabled}) {
    return AuthenticatedUser(
      id: id,
      email: email,
      name: name,
      tier: tier,
      role: role,
      avatarUrl: avatarUrl,
      language: language,
      sessionId: sessionId,
      mfaEnabled: mfaEnabled ?? this.mfaEnabled,
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
        'mfaEnabled': mfaEnabled,
      };
}
