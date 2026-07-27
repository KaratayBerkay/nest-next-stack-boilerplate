class ShareContent {
  final String title;
  final String? description;
  final String? url;
  final String? imageUrl;
  final String? contentType;

  const ShareContent({
    required this.title,
    this.description,
    this.url,
    this.imageUrl,
    this.contentType,
  });

  factory ShareContent.fromJson(Map<String, dynamic> json) {
    return ShareContent(
      title: json['title'] as String,
      description: json['description'] as String?,
      url: json['url'] as String?,
      imageUrl: json['imageUrl'] as String?,
      contentType: json['contentType'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'url': url,
        'imageUrl': imageUrl,
        'contentType': contentType,
      };
}
