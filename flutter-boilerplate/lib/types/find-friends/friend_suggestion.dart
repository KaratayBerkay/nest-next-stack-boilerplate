class FriendSuggestion {
  final String id;
  final String name;
  final String? avatarUrl;
  final String? bio;
  final List<String> mutualFriendIds;
  final bool isRequested;

  const FriendSuggestion({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.bio,
    this.mutualFriendIds = const [],
    this.isRequested = false,
  });

  factory FriendSuggestion.fromJson(Map<String, dynamic> json) {
    return FriendSuggestion(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      bio: json['bio'] as String?,
      mutualFriendIds: (json['mutualFriendIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isRequested: json['isRequested'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatarUrl': avatarUrl,
        'bio': bio,
        'mutualFriendIds': mutualFriendIds,
        'isRequested': isRequested,
      };
}
