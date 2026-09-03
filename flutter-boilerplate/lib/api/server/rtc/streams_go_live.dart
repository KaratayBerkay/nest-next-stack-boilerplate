import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import 'stream_fields.dart';

final goLiveServerProvider =
    Provider((ref) => GoLiveServer(ref.read(dioProvider)));

class GoLiveServer {
  final Dio _dio;

  GoLiveServer(this._dio);

  Future<LiveStreamJoinResult> call(String title) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation GoLive(\$title: String!) { goLive(title: \$title) { token roomName livekitUrl stream { $streamFields } } }',
        'variables': {'title': title},
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
        message: message ?? 'Failed to go live',
      );
    }
    return LiveStreamJoinResult.fromJson(
      (body['data'] as Map<String, dynamic>)['goLive'] as Map<String, dynamic>,
    );
  }
}
