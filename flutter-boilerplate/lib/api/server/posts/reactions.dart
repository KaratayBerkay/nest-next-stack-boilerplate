import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final postReactionsServerProvider = Provider((ref) => PostReactionsServer(ref.read(dioProvider)));

class PostReactionsServer {
  final Dio _dio;

  PostReactionsServer(this._dio);

  Future<void> toggle(String postId) async {
    await _dio.post<dynamic>('${Urls.reactions}/$postId');
  }

  Future<void> toggleForComment(String commentId) async {
    await _dio.post<dynamic>('${Urls.reactions}/comment/$commentId');
  }
}
