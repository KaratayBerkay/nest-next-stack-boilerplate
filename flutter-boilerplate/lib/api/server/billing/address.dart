import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final billingAddressServerProvider =
    Provider((ref) => BillingAddressServer(ref.read(dioProvider)));

const _getQuery = '''
  query MyBillingAddress {
    myBillingAddress {
      name
      street
      city
      state
      country
      zipCode
      vatNumber
    }
  }
''';

const _upsertMutation = '''
  mutation UpsertBillingAddress(\$input: BillingAddressInput!) {
    upsertBillingAddress(input: \$input) {
      name
      street
      city
      state
      country
      zipCode
      vatNumber
    }
  }
''';

class BillingAddressServer {
  final Dio _dio;

  BillingAddressServer(this._dio);

  Future<Map<String, dynamic>> get() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _getQuery},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch billing address',
      );
    }
    return (body['data'] as Map<String, dynamic>)['myBillingAddress']
        as Map<String, dynamic>;
  }

  Future<void> update(Map<String, dynamic> address) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _upsertMutation,
        'variables': {'input': address},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to update billing address',
      );
    }
  }
}
