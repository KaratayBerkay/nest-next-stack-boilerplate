import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/notification/notification_item.dart';

final notificationsServerProvider =
    Provider((ref) => NotificationsServer(ref.read(dioProvider)));

const _query = '''
  query MyNotifications(\$cursor: ID, \$take: Int) {
    myNotifications(cursor: \$cursor, take: \$take) {
      items {
        id
        type
        title
        body
        readAt
        createdAt
        payload
        actor {
          id
          name
          avatarUrl
        }
      }
      hasMore
    }
  }
''';

class NotificationsPage {
  final List<NotificationItem> items;
  final bool hasMore;

  const NotificationsPage({required this.items, required this.hasMore});
}

class NotificationsServer {
  final Dio _dio;

  NotificationsServer(this._dio);

  Future<NotificationsPage> call({String? cursor, int? take}) async {
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
    final page = (body['data'] as Map<String, dynamic>)['myNotifications']
        as Map<String, dynamic>;
    final items = (page['items'] as List)
        .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return NotificationsPage(
      items: items,
      hasMore: page['hasMore'] as bool? ?? false,
    );
  }
}
