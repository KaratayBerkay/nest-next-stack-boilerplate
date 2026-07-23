class PremiumFeature {
  final String id;
  final String name;
  final String description;
  final String? iconUrl;
  final bool isAvailable;
  final String? requiredTier;

  const PremiumFeature({
    required this.id,
    required this.name,
    required this.description,
    this.iconUrl,
    this.isAvailable = false,
    this.requiredTier,
  });

  factory PremiumFeature.fromJson(Map<String, dynamic> json) {
    return PremiumFeature(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      iconUrl: json['iconUrl'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? false,
      requiredTier: json['requiredTier'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'iconUrl': iconUrl,
        'isAvailable': isAvailable,
        'requiredTier': requiredTier,
      };
}
