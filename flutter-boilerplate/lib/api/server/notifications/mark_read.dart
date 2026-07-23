import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final notificationsMarkReadServerProvider = Provider(
  (ref) => NotificationsMarkReadServer(ref.read(dioProvider)),
);

class NotificationsMarkReadServer {
  final Dio _dio;

  NotificationsMarkReadServer(this._dio);

  Future<void> call(String notificationId) async {
    await _dio.post<dynamic>('${Urls.notificationsRead}/$notificationId');
  }
}
