class PlanTier {
  final String id;
  final String name;
  final String description;
  final double price;
  final String currency;
  final String interval;
  final List<String> includedFeatures;
  final List<String>? limitations;
  final int sortOrder;
  final bool isRecommended;

  const PlanTier({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.currency,
    required this.interval,
    this.includedFeatures = const [],
    this.limitations,
    this.sortOrder = 0,
    this.isRecommended = false,
  });

  factory PlanTier.fromJson(Map<String, dynamic> json) {
    return PlanTier(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String,
      interval: json['interval'] as String,
      includedFeatures: (json['includedFeatures'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      limitations: (json['limitations'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      sortOrder: json['sortOrder'] as int? ?? 0,
      isRecommended: json['isRecommended'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'currency': currency,
        'interval': interval,
        'includedFeatures': includedFeatures,
        'limitations': limitations,
        'sortOrder': sortOrder,
        'isRecommended': isRecommended,
      };
}
