import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GrowthStats {
  final int newUsersLast7Days;
  final int totalPosts;
  final int totalFriendships;

  const GrowthStats({
    required this.newUsersLast7Days,
    required this.totalPosts,
    required this.totalFriendships,
  });

  factory GrowthStats.fromJson(Map<String, dynamic> json) {
    return GrowthStats(
      newUsersLast7Days: json['newUsersLast7Days'] as int,
      totalPosts: json['totalPosts'] as int,
      totalFriendships: json['totalFriendships'] as int,
    );
  }
}

final growthStatsServerProvider =
    Provider((ref) => GrowthStatsServer(ref.read(dioProvider)));

const _query =
    'query GrowthStats { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }';

class GrowthStatsServer {
  final Dio _dio;

  GrowthStatsServer(this._dio);

  Future<GrowthStats> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch growth stats',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['growthStats']
        as Map<String, dynamic>;
    return GrowthStats.fromJson(result);
  }
}
