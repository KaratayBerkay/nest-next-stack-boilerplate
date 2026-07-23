class LayoutConfig {
  final String id;
  final String name;
  final String template;
  final Map<String, dynamic>? slots;
  final bool isResponsive;
  final bool isDefault;

  const LayoutConfig({
    required this.id,
    required this.name,
    required this.template,
    this.slots,
    this.isResponsive = true,
    this.isDefault = false,
  });

  factory LayoutConfig.fromJson(Map<String, dynamic> json) {
    return LayoutConfig(
      id: json['id'] as String,
      name: json['name'] as String,
      template: json['template'] as String,
      slots: json['slots'] as Map<String, dynamic>?,
      isResponsive: json['isResponsive'] as bool? ?? true,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'template': template,
        'slots': slots,
        'isResponsive': isResponsive,
        'isDefault': isDefault,
      };
}
