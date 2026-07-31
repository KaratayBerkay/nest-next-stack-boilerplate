class ChatRoomMessage {
  final String id;
  final String roomId;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final String? attachmentUrl;
  final String? attachmentType;
  final String? attachmentName;
  final DateTime createdAt;
  final bool isRead;

  const ChatRoomMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    this.attachmentUrl,
    this.attachmentType,
    this.attachmentName,
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
      attachmentUrl: json['attachmentUrl'] as String?,
      attachmentType: json['attachmentType'] as String?,
      attachmentName: json['attachmentName'] as String?,
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
        'attachmentUrl': attachmentUrl,
        'attachmentType': attachmentType,
        'attachmentName': attachmentName,
        'createdAt': createdAt.toIso8601String(),
        'isRead': isRead,
      };
}
