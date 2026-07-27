import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final removePaymentMethodServerProvider =
    Provider((ref) => RemovePaymentMethodServer(ref.read(dioProvider)));

const _mutation = '''
  mutation RemovePaymentMethod(\$id: ID!) {
    removePaymentMethod(id: \$id)
  }
''';

class RemovePaymentMethodServer {
  final Dio _dio;

  RemovePaymentMethodServer(this._dio);

  Future<void> call(String paymentMethodId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'id': paymentMethodId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to remove payment method',
      );
    }
  }
}
