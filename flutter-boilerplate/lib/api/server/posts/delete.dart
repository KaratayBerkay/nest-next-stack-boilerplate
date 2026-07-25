import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final postDeleteServerProvider =
    Provider((ref) => PostDeleteServer(ref.read(dioProvider)));

const _mutation =
    'mutation DeletePost(\$id: ID!) { deletePost(id: \$id) { id } }';

class PostDeleteServer {
  final Dio _dio;

  PostDeleteServer(this._dio);

  Future<void> call(String postId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'id': postId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to delete post',
      );
    }
  }
}
