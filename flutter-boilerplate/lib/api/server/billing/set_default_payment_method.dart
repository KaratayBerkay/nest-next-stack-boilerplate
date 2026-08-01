import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final setDefaultPaymentMethodServerProvider =
    Provider((ref) => SetDefaultPaymentMethodServer(ref.read(dioProvider)));

const _mutation = '''
  mutation SetDefaultPaymentMethod(\$paymentMethodId: String!) {
    setDefaultPaymentMethod(paymentMethodId: \$paymentMethodId)
  }
''';

class SetDefaultPaymentMethodServer {
  final Dio _dio;

  SetDefaultPaymentMethodServer(this._dio);

  Future<void> call(String paymentMethodId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'paymentMethodId': paymentMethodId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to set default payment method',
      );
    }
  }
}
