import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/messages/conversation_messages.dart';
import '../../server/messages/conversations.dart';
import '../../server/messages/dm_unread_count.dart';

final conversationsProvider = FutureProvider((ref) async {
  final server = ref.read(conversationsServerProvider);
  return server.call();
});

final conversationMessagesProvider = FutureProvider.family((ref, String conversationId) async {
  final server = ref.read(conversationMessagesServerProvider);
  return server.call(conversationId);
});

final dmUnreadCountProvider = FutureProvider((ref) async {
  final server = ref.read(dmUnreadCountServerProvider);
  return server.call();
});
