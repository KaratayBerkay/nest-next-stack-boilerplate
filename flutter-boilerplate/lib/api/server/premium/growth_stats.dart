import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GrowthStats {
  final int newUsersThisMonth;
  final int newSubscriptionsThisMonth;
  final double growthRate;

  const GrowthStats({
    required this.newUsersThisMonth,
    required this.newSubscriptionsThisMonth,
    required this.growthRate,
  });

  factory GrowthStats.fromJson(Map<String, dynamic> json) {
    return GrowthStats(
      newUsersThisMonth: json['newUsersLast7Days'] as int? ?? json['newUsersThisMonth'] as int,
      newSubscriptionsThisMonth: json['newSubscriptionsThisMonth'] as int? ?? 0,
      growthRate: (json['growthRate'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

final growthStatsServerProvider =
    Provider((ref) => GrowthStatsServer(ref.read(dioProvider)));

const _query = 'query GrowthStats { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }';

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
