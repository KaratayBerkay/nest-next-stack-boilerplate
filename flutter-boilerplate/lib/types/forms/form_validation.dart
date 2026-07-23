class FormValidation {
  final bool isValid;
  final Map<String, String> errors;
  final DateTime? validatedAt;

  const FormValidation({
    this.isValid = true,
    this.errors = const {},
    this.validatedAt,
  });

  factory FormValidation.fromJson(Map<String, dynamic> json) {
    return FormValidation(
      isValid: json['isValid'] as bool? ?? true,
      errors: (json['errors'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as String)) ??
          {},
      validatedAt: json['validatedAt'] != null
          ? DateTime.parse(json['validatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'isValid': isValid,
        'errors': errors,
        'validatedAt': validatedAt?.toIso8601String(),
      };
}
