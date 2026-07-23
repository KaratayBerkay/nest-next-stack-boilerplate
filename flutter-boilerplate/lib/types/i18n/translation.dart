class Translation {
  final String key;
  final String value;
  final String locale;
  final String? namespace;
  final bool isPlural;

  const Translation({
    required this.key,
    required this.value,
    required this.locale,
    this.namespace,
    this.isPlural = false,
  });

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      key: json['key'] as String,
      value: json['value'] as String,
      locale: json['locale'] as String,
      namespace: json['namespace'] as String?,
      isPlural: json['isPlural'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'key': key,
        'value': value,
        'locale': locale,
        'namespace': namespace,
        'isPlural': isPlural,
      };
}
