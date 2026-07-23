class RouteItem {
  final String name;
  final String path;
  final String? icon;
  final String? label;
  final bool requiresAuth;
  final bool isExact;
  final List<String>? allowedRoles;

  const RouteItem({
    required this.name,
    required this.path,
    this.icon,
    this.label,
    this.requiresAuth = false,
    this.isExact = true,
    this.allowedRoles,
  });

  factory RouteItem.fromJson(Map<String, dynamic> json) {
    return RouteItem(
      name: json['name'] as String,
      path: json['path'] as String,
      icon: json['icon'] as String?,
      label: json['label'] as String?,
      requiresAuth: json['requiresAuth'] as bool? ?? false,
      isExact: json['isExact'] as bool? ?? true,
      allowedRoles: (json['allowedRoles'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'path': path,
        'icon': icon,
        'label': label,
        'requiresAuth': requiresAuth,
        'isExact': isExact,
        'allowedRoles': allowedRoles,
      };
}
