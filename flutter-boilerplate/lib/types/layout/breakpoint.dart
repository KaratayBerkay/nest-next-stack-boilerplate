class LayoutBreakpoint {
  final String name;
  final double minWidth;
  final double? maxWidth;
  final int columns;
  final double gutter;

  const LayoutBreakpoint({
    required this.name,
    required this.minWidth,
    this.maxWidth,
    this.columns = 12,
    this.gutter = 16.0,
  });

  factory LayoutBreakpoint.fromJson(Map<String, dynamic> json) {
    return LayoutBreakpoint(
      name: json['name'] as String,
      minWidth: (json['minWidth'] as num).toDouble(),
      maxWidth: (json['maxWidth'] as num?)?.toDouble(),
      columns: json['columns'] as int? ?? 12,
      gutter: (json['gutter'] as num?)?.toDouble() ?? 16.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'minWidth': minWidth,
        'maxWidth': maxWidth,
        'columns': columns,
        'gutter': gutter,
      };
}
