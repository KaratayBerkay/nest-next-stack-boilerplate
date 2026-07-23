class HookConfig {
  final String name;
  final String event;
  final String? targetUrl;
  final Map<String, dynamic> headers;
  final bool isActive;
  final int retryCount;
  final DateTime? lastTriggeredAt;

  const HookConfig({
    required this.name,
    required this.event,
    this.targetUrl,
    this.headers = const {},
    this.isActive = true,
    this.retryCount = 0,
    this.lastTriggeredAt,
  });

  factory HookConfig.fromJson(Map<String, dynamic> json) {
    return HookConfig(
      name: json['name'] as String,
      event: json['event'] as String,
      targetUrl: json['targetUrl'] as String?,
      headers: (json['headers'] as Map<String, dynamic>?) ?? {},
      isActive: json['isActive'] as bool? ?? true,
      retryCount: json['retryCount'] as int? ?? 0,
      lastTriggeredAt: json['lastTriggeredAt'] != null
          ? DateTime.parse(json['lastTriggeredAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'event': event,
        'targetUrl': targetUrl,
        'headers': headers,
        'isActive': isActive,
        'retryCount': retryCount,
        'lastTriggeredAt': lastTriggeredAt?.toIso8601String(),
      };
}
