import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/posts/comments.dart';
import '../../server/posts/create.dart';
import '../../server/posts/delete.dart';
import '../../server/posts/reactions.dart';
import '../../server/posts/update.dart';
import '../../server/posts/upload.dart';

final postActionsProvider = Provider((ref) => PostActions(ref));

class PostActions {
  final Ref _ref;

  PostActions(this._ref);

  Future<void> create({
    required String title,
    required String content,
    String? imageUrl,
  }) async {
    final server = _ref.read(postCreateServerProvider);
    await server.call(title: title, content: content, imageUrl: imageUrl);
  }

  Future<void> delete(String postId) async {
    final server = _ref.read(postDeleteServerProvider);
    await server.call(postId);
  }

  Future<void> update(
    String postId, {
    String? title,
    String? content,
    String? imageUrl,
  }) async {
    final server = _ref.read(postUpdateServerProvider);
    await server.call(
      postId,
      title: title,
      content: content,
      imageUrl: imageUrl,
    );
  }

  Future<void> toggleReaction(String postId) async {
    final server = _ref.read(postReactionsServerProvider);
    await server.toggle(postId);
  }

  Future<void> addComment(String postId, String content) async {
    final server = _ref.read(postCommentsServerProvider);
    await server.create(postId, content);
  }

  Future<void> updateComment(
    String commentId, {
    required String content,
  }) async {
    final server = _ref.read(postCommentsServerProvider);
    await server.update(commentId, content: content);
  }

  Future<void> deleteComment(String commentId) async {
    final server = _ref.read(postCommentsServerProvider);
    await server.delete(commentId);
  }

  Future<void> toggleCommentReaction(String commentId) async {
    final server = _ref.read(postReactionsServerProvider);
    await server.toggleForComment(commentId);
  }

  Future<String> uploadImage(String filePath) async {
    final server = _ref.read(postUploadServerProvider);
    return server.call(filePath);
  }
}
