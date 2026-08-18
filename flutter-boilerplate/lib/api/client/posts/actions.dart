import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../types/feed/comment.dart';
import '../../server/posts/comments.dart';
import '../../server/posts/create.dart';
import '../../server/posts/delete.dart';
import '../../server/posts/reactions.dart';
import '../../server/posts/update.dart';
import '../../server/posts/upload.dart';
import 'query.dart';

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
    _invalidateFeed();
  }

  Future<void> delete(String postId) async {
    final server = _ref.read(postDeleteServerProvider);
    await server.call(postId);
    _invalidateFeed();
    _ref.invalidate(postProvider(postId));
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
    _invalidateFeed();
    _ref.invalidate(postProvider(postId));
  }

  Future<void> toggleReaction(String postId, {String type = 'LIKE'}) async {
    final server = _ref.read(postReactionsServerProvider);
    await server.toggle(postId, type: type);
    _invalidateFeed();
    _ref.invalidate(postProvider(postId));
  }

  Future<Comment> addComment(
    String postId,
    String bodyText, {
    String? parentId,
  }) async {
    final server = _ref.read(postCommentsServerProvider);
    final comment = await server.create(postId, bodyText, parentId: parentId);
    _ref.invalidate(postCommentsProvider(comment.postId));
    _invalidateFeed();
    _ref.invalidate(postProvider(comment.postId));
    return comment;
  }

  Future<Comment> updateComment(
    String commentId, {
    required String bodyText,
  }) async {
    final server = _ref.read(postCommentsServerProvider);
    final comment = await server.update(commentId, bodyText: bodyText);
    _ref.invalidate(postCommentsProvider(comment.postId));
    _invalidateFeed();
    _ref.invalidate(postProvider(comment.postId));
    return comment;
  }

  Future<Comment> deleteComment(String commentId) async {
    final server = _ref.read(postCommentsServerProvider);
    final comment = await server.delete(commentId);
    _ref.invalidate(postCommentsProvider(comment.postId));
    _invalidateFeed();
    _ref.invalidate(postProvider(comment.postId));
    return comment;
  }

  Future<void> toggleCommentReaction(
    String commentId, {
    required String postId,
    String type = 'LIKE',
  }) async {
    final server = _ref.read(postReactionsServerProvider);
    await server.toggleForComment(commentId, type: type);
    _ref.invalidate(postCommentsProvider(postId));
    _invalidateFeed();
    _ref.invalidate(postProvider(postId));
  }

  Future<String> uploadImage(String filePath) async {
    final server = _ref.read(postUploadServerProvider);
    return server.call(filePath);
  }

  // Mirrors the web's usePostActions(), which invalidates every `["feed",
  // ...]`-keyed query after all 8 of these mutations, not just the comment
  // ones — every feed-list-shaped provider that could change as a result of
  // any of them, not just the one the calling screen happens to render.
  void _invalidateFeed() {
    _ref.invalidate(paginatedFeedProvider);
    _ref.invalidate(feedProvider);
  }
}
