import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationsMarkReadServerProvider = Provider(
  (ref) => NotificationsMarkReadServer(ref.read(dioProvider)),
);

const _mutation =
    'mutation MarkNotificationRead(\$id: ID!) { markNotificationRead(id: \$id) }';

class NotificationsMarkReadServer {
  final Dio _dio;

  NotificationsMarkReadServer(this._dio);

  Future<void> call(String notificationId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'id': notificationId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to mark notification read',
      );
    }
  }
}
