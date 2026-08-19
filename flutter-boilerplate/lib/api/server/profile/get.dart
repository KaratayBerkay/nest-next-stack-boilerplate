import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? username;
  final String? bio;
  final String? avatarUrl;
  final String? locale;
  final String? timezone;
  final String tier;
  final String? chatNickname;
  final bool useNickname;
  final bool hideAvatar;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.username,
    this.bio,
    this.avatarUrl,
    this.locale,
    this.timezone,
    required this.tier,
    this.chatNickname,
    this.useNickname = false,
    this.hideAvatar = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      username: json['username'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      locale: json['locale'] as String?,
      timezone: json['timezone'] as String?,
      tier: json['tier'] as String? ?? 'free',
      chatNickname: json['chatNickname'] as String?,
      useNickname: json['useNickname'] as bool? ?? false,
      hideAvatar: json['hideAvatar'] as bool? ?? false,
    );
  }
}

final profileGetServerProvider =
    Provider((ref) => ProfileGetServer(ref.read(dioProvider)));

const _query = '''
  query MyProfile {
    myProfile {
      id
      email
      name
      username
      avatarUrl
      bio
      locale
      timezone
      tier: subscriptionTier
      chatNickname
      useNickname
      hideAvatar
    }
  }
''';

class ProfileGetServer {
  final Dio _dio;

  ProfileGetServer(this._dio);

  Future<UserProfile> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch profile',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['myProfile']
        as Map<String, dynamic>;
    return UserProfile.fromJson(result);
  }
}
