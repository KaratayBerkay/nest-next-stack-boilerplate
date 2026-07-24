import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dmUnreadNotificationsServerProvider = Provider(
  (ref) => DmUnreadNotificationsServer(ref.read(dioProvider)),
);

const _query = 'query UnreadNotificationCount { unreadNotificationCount }';

class DmUnreadNotificationsServer {
  final Dio _dio;

  DmUnreadNotificationsServer(this._dio);

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
    return (body['data'] as Map<String, dynamic>)['unreadNotificationCount'] as int;
  }
}
