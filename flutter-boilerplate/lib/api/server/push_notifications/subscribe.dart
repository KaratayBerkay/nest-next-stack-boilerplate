import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final pushSubscribeServerProvider = Provider((ref) => PushSubscribeServer(ref.read(dioProvider)));

class PushSubscribeServer {
  final Dio _dio;

  PushSubscribeServer(this._dio);

  Future<void> call(String token) async {
    await _dio.post<dynamic>(Urls.pushSubscribe, data: {'token': token});
  }
}
