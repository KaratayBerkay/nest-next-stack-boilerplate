class ChatConstants {
  ChatConstants._();

  static const int maxMessageLength = 5000;
  static const int maxAttachmentSize = 10 * 1024 * 1024; // 10MB
  static const int pageSize = 50;
  static const Duration typingTimeout = Duration(seconds: 3);
}
