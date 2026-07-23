import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/feed/post.dart';

final postSingleServerProvider = Provider((ref) => PostSingleServer(ref.read(dioProvider)));

class PostSingleServer {
  final Dio _dio;

  PostSingleServer(this._dio);

  Future<Post> call(String postId) async {
    final response = await _dio.get<dynamic>('${Urls.posts}/$postId');
    return Post.fromJson(response.data as Map<String, dynamic>);
  }
}
