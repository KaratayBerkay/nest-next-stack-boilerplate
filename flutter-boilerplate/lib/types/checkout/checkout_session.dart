class CheckoutSession {
  final String id;
  final String planId;
  final String? couponCode;
  final double? discountAmount;
  final double totalAmount;
  final String currency;
  final String status;
  final String? url;
  final DateTime createdAt;

  const CheckoutSession({
    required this.id,
    required this.planId,
    this.couponCode,
    this.discountAmount,
    required this.totalAmount,
    required this.currency,
    required this.status,
    this.url,
    required this.createdAt,
  });

  factory CheckoutSession.fromJson(Map<String, dynamic> json) {
    return CheckoutSession(
      id: json['id'] as String,
      planId: json['planId'] as String,
      couponCode: json['couponCode'] as String?,
      discountAmount: (json['discountAmount'] as num?)?.toDouble(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: json['status'] as String,
      url: json['url'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'planId': planId,
        'couponCode': couponCode,
        'discountAmount': discountAmount,
        'totalAmount': totalAmount,
        'currency': currency,
        'status': status,
        'url': url,
        'createdAt': createdAt.toIso8601String(),
      };
}
