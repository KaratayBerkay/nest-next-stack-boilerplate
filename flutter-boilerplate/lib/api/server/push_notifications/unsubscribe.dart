import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final pushUnsubscribeServerProvider = Provider((ref) => PushUnsubscribeServer(ref.read(dioProvider)));

class PushUnsubscribeServer {
  final Dio _dio;

  PushUnsubscribeServer(this._dio);

  Future<void> call(String token) async {
    await _dio.post<dynamic>(Urls.pushUnsubscribe, data: {'token': token});
  }
}
