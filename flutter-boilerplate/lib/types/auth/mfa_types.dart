class EnrollMfaResponse {
  final String otpauthUrl;
  final String secret;

  const EnrollMfaResponse({required this.otpauthUrl, required this.secret});

  factory EnrollMfaResponse.fromJson(Map<String, dynamic> json) {
    return EnrollMfaResponse(
      otpauthUrl: json['otpauthUrl'] as String,
      secret: json['secret'] as String,
    );
  }
}

class VerifyMfaResponse {
  final bool enabled;
  final List<String> backupCodes;

  const VerifyMfaResponse({required this.enabled, required this.backupCodes});

  factory VerifyMfaResponse.fromJson(Map<String, dynamic> json) {
    return VerifyMfaResponse(
      enabled: json['enabled'] as bool,
      backupCodes: (json['backupCodes'] as List)
          .map((e) => e as String)
          .toList(),
    );
  }
}
