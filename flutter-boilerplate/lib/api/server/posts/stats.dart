import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PostStats {
  final int totalPosts;
  final int totalReactions;
  final double avgReactionsPerPost;

  const PostStats({
    required this.totalPosts,
    required this.totalReactions,
    required this.avgReactionsPerPost,
  });

  factory PostStats.fromJson(Map<String, dynamic> json) {
    return PostStats(
      totalPosts: json['totalPosts'] as int,
      totalReactions: json['totalReactions'] as int,
      avgReactionsPerPost: (json['avgReactionsPerPost'] as num).toDouble(),
    );
  }
}

final postStatsServerProvider =
    Provider((ref) => PostStatsServer(ref.read(dioProvider)));

const _query = 'query MyPostStats { myPostStats { totalPosts totalReactions avgReactionsPerPost } }';

class PostStatsServer {
  final Dio _dio;

  PostStatsServer(this._dio);

  Future<PostStats> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch post stats',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['myPostStats']
        as Map<String, dynamic>;
    return PostStats.fromJson(result);
  }
}
