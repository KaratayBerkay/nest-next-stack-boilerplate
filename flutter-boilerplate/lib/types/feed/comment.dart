class Comment {
  final String id;
  final String postId;
  final String authorName;
  final String? authorAvatarUrl;
  final String content;
  final DateTime createdAt;

  const Comment({
    required this.id,
    required this.postId,
    required this.authorName,
    this.authorAvatarUrl,
    required this.content,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      postId: json['postId'] as String,
      authorName: json['authorName'] as String,
      authorAvatarUrl: json['authorAvatarUrl'] as String?,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
