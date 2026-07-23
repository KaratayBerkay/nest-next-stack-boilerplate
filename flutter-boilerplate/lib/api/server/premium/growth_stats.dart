import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

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
      newUsersThisMonth: json['newUsersThisMonth'] as int,
      newSubscriptionsThisMonth: json['newSubscriptionsThisMonth'] as int,
      growthRate: (json['growthRate'] as num).toDouble(),
    );
  }
}

final growthStatsServerProvider = Provider((ref) => GrowthStatsServer(ref.read(dioProvider)));

class GrowthStatsServer {
  final Dio _dio;

  GrowthStatsServer(this._dio);

  Future<GrowthStats> call() async {
    final response = await _dio.get<dynamic>('${Urls.premiumStats}/growth');
    return GrowthStats.fromJson(response.data as Map<String, dynamic>);
  }
}
