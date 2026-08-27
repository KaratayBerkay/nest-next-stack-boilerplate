import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationReadServerProvider =
    Provider((ref) => NotificationReadServer(ref.read(dioProvider)));

const _markAllMutation =
    'mutation MarkAllNotificationsRead { markAllNotificationsRead }';

class NotificationReadServer {
  final Dio _dio;

  NotificationReadServer(this._dio);

  Future<void> markAllRead() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _markAllMutation},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to mark all notifications read',
      );
    }
  }
}
