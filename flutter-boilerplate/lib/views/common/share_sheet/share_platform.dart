class SharePlatform {
  final String id;
  final String name;
  final String? iconUrl;
  final bool isInstalled;
  final String? packageName;

  const SharePlatform({
    required this.id,
    required this.name,
    this.iconUrl,
    this.isInstalled = false,
    this.packageName,
  });

  factory SharePlatform.fromJson(Map<String, dynamic> json) {
    return SharePlatform(
      id: json['id'] as String,
      name: json['name'] as String,
      iconUrl: json['iconUrl'] as String?,
      isInstalled: json['isInstalled'] as bool? ?? false,
      packageName: json['packageName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'iconUrl': iconUrl,
        'isInstalled': isInstalled,
        'packageName': packageName,
      };
}
