import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/feed/post.dart';

final postCreateServerProvider = Provider((ref) => PostCreateServer(ref.read(dioProvider)));

class PostCreateServer {
  final Dio _dio;

  PostCreateServer(this._dio);

  Future<Post> call({required String title, required String content, String? imageUrl}) async {
    final response = await _dio.post<dynamic>(Urls.posts, data: {
      'title': title,
      'content': content,
      'imageUrl': imageUrl,
    },);
    return Post.fromJson(response.data as Map<String, dynamic>);
  }
}
