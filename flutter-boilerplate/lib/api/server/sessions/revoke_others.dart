import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final revokeOthersServerProvider =
    Provider((ref) => RevokeOthersServer(ref.read(dioProvider)));

const _mutation = 'mutation RevokeAllOtherSessions { revokeAllOtherSessions }';

class RevokeOthersServer {
  final Dio _dio;

  RevokeOthersServer(this._dio);

  Future<void> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _mutation},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to revoke other sessions',
      );
    }
  }
}
