import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import 'stream_fields.dart';

final joinStreamServerProvider =
    Provider((ref) => JoinStreamServer(ref.read(dioProvider)));

class JoinStreamServer {
  final Dio _dio;

  JoinStreamServer(this._dio);

  Future<LiveStreamJoinResult> call(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation JoinStreamAsViewer(\$slug: String!) { joinStreamAsViewer(slug: \$slug) { token roomName stream { $streamFields } } }',
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
        message: message ?? 'Failed to join stream',
      );
    }
    return LiveStreamJoinResult.fromJson(
      (body['data'] as Map<String, dynamic>)['joinStreamAsViewer']
          as Map<String, dynamic>,
    );
  }
}
