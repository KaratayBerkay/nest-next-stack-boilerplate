import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/feed/post.dart';

final postUpdateServerProvider =
    Provider((ref) => PostUpdateServer(ref.read(dioProvider)));

const _mutation = '''
  mutation UpdatePost(\$id: ID!, \$data: UpdatePostInput!) {
    updatePost(id: \$id, data: \$data) {
      id
      title
      content
      imageUrl
      authorId
      createdAt
      updatedAt
    }
  }
''';

class PostUpdateServer {
  final Dio _dio;

  PostUpdateServer(this._dio);

  Future<Post> call(
    String postId, {
    String? title,
    String? content,
    String? imageUrl,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'id': postId,
          'data': {
            if (title != null) 'title': title,
            if (content != null) 'content': content,
            if (imageUrl != null) 'imageUrl': imageUrl,
          },
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to update post',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['updatePost']
        as Map<String, dynamic>;
    return Post.fromJson(result);
  }
}
