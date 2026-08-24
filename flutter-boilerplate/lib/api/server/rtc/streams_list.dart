import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import 'stream_fields.dart';

final liveStreamsServerProvider =
    Provider((ref) => LiveStreamsServer(ref.read(dioProvider)));

class LiveStreamsServer {
  final Dio _dio;

  LiveStreamsServer(this._dio);

  Future<List<LiveStream>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': 'query LiveStreams { liveStreams { $streamFields } }'},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load live streams',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['liveStreams'] as List;
    return list
        .map((e) => LiveStream.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
