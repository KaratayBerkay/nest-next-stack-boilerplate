import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';
import '../../../types/messages/message.dart';

final conversationMessagesServerProvider = Provider(
  (ref) => ConversationMessagesServer(ref.read(dioProvider)),
);

class ConversationMessagesServer {
  final Dio _dio;

  ConversationMessagesServer(this._dio);

  Future<List<ChatMessage>> call(String conversationId) async {
    final response = await _dio.get<dynamic>('${Urls.messages}/$conversationId');
    final list = response.data as List<dynamic>;
    return list.map((e) => ChatMessage.fromJson(e as Map<String, dynamic>)).toList();
  }
}
