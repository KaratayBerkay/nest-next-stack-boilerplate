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
      final errors = body['errors'] as List;
      final first =
          errors.isNotEmpty ? errors.first as Map<String, dynamic> : null;
      final message = first?['message'] as String?;
      // GraphQL errors ride in a 200 body; surface the backend's
      // extensions.statusCode so the view can tell "meeting not found"
      // (404) from "meeting already ended" — same distinction the web view
      // reads off its BFF error shape.
      final statusCode = ((first?['extensions']
              as Map<String, dynamic>?)?['statusCode'] as num?)
          ?.toInt();
      throw DioException(
        requestOptions: response.requestOptions,
        response: statusCode != null
            ? Response(
                requestOptions: response.requestOptions,
                statusCode: statusCode,
              )
            : null,
        message: message ?? 'Failed to join meeting',
      );
    }
    return JoinMeetingResult.fromJson(
      (body['data'] as Map<String, dynamic>)['joinMeeting']
          as Map<String, dynamic>,
    );
  }
}
