class FormFieldModel {
  final String name;
  final String label;
  final String type;
  final String? placeholder;
  final String? defaultValue;
  final bool required;
  final String? validationRule;
  final String? errorMessage;

  const FormFieldModel({
    required this.name,
    required this.label,
    required this.type,
    this.placeholder,
    this.defaultValue,
    this.required = false,
    this.validationRule,
    this.errorMessage,
  });

  factory FormFieldModel.fromJson(Map<String, dynamic> json) {
    return FormFieldModel(
      name: json['name'] as String,
      label: json['label'] as String,
      type: json['type'] as String,
      placeholder: json['placeholder'] as String?,
      defaultValue: json['defaultValue'] as String?,
      required: json['required'] as bool? ?? false,
      validationRule: json['validationRule'] as String?,
      errorMessage: json['errorMessage'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'label': label,
        'type': type,
        'placeholder': placeholder,
        'defaultValue': defaultValue,
        'required': required,
        'validationRule': validationRule,
        'errorMessage': errorMessage,
      };
}
