import 'reaction.dart';

class Post {
  final String id;
  final String uuid;
  final String title;
  final String content;
  final String? imageUrl;
  final String authorName;
  final String? authorAvatarUrl;
  final String? authorEmail;
  final int likeCount;
  final int commentCount;
  final bool isLiked;
  final DateTime createdAt;
  final List<FeedReaction> reactions;

  const Post({
    required this.id,
    required this.uuid,
    required this.title,
    required this.content,
    this.imageUrl,
    required this.authorName,
    this.authorAvatarUrl,
    this.authorEmail,
    this.likeCount = 0,
    this.commentCount = 0,
    this.isLiked = false,
    required this.createdAt,
    this.reactions = const [],
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] as String,
      uuid: json['uuid'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String?,
      authorName: json['authorName'] as String,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      authorEmail: json['authorEmail'] as String?,
      likeCount: json['likeCount'] as int? ?? 0,
      commentCount: json['commentCount'] as int? ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => FeedReaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
