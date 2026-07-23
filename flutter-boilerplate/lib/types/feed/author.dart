class FeedAuthor {
  final String id;
  final String name;
  final String email;

  const FeedAuthor({
    required this.id,
    required this.name,
    required this.email,
  });

  factory FeedAuthor.fromJson(Map<String, dynamic> json) {
    return FeedAuthor(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
    );
  }
}
