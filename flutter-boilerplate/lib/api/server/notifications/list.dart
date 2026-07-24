import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/notification/notification_item.dart';

final notificationsServerProvider =
    Provider((ref) => NotificationsServer(ref.read(dioProvider)));

const _query = '''
  query MyNotifications(\$cursor: ID, \$take: Int) {
    myNotifications(cursor: \$cursor, take: \$take) {
      id
      type
      title
      body
      read
      createdAt
    }
  }
''';

class NotificationsServer {
  final Dio _dio;

  NotificationsServer(this._dio);

  Future<List<NotificationItem>> call({String? cursor, int? take}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {
          if (cursor != null) 'cursor': cursor,
          if (take != null) 'take': take,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch notifications',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['myNotifications'] as List;
    return list
        .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
