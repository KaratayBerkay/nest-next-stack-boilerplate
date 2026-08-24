import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import 'meeting_fields.dart';

final meetingBySlugServerProvider =
    Provider((ref) => MeetingBySlugServer(ref.read(dioProvider)));

class MeetingBySlugServer {
  final Dio _dio;

  MeetingBySlugServer(this._dio);

  Future<Meeting?> call(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query MeetingBySlug(\$slug: String!) { meetingBySlug(slug: \$slug) { $meetingFields } }',
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load meeting',
      );
    }
    final data = (body['data'] as Map<String, dynamic>)['meetingBySlug'];
    return data != null ? Meeting.fromJson(data as Map<String, dynamic>) : null;
  }
}
