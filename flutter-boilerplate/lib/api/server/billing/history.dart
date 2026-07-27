import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Invoice {
  final String id;
  final String status;
  final double amount;
  final String currency;
  final String? type;
  final String? reference;
  final DateTime createdAt;
  final String? pdfUrl;

  const Invoice({
    required this.id,
    required this.status,
    required this.amount,
    required this.currency,
    this.type,
    this.reference,
    required this.createdAt,
    this.pdfUrl,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String,
      status: json['status'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      type: json['type'] as String?,
      reference: json['reference'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      pdfUrl: json['stripeInvoiceUrl'] as String?,
    );
  }
}

final billingHistoryServerProvider =
    Provider((ref) => BillingHistoryServer(ref.read(dioProvider)));

const _query = '''
  query MyBillingHistory {
    myBillingHistory {
      id
      type
      status
      amount
      currency
      reference
      stripeInvoiceUrl
      metadata
      createdAt
    }
  }
''';

class BillingHistoryServer {
  final Dio _dio;

  BillingHistoryServer(this._dio);

  Future<List<Invoice>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch billing history',
      );
    }
    final list =
        (body['data'] as Map<String, dynamic>)['myBillingHistory'] as List;
    return list
        .map((e) => Invoice.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
