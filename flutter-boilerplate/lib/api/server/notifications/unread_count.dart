import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final notificationsUnreadCountServerProvider = Provider(
  (ref) => NotificationsUnreadCountServer(ref.read(dioProvider)),
);

class NotificationsUnreadCountServer {
  final Dio _dio;

  NotificationsUnreadCountServer(this._dio);

  Future<int> call() async {
    final response = await _dio.get<dynamic>(Urls.notificationsUnreadCount);
    return response.data['count'] as int;
  }
}
