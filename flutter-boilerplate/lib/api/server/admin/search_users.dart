import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AdminUser {
  final String id;
  final String name;
  final String email;
  final String tier;

  const AdminUser({
    required this.id,
    required this.name,
    required this.email,
    required this.tier,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      tier: json['subscriptionTier'] as String? ?? 'FREE',
    );
  }
}

final adminSearchUsersServerProvider = Provider(
  (ref) => AdminSearchUsersServer(ref.read(dioProvider)),
);

// The backend's `authorization` module is GraphQL-only — there is no and
// never was a `/api/admin/audit-logs/users` REST route; the previous
// implementation here 404'd/threw on every search. Mirrors the pattern in
// `users/search.dart` and `admin/audit_logs.dart`, both direct-GraphQL.
const _query =
    'query Users(\$search: String) { users(search: \$search) { id name email subscriptionTier } }';

class AdminSearchUsersServer {
  final Dio _dio;

  AdminSearchUsersServer(this._dio);

  Future<List<AdminUser>> call(String query) async {
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
        .map((e) => AdminUser.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
