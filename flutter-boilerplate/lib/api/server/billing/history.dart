import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class Invoice {
  final String id;
  final String status;
  final double amount;
  final String currency;
  final DateTime createdAt;
  final String? pdfUrl;

  const Invoice({
    required this.id,
    required this.status,
    required this.amount,
    required this.currency,
    required this.createdAt,
    this.pdfUrl,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String,
      status: json['status'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      pdfUrl: json['pdfUrl'] as String?,
    );
  }
}

final billingHistoryServerProvider =
    Provider((ref) => BillingHistoryServer(ref.read(dioProvider)));

class BillingHistoryServer {
  final Dio _dio;

  BillingHistoryServer(this._dio);

  Future<List<Invoice>> call() async {
    final response = await _dio.get<dynamic>(Urls.billingHistory);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => Invoice.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
