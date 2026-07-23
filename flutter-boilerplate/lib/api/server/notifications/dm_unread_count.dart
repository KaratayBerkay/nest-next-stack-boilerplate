import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final dmUnreadNotificationsServerProvider = Provider(
  (ref) => DmUnreadNotificationsServer(ref.read(dioProvider)),
);

class DmUnreadNotificationsServer {
  final Dio _dio;

  DmUnreadNotificationsServer(this._dio);

  Future<int> call() async {
    final response = await _dio.get<dynamic>(Urls.notificationsUnreadCount);
    return response.data['count'] as int;
  }
}
