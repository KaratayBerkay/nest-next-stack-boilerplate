import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class PaymentMethod {
  final String id;
  final String brand;
  final String last4;
  final int expMonth;
  final int expYear;
  final bool isDefault;

  const PaymentMethod({
    required this.id,
    required this.brand,
    required this.last4,
    required this.expMonth,
    required this.expYear,
    this.isDefault = false,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'] as String,
      brand: json['brand'] as String,
      last4: json['last4'] as String,
      expMonth: json['expMonth'] as int,
      expYear: json['expYear'] as int,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
}

final paymentMethodsServerProvider = Provider(
  (ref) => PaymentMethodsServer(ref.read(dioProvider)),
);

class PaymentMethodsServer {
  final Dio _dio;

  PaymentMethodsServer(this._dio);

  Future<List<PaymentMethod>> call() async {
    final response = await _dio.get<dynamic>(Urls.billingPaymentMethods);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => PaymentMethod.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
