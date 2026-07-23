class AppLocale {
  final String code;
  final String name;
  final String nativeName;
  final bool isRtl;
  final bool isDefault;

  const AppLocale({
    required this.code,
    required this.name,
    required this.nativeName,
    this.isRtl = false,
    this.isDefault = false,
  });

  factory AppLocale.fromJson(Map<String, dynamic> json) {
    return AppLocale(
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['nativeName'] as String,
      isRtl: json['isRtl'] as bool? ?? false,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'code': code,
        'name': name,
        'nativeName': nativeName,
        'isRtl': isRtl,
        'isDefault': isDefault,
      };
}
