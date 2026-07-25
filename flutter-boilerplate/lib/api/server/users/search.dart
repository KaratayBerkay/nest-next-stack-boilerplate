import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserSearchResult {
  final String id;
  final String name;
  final String? avatarUrl;

  const UserSearchResult({
    required this.id,
    required this.name,
    this.avatarUrl,
  });

  factory UserSearchResult.fromJson(Map<String, dynamic> json) {
    return UserSearchResult(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}

final usersSearchServerProvider =
    Provider((ref) => UsersSearchServer(ref.read(dioProvider)));

const _query =
    'query Users(\$search: String) { users(search: \$search) { id name email avatarUrl } }';

class UsersSearchServer {
  final Dio _dio;

  UsersSearchServer(this._dio);

  Future<List<UserSearchResult>> call(String query) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {'search': query},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to search users',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['users'] as List;
    return list
        .map((e) => UserSearchResult.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
