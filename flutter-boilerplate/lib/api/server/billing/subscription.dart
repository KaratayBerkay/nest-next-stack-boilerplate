import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

class SubscriptionInfo {
  final String plan;
  final String status;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;

  const SubscriptionInfo({
    required this.plan,
    required this.status,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
  });

  factory SubscriptionInfo.fromJson(Map<String, dynamic> json) {
    return SubscriptionInfo(
      plan: json['plan'] as String,
      status: json['status'] as String,
      currentPeriodEnd: json['currentPeriodEnd'] != null
          ? DateTime.parse(json['currentPeriodEnd'] as String)
          : null,
      cancelAtPeriodEnd: json['cancelAtPeriodEnd'] as bool? ?? false,
    );
  }
}

final subscriptionServerProvider = Provider((ref) => SubscriptionServer(ref.read(dioProvider)));

class SubscriptionServer {
  final Dio _dio;

  SubscriptionServer(this._dio);

  Future<SubscriptionInfo> call() async {
    final response = await _dio.get<dynamic>(Urls.billingSubscription);
    return SubscriptionInfo.fromJson(response.data as Map<String, dynamic>);
  }
}
