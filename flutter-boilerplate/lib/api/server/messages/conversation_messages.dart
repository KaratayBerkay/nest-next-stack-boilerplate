import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message.dart';
import '../../../types/messages/message_attachment.dart';

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
      attachments {
        url
        type
        name
        size
        thumbnailUrl
        storageEnvelope { v nonce }
      }
      createdAt
      readAt
      deletedAt
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
    final list =
        (body['data'] as Map<String, dynamic>)['conversationMessages'] as List;
    return list.map((e) => _mapMessage(e as Map<String, dynamic>)).toList();
  }

  ChatMessage _mapMessage(Map<String, dynamic> json) {
    final sender = json['sender'] as Map<String, dynamic>?;
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['recipientId'] as String,
      senderId: json['senderId'] as String,
      senderName: sender?['name'] as String? ?? '',
      senderAvatarUrl: sender?['avatarUrl'] as String?,
      // A tombstoned ("deleted for everyone") message resolves `body` to
      // null server-side — the unguarded cast this used to be would throw
      // the first time a deleted message was fetched.
      content: json['body'] as String? ?? '',
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map((e) => MessageAttachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['readAt'] != null,
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'] as String)
          : null,
    );
  }
}
