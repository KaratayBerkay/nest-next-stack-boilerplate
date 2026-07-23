class UserProfile {
  final String id;
  final String name;
  final String? bio;
  final String? avatarUrl;
  final String? coverUrl;
  final String? location;
  final String? website;
  final int followerCount;
  final int followingCount;
  final int postCount;
  final DateTime createdAt;

  const UserProfile({
    required this.id,
    required this.name,
    this.bio,
    this.avatarUrl,
    this.coverUrl,
    this.location,
    this.website,
    this.followerCount = 0,
    this.followingCount = 0,
    this.postCount = 0,
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      location: json['location'] as String?,
      website: json['website'] as String?,
      followerCount: json['followerCount'] as int? ?? 0,
      followingCount: json['followingCount'] as int? ?? 0,
      postCount: json['postCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'bio': bio,
        'avatarUrl': avatarUrl,
        'coverUrl': coverUrl,
        'location': location,
        'website': website,
        'followerCount': followerCount,
        'followingCount': followingCount,
        'postCount': postCount,
        'createdAt': createdAt.toIso8601String(),
      };
}
