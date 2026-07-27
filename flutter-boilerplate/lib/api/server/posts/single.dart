import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/feed/post.dart';

final postSingleServerProvider =
    Provider((ref) => PostSingleServer(ref.read(dioProvider)));

const _query = '''
  query Post(\$id: ID!) {
    post(id: \$id) {
      id
      title
      content
      imageUrl
      createdAt
      updatedAt
      author {
        id
        name
        avatarUrl
        email
      }
    }
  }
''';

class PostSingleServer {
  final Dio _dio;

  PostSingleServer(this._dio);

  Future<Post> call(String postId) async {
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
        message: 'Failed to fetch post',
      );
    }
    final result =
        (body['data'] as Map<String, dynamic>)['post'] as Map<String, dynamic>;
    return Post.fromJson(result);
  }
}
