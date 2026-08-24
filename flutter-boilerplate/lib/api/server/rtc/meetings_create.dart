import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import 'meeting_fields.dart';

final createMeetingServerProvider =
    Provider((ref) => CreateMeetingServer(ref.read(dioProvider)));

class CreateMeetingServer {
  final Dio _dio;

  CreateMeetingServer(this._dio);

  Future<Meeting> call(String title) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation CreateMeeting(\$title: String!) { createMeeting(title: \$title) { $meetingFields } }',
        'variables': {'title': title},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to create meeting',
      );
    }
    return Meeting.fromJson(
      (body['data'] as Map<String, dynamic>)['createMeeting']
          as Map<String, dynamic>,
    );
  }
}
