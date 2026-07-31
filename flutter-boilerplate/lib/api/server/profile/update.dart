import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final profileUpdateServerProvider =
    Provider((ref) => ProfileUpdateServer(ref.read(dioProvider)));

const _mutation = '''
  mutation UpdateProfile(\$input: UpdateProfileInput!) {
    updateProfile(input: \$input) {
      id
      email
      name
      username
      avatarUrl
      bio
      locale
      timezone
    }
  }
''';

class ProfileUpdateServer {
  final Dio _dio;

  ProfileUpdateServer(this._dio);

  Future<void> call({
    String? name,
    String? bio,
    String? username,
    String? avatarUrl,
    String? locale,
    String? timezone,
    String? chatNickname,
  }) async {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (bio != null) data['bio'] = bio;
    if (username != null) data['username'] = username;
    if (avatarUrl != null) data['avatarUrl'] = avatarUrl;
    if (locale != null) data['locale'] = locale;
    if (timezone != null) data['timezone'] = timezone;
    // Empty string means "clear the nickname" — the backend rejects blank
    // values, so map to explicit null (which UpdateProfileInput accepts).
    if (chatNickname != null) {
      data['chatNickname'] = chatNickname.isEmpty ? null : chatNickname;
    }

    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _mutation,
        'variables': {'input': data},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to update profile',
      );
    }
  }
}
