import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/feed/post.dart';

final postCreateServerProvider =
    Provider((ref) => PostCreateServer(ref.read(dioProvider)));

const _mutation = '''
  mutation CreatePost(\$data: CreatePostInput!) {
    createPost(data: \$data) {
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

class PostCreateServer {
  final Dio _dio;

  PostCreateServer(this._dio);

  Future<Post> call({
    required String title,
    required String content,
    String? imageUrl,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {
          'data': {
            'title': title,
            'content': content,
            if (imageUrl != null) 'imageUrl': imageUrl,
          },
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to create post',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['createPost']
        as Map<String, dynamic>;
    return Post.fromJson(result);
  }
}
