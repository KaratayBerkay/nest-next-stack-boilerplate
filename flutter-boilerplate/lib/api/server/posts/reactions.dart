import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final postReactionsServerProvider = Provider((ref) => PostReactionsServer(ref.read(dioProvider)));

class PostReactionsServer {
  final Dio _dio;

  PostReactionsServer(this._dio);

  Future<void> toggle(String postId) async {
    await _dio.post<dynamic>('${Urls.reactions}/$postId');
  }
}
