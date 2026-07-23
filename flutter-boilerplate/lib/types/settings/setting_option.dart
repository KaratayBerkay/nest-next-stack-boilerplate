class SettingOption {
  final String key;
  final String label;
  final String type;
  final String? description;
  final dynamic value;
  final dynamic defaultValue;
  final List<String>? options;
  final String? category;

  const SettingOption({
    required this.key,
    required this.label,
    required this.type,
    this.description,
    this.value,
    this.defaultValue,
    this.options,
    this.category,
  });

  factory SettingOption.fromJson(Map<String, dynamic> json) {
    return SettingOption(
      key: json['key'] as String,
      label: json['label'] as String,
      type: json['type'] as String,
      description: json['description'] as String?,
      value: json['value'],
      defaultValue: json['defaultValue'],
      options: (json['options'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      category: json['category'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'key': key,
        'label': label,
        'type': type,
        'description': description,
        'value': value,
        'defaultValue': defaultValue,
        'options': options,
        'category': category,
      };
}
