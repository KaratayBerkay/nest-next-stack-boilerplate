import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final leaveMeetingServerProvider =
    Provider((ref) => LeaveMeetingServer(ref.read(dioProvider)));

class LeaveMeetingServer {
  final Dio _dio;

  LeaveMeetingServer(this._dio);

  Future<void> call(String slug) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation LeaveMeeting(\$slug: String!) { leaveMeeting(slug: \$slug) }',
        'variables': {'slug': slug},
      },
    );
  }
}
