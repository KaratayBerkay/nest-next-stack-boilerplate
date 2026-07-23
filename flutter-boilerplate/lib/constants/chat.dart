class ChatConstants {
  ChatConstants._();

  static const int maxMessageLength = 5000;
  static const int maxAttachmentSize = 10 * 1024 * 1024; // 10MB
  static const int pageSize = 50;
  static const Duration typingTimeout = Duration(seconds: 3);

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
