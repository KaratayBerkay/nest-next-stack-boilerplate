class FeedReaction {
  final String type;
  final String userId;

  const FeedReaction({
    required this.type,
    required this.userId,
  });

  factory FeedReaction.fromJson(Map<String, dynamic> json) {
    return FeedReaction(
      type: json['type'] as String,
      userId: json['userId'] as String,
    );
  }
}
