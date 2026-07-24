class FriendRequest {
  final String id;
  final String fromUserId;
  final String fromUserName;
  final String? fromUserAvatar;
  final DateTime createdAt;

  const FriendRequest({
    required this.id,
    required this.fromUserId,
    required this.fromUserName,
    this.fromUserAvatar,
    required this.createdAt,
  });

  factory FriendRequest.fromJson(Map<String, dynamic> json) {
    return FriendRequest(
      id: json['id'] as String,
      fromUserId: json['fromUserId'] as String,
      fromUserName: json['fromUserName'] as String,
      fromUserAvatar: json['fromUserAvatar'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
