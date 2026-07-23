class ChatRoom {
  final String id;
  final String name;
  final String? avatarUrl;
  final List<String> participantIds;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final bool isGroup;

  const ChatRoom({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.participantIds = const [],
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    this.isGroup = false,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    return ChatRoom(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      participantIds: (json['participantIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      lastMessage: json['lastMessage'] as String?,
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.parse(json['lastMessageAt'] as String)
          : null,
      unreadCount: json['unreadCount'] as int? ?? 0,
      isGroup: json['isGroup'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatarUrl': avatarUrl,
        'participantIds': participantIds,
        'lastMessage': lastMessage,
        'lastMessageAt': lastMessageAt?.toIso8601String(),
        'unreadCount': unreadCount,
        'isGroup': isGroup,
      };
}
