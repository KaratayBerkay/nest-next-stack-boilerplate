class GalleryItem {
  final String id;
  final String url;
  final String? thumbnailUrl;
  final String type;
  final double? width;
  final double? height;
  final int? fileSize;
  final DateTime createdAt;

  const GalleryItem({
    required this.id,
    required this.url,
    this.thumbnailUrl,
    required this.type,
    this.width,
    this.height,
    this.fileSize,
    required this.createdAt,
  });

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    return GalleryItem(
      id: json['id'] as String,
      url: json['url'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      type: json['type'] as String,
      width: (json['width'] as num?)?.toDouble(),
      height: (json['height'] as num?)?.toDouble(),
      fileSize: json['fileSize'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'url': url,
        'thumbnailUrl': thumbnailUrl,
        'type': type,
        'width': width,
        'height': height,
        'fileSize': fileSize,
        'createdAt': createdAt.toIso8601String(),
      };
}
