import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/feed/post.dart';

final postUpdateServerProvider =
    Provider((ref) => PostUpdateServer(ref.read(dioProvider)));

class PostUpdateServer {
  final Dio _dio;

  PostUpdateServer(this._dio);

  Future<Post> call(
    String postId, {
    String? title,
    String? content,
    String? imageUrl,
  }) async {
    final response = await _dio.put<dynamic>(
      '${Urls.posts}/$postId',
      data: {
        if (title != null) 'title': title,
        if (content != null) 'content': content,
        if (imageUrl != null) 'imageUrl': imageUrl,
      },
    );
    return Post.fromJson(response.data as Map<String, dynamic>);
  }
}
