import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/messages/friend_request_types.dart';

final friendRequestsServerProvider = Provider(
  (ref) => FriendRequestsServer(ref.read(dioProvider)),
);

class FriendRequestsServer {
  final Dio _dio;

  FriendRequestsServer(this._dio);

  Future<List<FriendRequest>> call() async {
    final response = await _dio.get<dynamic>(Urls.friendRequests);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => FriendRequest.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
