import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final deleteMessageServerProvider =
    Provider((ref) => DeleteMessageServer(ref.read(dioProvider)));

const _forMeMutation =
    'mutation DeleteMessageForMe(\$messageId: String!) { deleteMessageForMe(messageId: \$messageId) }';
const _forEveryoneMutation =
    'mutation DeleteMessageForEveryone(\$messageId: String!) { deleteMessageForEveryone(messageId: \$messageId) }';

class DeleteMessageServer {
  final Dio _dio;

  DeleteMessageServer(this._dio);

  Future<void> forMe(String messageId) => _call(_forMeMutation, messageId);

  Future<void> forEveryone(String messageId) =>
      _call(_forEveryoneMutation, messageId);

  Future<void> _call(String mutation, String messageId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': mutation,
        'variables': {'messageId': messageId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to delete message',
      );
    }
  }
}
