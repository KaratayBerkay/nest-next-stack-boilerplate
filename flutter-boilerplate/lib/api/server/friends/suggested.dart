import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SuggestedUser {
  final String id;
  final String name;
  final String? avatarUrl;
  final int mutualFriends;

  const SuggestedUser({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.mutualFriends = 0,
  });

  factory SuggestedUser.fromJson(Map<String, dynamic> json) {
    return SuggestedUser(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      mutualFriends: json['mutualFriends'] as int? ?? 0,
    );
  }
}

final suggestedFriendsServerProvider = Provider(
  (ref) => SuggestedFriendsServer(ref.read(dioProvider)),
);

const _query = '''
  query SuggestedFriends {
    suggestedFriends {
      id
      name
      email
      avatarUrl
      mutualFriends
    }
  }
''';

class SuggestedFriendsServer {
  final Dio _dio;

  SuggestedFriendsServer(this._dio);

  Future<List<SuggestedUser>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch suggested friends',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['suggestedFriends'] as List;
    return list
        .map((e) => SuggestedUser.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
