import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final postDeleteServerProvider = Provider((ref) => PostDeleteServer(ref.read(dioProvider)));

class PostDeleteServer {
  final Dio _dio;

  PostDeleteServer(this._dio);

  Future<void> call(String postId) async {
    await _dio.delete<dynamic>('${Urls.posts}/$postId');
  }
}
