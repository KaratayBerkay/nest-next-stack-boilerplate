import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final postReactionsServerProvider =
    Provider((ref) => PostReactionsServer(ref.read(dioProvider)));

const _toggleMutation = '''
  mutation CreateReaction(\$data: CreateReactionInput!) {
    createReaction(data: \$data) {
      id
    }
  }
''';

class PostReactionsServer {
  final Dio _dio;

  PostReactionsServer(this._dio);

  Future<void> toggle(String postId, {String type = 'LIKE'}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _toggleMutation,
        'variables': {
          'data': {'postId': postId, 'type': type},
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to toggle reaction',
      );
    }
  }

  Future<void> toggleForComment(
    String commentId, {
    String type = 'LIKE',
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _toggleMutation,
        'variables': {
          'data': {'commentId': commentId, 'type': type},
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to toggle reaction',
      );
    }
  }
}
