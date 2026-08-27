class FriendRequest {
  final String id;
  final String fromUserId;
  final String fromUserName;
  final String? fromUserAvatar;
  final String direction;
  final DateTime createdAt;

  const FriendRequest({
    required this.id,
    required this.fromUserId,
    required this.fromUserName,
    this.fromUserAvatar,
    required this.direction,
    required this.createdAt,
  });

  bool get isIncoming => direction == 'incoming';

  // Backend shape is `{id, direction, user: {id, name, email, avatar}, createdAt}`
  // — the per-user fields live under `user`, not flat on the request itself.
  factory FriendRequest.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>;
    return FriendRequest(
      id: json['id'] as String,
      fromUserId: user['id'] as String,
      fromUserName: user['name'] as String,
      fromUserAvatar: user['avatar'] as String?,
      direction: json['direction'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
