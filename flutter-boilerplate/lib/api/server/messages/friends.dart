import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Friend {
  final String id;
  final String name;
  final String email;
  final bool isOnline;

  const Friend({
    required this.id,
    required this.name,
    required this.email,
    required this.isOnline,
  });

  // Backend (getFriends() in messaging-friend.service.ts) sends `email`,
  // a nullable `name`, and `online` — not `avatarUrl`/`isOnline`. `avatar`
  // is deliberately not modeled: it's server-computed initials text, not an
  // image URL, so nothing should ever feed it to a network image loader.
  factory Friend.fromJson(Map<String, dynamic> json) {
    final email = json['email'] as String;
    return Friend(
      id: json['id'] as String,
      name: (json['name'] as String?) ?? email,
      email: email,
      isOnline: json['online'] as bool? ?? false,
    );
  }
}

final friendsListServerProvider =
    Provider((ref) => FriendsListServer(ref.read(dioProvider)));

class FriendsListServer {
  final Dio _dio;

  FriendsListServer(this._dio);

  Future<List<Friend>> call() async {
    final response = await _dio.get<dynamic>('/api/friends');
    final list = response.data as List<dynamic>;
    return list.map((e) => Friend.fromJson(e as Map<String, dynamic>)).toList();
  }
}
