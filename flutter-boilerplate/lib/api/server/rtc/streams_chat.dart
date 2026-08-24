import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';

final streamChatServerProvider =
    Provider((ref) => StreamChatServer(ref.read(dioProvider)));

class StreamChatServer {
  final Dio _dio;

  StreamChatServer(this._dio);

  Future<StreamChatPage> call(
    String slug, {
    String? before,
    int take = 50,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query StreamChatMessages(\$slug: String!, \$before: String, \$take: Int) { streamChatMessages(slug: \$slug, before: \$before, take: \$take) { hasMore messages { id senderId senderName senderAvatarUrl text createdAt } } }',
        'variables': {'slug': slug, 'before': before, 'take': take},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load stream chat',
      );
    }
    return StreamChatPage.fromJson(
      (body['data'] as Map<String, dynamic>)['streamChatMessages']
          as Map<String, dynamic>,
    );
  }
}
