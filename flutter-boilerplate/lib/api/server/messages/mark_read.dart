import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final markReadServerProvider =
    Provider((ref) => MarkReadServer(ref.read(dioProvider)));

const _mutation = 'mutation MarkMessagesRead(\$userId: String!) { markMessagesRead(userId: \$userId) }';

class MarkReadServer {
  final Dio _dio;

  MarkReadServer(this._dio);

  Future<void> call(String userId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'userId': userId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to mark messages read',
      );
    }
  }
}
