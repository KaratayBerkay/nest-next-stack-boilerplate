import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/feed/post.dart';

final feedListServerProvider =
    Provider((ref) => FeedListServer(ref.read(dioProvider)));

const _query = '''
  query PostList(\$cursor: ID, \$take: Int, \$search: String) {
    postList(cursor: \$cursor, take: \$take, search: \$search) {
      id
      title
      content
      imageUrl
      createdAt
      updatedAt
      author {
        id
        name
        avatarUrl
        email
      }
    }
  }
''';

class FeedListServer {
  final Dio _dio;

  FeedListServer(this._dio);

  Future<List<Post>> call({String? cursor, int? take, String? search}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {
          if (cursor != null) 'cursor': cursor,
          if (take != null) 'take': take,
          if (search != null) 'search': search,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch posts',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['postList'] as List;
    return list.map((e) => Post.fromJson(e as Map<String, dynamic>)).toList();
  }
}
