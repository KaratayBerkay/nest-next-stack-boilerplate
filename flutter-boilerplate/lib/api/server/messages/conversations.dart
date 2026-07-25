import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/conversation.dart';

final conversationsServerProvider =
    Provider((ref) => ConversationsServer(ref.read(dioProvider)));

const _query = '''
  query Conversations {
    conversations {
      user { id name avatarUrl }
      lastMessage
      lastTime
      unread
    }
  }
''';

class ConversationsServer {
  final Dio _dio;

  ConversationsServer(this._dio);

  Future<List<Conversation>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch conversations',
      );
    }
    final list =
        (body['data'] as Map<String, dynamic>)['conversations'] as List;
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
    );
  }
}
