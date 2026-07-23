class UserStats {
  final int totalPosts;
  final int totalLikes;
  final int totalComments;
  final int totalFriends;
  final int totalViews;
  final DateTime? lastActiveAt;

  const UserStats({
    this.totalPosts = 0,
    this.totalLikes = 0,
    this.totalComments = 0,
    this.totalFriends = 0,
    this.totalViews = 0,
    this.lastActiveAt,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalPosts: json['totalPosts'] as int? ?? 0,
      totalLikes: json['totalLikes'] as int? ?? 0,
      totalComments: json['totalComments'] as int? ?? 0,
      totalFriends: json['totalFriends'] as int? ?? 0,
      totalViews: json['totalViews'] as int? ?? 0,
      lastActiveAt: json['lastActiveAt'] != null
          ? DateTime.parse(json['lastActiveAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'totalPosts': totalPosts,
        'totalLikes': totalLikes,
        'totalComments': totalComments,
        'totalFriends': totalFriends,
        'totalViews': totalViews,
        'lastActiveAt': lastActiveAt?.toIso8601String(),
      };
}
