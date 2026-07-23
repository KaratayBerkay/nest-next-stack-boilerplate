class FeatureFlag {
  final String key;
  final String name;
  final String description;
  final bool enabled;
  final List<String>? allowedTiers;

  const FeatureFlag({
    required this.key,
    required this.name,
    required this.description,
    this.enabled = false,
    this.allowedTiers,
  });

  factory FeatureFlag.fromJson(Map<String, dynamic> json) {
    return FeatureFlag(
      key: json['key'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      enabled: json['enabled'] as bool? ?? false,
      allowedTiers: (json['allowedTiers'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'key': key,
        'name': name,
        'description': description,
        'enabled': enabled,
        'allowedTiers': allowedTiers,
      };
}
