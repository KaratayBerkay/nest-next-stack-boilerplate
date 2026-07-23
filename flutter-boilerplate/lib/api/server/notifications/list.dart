import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/notification/notification_item.dart';

final notificationsServerProvider = Provider((ref) => NotificationsServer(ref.read(dioProvider)));

class NotificationsServer {
  final Dio _dio;

  NotificationsServer(this._dio);

  Future<List<NotificationItem>> call() async {
    final response = await _dio.get<dynamic>(Urls.notifications);
    final list = response.data as List<dynamic>;
    return list.map((e) => NotificationItem.fromJson(e as Map<String, dynamic>)).toList();
  }
}
