class NotificationItem {
  final String id;
  final String type;
  final String title;
  final String body;
  final String? imageUrl;
  final bool isRead;
  final DateTime createdAt;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.imageUrl,
    this.isRead = false,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      imageUrl: json['imageUrl'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
