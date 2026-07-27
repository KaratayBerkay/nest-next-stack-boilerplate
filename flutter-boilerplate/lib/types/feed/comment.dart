import 'reaction.dart';

class Comment {
  final String id;
  final String postId;
  final String authorName;
  final String? authorAvatarUrl;
  final String body;
  final DateTime createdAt;
  final String? parentId;
  final String? authorId;
  final String? authorEmail;
  final List<FeedReaction> reactions;

  const Comment({
    required this.id,
    required this.postId,
    required this.authorName,
    this.authorAvatarUrl,
    required this.body,
    required this.createdAt,
    this.parentId,
    this.authorId,
    this.authorEmail,
    this.reactions = const [],
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      postId: json['postId'] as String,
      authorName: json['authorName'] as String,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      parentId: json['parentId'] as String?,
      authorId: json['authorId'] as String?,
      authorEmail: json['authorEmail'] as String?,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => FeedReaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
