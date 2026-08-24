import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';

final meetingChatServerProvider =
    Provider((ref) => MeetingChatServer(ref.read(dioProvider)));

class MeetingChatServer {
  final Dio _dio;

  MeetingChatServer(this._dio);

  Future<MeetingChatPage> call(
    String slug, {
    String? before,
    int take = 50,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query MeetingChatMessages(\$slug: String!, \$before: String, \$take: Int) { meetingChatMessages(slug: \$slug, before: \$before, take: \$take) { hasMore messages { id senderId senderName senderAvatarUrl text createdAt } } }',
        'variables': {'slug': slug, 'before': before, 'take': take},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load meeting chat',
      );
    }
    return MeetingChatPage.fromJson(
      (body['data'] as Map<String, dynamic>)['meetingChatMessages']
          as Map<String, dynamic>,
    );
  }
}
