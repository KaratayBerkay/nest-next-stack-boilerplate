class Subscription {
  final String id;
  final String planId;
  final String planName;
  final String status;
  final DateTime startDate;
  final DateTime? endDate;
  final String? cancelUrl;
  final String? updateUrl;

  const Subscription({
    required this.id,
    required this.planId,
    required this.planName,
    required this.status,
    required this.startDate,
    this.endDate,
    this.cancelUrl,
    this.updateUrl,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      planId: json['planId'] as String,
      planName: json['planName'] as String,
      status: json['status'] as String,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : null,
      cancelUrl: json['cancelUrl'] as String?,
      updateUrl: json['updateUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'planId': planId,
        'planName': planName,
        'status': status,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate?.toIso8601String(),
        'cancelUrl': cancelUrl,
        'updateUrl': updateUrl,
      };
}
