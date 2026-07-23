import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final dmUnreadCountServerProvider = Provider((ref) => DmUnreadCountServer(ref.read(dioProvider)));

class DmUnreadCountServer {
  final Dio _dio;

  DmUnreadCountServer(this._dio);

  Future<int> call() async {
    final response = await _dio.get<dynamic>(Urls.messagesUnreadCount);
    return response.data['count'] as int;
  }
}
