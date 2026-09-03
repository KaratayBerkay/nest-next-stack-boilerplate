import 'message_attachment.dart';

/// Mirrors the backend's `ReplyPreview` GraphQL type — deliberately a small,
/// separate shape from the full `Message`, never a nested full message (the
/// server hides `Message.replyTo`'s auto-generated field specifically to
/// avoid a client pulling raw ciphertext/full sender objects into a quote).
class ReplyPreview {
  final String id;
  final String senderId;
  final String? body;
  final DateTime? deletedAt;
  final bool hasAttachments;
  // Only room previews carry this (CROSS-024): a DM quote is always "you"
  // or the peer, a room quote needs the quoted author's display name.
  final String? senderName;

  const ReplyPreview({
    required this.id,
    required this.senderId,
    this.body,
    this.deletedAt,
    required this.hasAttachments,
    this.senderName,
  });

  factory ReplyPreview.fromJson(Map<String, dynamic> json) {
    return ReplyPreview(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      body: json['body'] as String?,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
      hasAttachments: json['hasAttachments'] as bool? ?? false,
      senderName: json['senderName'] as String?,
    );
  }
}

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
  final ReplyPreview? replyTo;

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
    this.replyTo,
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
      replyTo: json['replyTo'] != null
          ? ReplyPreview.fromJson(json['replyTo'] as Map<String, dynamic>)
          : null,
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
      replyTo: json['replyTo'] != null
          ? ReplyPreview.fromJson(json['replyTo'] as Map<String, dynamic>)
          : null,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
    );
  }
}
