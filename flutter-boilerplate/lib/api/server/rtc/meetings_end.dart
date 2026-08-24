import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final endMeetingServerProvider =
    Provider((ref) => EndMeetingServer(ref.read(dioProvider)));

class EndMeetingServer {
  final Dio _dio;

  EndMeetingServer(this._dio);

  Future<void> call(String slug) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation EndMeeting(\$slug: String!) { endMeeting(slug: \$slug) }',
        'variables': {'slug': slug},
      },
    );
  }
}
