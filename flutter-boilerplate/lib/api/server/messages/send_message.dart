import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message.dart';
import '../../../types/messages/message_attachment.dart';

final sendMessageServerProvider =
    Provider((ref) => SendMessageServer(ref.read(dioProvider)));

const _mutation = '''
  mutation SendMessage(\$input: SendMessageInput!) {
    sendMessage(input: \$input) {
      id
      body
      senderId
      recipientId
      sender { id name avatarUrl }
      recipient { id name avatarUrl }
      attachmentUrl
      attachmentType
      attachmentName
      createdAt
      readAt
    }
  }
''';

class SendMessageServer {
  final Dio _dio;

  SendMessageServer(this._dio);

  Future<ChatMessage> call(
    String recipientId,
    String text,
    MessageAttachment? attachment,
  ) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'input': {
            'recipientId': recipientId,
            'text': text,
            'attachmentUrl': attachment?.url,
            'attachmentType': attachment?.type,
            'attachmentName': attachment?.name,
          },
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to send message',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['sendMessage']
        as Map<String, dynamic>;
    final sender = result['sender'] as Map<String, dynamic>?;
    return ChatMessage(
      id: result['id'] as String,
      conversationId: result['recipientId'] as String,
      senderId: result['senderId'] as String,
      senderName: sender?['name'] as String? ?? '',
      senderAvatarUrl: sender?['avatarUrl'] as String?,
      content: result['body'] as String,
      attachmentUrl: result['attachmentUrl'] as String?,
      attachmentType: result['attachmentType'] as String?,
      attachmentName: result['attachmentName'] as String?,
      createdAt: DateTime.parse(result['createdAt'] as String),
      isRead: result['readAt'] != null,
    );
  }
}
