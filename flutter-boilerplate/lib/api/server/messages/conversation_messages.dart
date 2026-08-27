import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message.dart';

final conversationMessagesServerProvider = Provider(
  (ref) => ConversationMessagesServer(ref.read(dioProvider)),
);

const _query = '''
  query ConversationMessages(\$userId: String!, \$before: String, \$take: Int) {
    conversationMessages(userId: \$userId, before: \$before, take: \$take) {
      messages {
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
        }
        createdAt
        readAt
        deletedAt
        replyTo {
          id
          senderId
          body
          deletedAt
          hasAttachments
        }
      }
      hasMore
    }
  }
''';

class ConversationMessagesPage {
  final List<ChatMessage> messages;
  final bool hasMore;

  const ConversationMessagesPage({
    required this.messages,
    required this.hasMore,
  });
}

class ConversationMessagesServer {
  final Dio _dio;

  ConversationMessagesServer(this._dio);

  Future<ConversationMessagesPage> call(
    String userId, {
    String? before,
    int take = 30,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {
          'userId': userId,
          if (before != null) 'before': before,
          'take': take,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch messages',
      );
    }
    final page = (body['data'] as Map<String, dynamic>)['conversationMessages']
        as Map<String, dynamic>;
    final messages = (page['messages'] as List)
        .map((e) => _mapMessage(e as Map<String, dynamic>))
        .toList();
    return ConversationMessagesPage(
      messages: messages,
      hasMore: page['hasMore'] as bool? ?? false,
    );
  }

  // A tombstoned ("deleted for everyone") message resolves `body` to null
  // server-side — ChatMessage.fromWireJson's null-coalesce on `body` is what
  // used to be an unguarded cast here, which threw the first time a deleted
  // message was fetched.
  ChatMessage _mapMessage(Map<String, dynamic> json) =>
      ChatMessage.fromWireJson(json);
}
