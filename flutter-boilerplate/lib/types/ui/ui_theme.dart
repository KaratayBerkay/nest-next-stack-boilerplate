class UiTheme {
  final String name;
  final bool isDark;
  final Map<String, dynamic> tokens;
  final String? fontFamily;
  final double? fontSize;

  const UiTheme({
    required this.name,
    this.isDark = false,
    this.tokens = const {},
    this.fontFamily,
    this.fontSize,
  });

  factory UiTheme.fromJson(Map<String, dynamic> json) {
    return UiTheme(
      name: json['name'] as String,
      isDark: json['isDark'] as bool? ?? false,
      tokens: (json['tokens'] as Map<String, dynamic>?) ?? {},
      fontFamily: json['fontFamily'] as String?,
      fontSize: (json['fontSize'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'isDark': isDark,
        'tokens': tokens,
        'fontFamily': fontFamily,
        'fontSize': fontSize,
      };
}
