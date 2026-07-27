class NotificationItem {
  final String id;
  final String type;
  final String title;
  final String body;
  final String? imageUrl;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? payload;
  final String? actorName;
  final String? actorAvatarUrl;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.imageUrl,
    this.isRead = false,
    required this.createdAt,
    this.payload,
    this.actorName,
    this.actorAvatarUrl,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    final actor = json['actor'] as Map<String, dynamic>?;
    return NotificationItem(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      imageUrl: json['imageUrl'] as String? ?? actor?['avatarUrl'] as String?,
      isRead: json['readAt'] != null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      payload: json['payload'] as Map<String, dynamic>?,
      actorName: actor?['name'] as String?,
      actorAvatarUrl: actor?['avatarUrl'] as String?,
    );
  }
}
