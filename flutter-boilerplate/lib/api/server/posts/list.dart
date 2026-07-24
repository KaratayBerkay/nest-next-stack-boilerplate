import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/feed/post.dart';

final feedListServerProvider =
    Provider((ref) => FeedListServer(ref.read(dioProvider)));

class FeedListServer {
  final Dio _dio;

  FeedListServer(this._dio);

  Future<List<Post>> call({int page = 0, int limit = 20}) async {
    final response = await _dio.get<dynamic>(
      Urls.feed,
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );
    final list = response.data as List<dynamic>;
    return list.map((e) => Post.fromJson(e as Map<String, dynamic>)).toList();
  }
}
