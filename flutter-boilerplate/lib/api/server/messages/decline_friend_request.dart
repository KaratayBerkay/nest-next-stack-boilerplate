import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final declineFriendRequestServerProvider = Provider(
  (ref) => DeclineFriendRequestServer(ref.read(dioProvider)),
);

class DeclineFriendRequestServer {
  final Dio _dio;

  DeclineFriendRequestServer(this._dio);

  Future<void> call(String requestId) async {
    await _dio.post<dynamic>('${Urls.declineFriendRequest}/$requestId');
  }
}
