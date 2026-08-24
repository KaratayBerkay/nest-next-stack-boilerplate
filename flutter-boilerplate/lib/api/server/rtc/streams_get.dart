import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import 'stream_fields.dart';

final streamBySlugServerProvider =
    Provider((ref) => StreamBySlugServer(ref.read(dioProvider)));

class StreamBySlugServer {
  final Dio _dio;

  StreamBySlugServer(this._dio);

  Future<LiveStream?> call(String slug) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'query StreamBySlug(\$slug: String!) { streamBySlug(slug: \$slug) { $streamFields } }',
        'variables': {'slug': slug},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load stream',
      );
    }
    final data = (body['data'] as Map<String, dynamic>)['streamBySlug'];
    return data != null
        ? LiveStream.fromJson(data as Map<String, dynamic>)
        : null;
  }
}
