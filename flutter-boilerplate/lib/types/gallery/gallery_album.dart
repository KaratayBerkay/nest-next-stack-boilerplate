class GalleryAlbum {
  final String id;
  final String name;
  final String? description;
  final String? coverUrl;
  final int itemCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const GalleryAlbum({
    required this.id,
    required this.name,
    this.description,
    this.coverUrl,
    this.itemCount = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory GalleryAlbum.fromJson(Map<String, dynamic> json) {
    return GalleryAlbum(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      coverUrl: json['coverUrl'] as String?,
      itemCount: json['itemCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'coverUrl': coverUrl,
        'itemCount': itemCount,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}
