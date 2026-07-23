class Integration {
  final String id;
  final String name;
  final String provider;
  final String? iconUrl;
  final bool isConnected;
  final Map<String, dynamic>? config;
  final DateTime? connectedAt;

  const Integration({
    required this.id,
    required this.name,
    required this.provider,
    this.iconUrl,
    this.isConnected = false,
    this.config,
    this.connectedAt,
  });

  factory Integration.fromJson(Map<String, dynamic> json) {
    return Integration(
      id: json['id'] as String,
      name: json['name'] as String,
      provider: json['provider'] as String,
      iconUrl: json['iconUrl'] as String?,
      isConnected: json['isConnected'] as bool? ?? false,
      config: json['config'] as Map<String, dynamic>?,
      connectedAt: json['connectedAt'] != null
          ? DateTime.parse(json['connectedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'provider': provider,
        'iconUrl': iconUrl,
        'isConnected': isConnected,
        'config': config,
        'connectedAt': connectedAt?.toIso8601String(),
      };
}
