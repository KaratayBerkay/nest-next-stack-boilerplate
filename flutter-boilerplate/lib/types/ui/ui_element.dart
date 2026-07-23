class UiElement {
  final String id;
  final String type;
  final Map<String, dynamic> properties;
  final Map<String, dynamic>? styles;
  final List<UiElement>? children;

  const UiElement({
    required this.id,
    required this.type,
    this.properties = const {},
    this.styles,
    this.children,
  });

  factory UiElement.fromJson(Map<String, dynamic> json) {
    return UiElement(
      id: json['id'] as String,
      type: json['type'] as String,
      properties: (json['properties'] as Map<String, dynamic>?) ?? {},
      styles: json['styles'] as Map<String, dynamic>?,
      children: (json['children'] as List<dynamic>?)
          ?.map((e) => UiElement.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'properties': properties,
        'styles': styles,
        'children': children?.map((c) => c.toJson()).toList(),
      };
}
