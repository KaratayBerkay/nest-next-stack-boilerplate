class ChatRoomMessage {
  final String id;
  final String roomId;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final DateTime createdAt;
  final bool isRead;

  const ChatRoomMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    required this.createdAt,
    this.isRead = false,
  });

  factory ChatRoomMessage.fromJson(Map<String, dynamic> json) {
    return ChatRoomMessage(
      id: json['id'] as String,
      roomId: json['roomId'] as String,
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      senderAvatarUrl: json['senderAvatarUrl'] as String?,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'roomId': roomId,
        'senderId': senderId,
        'senderName': senderName,
        'senderAvatarUrl': senderAvatarUrl,
        'content': content,
        'createdAt': createdAt.toIso8601String(),
        'isRead': isRead,
      };
}
