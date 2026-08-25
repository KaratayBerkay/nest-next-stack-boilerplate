import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/recording.dart';

const String _recordingFields = 'id status fileUrl startedAt endedAt';

final meetingRecordingServerProvider =
    Provider((ref) => MeetingRecordingServer(ref.read(dioProvider)));

class MeetingRecordingServer {
  final Dio _dio;

  MeetingRecordingServer(this._dio);

  Future<RtcRecording?> get(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query MeetingRecording(\$slug: String!) { meetingRecording(slug: \$slug) { $_recordingFields } }',
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) return null;
    final data = (body['data'] as Map<String, dynamic>)['meetingRecording'];
    return data != null
        ? RtcRecording.fromJson(data as Map<String, dynamic>)
        : null;
  }

  Future<RtcRecording> start(String slug) => _mutate('start', slug);

  Future<RtcRecording> stop(String slug) => _mutate('stop', slug);

  Future<RtcRecording> _mutate(String action, String slug) async {
    final mutation = action == 'start'
        ? 'mutation StartMeetingRecording(\$slug: String!) { startMeetingRecording(slug: \$slug) { $_recordingFields } }'
        : 'mutation StopMeetingRecording(\$slug: String!) { stopMeetingRecording(slug: \$slug) { $_recordingFields } }';
    final field =
        action == 'start' ? 'startMeetingRecording' : 'stopMeetingRecording';
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': mutation,
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to update recording',
      );
    }
    return RtcRecording.fromJson(
      (body['data'] as Map<String, dynamic>)[field] as Map<String, dynamic>,
    );
  }
}
