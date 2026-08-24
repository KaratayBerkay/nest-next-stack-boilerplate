import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final meetingParticipantsServerProvider =
    Provider((ref) => MeetingParticipantsServer(ref.read(dioProvider)));

class MeetingParticipantsServer {
  final Dio _dio;

  MeetingParticipantsServer(this._dio);

  Future<void> mute(String slug, String userId, bool muted) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation MuteMeetingParticipant(\$slug: String!, \$userId: String!, \$muted: Boolean!) { muteMeetingParticipant(slug: \$slug, userId: \$userId, muted: \$muted) }',
        'variables': {'slug': slug, 'userId': userId, 'muted': muted},
      },
    );
  }

  Future<void> remove(String slug, String userId) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation RemoveMeetingParticipant(\$slug: String!, \$userId: String!) { removeMeetingParticipant(slug: \$slug, userId: \$userId) }',
        'variables': {'slug': slug, 'userId': userId},
      },
    );
  }
}
