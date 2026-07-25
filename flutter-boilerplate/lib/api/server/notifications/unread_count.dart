import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationsUnreadCountServerProvider = Provider(
  (ref) => NotificationsUnreadCountServer(ref.read(dioProvider)),
);

const _query = 'query UnreadNotificationCount { unreadNotificationCount }';

class NotificationsUnreadCountServer {
  final Dio _dio;

  NotificationsUnreadCountServer(this._dio);

  Future<int> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch unread count',
      );
    }
    return (body['data'] as Map<String, dynamic>)['unreadNotificationCount']
        as int;
  }
}
