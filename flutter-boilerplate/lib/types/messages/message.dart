class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final DateTime createdAt;
  final bool isRead;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    required this.createdAt,
    this.isRead = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['conversationId'] as String,
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      senderAvatarUrl: json['senderAvatarUrl'] as String?,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );
  }
}
