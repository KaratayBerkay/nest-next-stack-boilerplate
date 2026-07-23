class PostSummary {
  final String id;
  final String title;
  final String? excerpt;
  final String? coverImageUrl;
  final String authorName;
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;

  const PostSummary({
    required this.id,
    required this.title,
    this.excerpt,
    this.coverImageUrl,
    required this.authorName,
    this.likeCount = 0,
    this.commentCount = 0,
    required this.createdAt,
  });

  factory PostSummary.fromJson(Map<String, dynamic> json) {
    return PostSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      excerpt: json['excerpt'] as String?,
      coverImageUrl: json['coverImageUrl'] as String?,
      authorName: json['authorName'] as String,
      likeCount: json['likeCount'] as int? ?? 0,
      commentCount: json['commentCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'excerpt': excerpt,
        'coverImageUrl': coverImageUrl,
        'authorName': authorName,
        'likeCount': likeCount,
        'commentCount': commentCount,
        'createdAt': createdAt.toIso8601String(),
      };
}
