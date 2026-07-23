import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

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
      activeSubscriptions: json['activeSubscriptions'] as int,
      monthlyRevenue: (json['monthlyRevenue'] as num).toDouble(),
    );
  }
}

final premiumStatsServerProvider = Provider((ref) => PremiumStatsServer(ref.read(dioProvider)));

class PremiumStatsServer {
  final Dio _dio;

  PremiumStatsServer(this._dio);

  Future<PremiumStats> call() async {
    final response = await _dio.get<dynamic>(Urls.premiumStats);
    return PremiumStats.fromJson(response.data as Map<String, dynamic>);
  }
}
