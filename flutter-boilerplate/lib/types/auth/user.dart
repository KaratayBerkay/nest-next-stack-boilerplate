class AuthenticatedUser {
  final String id;
  final String email;
  final String name;
  final String tier;
  final String? avatarUrl;
  final String? language;

  const AuthenticatedUser({
    required this.id,
    required this.email,
    required this.name,
    required this.tier,
    this.avatarUrl,
    this.language,
  });

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) {
    return AuthenticatedUser(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      tier: json['tier'] as String? ?? 'free',
      avatarUrl: json['avatarUrl'] as String?,
      language: json['language'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'tier': tier,
        'avatarUrl': avatarUrl,
        'language': language,
      };
}
