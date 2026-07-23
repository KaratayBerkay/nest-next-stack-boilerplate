class V1Migration {
  final String id;
  final String name;
  final String status;
  final int version;
  final DateTime? executedAt;
  final String? errorMessage;

  const V1Migration({
    required this.id,
    required this.name,
    required this.status,
    required this.version,
    this.executedAt,
    this.errorMessage,
  });

  factory V1Migration.fromJson(Map<String, dynamic> json) {
    return V1Migration(
      id: json['id'] as String,
      name: json['name'] as String,
      status: json['status'] as String,
      version: json['version'] as int,
      executedAt: json['executedAt'] != null
          ? DateTime.parse(json['executedAt'] as String)
          : null,
      errorMessage: json['errorMessage'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'status': status,
        'version': version,
        'executedAt': executedAt?.toIso8601String(),
        'errorMessage': errorMessage,
      };
}
