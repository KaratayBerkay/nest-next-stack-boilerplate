import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/feed/comment.dart';

final postCommentsServerProvider =
    Provider((ref) => PostCommentsServer(ref.read(dioProvider)));

const _listQuery = '''
  query PostComments(\$postId: ID!) {
    postComments(postId: \$postId) {
      id
      content
      authorId
      postId
      createdAt
      updatedAt
    }
  }
''';

const _createMutation = '''
  mutation CreateComment(\$data: CreateCommentInput!) {
    createComment(data: \$data) {
      id
      content
      authorId
      postId
      createdAt
      updatedAt
    }
  }
''';

const _updateMutation = '''
  mutation UpdateComment(\$id: ID!, \$data: UpdateCommentInput!) {
    updateComment(id: \$id, data: \$data) {
      id
      content
      authorId
      postId
      createdAt
      updatedAt
    }
  }
''';

const _deleteMutation = '''
  mutation DeleteComment(\$id: ID!) {
    deleteComment(id: \$id) {
      id
    }
  }
''';

class PostCommentsServer {
  final Dio _dio;

  PostCommentsServer(this._dio);

  Future<List<Comment>> list(String postId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _listQuery,
        'variables': {'postId': postId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch comments',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['postComments'] as List;
    return list
        .map((e) => Comment.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Comment> create(String postId, String content) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _createMutation,
        'variables': {
          'data': {'postId': postId, 'content': content},
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to create comment',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['createComment']
        as Map<String, dynamic>;
    return Comment.fromJson(result);
  }

  Future<Comment> update(String commentId, {required String content}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _updateMutation,
        'variables': {
          'id': commentId,
          'data': {'content': content},
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to update comment',
      );
    }
    final result = (body['data'] as Map<String, dynamic>)['updateComment']
        as Map<String, dynamic>;
    return Comment.fromJson(result);
  }

  Future<void> delete(String commentId) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _deleteMutation,
        'variables': {'id': commentId},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to delete comment',
      );
    }
  }
}
