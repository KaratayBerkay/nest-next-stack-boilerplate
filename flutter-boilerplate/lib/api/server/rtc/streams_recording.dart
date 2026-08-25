import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/recording.dart';

const String _recordingFields = 'id status fileUrl startedAt endedAt';

final streamRecordingServerProvider =
    Provider((ref) => StreamRecordingServer(ref.read(dioProvider)));

class StreamRecordingServer {
  final Dio _dio;

  StreamRecordingServer(this._dio);

  Future<RtcRecording?> get(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query StreamRecording(\$slug: String!) { streamRecording(slug: \$slug) { $_recordingFields } }',
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) return null;
    final data = (body['data'] as Map<String, dynamic>)['streamRecording'];
    return data != null
        ? RtcRecording.fromJson(data as Map<String, dynamic>)
        : null;
  }

  Future<RtcRecording> start(String slug) => _mutate('start', slug);

  Future<RtcRecording> stop(String slug) => _mutate('stop', slug);

  Future<RtcRecording> _mutate(String action, String slug) async {
    final mutation = action == 'start'
        ? 'mutation StartStreamRecording(\$slug: String!) { startStreamRecording(slug: \$slug) { $_recordingFields } }'
        : 'mutation StopStreamRecording(\$slug: String!) { stopStreamRecording(slug: \$slug) { $_recordingFields } }';
    final field =
        action == 'start' ? 'startStreamRecording' : 'stopStreamRecording';
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
