import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class UserSearchResult {
  final String id;
  final String name;
  final String? avatarUrl;

  const UserSearchResult({required this.id, required this.name, this.avatarUrl});

  factory UserSearchResult.fromJson(Map<String, dynamic> json) {
    return UserSearchResult(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}

final usersSearchServerProvider = Provider((ref) => UsersSearchServer(ref.read(dioProvider)));

class UsersSearchServer {
  final Dio _dio;

  UsersSearchServer(this._dio);

  Future<List<UserSearchResult>> call(String query) async {
    final response = await _dio.get<dynamic>(Urls.usersSearch, queryParameters: {'q': query});
    final list = response.data as List<dynamic>;
    return list.map((e) => UserSearchResult.fromJson(e as Map<String, dynamic>)).toList();
  }
}
