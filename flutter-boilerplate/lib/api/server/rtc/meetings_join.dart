import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import 'meeting_fields.dart';

final joinMeetingServerProvider =
    Provider((ref) => JoinMeetingServer(ref.read(dioProvider)));

class JoinMeetingServer {
  final Dio _dio;

  JoinMeetingServer(this._dio);

  Future<JoinMeetingResult> call(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation JoinMeeting(\$slug: String!) { joinMeeting(slug: \$slug) { token roomName role meeting { $meetingFields } } }',
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      final message = (body['errors'] as List).isNotEmpty
          ? ((body['errors'] as List).first as Map<String, dynamic>)['message']
              as String?
          : null;
      throw DioException(
        requestOptions: response.requestOptions,
        message: message ?? 'Failed to join meeting',
      );
    }
    return JoinMeetingResult.fromJson(
      (body['data'] as Map<String, dynamic>)['joinMeeting']
          as Map<String, dynamic>,
    );
  }
}
