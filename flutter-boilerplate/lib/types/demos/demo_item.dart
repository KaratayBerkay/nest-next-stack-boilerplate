class DemoItem {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final String? routeName;
  final List<String> tags;
  final bool isActive;

  const DemoItem({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    this.routeName,
    this.tags = const [],
    this.isActive = false,
  });

  factory DemoItem.fromJson(Map<String, dynamic> json) {
    return DemoItem(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String?,
      routeName: json['routeName'] as String?,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isActive: json['isActive'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'imageUrl': imageUrl,
        'routeName': routeName,
        'tags': tags,
        'isActive': isActive,
      };
}
