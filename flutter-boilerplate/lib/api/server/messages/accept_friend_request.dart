import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final acceptFriendRequestServerProvider = Provider(
  (ref) => AcceptFriendRequestServer(ref.read(dioProvider)),
);

class AcceptFriendRequestServer {
  final Dio _dio;

  AcceptFriendRequestServer(this._dio);

  Future<void> call(String userId) async {
    await _dio.post<dynamic>('/api/friends/accept/$userId');
  }
}
