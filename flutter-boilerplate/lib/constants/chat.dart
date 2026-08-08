class ChatConstants {
  ChatConstants._();

  static const int maxMessageLength = 5000;
  static const int maxAttachmentSize = 10 * 1024 * 1024; // 10MB
  static const int pageSize = 50;
  static const Duration typingTimeout = Duration(seconds: 3);
  // Mirrors the backend's DELETE_FOR_EVERYONE_WINDOW_MS
  // (nest-js-boilerplate/src/messaging/messaging.types.ts) — UI-only gate,
  // the server remains the enforcement authority.
  static const Duration deleteForEveryoneWindow = Duration(minutes: 15);

  static const List<String> chatRooms = [
    'general',
    'random',
    'tech',
    'design',
    'music',
  ];

  // VIP rooms for Medium/Premium tiers
  static const List<String> vipRooms = [
    'vip-lounge',
  ];
}
