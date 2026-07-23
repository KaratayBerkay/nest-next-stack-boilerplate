import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final acceptFriendRequestServerProvider = Provider(
  (ref) => AcceptFriendRequestServer(ref.read(dioProvider)),
);

class AcceptFriendRequestServer {
  final Dio _dio;

  AcceptFriendRequestServer(this._dio);

  Future<void> call(String requestId) async {
    await _dio.post<dynamic>('${Urls.acceptFriendRequest}/$requestId');
  }
}
