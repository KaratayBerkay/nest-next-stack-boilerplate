import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? bio;
  final String? avatarUrl;
  final String tier;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.bio,
    this.avatarUrl,
    required this.tier,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      tier: json['tier'] as String? ?? 'free',
    );
  }
}

final profileGetServerProvider =
    Provider((ref) => ProfileGetServer(ref.read(dioProvider)));

class ProfileGetServer {
  final Dio _dio;

  ProfileGetServer(this._dio);

  Future<UserProfile> call() async {
    final response = await _dio.get<dynamic>(Urls.profile);
    return UserProfile.fromJson(response.data as Map<String, dynamic>);
  }
}
