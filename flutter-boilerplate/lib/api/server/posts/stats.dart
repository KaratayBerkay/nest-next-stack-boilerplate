import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class PostStats {
  final int totalPosts;
  final int totalLikes;
  final int totalComments;

  const PostStats({
    required this.totalPosts,
    required this.totalLikes,
    required this.totalComments,
  });

  factory PostStats.fromJson(Map<String, dynamic> json) {
    return PostStats(
      totalPosts: json['totalPosts'] as int,
      totalLikes: json['totalLikes'] as int,
      totalComments: json['totalComments'] as int,
    );
  }
}

final postStatsServerProvider = Provider((ref) => PostStatsServer(ref.read(dioProvider)));

class PostStatsServer {
  final Dio _dio;

  PostStatsServer(this._dio);

  Future<PostStats> call() async {
    final response = await _dio.get<dynamic>('${Urls.posts}/stats');
    return PostStats.fromJson(response.data as Map<String, dynamic>);
  }
}
