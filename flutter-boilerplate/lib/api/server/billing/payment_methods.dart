import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

const _query = '''
  query MyPaymentMethods {
    myPaymentMethods {
      id
      brand
      last4
      expMonth
      expYear
      isDefault
    }
  }
''';

class PaymentMethodsServer {
  final Dio _dio;

  PaymentMethodsServer(this._dio);

  Future<List<PaymentMethod>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch payment methods',
      );
    }
    final list =
        (body['data'] as Map<String, dynamic>)['myPaymentMethods'] as List;
    return list
        .map((e) => PaymentMethod.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
