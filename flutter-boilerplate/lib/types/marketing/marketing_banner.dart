class MarketingBanner {
  final String id;
  final String title;
  final String? subtitle;
  final String? imageUrl;
  final String? actionUrl;
  final String? actionLabel;
  final String placement;
  final bool isDismissible;
  final DateTime? startsAt;
  final DateTime? endsAt;

  const MarketingBanner({
    required this.id,
    required this.title,
    this.subtitle,
    this.imageUrl,
    this.actionUrl,
    this.actionLabel,
    required this.placement,
    this.isDismissible = true,
    this.startsAt,
    this.endsAt,
  });

  factory MarketingBanner.fromJson(Map<String, dynamic> json) {
    return MarketingBanner(
      id: json['id'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String?,
      imageUrl: json['imageUrl'] as String?,
      actionUrl: json['actionUrl'] as String?,
      actionLabel: json['actionLabel'] as String?,
      placement: json['placement'] as String,
      isDismissible: json['isDismissible'] as bool? ?? true,
      startsAt: json['startsAt'] != null
          ? DateTime.parse(json['startsAt'] as String)
          : null,
      endsAt: json['endsAt'] != null
          ? DateTime.parse(json['endsAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'imageUrl': imageUrl,
        'actionUrl': actionUrl,
        'actionLabel': actionLabel,
        'placement': placement,
        'isDismissible': isDismissible,
        'startsAt': startsAt?.toIso8601String(),
        'endsAt': endsAt?.toIso8601String(),
      };
}
