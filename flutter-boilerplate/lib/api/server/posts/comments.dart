import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/feed/comment.dart';

final postCommentsServerProvider =
    Provider((ref) => PostCommentsServer(ref.read(dioProvider)));

class PostCommentsServer {
  final Dio _dio;

  PostCommentsServer(this._dio);

  Future<List<Comment>> list(String postId) async {
    final response = await _dio.get<dynamic>('${Urls.comments}/$postId');
    final list = response.data as List<dynamic>;
    return list
        .map((e) => Comment.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Comment> create(String postId, String content) async {
    final response = await _dio
        .post<dynamic>('${Urls.comments}/$postId', data: {'content': content});
    return Comment.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Comment> update(String commentId, {required String content}) async {
    final response = await _dio.put<dynamic>(
      '${Urls.comments}/$commentId',
      data: {'content': content},
    );
    return Comment.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> delete(String commentId) async {
    await _dio.delete<dynamic>('${Urls.comments}/$commentId');
  }
}
