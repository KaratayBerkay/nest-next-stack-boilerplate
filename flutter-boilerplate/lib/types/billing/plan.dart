class Plan {
  final String id;
  final String name;
  final String description;
  final double price;
  final String currency;
  final String interval;
  final List<String> features;
  final bool isPopular;

  const Plan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.currency,
    required this.interval,
    this.features = const [],
    this.isPopular = false,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    return Plan(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String,
      interval: json['interval'] as String,
      features: (json['features'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isPopular: json['isPopular'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'currency': currency,
        'interval': interval,
        'features': features,
        'isPopular': isPopular,
      };
}
