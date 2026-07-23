class ComponentTheme {
  final String name;
  final String component;
  final Map<String, dynamic> tokens;
  final bool isDefault;

  const ComponentTheme({
    required this.name,
    required this.component,
    this.tokens = const {},
    this.isDefault = false,
  });

  factory ComponentTheme.fromJson(Map<String, dynamic> json) {
    return ComponentTheme(
      name: json['name'] as String,
      component: json['component'] as String,
      tokens: (json['tokens'] as Map<String, dynamic>?) ?? {},
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'component': component,
        'tokens': tokens,
        'isDefault': isDefault,
      };
}
