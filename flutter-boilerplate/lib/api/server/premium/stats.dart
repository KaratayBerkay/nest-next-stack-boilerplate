import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PremiumStats {
  final int totalUsers;
  final int activeSubscriptions;
  final double monthlyRevenue;

  const PremiumStats({
    required this.totalUsers,
    required this.activeSubscriptions,
    required this.monthlyRevenue,
  });

  factory PremiumStats.fromJson(Map<String, dynamic> json) {
    return PremiumStats(
      totalUsers: json['totalUsers'] as int,
      activeSubscriptions: json['activeUsers'] as int? ?? json['activeSubscriptions'] as int,
      monthlyRevenue: (json['revenue'] as num?)?.toDouble() ?? (json['monthlyRevenue'] as num).toDouble(),
    );
  }
}

final premiumStatsServerProvider =
    Provider((ref) => PremiumStatsServer(ref.read(dioProvider)));

const _query = 'query PremiumStats { premiumStats { totalUsers activeUsers revenue } }';

class PremiumStatsServer {
  final Dio _dio;

  PremiumStatsServer(this._dio);

  Future<PremiumStats> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch premium stats',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['premiumStats']
        as Map<String, dynamic>;
    return PremiumStats.fromJson(result);
  }
}
