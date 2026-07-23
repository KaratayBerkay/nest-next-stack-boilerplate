class Invoice {
  final String id;
  final String number;
  final double amount;
  final String currency;
  final String status;
  final String? pdfUrl;
  final DateTime createdAt;
  final DateTime? paidAt;

  const Invoice({
    required this.id,
    required this.number,
    required this.amount,
    required this.currency,
    required this.status,
    this.pdfUrl,
    required this.createdAt,
    this.paidAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String,
      number: json['number'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: json['status'] as String,
      pdfUrl: json['pdfUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      paidAt: json['paidAt'] != null
          ? DateTime.parse(json['paidAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'number': number,
        'amount': amount,
        'currency': currency,
        'status': status,
        'pdfUrl': pdfUrl,
        'createdAt': createdAt.toIso8601String(),
        'paidAt': paidAt?.toIso8601String(),
      };
}
