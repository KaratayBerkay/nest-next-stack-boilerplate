import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

class Friend {
  final String id;
  final String name;
  final String? avatarUrl;
  final bool isOnline;

  const Friend({
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.isOnline,
  });

  factory Friend.fromJson(Map<String, dynamic> json) {
    return Friend(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      isOnline: json['isOnline'] as bool? ?? false,
    );
  }
}

final friendsListServerProvider = Provider((ref) => FriendsListServer(ref.read(dioProvider)));

class FriendsListServer {
  final Dio _dio;

  FriendsListServer(this._dio);

  Future<List<Friend>> call() async {
    final response = await _dio.get<dynamic>(Urls.friends);
    final list = response.data as List<dynamic>;
    return list.map((e) => Friend.fromJson(e as Map<String, dynamic>)).toList();
  }
}
