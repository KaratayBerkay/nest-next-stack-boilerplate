import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/messages/message.dart';

final sendMessageServerProvider = Provider((ref) => SendMessageServer(ref.read(dioProvider)));

class SendMessageServer {
  final Dio _dio;

  SendMessageServer(this._dio);

  Future<ChatMessage> call(String conversationId, String content) async {
    final response = await _dio.post<dynamic>(
      '${Urls.messages}/$conversationId',
      data: {'content': content},
    );
    return ChatMessage.fromJson(response.data as Map<String, dynamic>);
  }
}
