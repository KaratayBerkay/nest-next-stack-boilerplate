class PremiumTier {
  final String id;
  final String name;
  final String badge;
  final double price;
  final String currency;
  final String interval;
  final List<String> includedFeatures;
  final bool isCurrent;

  const PremiumTier({
    required this.id,
    required this.name,
    required this.badge,
    required this.price,
    required this.currency,
    required this.interval,
    this.includedFeatures = const [],
    this.isCurrent = false,
  });

  factory PremiumTier.fromJson(Map<String, dynamic> json) {
    return PremiumTier(
      id: json['id'] as String,
      name: json['name'] as String,
      badge: json['badge'] as String,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String,
      interval: json['interval'] as String,
      includedFeatures: (json['includedFeatures'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isCurrent: json['isCurrent'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'badge': badge,
        'price': price,
        'currency': currency,
        'interval': interval,
        'includedFeatures': includedFeatures,
        'isCurrent': isCurrent,
      };
}
