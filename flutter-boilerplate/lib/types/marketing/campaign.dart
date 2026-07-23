class Campaign {
  final String id;
  final String name;
  final String? description;
  final String channel;
  final String status;
  final double? budget;
  final double? spent;
  final int impressions;
  final int clicks;
  final DateTime startsAt;
  final DateTime? endsAt;

  const Campaign({
    required this.id,
    required this.name,
    this.description,
    required this.channel,
    required this.status,
    this.budget,
    this.spent,
    this.impressions = 0,
    this.clicks = 0,
    required this.startsAt,
    this.endsAt,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) {
    return Campaign(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      channel: json['channel'] as String,
      status: json['status'] as String,
      budget: (json['budget'] as num?)?.toDouble(),
      spent: (json['spent'] as num?)?.toDouble(),
      impressions: json['impressions'] as int? ?? 0,
      clicks: json['clicks'] as int? ?? 0,
      startsAt: DateTime.parse(json['startsAt'] as String),
      endsAt: json['endsAt'] != null
          ? DateTime.parse(json['endsAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'channel': channel,
        'status': status,
        'budget': budget,
        'spent': spent,
        'impressions': impressions,
        'clicks': clicks,
        'startsAt': startsAt.toIso8601String(),
        'endsAt': endsAt?.toIso8601String(),
      };
}
