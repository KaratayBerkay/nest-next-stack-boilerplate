class Conversation {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatarUrl;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;

  const Conversation({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatarUrl,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] as String,
      userId: json['userId'] as String,
      userName: json['userName'] as String,
      userAvatarUrl: json['userAvatarUrl'] as String?,
      lastMessage: json['lastMessage'] as String?,
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.parse(json['lastMessageAt'] as String)
          : null,
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }
}
