import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Reactor {
  final String userId;
  final String? name;
  final String type;

  const Reactor({required this.userId, this.name, required this.type});

  factory Reactor.fromJson(Map<String, dynamic> json) {
    return Reactor(
      userId: json['userId'] as String,
      name: json['name'] as String?,
      type: json['type'] as String,
    );
  }
}

// Backend's `whoReacted` field (post.resolver.ts) is @MinTier(PREMIUM) — only
// ever call this from a screen already gated to Premium, since a lower tier
// would get a GraphQL error for this field alone, and this query has no
// other field to fall back on.
final whoReactedServerProvider =
    Provider((ref) => WhoReactedServer(ref.read(dioProvider)));

const _query = '''
  query PostWhoReacted(\$id: ID!) {
    post(id: \$id) {
      whoReacted {
        userId
        name
        type
      }
    }
  }
''';

class WhoReactedServer {
  final Dio _dio;

  WhoReactedServer(this._dio);

  Future<List<Reactor>> call(String postId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {'id': postId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch who reacted',
      );
    }
    final post =
        (body['data'] as Map<String, dynamic>)['post'] as Map<String, dynamic>;
    return (post['whoReacted'] as List<dynamic>)
        .map((e) => Reactor.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
