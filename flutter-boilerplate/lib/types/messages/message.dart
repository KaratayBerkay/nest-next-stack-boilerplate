import 'message_attachment.dart';

class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String content;
  final List<MessageAttachment> attachments;
  final DateTime createdAt;
  final bool isRead;
  // Set once this message was "deleted for everyone" — a tombstone, not a
  // hard delete: the row still exists, content is just withheld from here
  // on. Null means not deleted. "Delete for me" never surfaces here at all
  // — the server excludes those rows from the response entirely.
  final DateTime? deletedAt;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.content,
    this.attachments = const [],
    required this.createdAt,
    this.isRead = false,
    this.deletedAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['conversationId'] as String,
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      senderAvatarUrl: json['senderAvatarUrl'] as String?,
      content: json['content'] as String,
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map((e) => MessageAttachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool? ?? false,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
    );
  }

  /// Maps the GraphQL `conversationMessages` shape (nested `sender`/`body`,
  /// `readAt` instead of `isRead`) — also shared by the live WS
  /// `direct-message` frame, whose `message` payload is a compatible subset
  /// (no `readAt`/`deletedAt`, both correctly absent on a just-arrived
  /// message anyway).
  factory ChatMessage.fromWireJson(Map<String, dynamic> json) {
    final sender = json['sender'] as Map<String, dynamic>?;
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['recipientId'] as String,
      senderId: json['senderId'] as String,
      senderName: sender?['name'] as String? ?? '',
      senderAvatarUrl: sender?['avatarUrl'] as String?,
      content: json['body'] as String? ?? '',
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map((e) => MessageAttachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['readAt'] != null,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
    );
  }
}
