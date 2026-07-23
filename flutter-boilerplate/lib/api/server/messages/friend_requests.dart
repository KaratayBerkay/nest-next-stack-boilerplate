import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

class FriendRequest {
  final String id;
  final String fromUserId;
  final String fromUserName;
  final String? fromUserAvatar;
  final DateTime createdAt;

  const FriendRequest({
    required this.id,
    required this.fromUserId,
    required this.fromUserName,
    this.fromUserAvatar,
    required this.createdAt,
  });

  factory FriendRequest.fromJson(Map<String, dynamic> json) {
    return FriendRequest(
      id: json['id'] as String,
      fromUserId: json['fromUserId'] as String,
      fromUserName: json['fromUserName'] as String,
      fromUserAvatar: json['fromUserAvatar'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

final friendRequestsServerProvider = Provider(
  (ref) => FriendRequestsServer(ref.read(dioProvider)),
);

class FriendRequestsServer {
  final Dio _dio;

  FriendRequestsServer(this._dio);

  Future<List<FriendRequest>> call() async {
    final response = await _dio.get<dynamic>(Urls.friendRequests);
    final list = response.data as List<dynamic>;
    return list.map((e) => FriendRequest.fromJson(e as Map<String, dynamic>)).toList();
  }
}
