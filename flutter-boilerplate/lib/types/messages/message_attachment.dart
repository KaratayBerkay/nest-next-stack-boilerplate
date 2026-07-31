class MessageAttachment {
  final String url;
  final String type;
  final String name;

  const MessageAttachment({
    required this.url,
    required this.type,
    required this.name,
  });

  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      url: json['url'] as String,
      type: json['type'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url,
        'type': type,
        'name': name,
      };
}
