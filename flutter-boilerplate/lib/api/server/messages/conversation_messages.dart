import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message.dart';

final conversationMessagesServerProvider = Provider(
  (ref) => ConversationMessagesServer(ref.read(dioProvider)),
);

const _query = '''
  query ConversationMessages(\$userId: String!) {
    conversationMessages(userId: \$userId) {
      id
      body
      senderId
      recipientId
      sender { id name avatarUrl }
      recipient { id name avatarUrl }
      createdAt
      readAt
    }
  }
''';

class ConversationMessagesServer {
  final Dio _dio;

  ConversationMessagesServer(this._dio);

  Future<List<ChatMessage>> call(String userId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {'userId': userId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch messages',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['conversationMessages'] as List;
    return list
        .map((e) => _mapMessage(e as Map<String, dynamic>))
        .toList();
  }

  ChatMessage _mapMessage(Map<String, dynamic> json) {
    final sender = json['sender'] as Map<String, dynamic>?;
    final recipient = json['recipient'] as Map<String, dynamic>?;
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['recipientId'] as String,
      senderId: json['senderId'] as String,
      senderName: sender?['name'] as String? ?? '',
      senderAvatarUrl: sender?['avatarUrl'] as String?,
      content: json['body'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['readAt'] != null,
    );
  }
}
