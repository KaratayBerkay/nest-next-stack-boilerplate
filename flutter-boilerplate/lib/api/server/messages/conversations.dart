import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/conversation.dart';

final conversationsServerProvider =
    Provider((ref) => ConversationsServer(ref.read(dioProvider)));

class ConversationsServer {
  final Dio _dio;

  ConversationsServer(this._dio);

  // Backend-native REST (`@Controller('api')` + `@Get('conversations')` on
  // messaging.controller.ts, i.e. `/api/conversations` — NOT the unused,
  // wrongly-pathed `ApiUrls.conversations` constant), not the GraphQL
  // `conversations` query — the GraphQL `Conversation` ObjectType never
  // declares a `favorite` field, only the REST response actually carries it.
  Future<List<Conversation>> call() async {
    final response = await _dio.get<dynamic>('/api/conversations');
    final list = response.data as List;
    return list
        .map((e) => _mapConversation(e as Map<String, dynamic>))
        .toList();
  }

  Conversation _mapConversation(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>;
    return Conversation(
      id: user['id'] as String,
      userId: user['id'] as String,
      userName: user['name'] as String,
      userAvatarUrl: user['avatarUrl'] as String?,
      lastMessage: json['lastMessage'] as String?,
      lastMessageAt: json['lastTime'] != null
          ? DateTime.tryParse(json['lastTime'] as String)
          : null,
      unreadCount: (json['unread'] as num?)?.toInt() ?? 0,
      isFavorite: json['favorite'] as bool? ?? false,
    );
  }
}
