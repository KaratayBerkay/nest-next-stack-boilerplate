import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import 'meeting_fields.dart';

final myMeetingsServerProvider =
    Provider((ref) => MyMeetingsServer(ref.read(dioProvider)));

class MyMeetingsServer {
  final Dio _dio;

  MyMeetingsServer(this._dio);

  Future<List<Meeting>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': 'query MyMeetings { myMeetings { $meetingFields } }'},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load meetings',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['myMeetings'] as List;
    return list
        .map((e) => Meeting.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
