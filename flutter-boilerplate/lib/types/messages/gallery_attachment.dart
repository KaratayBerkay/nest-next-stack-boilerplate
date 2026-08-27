/// A single item in the attachment-gallery ("all uploads") sheet — mirrors
/// web's `ConversationAttachment`/`RoomAttachment` (both share this same
/// shape). Distinct from `MessageAttachment`: this carries `id`/`createdAt`,
/// needed for day-grouping and list keys, which the inline chat-bubble
/// attachment type doesn't need.
class GalleryAttachment {
  final String id;
  final String url;
  final String? thumbnailUrl;
  final String type;
  final String name;
  final int size;
  final DateTime createdAt;

  const GalleryAttachment({
    required this.id,
    required this.url,
    this.thumbnailUrl,
    required this.type,
    required this.name,
    required this.size,
    required this.createdAt,
  });

  factory GalleryAttachment.fromJson(Map<String, dynamic> json) {
    return GalleryAttachment(
      id: json['id'] as String,
      url: json['url'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      type: json['type'] as String,
      name: json['name'] as String,
      size: json['size'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class GalleryAttachmentsPage {
  final List<GalleryAttachment> attachments;
  final bool hasMore;

  const GalleryAttachmentsPage({
    required this.attachments,
    required this.hasMore,
  });

  factory GalleryAttachmentsPage.fromJson(Map<String, dynamic> json) {
    return GalleryAttachmentsPage(
      attachments: (json['attachments'] as List<dynamic>)
          .map((a) => GalleryAttachment.fromJson(a as Map<String, dynamic>))
          .toList(),
      hasMore: json['hasMore'] as bool? ?? false,
    );
  }
}
