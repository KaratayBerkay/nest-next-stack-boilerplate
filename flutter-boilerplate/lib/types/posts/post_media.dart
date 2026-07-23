class PostMedia {
  final String id;
  final String postId;
  final String url;
  final String type;
  final double? width;
  final double? height;
  final int sortOrder;

  const PostMedia({
    required this.id,
    required this.postId,
    required this.url,
    required this.type,
    this.width,
    this.height,
    this.sortOrder = 0,
  });

  factory PostMedia.fromJson(Map<String, dynamic> json) {
    return PostMedia(
      id: json['id'] as String,
      postId: json['postId'] as String,
      url: json['url'] as String,
      type: json['type'] as String,
      width: (json['width'] as num?)?.toDouble(),
      height: (json['height'] as num?)?.toDouble(),
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'postId': postId,
        'url': url,
        'type': type,
        'width': width,
        'height': height,
        'sortOrder': sortOrder,
      };
}
