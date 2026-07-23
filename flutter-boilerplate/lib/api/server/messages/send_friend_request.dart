import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final sendFriendRequestServerProvider = Provider(
  (ref) => SendFriendRequestServer(ref.read(dioProvider)),
);

class SendFriendRequestServer {
  final Dio _dio;

  SendFriendRequestServer(this._dio);

  Future<void> call(String userId) async {
    await _dio.post<dynamic>(Urls.sendFriendRequest, data: {'userId': userId});
  }
}
