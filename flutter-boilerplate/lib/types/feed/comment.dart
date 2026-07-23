import 'reaction.dart';

class Comment {
  final String id;
  final String postId;
  final String authorName;
  final String? authorAvatarUrl;
  final String content;
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
    required this.content,
    required this.createdAt,
    this.parentId,
    this.authorId,
    this.authorEmail,
    this.reactions = const [],
  });

  String get body => content;

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      postId: json['postId'] as String,
      authorName: json['authorName'] as String,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      content: json['content'] as String,
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
