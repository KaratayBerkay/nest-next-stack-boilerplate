import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

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
      tier: json['tier'] as String? ?? 'free',
    );
  }
}

final adminSearchUsersServerProvider = Provider(
  (ref) => AdminSearchUsersServer(ref.read(dioProvider)),
);

class AdminSearchUsersServer {
  final Dio _dio;

  AdminSearchUsersServer(this._dio);

  Future<List<AdminUser>> call(String query) async {
    final response = await _dio.get<dynamic>('${Urls.adminAuditLogs}/users', queryParameters: {
      'q': query,
    });
    final list = response.data as List<dynamic>;
    return list.map((e) => AdminUser.fromJson(e as Map<String, dynamic>)).toList();
  }
}
