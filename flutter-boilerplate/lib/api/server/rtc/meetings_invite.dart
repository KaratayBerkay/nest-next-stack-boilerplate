import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final inviteToMeetingServerProvider =
    Provider((ref) => InviteToMeetingServer(ref.read(dioProvider)));

class InviteToMeetingServer {
  final Dio _dio;

  InviteToMeetingServer(this._dio);

  Future<void> call(String slug, String userId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation InviteToMeeting(\$slug: String!, \$userId: String!) { inviteToMeeting(slug: \$slug, userId: \$userId) }',
        'variables': {'slug': slug, 'userId': userId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to invite to meeting',
      );
    }
  }
}
