import 'reaction.dart';

class Post {
  final String id;
  final String title;
  final String content;
  final String? imageUrl;
  final String? coverImage;
  final String authorName;
  final String? authorAvatarUrl;
  final String? authorEmail;
  final String authorId;
  final int likeCount;
  final int commentCount;
  final bool isLiked;
  final DateTime createdAt;
  final List<FeedReaction> reactions;

  const Post({
    required this.id,
    required this.title,
    required this.content,
    this.imageUrl,
    this.coverImage,
    required this.authorName,
    this.authorAvatarUrl,
    this.authorEmail,
    required this.authorId,
    required this.likeCount,
    required this.commentCount,
    this.isLiked = false,
    required this.createdAt,
    this.reactions = const [],
  });

  bool isLikedBy(String userId) => reactions.any((r) => r.userId == userId);

  factory Post.fromJson(Map<String, dynamic> json) {
    final author = json['author'] as Map<String, dynamic>?;
    final count = json['_count'] as Map<String, dynamic>?;
    return Post(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String?,
      coverImage: json['coverImage'] as String?,
      authorName: (author?['name'] as String?) ?? 'Unknown',
      authorAvatarUrl: author?['avatarUrl'] as String?,
      authorEmail: author?['email'] as String?,
      authorId: author?['id'] as String? ?? '',
      likeCount: (count?['reactions'] as int?) ?? 0,
      commentCount: (count?['comments'] as int?) ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => FeedReaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
